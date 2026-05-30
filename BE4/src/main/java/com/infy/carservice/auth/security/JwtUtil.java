package com.infy.carservice.auth.security;



import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.*;

@Component
public class JwtUtil {
	
	
	private final String SECRET="mysecretkeymysecretmykeymysecretkey";
	private final long EXPIRATION = 1000*60*60; // 1 hour
	
	private Key getSigningKey() {
		return Keys.hmacShaKeyFor(SECRET.getBytes());
	}
	
	public String generateToken(String email,String role) {
		return Jwts.builder()
			   .setSubject(email)
			   .claim("role", role)
			   .setIssuedAt(new Date())
			   .setExpiration(new Date(System.currentTimeMillis()+EXPIRATION))
			   .signWith(getSigningKey(),SignatureAlgorithm.HS256)
			   .compact();
	}
	
	public String extractEmail(String token) {
		return getClaims(token).getSubject();
	}
	
	
	public String extractRole(String token) {
		return (String)getClaims(token).get("role");
	}
	
	public boolean validateToken(String token) {
		try {
			getClaims(token);
			return true;
		}catch(Exception e) {
			return false;
		}
	}
	
	private Claims getClaims(String token) {
		return Jwts.parserBuilder()
				.setSigningKey(getSigningKey())
				.build()
				.parseClaimsJws(token)
				.getBody();
	}
}
