DROP DATABASE IF EXISTS car_service_db;

CREATE DATABASE car_service_db;

USE car_service_db;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE address (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    address_line1 VARCHAR(100) ,

    address_line2 VARCHAR(100),

    city VARCHAR(50) NOT NULL,

    state VARCHAR(50) NOT NULL,

    country VARCHAR(50) NOT NULL,

    pincode VARCHAR(10) NOT NULL

);

CREATE TABLE users (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    email VARCHAR(100) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    phone VARCHAR(15),

    user_type ENUM('ADMIN','MANAGER','TECHNICIAN','CUSTOMER') NOT NULL,

    status ENUM('ACTIVE','INACTIVE','LOCKED') DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);


CREATE TABLE service_managers (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNIQUE,
    
    full_name VARCHAR(100),


    FOREIGN KEY (user_id) REFERENCES users(id)


);

CREATE TABLE workshops (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
  

    name VARCHAR(100),

    address_id BIGINT,
    
      manager_id BIGINT,
    open_time TIME,
    
    close_time TIME,
    
    serviceable_brands VARCHAR(255),

    FOREIGN KEY (address_id) REFERENCES address(id),
    
    FOREIGN KEY (manager_id) REFERENCES service_managers(id)

);

CREATE TABLE customers (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNIQUE,

    full_name VARCHAR(100),

    address_id BIGINT,

    FOREIGN KEY (user_id) REFERENCES users(id),

    FOREIGN KEY (address_id) REFERENCES address(id)

);

CREATE TABLE vehicle_documents (

    vehicle_document_id BIGINT AUTO_INCREMENT PRIMARY KEY,


    doc_type ENUM('RC','INSURANCE','POLLUTION','OTHER'),

    file_url TEXT


);

CREATE TABLE vehicles (

    vehicle_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    customer_id BIGINT,
  
   vehicle_docid BIGINT,

    make VARCHAR(50),

    model VARCHAR(50),

    year INT,

    vin VARCHAR(50) UNIQUE,

    plate_number VARCHAR(20),

    is_active BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (customer_id) REFERENCES customers(id),
 	
    FOREIGN KEY (vehicle_docid) REFERENCES vehicle_documents(vehicle_document_id)

);





CREATE TABLE technician (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNIQUE,
    
    workshop_id BIGINT,
    
    address_id BIGINT,
    
    specialization VARCHAR(100),

    technician_name VARCHAR(50),
    
    phone VARCHAR(15),
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    
    FOREIGN KEY (workshop_id) REFERENCES workshops(id),

    FOREIGN KEY (address_id) REFERENCES address(id)
    

);

CREATE TABLE service_bays (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    workshop_id BIGINT,

    bay_name VARCHAR(50),

    FOREIGN KEY (workshop_id) REFERENCES workshops(id)

);

CREATE TABLE technician_shifts (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    technician_id BIGINT,

    shift_start DATETIME,

    shift_end DATETIME,

    FOREIGN KEY (technician_id) REFERENCES technician(id)

);

CREATE TABLE blackout_dates (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    workshop_id BIGINT,

    date DATE,

    reason VARCHAR(100),

    FOREIGN KEY (workshop_id) REFERENCES workshops(id)

);

CREATE TABLE services (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100),

    description TEXT,

    base_price DECIMAL(10,2),

    duration_minutes INT,

    is_active BOOLEAN DEFAULT TRUE

);

CREATE TABLE service_packages (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100),

    description TEXT,

    price DECIMAL(10,2)

);

CREATE TABLE service_package_items (

    package_id BIGINT,

    service_id BIGINT,

    PRIMARY KEY (package_id, service_id),

    FOREIGN KEY (package_id) REFERENCES service_packages(id),

    FOREIGN KEY (service_id) REFERENCES services(id)

);

CREATE TABLE add_ons (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100),

    price DECIMAL(10,2)

);

CREATE TABLE bookings (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    customer_id BIGINT,

    vehicle_id BIGINT,

    workshop_id BIGINT,

    booking_time DATETIME,
    
    end_time DATETIME NOT NULL,

    status ENUM('CONFIRMED','CANCELLED','COMPLETED'),

    pickup_required BOOLEAN,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id),

    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),

    FOREIGN KEY (workshop_id) REFERENCES workshops(id)

);

CREATE TABLE booking_services (

    booking_id BIGINT,

    service_id BIGINT,

    PRIMARY KEY (booking_id, service_id),

    FOREIGN KEY (booking_id) REFERENCES bookings(id),

    FOREIGN KEY (service_id) REFERENCES services(id)

);

