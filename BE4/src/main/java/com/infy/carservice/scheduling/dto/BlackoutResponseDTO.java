package com.infy.carservice.scheduling.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BlackoutResponseDTO {
	private Long id;
	private Long workshopId;
	private String date;
	private String reason;

}
