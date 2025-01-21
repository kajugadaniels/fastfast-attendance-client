import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { CloudUpload, Eye, Lightbulb, ToggleLeft } from 'lucide-react'
import { fetchEmployee, updateEmployee } from '../../api'

const EditEmployee = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    // Track form data and loading states
    const [formData, setFormData] = useState({
        name: '',
        finger_id: '',
        gender: '',
        phone: '',
        position: '',
        salary: ''
    })
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    // Fetch existing employee data on mount
    useEffect(() => {
        const getEmployee = async () => {
            try {
                setInitialLoading(true)
                const res = await fetchEmployee(id)
                if (res.data) {
                    const emp = res.data
                    setFormData({
                        name: emp.name || '',
                        finger_id: emp.finger_id?.toString() || '',
                        gender: emp.gender || '',
                        phone: emp.phone || '',
                        position: emp.position || '',
                        salary: emp.salary?.toString() || ''
                    })
                }
            } catch (error) {
                toast.error(
                    error.response?.data?.message?.detail ||
                    error.response?.data?.detail ||
                    'Failed to load employee data.'
                )
            } finally {
                setInitialLoading(false)
            }
        }

        getEmployee()
    }, [id])

    // Handle change in form inputs
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Validate required fields
    const validateForm = () => {
        const { name, finger_id, gender, phone, position, salary } = formData
        if (
            !name.trim() ||
            !finger_id.trim() ||
            !gender ||
            !phone.trim() ||
            !position ||
            !salary.trim()
        ) {
            toast.error('Please fill in all required fields.')
            return false
        }
        return true
    }

    // Submit updated employee data
    const handleUpdateEmployee = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            setLoading(true)
            await updateEmployee(id, {
                name: formData.name,
                phone: formData.phone,
                gender: formData.gender,
                position: formData.position,
                salary: formData.salary,
                finger_id: formData.finger_id
            })
            toast.success('Employee updated successfully.')
            navigate('/employees')
        } catch (error) {
            toast.error(
                error.response?.data?.message?.detail ||
                error.response?.data?.detail ||
                'Error updating employee.'
            )
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <svg
                        className="animate-spin h-6 w-6 mb-2 text-primary inline-block"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4l3.5-3.5L12 1V0a10 10 0 00-10 10h2z"
                        ></path>
                    </svg>
                    <p>Loading employee data...</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="intro-y col-span-12 mt-8 flex flex-wrap items-center xl:flex-nowrap">
                <h2 className="mr-auto text-lg font-medium">
                    Edit Employee
                </h2>
                <a
                    href="/employees"
                    className="transition duration-200 border inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 bg-primary border-primary text-white dark:border-primary mr-2 shadow-md"
                >
                    Go Back
                    <span className="flex h-5 w-5 items-center justify-center">
                        <Eye className="stroke-1.5 h-4 w-4" />
                    </span>
                </a>
            </div>

            <form onSubmit={handleUpdateEmployee}>
                <div className="mt-5 grid grid-cols-11 gap-x-6 pb-20">
                    <div className="intro-y col-span-11 2xl:col-span-9">
                        <div className="intro-y box mt-5 p-5">
                            <div className="rounded-md border border-slate-200/60 p-5 dark:border-darkmode-400">
                                <div className="flex items-center border-b border-slate-200/60 pb-5 text-base font-medium dark:border-darkmode-400">
                                    Edit Employee
                                </div>
                                <div className="mt-5">
                                    {/* Name & Finger ID */}
                                    <div className="block sm:flex group form-inline mt-5 flex-col items-start pt-5 xl:flex-row">
                                        <label className="inline-block mb-2 xl:!mr-10 xl:w-64">
                                            <div className="text-left">
                                                <div className="flex items-center">
                                                    <div className="font-medium">Name & Finger ID</div>
                                                    <div className="ml-2 rounded-md bg-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:bg-darkmode-300 dark:text-slate-400">
                                                        Required
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-xs leading-relaxed text-slate-500">
                                                    Please update the employee’s name and unique finger ID if necessary.
                                                </div>
                                            </div>
                                        </label>
                                        <div className="mt-3 w-full flex-1 xl:mt-0 grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Enter Employee Name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="disabled:bg-slate-100 dark:disabled:bg-darkmode-800/50 transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary dark:bg-darkmode-800"
                                            />
                                            <input
                                                type="number"
                                                name="finger_id"
                                                placeholder="Finger ID"
                                                value={formData.finger_id}
                                                onChange={handleChange}
                                                className="disabled:bg-slate-100 dark:disabled:bg-darkmode-800/50 transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary dark:bg-darkmode-800"
                                            />
                                        </div>
                                    </div>

                                    {/* Gender & Phone Number */}
                                    <div className="block sm:flex group form-inline mt-5 flex-col items-start pt-5 xl:flex-row">
                                        <label className="inline-block mb-2 xl:!mr-10 xl:w-64">
                                            <div className="text-left">
                                                <div className="flex items-center">
                                                    <div className="font-medium">Gender & Phone Number</div>
                                                    <div className="ml-2 rounded-md bg-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:bg-darkmode-300 dark:text-slate-400">
                                                        Required
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-xs leading-relaxed text-slate-500">
                                                    Update the employee's gender and phone number if needed.
                                                </div>
                                            </div>
                                        </label>
                                        <div className="mt-3 w-full flex-1 xl:mt-0 grid grid-cols-2 gap-3">
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="disabled:bg-slate-100 dark:disabled:bg-darkmode-800/50 transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 pr-8 focus:ring-4 focus:ring-primary dark:bg-darkmode-800"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="M">Male</option>
                                                <option value="F">Female</option>
                                                <option value="O">Other</option>
                                            </select>
                                            <input
                                                type="text"
                                                name="phone"
                                                placeholder="Enter Phone Number"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="disabled:bg-slate-100 dark:disabled:bg-darkmode-800/50 transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary dark:bg-darkmode-800"
                                            />
                                        </div>
                                    </div>

                                    {/* Position & Salary */}
                                    <div className="block sm:flex group form-inline mt-5 flex-col items-start pt-5 xl:flex-row">
                                        <label className="inline-block mb-2 xl:!mr-10 xl:w-64">
                                            <div className="text-left">
                                                <div className="flex items-center">
                                                    <div className="font-medium">Position & Salary</div>
                                                    <div className="ml-2 rounded-md bg-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:bg-darkmode-300 dark:text-slate-400">
                                                        Required
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-xs leading-relaxed text-slate-500">
                                                    Update the employee’s position and salary if changed.
                                                </div>
                                            </div>
                                        </label>
                                        <div className="mt-3 w-full flex-1 xl:mt-0 grid grid-cols-2 gap-3">
                                            <select
                                                name="position"
                                                value={formData.position}
                                                onChange={handleChange}
                                                className="disabled:bg-slate-100 dark:disabled:bg-darkmode-800/50 transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 pr-8 focus:ring-4 focus:ring-primary dark:bg-darkmode-800"
                                            >
                                                <option value="">Select Position</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Engineer">Engineer</option>
                                                <option value="Accountant">Accountant</option>
                                                <option value="Administration">Administration</option>
                                                {/* Add more if needed */}
                                            </select>
                                            <input
                                                type="number"
                                                name="salary"
                                                placeholder="Enter Employee Salary"
                                                value={formData.salary}
                                                onChange={handleChange}
                                                className="disabled:bg-slate-100 dark:disabled:bg-darkmode-800/50 transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary dark:bg-darkmode-800"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-5 flex flex-col justify-end gap-2 md:flex-row">
                                <a
                                    href="/employees"
                                    type="button"
                                    className="transition duration-200 border shadow-sm inline-flex items-center justify-center px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 bg-white dark:bg-darkmode-800 text-slate-500 dark:text-slate-300 dark:focus:ring-slate-700 w-full py-3 md:w-52"
                                >
                                    Cancel
                                    <span className="flex h-5 w-5 items-center justify-center ml-1">
                                        <ToggleLeft className="stroke-1.5 h-4 w-4" />
                                    </span>
                                </a>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="transition duration-200 border shadow-sm inline-flex items-center justify-center px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 bg-primary border-primary text-white dark:border-primary w-full py-3 md:w-52 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <svg
                                                className="animate-spin h-5 w-5 mr-2 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v4l3.5-3.5L12 1V0a10 10 0 00-10 10h2z"
                                                ></path>
                                            </svg>
                                            Updating...
                                        </div>
                                    ) : (
                                        <>
                                            Update
                                            <span className="flex h-5 w-5 items-center justify-center ml-1">
                                                <CloudUpload className="stroke-1.5 h-4 w-4" />
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tips Section */}
                    <div className="intro-y col-span-2 hidden 2xl:block">
                        <div className="sticky top-0">
                            <div className="relative mt-6 rounded-md border border-warning bg-warning/20 p-5 dark:border-0 dark:bg-darkmode-600">
                                <Lightbulb className="stroke-1.5 absolute right-0 top-0 mr-3 mt-5 h-12 w-12 text-warning/80" />
                                <h2 className="text-lg font-medium">Tips</h2>
                                <div className="mt-5 font-medium">Editing Employee</div>
                                <div className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-500">
                                    <div>
                                        Make sure to keep the Finger ID unique if you change it.
                                        Double check the phone number, salary, and position
                                        for accuracy before updating.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}

export default EditEmployee
