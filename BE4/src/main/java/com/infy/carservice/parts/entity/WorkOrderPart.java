
package com.infy.carservice.parts.entity;

import com.infy.carservice.common.entity.WorkOrder;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "work_order_parts")
@Getter
@Setter
public class WorkOrderPart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id")
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "part_id")
    private Part part;

    @Column(name = "quantity")
    private Integer quantity;


    @Column(name = "is_backorder", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isBackorder = false;
}