CREATE TABLE work_orders (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    booking_id BIGINT UNIQUE,

    assigned_technician BIGINT,

    status ENUM('SCHEDULED','RECEIVED','DIAGNOSIS','IN_SERVICE','QA','READY','DELIVERED','CLOSED'),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (booking_id) REFERENCES bookings(id),

    FOREIGN KEY (assigned_technician) REFERENCES technician(id)

);

CREATE TABLE work_order_logs (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    work_order_id BIGINT,

    status VARCHAR(50),

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (work_order_id) REFERENCES work_orders(id)

);

CREATE TABLE estimates (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    work_order_id BIGINT UNIQUE,

    total_amount DECIMAL(10,2),

    status ENUM('PENDING','APPROVED','REJECTED'),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (work_order_id) REFERENCES work_orders(id)

);

CREATE TABLE estimate_items (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    estimate_id BIGINT,

    item_type ENUM('SERVICE','PART'),

    item_id BIGINT,

    price DECIMAL(10,2),

    FOREIGN KEY (estimate_id) REFERENCES estimates(id)

);

CREATE TABLE parts (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100),

    sku VARCHAR(50),

    price DECIMAL(10,2),

    stock INT

);

CREATE TABLE work_order_parts (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    work_order_id BIGINT,

    part_id BIGINT,

    quantity INT,

    FOREIGN KEY (work_order_id) REFERENCES work_orders(id),

    FOREIGN KEY (part_id) REFERENCES parts(id)

);

CREATE TABLE invoices (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    work_order_id BIGINT UNIQUE,

    total_amount DECIMAL(10,2),

    status ENUM('PENDING','PAID'),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (work_order_id) REFERENCES work_orders(id)

);

CREATE TABLE invoice_items (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    invoice_id BIGINT,

    description VARCHAR(255),

    amount DECIMAL(10,2),

    FOREIGN KEY (invoice_id) REFERENCES invoices(id)

);

CREATE TABLE payments (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    invoice_id BIGINT,

    method ENUM('CASH','CARD','UPI'),

    amount DECIMAL(10,2),

    status VARCHAR(50),

    paid_at TIMESTAMP,

    FOREIGN KEY (invoice_id) REFERENCES invoices(id)

);

CREATE TABLE pickup_requests (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    booking_id BIGINT UNIQUE,

    address_id BIGINT,

    status ENUM('ASSIGNED','PICKED','DELIVERED'),

    FOREIGN KEY (booking_id) REFERENCES bookings(id),

    FOREIGN KEY (address_id) REFERENCES address(id)

);

CREATE TABLE notifications (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT,

    message TEXT,

    status VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)

);

CREATE TABLE feedback (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    work_order_id BIGINT UNIQUE,

    rating INT,

    comments TEXT,

    FOREIGN KEY (work_order_id) REFERENCES work_orders(id)

);

CREATE TABLE audit_logs (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT,

    action VARCHAR(100),

    entity VARCHAR(100),

    entity_id BIGINT,

    ip_address VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)

);

SET FOREIGN_KEY_CHECKS = 1;



INSERT INTO address VALUES

(1,'Main Road','Near Circle','Belgaum','Karnataka','India','590001'),

(2,'2nd Cross','BTM','Bangalore','Karnataka','India','560076'),

(3,'Station Road','Center','Hubli','Karnataka','India','580020'),

(4,'MG Road','Near Mall','Pune','Maharashtra','India','411001'),

(5,'Sector 21','Market','Delhi','Delhi','India','110001'),

(6,'Ring Road','Industrial Area','Mysore','Karnataka','India','570001'),

(7,'Airport Road','Phase 1','Hyderabad','Telangana','India','500001'),

(8,'Beach Road','Area A','Chennai','Tamil Nadu','India','600001');

INSERT INTO users VALUES

(1,'admin@mail.com','pass123','9999990001','ADMIN','ACTIVE',NOW()),

(2,'manager1@mail.com','pass123','9999990002','MANAGER','ACTIVE',NOW()),

(3,'manager2@mail.com','pass123','9999990003','MANAGER','ACTIVE',NOW()),

(4,'tech1@mail.com','pass123','9999990004','TECHNICIAN','ACTIVE',NOW()),

(5,'tech2@mail.com','pass123','9999990005','TECHNICIAN','ACTIVE',NOW()),

(6,'tech3@mail.com','pass123','9999990006','TECHNICIAN','ACTIVE',NOW()),

(7,'cust1@mail.com','pass123','9999990007','CUSTOMER','ACTIVE',NOW()),

(8,'cust2@mail.com','pass123','9999990008','CUSTOMER','ACTIVE',NOW()),

