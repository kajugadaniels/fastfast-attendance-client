import React from 'react'
import {  } from './pages'
import { Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
            </Route>
        </Routes>
    )
}

export default AppRoutes