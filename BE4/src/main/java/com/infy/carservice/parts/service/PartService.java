
package com.infy.carservice.parts.service;

import com.infy.carservice.parts.dto.AddPartToWorkOrderDTO;
import com.infy.carservice.parts.dto.PartResponseDTO;
import com.infy.carservice.parts.dto.WorkOrderPartResponseDTO;

import java.util.List;

public interface PartService {

    List<PartResponseDTO> getAllParts();

    List<PartResponseDTO> searchParts(String keyword);

    WorkOrderPartResponseDTO addPartToWorkOrder(Long workOrderId, AddPartToWorkOrderDTO dto);

    List<WorkOrderPartResponseDTO> getPartsByWorkOrder(Long workOrderId);

    void removePartFromWorkOrder(Long workOrderPartId);
}