import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header, Sidebar } from '../components'

const AppLayout = () => {
    return (
        <div class="rubick px-5 sm:px-8 py-5 before:content-[''] before:bg-gradient-to-b before:from-theme-1 before:to-theme-2 dark:before:from-darkmode-800 dark:before:to-darkmode-800 before:fixed before:inset-0 before:z-[-1]">
            <Header />

            <Sidebar />

            <Outlet />
        </div>
    )
}

export default AppLayout