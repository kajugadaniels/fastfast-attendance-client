import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToggleRight, UserCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { logoutUser } from '../api' // <--- Make sure your logoutUser function is imported

const Header = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)
    const navigate = useNavigate()

    // Retrieve user info from localStorage (if exists)
    const [userData, setUserData] = useState({
        name: '',
        role: '',
    })

    useEffect(() => {
        const userString = localStorage.getItem('user')
        if (userString) {
            const parsedUser = JSON.parse(userString)
            setUserData({
                name: parsedUser?.name || '',
                role: parsedUser?.role || '',
            })
        }
    }, [])

    const handleToggleDropdown = () => {
        setDropdownOpen((prev) => !prev)
    }

    // Close dropdown if click is detected outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleLogout = async () => {
        try {
            // (Optional) If you want to notify the backend to delete the token:
            await logoutUser()

            // Clear local storage
            localStorage.removeItem('token')
            localStorage.removeItem('user')

            toast.success('You have successfully logged out.')
            navigate('/')
        } catch (error) {
            toast.error('An error occurred during logout. Please try again.')
        }
    }

    return (
        <div className="relative z-[51] flex h-[67px] items-center border-b border-slate-200">
            <nav aria-label="breadcrumb" className="flex -intro-x mr-auto hidden sm:flex">
                <ol className="flex items-center text-theme-1 dark:text-slate-300">
                    <li>
                        <a href="/dashboard">Dashboard</a>
                    </li>
                </ol>
            </nav>
            {/* Attach ref to the dropdown wrapper */}
            <div className="dropdown relative" ref={dropdownRef}>
                <button
                    aria-expanded={dropdownOpen ? 'true' : 'false'}
                    className="cursor-pointer image-fit zoom-in intro-x block h-8 w-8 overflow-hidden rounded-full shadow-lg"
                    onClick={handleToggleDropdown}
                >
                    <img
                        src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                        alt=""
                    />
                </button>
                <div
                    className={
                        dropdownOpen
                            ? 'absolute z-30 top-[100%] right-0'
                            : 'dropdown-menu z-[9999] hidden absolute invisible opacity-0 translate-y-1'
                    }
                >
                    <div className="dropdown-content rounded-md border-transparent p-2 shadow-[0px_3px_10px_#00000017] dark:border-transparent dark:bg-darkmode-600 mt-px w-56 bg-theme-1 text-white">
                        <div className="p-2 font-medium font-normal">
                            <div className="font-medium">
                                {userData.name || 'Unknown User'}
                            </div>
                            <div className="mt-0.5 text-xs text-white/70 dark:text-slate-500">
                                {userData.role || 'Unknown Role'}
                            </div>
                        </div>
                        <div className="h-px my-2 -mx-2 bg-slate-200/60 dark:bg-darkmode-400 bg-white/[0.08]" />
                        <a
                            className="cursor-pointer flex items-center p-2 transition duration-300 ease-in-out rounded-md hover:bg-slate-200/60 dark:bg-darkmode-600 dark:hover:bg-darkmode-400 dropdown-item hover:bg-white/5"
                            href="/profile"
                        >
                            <UserCircle className="stroke-1.5 mr-2 h-4 w-4" />
                            Profile
                        </a>
                        <div className="h-px my-2 -mx-2 bg-slate-200/60 dark:bg-darkmode-400 bg-white/[0.08]" />
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="cursor-pointer flex items-center p-2 w-full text-left transition duration-300 ease-in-out rounded-md hover:bg-slate-200/60 dark:bg-darkmode-600 dark:hover:bg-darkmode-400 dropdown-item hover:bg-white/5"
                        >
                            <ToggleRight className="stroke-1.5 mr-2 h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header
