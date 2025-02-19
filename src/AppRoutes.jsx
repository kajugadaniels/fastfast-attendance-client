import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import { Dashboard, Login, AddEmployee, EditEmployee, GetAttendances, GetEmployees, NotFound, Profile, ShowEmployee, EmployeeDetails } from './pages'
import ProtectedRoute from './components/ProtectedRoute'

const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<Login />} />
            <Route path="/employee/:employeeId/details" element={<EmployeeDetails />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    <Route path="/employees" element={<GetEmployees />} />
                    <Route path="/employee/add" element={<AddEmployee />} />
                    <Route path="/employee/:id" element={<ShowEmployee />} />
                    <Route path="/employee/:id/edit" element={<EditEmployee />} />

                    <Route path="/attendance" element={<GetAttendances />} />
                </Route>
            </Route>

            <Route path='*' element={<NotFound />} />
        </Routes>
    )
}

export default AppRoutes
