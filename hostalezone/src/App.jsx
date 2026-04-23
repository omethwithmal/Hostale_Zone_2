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

// Ranga module
import R_AdminDashboard from "./components/RANGA/R_AdminDashboard";
import R_AdminLeaveManagement from "./components/RANGA/R_AdminLeaveManagement";
import LeaveRequest from "./components/RANGA/LeaveRequest";

// Auth components
import StudentRegistration from "./components/Auth/StudentRegistration";
import SignIn from "./components/Auth/SignIn";
import StudentProfile from "./components/Auth/StudentProfile";

// Complaint module
import Complaints from "./components/complain/complain";
import AdminPanel from "./components/complain/AdminPanel";
import Dashboard from "./components/complain/Dashboard";
import NewComplaint from "./components/complain/NewComplaint";
import ComplaintHome from "./components/complain/Home";
import ComplaintDetails from "./components/complain/ComplaintDetails";

// Main landing page
function HomePage() {
  return (
    <>
      <NaveBar />
      <HeroSection />
      <Rooms />
      <About />
      <Dmodel />
      <Contact />
      <Rules />
      <Footer />
    </>
  );
}

// Optional external 3D model page
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
        {/* Main website routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/external" element={<ExternalView />} />

        {/* Room management routes */}
        <Route path="/room-change-request" element={<RoomChangeRequest />} />
        <Route path="/RoomDetailsForm" element={<RoomDetailsForm />} />
        <Route path="/RoomTransferRequest" element={<RoomTransferRequest />} />
        <Route path="/GoogleSheetTable" element={<GoogleSheetTable />} />
        <Route
          path="/RoomManagementDashboard"
          element={<RoomManagementDashboard />}
        />
        <Route
          path="/RoomManageMentNavebar"
          element={<RoomManageMentNavebar />}
        />
        <Route
          path="/RoomManagementSidebar"
          element={<RoomManagementSidebar />}
        />

        {/* Leave / admin module routes */}
        <Route path="/R-AdminDashboard" element={<R_AdminDashboard />} />
        <Route
          path="/R-AdminLeaveManagement"
          element={<R_AdminLeaveManagement />}
        />
        <Route path="/LeaveRequest" element={<LeaveRequest />} />

        {/* Auth routes */}
        <Route path="/StudentRegistration" element={<StudentRegistration />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/StudentProfile" element={<StudentProfile />} />

        {/* Complaint module routes */}
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/complaint" element={<NewComplaint />} />
        <Route path="/new-complaint" element={<NewComplaint />} />
        <Route path="/complaint-dashboard" element={<Dashboard />} />
        <Route path="/complaint-admin" element={<AdminPanel />} />
        <Route path="/complaint-home" element={<ComplaintHome />} />
        <Route path="/complaint-details/:id" element={<ComplaintDetails />} />
      </Routes>
    </Router>
  );
}

export default App;