(9,'cust3@mail.com','pass123','9999990009','CUSTOMER','ACTIVE',NOW()),

(10,'cust4@mail.com','pass123','9999990010','CUSTOMER','ACTIVE',NOW());


INSERT INTO service_managers VALUES

(1,2,"Rahul"),

(2,3,"Virat");


INSERT INTO workshops VALUES

(1,'AutoFix Garage',1,1,'08:00:00','16:00:00','All'),

(2,'Speed Motors1',2,1,'09:00:00','17:00:00','Honda'),
(3,'Speed Motors',3,2,'10:00:00','18:00:00','Toyota'),
(4,'Speed Motors2',4,1,'08:00:00','16:00:00','Kia'),
(5,'Speed Drive Z',5,1,'09:00:00','17:00:00','Maruti'),
(6,'Speed Drive Z1',6,2,'08:00:00','16:00:00','Mercedes');

INSERT INTO customers VALUES

(1,7,'Rahul Patil',2),

(2,8,'Amit Sharma',3),

(3,9,'Kiran Rao',5),

(4,10,'Sneha Iyer',8);


INSERT INTO vehicle_documents VALUES

(1,'RC','/docs/rc1.pdf'),

(2,'INSURANCE','/docs/ins2.pdf'),

(3,'RC','/docs/rc3.pdf'),

(4,'INSURANCE','/docs/ins4.pdf');


INSERT INTO vehicles VALUES

(1,1,1,'Honda','City',2020,'VIN111','KA01AA1111',TRUE),

(2,2,2,'Hyundai','i20',2019,'VIN222','KA02BB2222',TRUE),

(3,3,3,'Toyota','Innova',2021,'VIN333','DL03CC3333',TRUE),

(4,4,4,'Maruti','Swift',2018,'VIN444','MH04DD4444',TRUE);



INSERT INTO technician VALUES

(1,4,4,7,'Engine Specialist','John','8776456789'),

(2,5,5,8,'Brake Specialist','Wilson','8776456789'),

(3,6,6,6,'Electrical Specialist','Kumar','8776456789');

INSERT INTO services VALUES

(1,'Oil Change','Engine oil replacement',1500,60,TRUE),

(2,'General Service','Full check',3000,120,TRUE),

(3,'Brake Service','Brake check',2000,90,TRUE),

(4,'AC Service','Cooling system',2500,80,TRUE),

(5,'Battery Check','Battery health',500,30,TRUE);

INSERT INTO service_packages VALUES

(1,'Basic Package','Oil + General',4000),

(2,'Premium Package','All services',7000);

INSERT INTO service_package_items VALUES

(1,1),(1,2),(2,1),(2,2),(2,3),(2,4);

INSERT INTO bookings VALUES

(1,1,1,1,NOW(),DATE_ADD(NOW(), INTERVAL 60 MINUTE),'CONFIRMED',TRUE,NOW()),

(2,2,2,1,NOW(),DATE_ADD(NOW(), INTERVAL 45 MINUTE),'CONFIRMED',FALSE,NOW()),

(3,3,3,2,NOW(),DATE_ADD(NOW(), INTERVAL 30 MINUTE),'CONFIRMED',TRUE,NOW()),

(4,4,4,2,NOW(),DATE_ADD(NOW(), INTERVAL 90 MINUTE),'CONFIRMED',FALSE,NOW());



INSERT INTO booking_services VALUES

(1,1),(1,2),

(2,2),(2,3),

(3,1),(3,4),

(4,5);

INSERT INTO work_orders VALUES

(1,1,1,'SCHEDULED',NOW()),

(2,2,2,'RECEIVED',NOW()),

(3,3,3,'IN_SERVICE',NOW()),

(4,4,1,'QA',NOW());

INSERT INTO estimates VALUES

(1,1,4500,'PENDING',NOW()),

(2,2,3500,'APPROVED',NOW()),

(3,3,5000,'PENDING',NOW()),

(4,4,2000,'APPROVED',NOW());

INSERT INTO parts VALUES

(1,'Engine Oil','EO1',800,50),

(2,'Oil Filter','OF1',300,40),

(3,'Brake Pad','BP1',1200,30),

(4,'Battery','BT1',4000,20),

(5,'AC Gas','AC1',1500,25);

INSERT INTO work_order_parts VALUES

(1,1,1,1),

(2,1,2,1),

(3,2,3,2),

(4,3,4,1),

(5,4,5,1);

INSERT INTO invoices VALUES

(1,1,4800,'PENDING',NOW()),

(2,2,3500,'PAID',NOW()),

(3,3,5200,'PENDING',NOW()),

