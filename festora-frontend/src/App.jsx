import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute.jsx";

import AllEvents from "./pages/organizer/AllEvents.jsx";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import CreateEvent from "./pages/organizer/CreateEvent";
import EditEvent from "./pages/organizer/EditEvent.jsx";
import UserDashboard from "./pages/UserDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EventDetails from "./pages/EventDetails";
import MyBookings from "./pages/MyBookings.jsx";
import VenueManagement from "./pages/admin/VenueManagement.jsx";
import CategoryManagement from "./pages/admin/CategoryManagement.jsx";
import Payment from "./pages/PaymentPage.jsx"
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route
          path="/organizer/dashboard"
          element={
            <PrivateRoute>
              <OrganizerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/organizer/events"
          element={
            <PrivateRoute role="ROLE_ORGANIZER">
              <AllEvents />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <PrivateRoute role="ROLE_ADMIN">
              <CategoryManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/venues"
          element={
            <PrivateRoute role="ROLE_ADMIN">
              <VenueManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/user/dashboard"
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/organizer/events/create"
          element={
            <PrivateRoute role="ROLE_ORGANIZER">
              <CreateEvent />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment/:bookingId"
          element={
            <PrivateRoute role="ROLE_USER">
              <Payment />
            </PrivateRoute>
          }
        />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/event/:id" element={<EventDetails />} />
        <Route
          path="/organizer/events/edit/:id"
          element={
            <PrivateRoute role="ROLE_ORGANIZER">
              <EditEvent />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
