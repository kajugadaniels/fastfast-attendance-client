import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'

const ProtectedRoute = () => {
    const token = localStorage.getItem('token')
    const location = useLocation()

    if (!token) {
        // Show toast error and redirect to login if no token
        toast.error('Unauthorized user cannot access that page.')
        return <Navigate to="/?error=unauthorized" state={{ from: location }} replace />
    }

    // Simulate a token check (e.g., make an API call or decode the token)
    const isTokenValid = true // Replace with real token validation logic (e.g., decoding token)

    if (!isTokenValid) {
        // Show toast error and logout the user if token is invalid
        toast.error('Your session has expired or the token is invalid. Please log in again.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return <Navigate to="/" replace />
    }

    // If token is valid, render child routes
    return <Outlet />
}

export default ProtectedRoute
