import React from 'react'
import { ToggleRight, UserCircle } from 'lucide-react'

const Header = () => {
    return (
        <div className="relative z-[51] flex h-[67px] items-center border-b border-slate-200">
            <nav aria-label="breadcrumb" className="flex -intro-x mr-auto hidden sm:flex">
                <ol className="flex items-center text-theme-1 dark:text-slate-300">
                    <li>
                        <a href="/dashboard">Dashboard</a>
                    </li>
                </ol>
            </nav>
            <div className="dropdown relative">
                <button aria-expanded="false" className="cursor-pointer image-fit zoom-in intro-x block h-8 w-8 overflow-hidden rounded-full shadow-lg">
                    <img src="https://midone-html.left4code.com/dist/images/fakers/profile-6.jpg" alt="" />
                </button>
                <div className="dropdown-menu absolute z-[9999] hidden">
                    <div className="dropdown-content rounded-md border-transparent p-2 shadow-[0px_3px_10px_#00000017] dark:border-transparent dark:bg-darkmode-600 mt-px w-56 bg-theme-1 text-white">
                        <div className="p-2 font-medium font-normal">
                            <div className="font-medium">Johnny Depp</div>
                            <div className="mt-0.5 text-xs text-white/70 dark:text-slate-500">
                                Backend Engineer
                            </div>
                        </div>
                        <div className="h-px my-2 -mx-2 bg-slate-200/60 dark:bg-darkmode-400 bg-white/[0.08]">
                        </div>
                        <a className="cursor-pointer flex items-center p-2 transition duration-300 ease-in-out rounded-md hover:bg-slate-200/60 dark:bg-darkmode-600 dark:hover:bg-darkmode-400 dropdown-item hover:bg-white/5" href='/profile'>
                            <UserCircle className="stroke-1.5 mr-2 h-4 w-4" />
                            Profile
                        </a>
                        <div className="h-px my-2 -mx-2 bg-slate-200/60 dark:bg-darkmode-400 bg-white/[0.08]"></div>
                        <a className="cursor-pointer flex items-center p-2 transition duration-300 ease-in-out rounded-md hover:bg-slate-200/60 dark:bg-darkmode-600 dark:hover:bg-darkmode-400 dropdown-item hover:bg-white/5">
                            <ToggleRight className="stroke-1.5 mr-2 h-4 w-4" />
                            Logout
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header