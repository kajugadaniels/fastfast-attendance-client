import React from 'react'

const Login = () => {
    return (
        <div className="p-3 sm:px-8 relative h-screen lg:overflow-hidden bg-primary xl:bg-white dark:bg-darkmode-800 xl:dark:bg-darkmode-600 before:hidden before:xl:block before:content-[''] before:w-[57%] before:-mt-[28%] before:-mb-[16%] before:-ml-[13%] before:absolute before:inset-y-0 before:left-0 before:transform before:rotate-[-4.5deg] before:bg-primary/20 before:rounded-[100%] before:dark:bg-darkmode-400 after:hidden after:xl:block after:content-[''] after:w-[57%] after:-mt-[20%] after:-mb-[13%] after:-ml-[13%] after:absolute after:inset-y-0 after:left-0 after:transform after:rotate-[-4.5deg] after:bg-primary after:rounded-[100%] after:dark:bg-darkmode-700">
            <div className="container relative z-10 sm:px-10">
                <div className="block grid-cols-2 gap-4 xl:grid">
                    <div className="hidden min-h-screen flex-col xl:flex">
                        <a className="-intro-x flex items-center pt-5" href="/">
                            <img className="w-6" src="https://midone-html.left4code.com/dist/images/logo.svg" alt="Midone - Tailwind Admin Dashboard Template" />
                            <span className="ml-3 text-lg text-white">Midone </span>
                        </a>
                        <div className="my-auto">
                            <img className="-intro-x -mt-16 w-1/2" src="https://midone-html.left4code.com/dist/images/illustration.svg" alt="Midone - Tailwind Admin Dashboard Template" />
                            <div className="-intro-x mt-10 text-4xl font-medium leading-tight text-white">
                                A few more clicks to <br />sign in to your account.

                            </div>
                            <div className="-intro-x mt-5 text-lg text-white text-opacity-70 dark:text-slate-400">
                                Casual Attendance
                            </div>
                        </div>
                    </div>
                    <div className="my-10 flex h-screen py-5 xl:my-0 xl:h-auto xl:py-0">
                        <div className="mx-auto my-auto w-full rounded-md bg-white px-5 py-8 shadow-md dark:bg-darkmode-600 sm:w-3/4 sm:px-8 lg:w-2/4 xl:ml-20 xl:w-auto xl:bg-transparent xl:p-0 xl:shadow-none">
                            <h2 className="intro-x text-center text-2xl font-bold xl:text-left xl:text-3xl">Sign In
                            </h2>
                            <div className="intro-x mt-2 text-center text-slate-400 xl:hidden">
                                Casual Attendance
                            </div>
                            <div className="intro-x mt-8">
                                <input type="text" placeholder="Email" className="disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-darkmode-800/50 dark:disabled:border-transparent [&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed [&[readonly]]:dark:bg-darkmode-800/50 [&[readonly]]:dark:border-transparent transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:placeholder:text-slate-500/80 group-[.form-inline]:flex-1 group-[.input-group]:rounded-none group-[.input-group]:[&:not(:first-child)]:border-l-transparent group-[.input-group]:first:rounded-l group-[.input-group]:last:rounded-r group-[.input-group]:z-10 intro-x block min-w-full px-4 py-3 xl:min-w-[350px]" />
                                <input type="password" placeholder="Password" className="disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-darkmode-800/50 dark:disabled:border-transparent [&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed [&[readonly]]:dark:bg-darkmode-800/50 [&[readonly]]:dark:border-transparent transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:placeholder:text-slate-500/80 group-[.form-inline]:flex-1 group-[.input-group]:rounded-none group-[.input-group]:[&:not(:first-child)]:border-l-transparent group-[.input-group]:first:rounded-l group-[.input-group]:last:rounded-r group-[.input-group]:z-10 intro-x mt-4 block min-w-full px-4 py-3 xl:min-w-[350px]" />
                            </div>
                            <div className="intro-x mt-4 flex text-xs text-slate-600 dark:text-slate-500 sm:text-sm">
                                <div className="mr-auto flex items-center">
                                    <input type="checkbox" className="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&[type='radio']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10 [&[type='checkbox']]:checked:bg-primary [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&:disabled:not(:checked)]:bg-slate-100 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:not(:checked)]:dark:bg-darkmode-800/50 [&:disabled:checked]:opacity-70 [&:disabled:checked]:cursor-not-allowed [&:disabled:checked]:dark:bg-darkmode-800/50 mr-2 border" id="remember-me" />
                                    <label className="cursor-pointer select-none" for="remember-me">
                                        Remember me
                                    </label>
                                </div>
                                <a href="">Forgot Password?</a>
                            </div>
                            <div className="intro-x mt-5 text-center xl:mt-8 xl:text-left">
                                <button className="transition duration-200 border shadow-sm inline-flex items-center justify-center rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-primary border-primary text-white dark:border-primary w-full px-4 py-3 align-top xl:mr-3 xl:w-32">Login</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login