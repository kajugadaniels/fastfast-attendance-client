import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { loginUser } from '../../api'  // <--- import your API function

const Login = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // New: track loading state
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // If user is already logged in, optionally redirect away from login.
        const token = localStorage.getItem('token')
        if (token) {
            navigate('/dashboard')
        }

        // Check if there's an error param in the URL
        const errorParam = searchParams.get('error')
        if (errorParam === 'unauthorized') {
            toast.error('Unauthorized user cannot access that page. Please log in.')
        }
    }, [navigate, searchParams])

    const handleLogin = async (e) => {
        e.preventDefault()

        try {
            setLoading(true) // Start loading
            const response = await loginUser(email, password)
            // response => { token, user, message, etc. }

            // Store token
            localStorage.setItem('token', response.token)
            localStorage.setItem('user', JSON.stringify(response.user)) 
            toast.success(response.message || 'Login successful.')

            // Redirect to a protected route
            navigate('/dashboard')
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                toast.error(error.response.data.error)
            } else {
                toast.error('Login failed. Please check your credentials.')
            }
        } finally {
            setLoading(false) // End loading
        }
    }

    return (
        <div className="p-3 sm:px-8 relative h-screen lg:overflow-hidden bg-primary xl:bg-white dark:bg-darkmode-800 xl:dark:bg-darkmode-600 before:hidden before:xl:block before:content-[''] before:w-[57%] before:-mt-[28%] before:-mb-[16%] before:-ml-[13%] before:absolute before:inset-y-0 before:left-0 before:transform before:rotate-[-4.5deg] before:bg-primary/20 before:rounded-[100%] before:dark:bg-darkmode-400 after:hidden after:xl:block after:content-[''] after:w-[57%] after:-mt-[20%] after:-mb-[13%] after:-ml-[13%] after:absolute after:inset-y-0 after:left-0 after:transform after:rotate-[-4.5deg] after:bg-primary after:rounded-[100%] after:dark:bg-darkmode-700">
            <div className="container relative z-10 sm:px-10">
                <div className="block grid-cols-2 gap-4 xl:grid">
                    <div className="hidden min-h-screen flex-col xl:flex">
                        <a className="-intro-x flex items-center pt-5" href="/">
                            <img
                                className="w-6"
                                src="https://midone-html.left4code.com/dist/images/logo.svg"
                                alt="Midone - Tailwind Admin Dashboard Template"
                            />
                            <span className="ml-3 text-lg text-white">Midone </span>
                        </a>
                        <div className="my-auto">
                            <img
                                className="-intro-x -mt-16 w-1/2"
                                src="https://midone-html.left4code.com/dist/images/illustration.svg"
                                alt="Midone - Tailwind Admin Dashboard Template"
                            />
                            <div className="-intro-x mt-10 text-4xl font-medium leading-tight text-white">
                                A few more clicks to <br />
                                sign in to your account.
                            </div>
                            <div className="-intro-x mt-5 text-lg text-white text-opacity-70 dark:text-slate-400">
                                Casual Attendance
                            </div>
                        </div>
                    </div>
                    <div className="my-10 flex h-screen py-5 xl:my-0 xl:h-auto xl:py-0">
                        <form
                            className="mx-auto my-auto w-full rounded-md bg-white px-5 py-8 shadow-md dark:bg-darkmode-600 sm:w-3/4 sm:px-8 lg:w-2/4 xl:ml-20 xl:w-auto xl:bg-transparent xl:p-0 xl:shadow-none"
                            onSubmit={handleLogin}
                        >
                            <h2 className="intro-x text-center text-2xl font-bold xl:text-left xl:text-3xl">
                                Sign In
                            </h2>
                            <div className="intro-x mt-2 text-center text-slate-400 xl:hidden">
                                Casual Attendance
                            </div>
                            <div className="intro-x mt-8">
                                <input
                                    type="text"
                                    placeholder="Email"
                                    className="disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-darkmode-800/50 dark:disabled:border-transparent [&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed [&[readonly]]:dark:bg-darkmode-800/50 [&[readonly]]:dark:border-transparent transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:placeholder:text-slate-500/80 intro-x block min-w-full px-4 py-3 xl:min-w-[350px]"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-darkmode-800/50 dark:disabled:border-transparent [&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed [&[readonly]]:dark:bg-darkmode-800/50 [&[readonly]]:dark:border-transparent transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:placeholder:text-slate-500/80 intro-x mt-4 block min-w-full px-4 py-3 xl:min-w-[350px]"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="intro-x mt-4 flex text-xs text-slate-600 dark:text-slate-500 sm:text-sm">
                                <div className="mr-auto flex items-center">
                                    <input
                                        type="checkbox"
                                        className="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 mr-2 border"
                                        id="remember-me"
                                        disabled={loading}
                                    />
                                    <label className="cursor-pointer select-none" htmlFor="remember-me">
                                        Remember me
                                    </label>
                                </div>
                                <a href="">Forgot Password?</a>
                            </div>
                            <div className="intro-x mt-5 text-center xl:mt-8 xl:text-left">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`transition duration-200 border shadow-sm inline-flex items-center justify-center rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 dark:focus:ring-slate-700 dark:focus:ring-opacity-50 
                    bg-primary border-primary text-white dark:border-primary w-full px-10 py-3 
                    xl:mr-3 xl:w-48 disabled:opacity-70 disabled:cursor-not-allowed`}
                                >
                                    {loading ? (
                                        // Show a spinner (or any loader icon) while loading
                                        <div className="flex items-center">
                                            <span style={{ paddingRight: '10px' }}>
                                                Logging In
                                            </span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="1.4rem" height="1.4rem" viewBox="0 0 24 24"><circle cx="12" cy="2" r="0" fill="#fff"><animate attributeName="r" begin="0" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/></circle><circle cx="12" cy="2" r="0" fill="#fff" transform="rotate(45 12 12)"><animate attributeName="r" begin="0.125s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/></circle><circle cx="12" cy="2" r="0" fill="#fff" transform="rotate(90 12 12)"><animate attributeName="r" begin="0.25s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/></circle><circle cx="12" cy="2" r="0" fill="#fff" transform="rotate(135 12 12)"><animate attributeName="r" begin="0.375s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/></circle><circle cx="12" cy="2" r="0" fill="#fff" transform="rotate(180 12 12)"><animate attributeName="r" begin="0.5s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/></circle><circle cx="12" cy="2" r="0" fill="#fff" transform="rotate(225 12 12)"><animate attributeName="r" begin="0.625s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/></circle><circle cx="12" cy="2" r="0" fill="#fff" transform="rotate(270 12 12)"><animate attributeName="r" begin="0.75s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/></circle><circle cx="12" cy="2" r="0" fill="#fff" transform="rotate(315 12 12)"><animate attributeName="r" begin="0.875s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"/></circle></svg>
                                        </div>
                                    ) : (
                                        'Login'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
