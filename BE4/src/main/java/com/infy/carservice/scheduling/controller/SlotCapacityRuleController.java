package com.infy.carservice.scheduling.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.scheduling.entity.SlotCapacityRule;
import com.infy.carservice.scheduling.repository.SlotCapacityRuleRepository;


@RestController
@RequestMapping("/slot-capacity-rules")
//@CrossOrigin(origins = "http://localhost:3000")
public class SlotCapacityRuleController {
	
	@Autowired
	private SlotCapacityRuleRepository repo;
	
	@PostMapping
	public SlotCapacityRule create(@RequestBody SlotCapacityRule rule) {
		return repo.save(rule);
	}
	
@GetMapping("/{workshopId}")
public List<SlotCapacityRule> get(@PathVariable Long workshopId){
	return repo.findByWorkshopId(workshopId);
	
}

@DeleteMapping("/{id}")
public void delete(@PathVariable Long id) {
	repo.deleteById(id);
}



}
