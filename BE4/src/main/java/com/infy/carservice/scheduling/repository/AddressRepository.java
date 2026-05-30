package com.infy.carservice.scheduling.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.carservice.common.entity.Address;

public interface AddressRepository extends JpaRepository<Address, Long>{

}
