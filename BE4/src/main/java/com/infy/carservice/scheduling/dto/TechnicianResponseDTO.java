package com.infy.carservice.scheduling.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TechnicianResponseDTO {
	private Long id;
	private String technicianName;
	private String specialization;
	private String phone;
	private Long workshopId;
	private String workshopName;

}
