package com.infy.carservice.common.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;




@Configuration

public class SecurityConfig {
	
	
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
		http.csrf(csrf->csrf.disable())
			.cors(cors -> {})
			.sessionManagement(session->session
					.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.authorizeHttpRequests(auth->auth
//			.requestMatchers(HttpMethod.OPTIONS,"/**").permitAll()
//			.requestMatchers("/auth/**").permitAll()
//			.requestMatchers("/api/v1/**").permitAll()
//			.requestMatchers("/customer/**").permitAll()
//			.requestMatchers("/vehicle/**").permitAll()
//			.requestMatchers("/manager/**").permitAll()
//					.anyRequest().authenticated()
					.anyRequest().permitAll()
		);
	
		return http.build();
	}
	
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	
	
}
