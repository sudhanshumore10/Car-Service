import { BrowserRouter, Route, Routes } from "react-router-dom"

import Home from "../pages/Home/Home";
import RoleSelection from "../pages/RoleSelection/RoleSelection";

import CustomerLogin from "../pages/Auth/CustomerLogin";
import ServiceManagerLogin from "../pages/Auth/ServiceManagerLogin";
import TechnicianLogin from "../pages/Auth/TechnicianLogin";
import AdminLogin from "../pages/Auth/AdminLogin";

import CustomerDashboard from "../pages/Customer/CustDashboard/CustomerDashboard";
import CapacityDashboard from "../pages/ServiceManager/SMDashboard/CapacityDashboard";


import Invoices from "../pages/Customer/Invoices";
import ProtectedRoute from "./ProtectedRoute";
import MyVehicles from "../pages/Customer/Vehicles/MyVehicles";
import AddVehicle from "../pages/Customer/Vehicles/AddVehicle";
import Profile from "../pages/Customer/Profile/Profile";
import ManageProfile from "../pages/Customer/Profile/ManageProfile";
import MyBookings from "../pages/Customer/MyBookings/MyBookings";
import CustomerFeedback from "../pages/Customer/Feedback/Feedback";
import BookService from "../pages/Customer/BookService/BookService";
import AddWorkshop from "../pages/ServiceManager/Workshops/Addworkshop";
import ServiceManagerLayout from "../pages/ServiceManager/Layout/ServiceManagerLayout";
import Workshops from "../pages/ServiceManager/Workshops/Workshops";
import CapacityConfig from "../pages/ServiceManager/CapacityConfig/CapacityConfig";
import About from "../pages/Home/sections/About";
import Contact from "../pages/Home/sections/Contact";
import Services from "../pages/Home/sections/Services";
import PublicLayout from "../components/PublicLayout";
import TechnicianDashboard from "../pages/Technician/TechnicianDashboard/TechnicianDashboard";
import WorkOrderDetails from "../pages/Technician/WorkOrderDetails/WorkOrderDetails";
import WorkOrders from "../pages/Technician/WorkOrders/WorkOrders";
import CustomerEstimate from "../pages/Customer/Estimate/CustomerEstimate";
import TechnicianPlaceholder from "../pages/Technician/Placeholder/TechnicianPlaceholder";
import TechnicianLayout from "../pages/Technician/Layout/TechnicianLayout";
import TechnicianProfile from "../pages/Technician/Profile/Profile";
import Reports from "../pages/ServiceManager/Reports/Reports";
import FeedbackManager from "../pages/ServiceManager/Feedback/FeedbackManager";
import Bookings from "../pages/ServiceManager/Bookings/Bookings";
import Technicians from "../pages/ServiceManager/Technicians/Technicians";
import ServiceCatalog from "../pages/ServiceManager/Catalog/ServiceCatalog";
import AdminConsole from "../pages/Admin/AdminConsole";

