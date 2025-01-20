import React from 'react'
import { ChartBar, CircleX, CreditCard } from 'lucide-react';

const Sidebar = () => {
    return (
        <>
            <div className="mobile-menu group top-0 inset-x-0 fixed bg-theme-1/90 z-[60] border-b border-white/[0.08] dark:bg-darkmode-800/90 md:hidden before:content-[''] before:w-full before:h-screen before:z-10 before:fixed before:inset-x-0 before:bg-black/90 before:transition-opacity before:duration-200 before:ease-in-out before:invisible before:opacity-0 [&.mobile-menu--active]:before:visible [&.mobile-menu--active]:before:opacity-100">
                <div className="flex h-[70px] items-center px-3 sm:px-8">
                    <a className="mr-auto flex" href="">
                        <img className="w-6" src="https://midone-html.left4code.com/dist/images/logo.svg" alt="" />
                    </a>
                    <a className="mobile-menu-toggler" href="#">
                        <ChartBar className="stroke-1.5 h-8 w-8 -rotate-90 transform text-white" />
                    </a>
                </div>
                <div className="scrollable h-screen z-20 top-0 left-0 w-[270px] -ml-[100%] bg-primary transition-all duration-300 ease-in-out dark:bg-darkmode-800 [&[data-simplebar]]:fixed [&_.simplebar-scrollbar]:before:bg-black/50 group-[.mobile-menu--active]:ml-0">
                    <a href="#" className="fixed top-0 right-0 mt-4 mr-4 transition-opacity duration-200 ease-in-out invisible opacity-0 group-[.mobile-menu--active]:visible group-[.mobile-menu--active]:opacity-100">
                        <CircleX className="stroke-1.5 mobile-menu-toggler h-8 w-8 -rotate-90 transform text-white" />
                    </a>
                    <ul className="py-2">
                        <li>
                            <a className="menu" href="rubick-side-menu-point-of-sale-page.html">
                                <div className="menu__icon">
                                    <CreditCard className="stroke-1.5 w-5 h-5" />
                                </div>
                                <div className="menu__title">
                                    Dashboard
                                </div>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Sidebar