package com.infy.carservice.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.carservice.auth.entity.User;

public interface AuthRepository extends JpaRepository<User,Long> {
	
	Optional<User> findByEmail(String email);
	boolean existsByEmail(String email);
	
}
