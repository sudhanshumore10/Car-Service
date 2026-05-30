package com.infy.carservice.scheduling.dto;

import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SlotDTO {
//	private LocalTime time;
	private  LocalDateTime startTime;
	private  LocalDateTime endTime;
	private int capacity;
	private int used;
	private int available;

}
