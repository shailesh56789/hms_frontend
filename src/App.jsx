import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddPatient from './pages/AddPatient';
import PatientList from './pages/PatientList';
import EditPatient from './pages/EditPatient';
import ViewPatient from './pages/ViewPatient';
import DiagnosesList from './pages/DiagnosesList';
import AddDiagnosis from './pages/AddDiagnosis';
import ProductList from './pages/ProductList';
import UserList from './pages/UserList';
import AddUser from './pages/AddUser';
import Register from './pages/Register';
import './index.css';

// A simple PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      

      {/* Protected Routes wrapped in Layout */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Actual Pages */}
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patients/new" element={<AddPatient />} />
        <Route path="/patients/:id" element={<ViewPatient />} />
        <Route path="/patients/:id/edit" element={<EditPatient />} />
        <Route path="/diagnoses" element={<DiagnosesList />} />
        <Route path="/diagnoses/new" element={<AddDiagnosis />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/users/new" element={<AddUser />} />
      </Route>

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
