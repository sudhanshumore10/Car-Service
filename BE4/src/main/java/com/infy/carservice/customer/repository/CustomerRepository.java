package com.infy.carservice.customer.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infy.carservice.auth.entity.User;
import com.infy.carservice.customer.entity.Customer;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long>{
	
	Optional<Customer> findById(Long userId);
 
	Customer findByUserId(Long userId);
	
	

}
