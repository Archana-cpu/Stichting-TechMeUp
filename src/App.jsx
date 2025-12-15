import { Route, Routes } from "react-router-dom"
import Appointments from "./pages/Appointments"
import Login from "./pages/auth/Login"
import SignUp from "./pages/auth/SignUp"
import Dashboard from "./pages/Dashboard"
import HealthLogs from "./pages/HealthLogs"
import Medicines from "./pages/Medicines"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {

  return (
    <div className="bg-white w-full h-screen">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
        <Route path="/dashboard/logs" element={<ProtectedRoute> <HealthLogs /> </ProtectedRoute>} />
        <Route path="/dashboard/appointments" element={<ProtectedRoute> <Appointments /> </ProtectedRoute>} />
        <Route path="/dashboard/medicines" element={<ProtectedRoute> <Medicines /> </ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App