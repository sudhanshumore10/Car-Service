package com.infy.carservice.scheduling.dto;

import java.time.LocalTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateShiftDTO {
	private Long technicianId;
	private LocalTime shiftStart;
	private LocalTime shiftEnd; 

}
