import React from 'react'
import { NotFound } from './pages'
import { Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import { Dashboard, Login } from './pages'

const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<Login />} />
            <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route path='*' element={<NotFound />} />
        </Routes>
    )
}

export default AppRoutes