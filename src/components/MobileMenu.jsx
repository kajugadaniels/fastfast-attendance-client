import React, { useState } from 'react'
import { ChartBar, CircleX, House, Speaker, UsersRound } from 'lucide-react'
import { useLocation, NavLink } from 'react-router-dom'

const MobileMenu = () => {
    const { pathname } = useLocation()
    const [isMenuActive, setIsMenuActive] = useState(false)

    const isDashboardActive = pathname === '/dashboard'
    const isEmployeesActive = pathname.startsWith('/employees') || pathname.startsWith('/employee')
    const isAttendanceActive = pathname === '/attendance'

    const handleToggleMenu = (e) => {
        e.preventDefault()
        setIsMenuActive((prev) => !prev)
    }

    const handleLinkClick = () => {
        if (isMenuActive) {
            setIsMenuActive(false)
        }
    }

    return (
        <div
            className={`mobile-menu group top-0 inset-x-0 fixed bg-theme-1/90 z-[60] border-b border-white/[0.08] dark:bg-darkmode-800/90 md:hidden before:content-[''] before:w-full before:h-screen before:z-10 before:fixed before:inset-x-0 before:bg-black/90 before:transition-opacity before:duration-200 before:ease-in-out before:invisible before:opacity-0 ${isMenuActive ? 'mobile-menu--active' : ''
                }`}
        >
            <div className="flex h-[70px] items-center px-3 sm:px-8">
                <NavLink className="mr-auto flex" to="/dashboard" onClick={handleLinkClick}>
                    <img
                        className="w-6"
                        src="https://midone-html.left4code.com/dist/images/logo.svg"
                        alt="Logo"
                    />
                </NavLink>
                {!isMenuActive && (
                    <a
                        className="mobile-menu-toggler"
                        href="#"
                        onClick={handleToggleMenu}
                    >
                        <ChartBar className="stroke-1.5 h-8 w-8 -rotate-90 transform text-white" />
                    </a>
                )}
            </div>
            <div className="scrollable h-screen z-20 top-0 left-0 w-[270px] -ml-[100%] bg-primary transition-all duration-300 ease-in-out dark:bg-darkmode-800 [&[data-simplebar]]:fixed [&_.simplebar-scrollbar]:before:bg-black/50 group-[.mobile-menu--active]:ml-0">
                {isMenuActive && (
                    <a
                        href="#"
                        className="fixed top-0 right-0 mt-4 mr-4 transition-opacity duration-200 ease-in-out"
                        onClick={handleToggleMenu}
                    >
                        <CircleX className="stroke-1.5 h-8 w-8 -rotate-90 transform text-white" />
                    </a>
                )}
                <ul className="py-2">
                    <li>
                        <NavLink
                            to="/dashboard"
                            className={() =>
                                `menu ${isDashboardActive ? 'side-menu--active' : ''}`
                            }
                            onClick={handleLinkClick}
                        >
                            <div className="menu__icon">
                                <House className="stroke-1.5 w-5 h-5" />
                            </div>
                            <div className="menu__title">Dashboard</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/employees"
                            className={() =>
                                `menu ${isEmployeesActive ? 'side-menu--active' : ''}`
                            }
                            onClick={handleLinkClick}
                        >
                            <div className="menu__icon">
                                <UsersRound className="stroke-1.5 w-5 h-5" />
                            </div>
                            <div className="menu__title">Employees</div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/attendance"
                            className={() =>
                                `menu ${isAttendanceActive ? 'side-menu--active' : ''}`
                            }
                            onClick={handleLinkClick}
                        >
                            <div className="menu__icon">
                                <Speaker className="stroke-1.5 w-5 h-5" />
                            </div>
                            <div className="menu__title">Attendance</div>
                        </NavLink>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default MobileMenu
