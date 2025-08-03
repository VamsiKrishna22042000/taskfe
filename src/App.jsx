import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./Signup/Signup.jsx";
import Signin from "./Signin/Signin.jsx";
import TaskDashboard from "./TaskDashboard/TaskDashboard.jsx";
import Notfound from "./Notfound/Notfound.jsx";
import "./App.css";
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute.jsx";

function App() {
  return (
    <Router basename="/taskdashboard">
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <TaskDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Notfound />} />
      </Routes>
    </Router>
  );
}

export default App;
