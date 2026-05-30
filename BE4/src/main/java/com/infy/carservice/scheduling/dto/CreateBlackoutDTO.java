package com.infy.carservice.scheduling.dto;

import java.time.LocalDate;

import jakarta.persistence.JoinColumn;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBlackoutDTO {
	@JoinColumn(name="workshop_id")

	private Long workshopId;
	private LocalDate date;
	private String reason;

}
