import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'

const ProtectedRoute = () => {
    const token = localStorage.getItem('token')
    const location = useLocation()

    if (!token) {
        // Show toast error (or add your own logic)
        toast.error('Unauthorized user cannot access that page.')
        // Redirect to login with optional query param for further logic
        return <Navigate to="/?error=unauthorized" state={{ from: location }} replace />
    }

    // If user is logged in, render child routes
    return <Outlet />
}

export default ProtectedRoute
