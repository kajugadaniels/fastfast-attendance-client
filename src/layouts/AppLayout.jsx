import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header, Sidebar } from '../components'

const AppLayout = () => {
    return (
        <div>
            <Header />

            <Sidebar />

            <Outlet />
        </div>
    )
}

export default AppLayout