
package com.infy.carservice.scheduling.dto;

import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShiftResponseDTO {
	private Long id;
	private Long workshopId;
	private Long technicianId;
	private String technicianName;
	private String dayOfWeek;
	private LocalTime shiftStart;
	private LocalTime shiftEnd;
	private Integer maxJobsPerShift;
}