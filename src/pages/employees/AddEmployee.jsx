import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { CloudUpload, Eye, Lightbulb, ToggleLeft } from 'lucide-react'
import { createEmployee } from '../../api' // <-- Import your createEmployee function

const AddEmployee = () => {
    const navigate = useNavigate()

    // Track form inputs and loading state
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        phone: '',
        position: '',
        salary: '',
        image: null  // Image is optional
    })
    const [loading, setLoading] = useState(false)

    // Handle change in form inputs
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Handle image file change
    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData((prev) => ({ ...prev, image: file }))
        }
    }

    // Validate only the required fields: name and phone
    const validateForm = () => {
        const { name, phone } = formData
        if (!name.trim() || !phone.trim()) {
            toast.error('Name and phone are required.')
            return false
        }
        return true
    }

    // Submit form to create new employee
    const handleSaveEmployee = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            setLoading(true)

            // Prepare FormData to send file
            const employeeData = new FormData()
            employeeData.append('name', formData.name)
            employeeData.append('phone', formData.phone)
            employeeData.append('gender', formData.gender)
            employeeData.append('position', formData.position)
            employeeData.append('salary', formData.salary)

            // If image exists, append it to FormData
            if (formData.image) {
                employeeData.append('image', formData.image)
            }

            await createEmployee(employeeData)
            toast.success('Employee created successfully.')
            navigate('/employees')
        } catch (error) {
            toast.error(
                error.response?.data?.message?.detail ||
                error.response?.data?.detail ||
                'Error creating employee.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="intro-y col-span-12 mt-8 flex flex-wrap items-center xl:flex-nowrap">
                <h2 className="mr-auto text-lg font-medium">
                    Add Employee
                </h2>
                <a
                    href='/employees'
                    className="transition duration-200 border inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 bg-primary border-primary text-white dark:border-primary mr-2 shadow-md"
                >
                    Go Back
                    <span className="flex h-5 w-5 items-center justify-center">
                        <Eye className="stroke-1.5 h-4 w-4" />
                    </span>
                </a>
            </div>

            <form onSubmit={handleSaveEmployee}>
                <div className="mt-5 grid grid-cols-11 gap-x-6 pb-20">
                    <div className="intro-y col-span-11 2xl:col-span-9">
                        <div className="intro-y box mt-5 p-5">
                            <div className="rounded-md border border-slate-200/60 p-5 dark:border-darkmode-400">
                                <div className="flex items-center border-b border-slate-200/60 pb-5 text-base font-medium dark:border-darkmode-400">
                                    Add New Employee
                                </div>
                                <div className="mt-5">
                                    {/* Group 1: Name & Image */}
                                    <div className="block sm:flex group form-inline mt-5 flex-col items-start pt-5 xl:flex-row">
                                        <label className="inline-block mb-2 xl:!mr-10 xl:w-64">
                                            <div className="text-left">
                                                <div className="flex items-center">
                                                    <div className="font-medium">Name & Image</div>
                                                    <div className="ml-2 rounded-md bg-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:bg-darkmode-300 dark:text-slate-400">
                                                        * Required for Name
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-xs leading-relaxed text-slate-500">
                                                    Please enter the employee’s full name. Image is optional.
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
                                                type="file"
                                                name="image"
                                                onChange={handleImageChange}
                                                className="disabled:bg-slate-100 dark:disabled:bg-darkmode-800/50 transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md focus:ring-4 focus:ring-primary dark:bg-darkmode-800"
                                            />
                                        </div>
                                    </div>

                                    {/* Group 2: Gender & Phone Number */}
                                    <div className="block sm:flex group form-inline mt-5 flex-col items-start pt-5 xl:flex-row">
                                        <label className="inline-block mb-2 xl:!mr-10 xl:w-64">
                                            <div className="text-left">
                                                <div className="flex items-center">
                                                    <div className="font-medium">Gender & Phone Number</div>
                                                    <div className="ml-2 rounded-md bg-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:bg-darkmode-300 dark:text-slate-400">
                                                        * Required for Phone
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-xs leading-relaxed text-slate-500">
                                                    Provide a valid phone number. Gender is optional.
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
                                                <option value="">Select Gender (optional)</option>
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

                                    {/* Group 3: Position & Salary (Optional) */}
                                    <div className="block sm:flex group form-inline mt-5 flex-col items-start pt-5 xl:flex-row">
                                        <label className="inline-block mb-2 xl:!mr-10 xl:w-64">
                                            <div className="text-left">
                                                <div className="flex items-center">
                                                    <div className="font-medium">Position & Salary</div>
                                                    <div className="ml-2 rounded-md bg-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:bg-darkmode-300 dark:text-slate-400">
                                                        Optional
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-xs leading-relaxed text-slate-500">
                                                    Specify the employee’s position and salary if applicable.
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
                                                <option value="">Select Position (optional)</option>
                                                <option value="Staff">Staff</option>
                                                <option value="Casual">Casual</option>
                                            </select>
                                            <input
                                                type="number"
                                                name="salary"
                                                placeholder="Enter Employee Salary (optional)"
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
                                    className="transition duration-200 border shadow-sm inline-flex items-center justify-center px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 dark:focus:ring-slate-700 bg-primary border-primary text-white dark:border-primary w-full py-3 md:w-52 disabled:opacity-70 disabled:cursor-not-allowed"
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
                                            Saving...
                                        </div>
                                    ) : (
                                        <>
                                            Save
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
                                <div className="mt-5 font-medium">Hiring</div>
                                <div className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-500">
                                    <div>
                                        Provide correct details to ensure the system
                                        accurately manages attendance and payroll.
                                        Only name and phone are required for creating an employee.
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

export default AddEmployee
