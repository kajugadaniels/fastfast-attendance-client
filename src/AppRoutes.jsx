import React from 'react'
import { AddEmployee, EditEmployee, GetEmployees, NotFound, Profile, ShowEmployee } from './pages'
import { Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import { Dashboard, Login } from './pages'

const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<Login />} />
            <Route element={<AppLayout />}>
                <Route path="/profile" element={<Profile />} />

                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/employees" element={<GetEmployees />} />
                <Route path="/employee/add" element={<AddEmployee />} />
                <Route path="/employee/:id" element={<ShowEmployee />} />
                <Route path="/employee/:id/edit" element={<EditEmployee />} />
            </Route>
            <Route path='*' element={<NotFound />} />
        </Routes>
    )
}

export default AppRoutes