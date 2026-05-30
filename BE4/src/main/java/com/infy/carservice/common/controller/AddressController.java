package com.infy.carservice.common.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.common.dto.AddressDTO;
import com.infy.carservice.common.entity.Address;
import com.infy.carservice.exception.InfyCarServiceException;
import com.infy.carservice.scheduling.repository.AddressRepository;

@RestController
@RequestMapping("/customer/address")
public class AddressController {

@Autowired
private AddressRepository addressRepository;

/**
 * US 11 — Customer creates an address (used for pickup/drop address input)
 * POST /customer/address
 */
@PostMapping
public ResponseEntity<Address> createAddress(@RequestBody AddressDTO dto) {
    Address address = new Address();
    address.setAddressLine1(dto.getAddressLine1());
    address.setAddressLine2(dto.getAddressLine2());
    address.setCity(dto.getCity());
    address.setState(dto.getState());
    address.setCountry(dto.getCountry());
    address.setPincode(dto.getPincode());
    Address saved = addressRepository.save(address);
    return ResponseEntity.ok(saved);
}

/**
 * GET /customer/address/{id}
 */
@GetMapping("/{id}")
public ResponseEntity<Address> getAddress(@PathVariable Long id) {
    Address address = addressRepository.findById(id)
        .orElseThrow(() -> new InfyCarServiceException("Address not found: " + id));
    return ResponseEntity.ok(address);
}
}