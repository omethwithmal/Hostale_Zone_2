import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 

// Hostel website components
import NaveBar from "./components/NaveBar/NaveBar";
import Footer from "./components/Footer/Footer";
import HeroSection from "./components/Home/HeroSection";
import About from "./components/Home/About";
import Contact from "./components/Home/Contact";
import Rules from "./components/Home/Rules";
import Rooms from "./components/Home/Rooms";
import Dmodel from "./components/Home/Dmodel";

import RoomChangeRequest from "./components/RoomChangeRequest/RoomChangeRequest";
import RoomDetailsForm from "./components/Add Room/RoomDetailsForm";
import RoomTransferRequest from "./components/RoomTransferRequest ADMIN/RoomTransferRequest";
import RoomManagementDashboard from "./components/RoomManagementDashboard/RoomManagementDashboard";
import RoomManageMentNavebar from "./components/RoomManageMentNavebar/RoomManageMentNavebar";
import RoomManagementSidebar from "./components/RoomManageMentNavebar/RoomManagementSidebar";
import GoogleSheetTable from "./components/Attendance/GoogleSheetTable";



//Ranga
import R_AdminDashboard from "./components/RANGA/R_AdminDashboard";
import R_AdminLeaveManagement from "./components/RANGA/R_AdminLeaveManagement";
import StudentRegistration from "./components/Auth/StudentRegistration";
import SignIn from "./components/Auth/SignIn";
import StudentProfile from "./components/Auth/StudentProfile";
import LeaveRequest from "./components/RANGA/LeaveRequest";


//hansica
import Complaints from "./components/complain/complain";






// Home Page Component
function Home() {
  return (
    <>
      <NaveBar />
      <HeroSection />
      <Rooms />
      
      <About />
      <Dmodel /> {/* Your 3D model */}
      <Contact />
      <Rules />
      <Footer />
    </>
  );
}

// Another page/component example for the "One" component
function ExternalView() {
  return (
    <div className="App">
      <Dmodel 
        websiteUrl="https://your-website.com"
        websiteTitle="Your Website"
        showControls={true}
        autoRotate={false}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/external" element={<ExternalView />} />
        <Route path="/room-change-request" element={<RoomChangeRequest />} />
        <Route path="/RoomDetailsForm" element={<RoomDetailsForm />} />
        <Route path="/RoomTransferRequest" element={<RoomTransferRequest />} />
        <Route path="/RoomManagementDashboard" element={<RoomManagementDashboard />} />
        <Route path="/RoomManageMentNavebar" element={<RoomManageMentNavebar />} />
        <Route path="/RoomManagementSidebar" element={<RoomManagementSidebar />} />
        <Route path="/GoogleSheetTable" element={<GoogleSheetTable />} />


        //Ranga
       <Route path="/R_AdminDashboard" element={<R_AdminDashboard />} />
       <Route path="/R_AdminLeaveManagement" element={<R_AdminLeaveManagement />} />
        <Route path="/StudentRegistration" element={<StudentRegistration />} />
        <Route path="/StudentProfile" element={<StudentProfile />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/LeaveRequest" element={<LeaveRequest />} />

        //hansica
        <Route path="/Complaints" element={<Complaints />} />
        


      </Routes>
    </Router>
  );
}

export default App;