(4,4,2200,'PAID',NOW());

INSERT INTO payments VALUES

(1,2,'UPI',3500,'SUCCESS',NOW()),

(2,4,'CARD',2200,'SUCCESS',NOW());

INSERT INTO pickup_requests VALUES

(1,1,2,'ASSIGNED'),

(2,3,5,'PICKED');

INSERT INTO notifications VALUES

(1,7,'Booking confirmed','SENT',NOW()),

(2,8,'Service completed','SENT',NOW()),

(3,9,'Invoice generated','SENT',NOW());

INSERT INTO feedback VALUES

(1,1,5,'Great service'),

(2,2,4,'Good experience'),

(3,3,5,'Excellent'),

(4,4,3,'Average');

INSERT INTO audit_logs (user_id,action,entity,entity_id,ip_address) VALUES

(1,'CREATE_BOOKING','BOOKING',1,'127.0.0.1'),

(2,'UPDATE_ORDER','WORK_ORDER',2,'127.0.0.1'),

(3,'PAYMENT_DONE','INVOICE',2,'127.0.0.1');



INSERT INTO service_bays VALUES

(1,1,'Bay 1'),

(2,1,'Bay 2'),

(3,2,'Bay 1'),

(4,2,'Bay 2');

INSERT INTO technician_shifts VALUES

(1,1,NOW(),DATE_ADD(NOW(), INTERVAL 8 HOUR)),

(2,2,NOW(),DATE_ADD(NOW(), INTERVAL 8 HOUR)),

(3,3,NOW(),DATE_ADD(NOW(), INTERVAL 8 HOUR));

INSERT INTO blackout_dates VALUES

(1,1,'2026-05-10','Maintenance'),

(2,2,'2026-05-12','Holiday');

INSERT INTO add_ons VALUES

(1,'Car Wash',300),

(2,'Interior Cleaning',700),

(3,'Wheel Balancing',500),

(4,'Polishing',1000);

INSERT INTO work_order_logs VALUES

(1,1,'SCHEDULED',NOW()), 

(2,2,'RECEIVED',NOW()),

(3,3,'IN_SERVICE',NOW()),

(4,4,'QA',NOW());

INSERT INTO invoice_items VALUES

(1,1,'Oil Change',1500),

(2,1,'Filter',300),

(3,2,'General Service',3000),

(4,3,'Brake Service',2000),

(5,4,'Battery Replacement',4000);



CREATE TABLE slot_capacity_rule(
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	workshop_id BIGINT NOT NULL,
	start_time TIME NOT NULL,
	end_time TIME NOT NULL,
	max_capacity INT NOT NULL,
	FOREIGN KEY (workshop_id) REFERENCES workshops(id)
);


INSERT INTO slot_capacity_rule (workshop_id, start_time, end_time, max_capacity) values (1,'9:00:00','11:00:00',5),(2,'11:00:00','14:00:00',3), (3,'14:00:00','17:00:00',4);

INSERT INTO slot_capacity_rule (workshop_id, start_time, end_time, max_capacity) values (2,'8:00:00','11:00:00',6),(2,'11:00:00','14:00:00',5), (3,'14:00:00','17:00:00',4);

INSERT INTO slot_capacity_rule (workshop_id, start_time, end_time, max_capacity) values (3,'10:00:00','11:00:00',6),(2,'11:00:00','14:00:00',5), (3,'14:00:00','17:00:00',4);


alter table services ADD COLUMN buffer_minutes INT DEFAULT 0;
ALTER TABLE work_orders MODIFY COLUMN status VARCHAR(50);
 alter table technician_shifts modify shift_start time;
 alter table technician_shifts modify shift_end time;
 
 
 ALTER TABLE work_order_parts
    ADD COLUMN IF NOT EXISTS is_backorder BOOLEAN NOT NULL DEFAULT FALSE;



alter table pickup_requests drop foreign key pickup_requests_ibfk_1;
alter table pickup_requests drop index booking_id;
alter table pickup_requests add constraint fk_booking foreign key (booking_id) references bookings(id);
alter table pickup_requests add column type varchar(20), add column scheduled_time datetime, add column completed_time datetime;
alter table pickup_requests modify column status enum('REQUESTED', 'ASSIGNED', 'EN_ROUTE','PICKED','DELIVERED','CANCELLED');
insert into pickup_requests(booking_id, address_id, status, type, scheduled_time) values (3, 2, 'REQUESTED', 'PICKUP', '2026-05-02 12:30:00'), (3, 5, 'REQUESTED', 'DROP', '2026-05-02 14:50:00');
delete from pickup_requests where type is null;