const AppRoutes=()=>{
    return(
        <BrowserRouter>
        <Routes>
            <Route element={<PublicLayout/>}>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/about-us" element={<About/>}></Route>
            <Route path="/contact-us" element={<Contact/>}></Route>  
            <Route path="/services" element={<Services/>}></Route>          
            <Route path="/select-role" element={<RoleSelection/>}/>
            <Route path="/login/customer" element={<CustomerLogin/>}/>
            <Route path="/login/manager" element={<ServiceManagerLogin/>}/>
            <Route path="/login/technician" element={<TechnicianLogin/>}/>    
            <Route path="/login/admin" element={<AdminLogin/>}/>
            </Route>
               
            <Route path="/customer/dashboard" element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}><CustomerDashboard/></ProtectedRoute>}/>

            <Route path="/customer/profile" element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}><Profile/></ProtectedRoute>}/>

            <Route path="/customer/vehicles" element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}><MyVehicles/></ProtectedRoute>}/>

            <Route path="/customer/bookings" element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}><MyBookings/></ProtectedRoute>}/>

            <Route path="/customer/book-service" element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}><BookService/></ProtectedRoute>}/>

            <Route path="/customer/feedback" element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}><CustomerFeedback/></ProtectedRoute>}/>

            <Route path="/customer/invoices" element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}><Invoices/></ProtectedRoute>}/>

            <Route path="/customer/add-vehicle" element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}><AddVehicle/></ProtectedRoute>}/>
            
            <Route path="/customer/estimate/:id" element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}><CustomerEstimate/></ProtectedRoute>
            }/>
            <Route path="/technician/dashboard"
                element={<ProtectedRoute allowedRoles={["TECHNICIAN"]}><TechnicianDashboard/></ProtectedRoute>}/>

            <Route path="/technician/work-orders" element={
                <ProtectedRoute allowedRoles={["TECHNICIAN"]}><WorkOrders/></ProtectedRoute>
            }/>

            <Route path="/technician" element={
                <ProtectedRoute allowedRoles={["TECHNICIAN"]}><TechnicianLayout/></ProtectedRoute>
            }/>


            <Route path="/technician/profile" element ={<ProtectedRoute allowedRoles={["TECHNICIAN"]}><TechnicianProfile/></ProtectedRoute>}/>
            <Route path="/technician/customers" element ={<ProtectedRoute allowedRoles={["TECHNICIAN"]}><TechnicianPlaceholder/></ProtectedRoute>}/>
            <Route path="/technician/vehicles" element ={<ProtectedRoute allowedRoles={["TECHNICIAN"]}><TechnicianPlaceholder/></ProtectedRoute>}/>
            <Route path="/technician/inventory" element={<ProtectedRoute allowedRoles={["TECHNICIAN"]}><TechnicianPlaceholder/></ProtectedRoute>}/>
            <Route path="/technician/estimates" element={<ProtectedRoute allowedRoles={["TECHNICIAN"]}><TechnicianPlaceholder/></ProtectedRoute>}/>
            <Route path="/technician/reports" element={<ProtectedRoute allowedRoles={["TECHNICIAN"]}><TechnicianPlaceholder/></ProtectedRoute>}/>
            <Route path="/technician/settings" element={<ProtectedRoute allowedRoles={["TECHNICIAN"]}><TechnicianPlaceholder/></ProtectedRoute>}/>

            <Route path = "/work-orders/:id" element={
                <ProtectedRoute allowedRoles={["TECHNICIAN","MANAGER"]}><WorkOrderDetails/></ProtectedRoute>
            }/>

            <Route path="/customer/manage-profile" element={
                <ProtectedRoute allowedRoles={["CUSTOMER"]}><ManageProfile/></ProtectedRoute>}/>

            <Route path="/manager"
                element={
                    <ProtectedRoute allowedRoles={["MANAGER"]}>
                        <ServiceManagerLayout/>
                    </ProtectedRoute>
                }
            />

            <Route path="/manager/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["MANAGER"]}>
                        <CapacityDashboard/>
                    </ProtectedRoute>
                }
            />
                        
            <Route path="/manager/capacity"
                element={
                    <ProtectedRoute allowedRoles={["MANAGER"]}>
                        <CapacityConfig/>
                    </ProtectedRoute>
                }
            />

            <Route path="/manager/workshops" 
                element={
                    <ProtectedRoute allowedRoles={["MANAGER"]}>
                        <Workshops/>
                    </ProtectedRoute>
                }
            />

            <Route path="/manager/add-workshop"
                element={
                    <ProtectedRoute allowedRoles={["MANAGER"]}>
                        <AddWorkshop/>
                    </ProtectedRoute>
                }
            />

            <Route path="/manager/bookings"
                element={
                    <ProtectedRoute allowedRoles={["MANAGER"]}>
                        <Bookings />
                    </ProtectedRoute>
                 }
            />

            <Route path="/manager/catalog"
                element={
                    <ProtectedRoute allowedRoles={["MANAGER"]}>
                        <ServiceCatalog />
                    </ProtectedRoute>
                }
            />

            <Route path="/manager/reports"
                element={
                    <ProtectedRoute allowedRoles={["MANAGER"]}>
                        <Reports />
                    </ProtectedRoute>
                }
            />

            <Route path="/manager/technicians"
                element={
                    <ProtectedRoute allowedRoles={["MANAGER"]}>
                        <Technicians />
                    </ProtectedRoute>
                }
            />

            <Route path="/manager/feedback"
                element={
                    <ProtectedRoute allowedRoles={["MANAGER"]}>
                        <FeedbackManager />
                    </ProtectedRoute>
                }
            />

            <Route path="/admin/console"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminConsole />
                    </ProtectedRoute>
                }
            />
           

        </Routes>
        </BrowserRouter>
    );
};
export default AppRoutes;
