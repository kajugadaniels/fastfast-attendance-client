import React from 'react'

const NotFound = () => {
    return (
        <div className="py-2 bg-gradient-to-b from-theme-1 to-theme-2 dark:from-darkmode-800 dark:to-darkmode-800">
            <div className="container">
                <div className="flex flex-col items-center justify-center h-screen text-center error-page lg:flex-row lg:text-left">
                    <div className="-intro-x lg:mr-20">
                        <img className="h-48 w-[450px] lg:h-auto" src="https://midone-html.left4code.com/dist/images/error-illustration.svg" alt="" />
                    </div>
                    <div className="mt-10 text-white lg:mt-0">
                        <div className="font-medium intro-x text-8xl">404</div>
                        <div className="mt-5 text-xl font-medium intro-x lg:text-3xl">
                            Oops. This page has gone missing.
                        </div>
                        <div className="mt-3 text-lg intro-x">
                            You may have mistyped the address or the page may have moved.
                        </div>
                        <a href='/' className="transition duration-200 border shadow-sm inline-flex items-center justify-center rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed px-4 py-3 mt-10 text-white border-white intro-x dark:border-darkmode-400 dark:text-slate-200">Back to Home</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotFound