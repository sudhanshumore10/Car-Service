package com.infy.carservice.scheduling.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdatePickupStatusDTO {
	private Long requestId;
	private String status;
	
}
