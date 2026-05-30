package com.infy.carservice.auth.service;

import java.util.Optional;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.infy.carservice.auth.dto.AuthResponseDTO;
import com.infy.carservice.auth.dto.LoginRequestDTO;
import com.infy.carservice.auth.dto.RegisterRequestDTO;
import com.infy.carservice.auth.entity.User;
import com.infy.carservice.auth.repository.AuthRepository;
import com.infy.carservice.auth.security.JwtUtil;
import com.infy.carservice.common.entity.Manager;
import com.infy.carservice.common.entity.Technician;

import com.infy.carservice.common.enums.UserStatus;
import com.infy.carservice.common.enums.UserType;
import com.infy.carservice.common.repository.ManagerRepository;
import com.infy.carservice.common.repository.TechnicianRepository;
import com.infy.carservice.customer.entity.Customer;
import com.infy.carservice.customer.repository.CustomerRepository;

@Service(value="authService")
//@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

	@Autowired
    private  CustomerRepository customerRepository;
	
	@Autowired
	private  AuthRepository authRepository;
	
	@Autowired
	private  PasswordEncoder passwordEncoder;
	
	@Autowired
	private ManagerRepository managerRepository;
	
	@Autowired
	private TechnicianRepository technicianRepository;
	
	@Autowired
	private  JwtUtil jwtUtil;
	
	private ModelMapper modelMapper = new ModelMapper();

    AuthServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }
	
	@Override
	public AuthResponseDTO register(RegisterRequestDTO request) {
		if(authRepository.existsByEmail(request.getEmail())) {
			throw new RuntimeException("User already exists");
		}
		
		User user=modelMapper.map(request, User.class);
		user.setPassword(passwordEncoder.encode(request.getPassword()));
		user.setStatus(UserStatus.ACTIVE);
		

		
	    if(request.getUserType()== UserType.CUSTOMER) {
	    	user.setUserType(UserType.CUSTOMER);
	    	user = authRepository.save(user);
	    	Customer customer = new Customer();
	    	customer.setFullName(request.getFullName());
	    	customer.setUser(user);
//	    	Address address =  new Address();
//	    	customer.setAddress(address);
	    	System.out.println(customer.getFullName());
	    	customerRepository.save(customer);
	    	
	    	
	    }else if(request.getUserType()==UserType.MANAGER) {
	    	user.setUserType(UserType.MANAGER);
	    	user = authRepository.save(user);
	    	Manager manager = new Manager();
	    	manager.setFullName(request.getFullName());
	    	manager.setUser(user);
	    	managerRepository.save(manager);
	    }else if(request.getUserType() == UserType.TECHNICIAN) {
	    	user.setUserType(UserType.TECHNICIAN);
	    	user= authRepository.save(user);
	    	Technician technician = new Technician();
	    	technician.setTechnicianName(request.getFullName());
	    	technician.setUser(user);
	    	technician.setPhone(request.getPhone());
	    	technicianRepository.save(technician);
	    	
	    }
		
		
		
		 
//		if(request.getUserType().toString().equalsIgnoreCase(UserType.CUSTOMER.toString())) {
//	    	Customer customer = new Customer();
//	    	
//	    	
//	    }else if(request.getUserType().toString().equalsIgnoreCase(UserType.TECNICIAN.toString())) {
//	    	user.setUserType(UserType.TECNICIAN);
//	    }else if(request.getUserType().toString().equalsIgnoreCase(UserType.TECNICIAN.toString())) {
//	    	user.setUserType(UserType.MANAGER);
//	    }
	
		
	    String token = jwtUtil.generateToken(user.getEmail(),user.getUserType().name());
		
		return new AuthResponseDTO(token,user.getId(),request.getFullName(),user.getEmail(), user.getPhone(), user.getUserType().name());
	}

	@Override
	public AuthResponseDTO login(LoginRequestDTO request) {
		// TODO Auto-generated method stub
		
		Optional<User> optional = authRepository.findByEmail(request.getEmail());
		
		User user = optional.orElseThrow(()->new RuntimeException("Invalid Credentials"));
		
		if(!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			if (request.getPassword() != null && request.getPassword().equals(user.getPassword())) {
				user.setPassword(passwordEncoder.encode(request.getPassword()));
				authRepository.save(user);
			} else {
			throw new RuntimeException("Invalid Password");
			}
		}
		
		if(!request.getUserType().equalsIgnoreCase(user.getUserType().toString())) {
			throw new RuntimeException("Unauthorized Login for this portal");
		}
		
		if(user.getStatus() != UserStatus.ACTIVE) {
			throw new RuntimeException("User is not Active");
		}
		String token = jwtUtil.generateToken(user.getEmail(),user.getUserType().name());
		
		if(user.getUserType() == UserType.ADMIN) {
			return new AuthResponseDTO(token,user.getId(),"Admin",user.getEmail(), user.getPhone(), user.getUserType().name());
		}
		
		if(user.getUserType() == UserType.CUSTOMER) {
			Customer customer = customerRepository.findByUserId(user.getId());
			if(customer!=null) {
				return new AuthResponseDTO(token,user.getId(),customer.getFullName(),user.getEmail(), user.getPhone(), user.getUserType().name());							
			}
		}else if(user.getUserType()==UserType.MANAGER){
			Manager manager = managerRepository.findByUserId(user.getId());
			if(manager!=null) {
				return new AuthResponseDTO(token,user.getId(),manager.getFullName(),user.getEmail(), user.getPhone(), user.getUserType().name());							
			}
			
		}else if(user.getUserType()==UserType.TECHNICIAN) {
			Technician technician = technicianRepository.findByUserId(user.getId()) ;
			if(technician!=null) {
				return new AuthResponseDTO(token,user.getId(),technician.getTechnicianName(),user.getEmail(), user.getPhone(), user.getUserType().name());							
			}
		}
		
		
		return new AuthResponseDTO();		
	}
}
