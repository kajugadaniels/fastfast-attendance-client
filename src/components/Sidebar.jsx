import React from 'react'
import { House } from 'lucide-react'

const Sidebar = () => {
    return (
        <nav className="side-nav hidden w-[80px] overflow-x-hidden pb-16 pr-5 md:block xl:w-[230px]">
            <a className="flex items-center pt-4 pl-5 intro-x" href="/dashboard">
                <img className="w-6" src="https://midone-html.left4code.com/dist/images/logo.svg" alt="" />
                <span className="hidden ml-3 text-lg text-white xl:block"> CAPS </span>
            </a>
            <div className="my-6 side-nav__divider"></div>
            <ul>
                <li>
                    <a href="/dashboard" className="side-menu">
                        <div className="side-menu__icon">
                            <House className="stroke-1.5 w-5 h-5" />
                        </div>
                        <div className="side-menu__title">
                            Dashboard
                        </div>
                    </a>
                </li>
            </ul>
        </nav>
    )
}

export default Sidebar