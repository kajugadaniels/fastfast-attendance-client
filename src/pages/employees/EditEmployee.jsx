import React from 'react'
import { CloudUpload, Eye, Lightbulb, ToggleLeft } from 'lucide-react'

const EditEmployee = () => {
    return (
        <>
            <div className="intro-y col-span-12 mt-8 flex flex-wrap items-center xl:flex-nowrap">
                <h2 className="mr-auto text-lg font-medium">
                    Edit Employee
                </h2>
                <a href='/employees' className="transition duration-200 border inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-primary border-primary text-white dark:border-primary mr-2 shadow-md">
                    Go Back
                    <span className="flex h-5 w-5 items-center justify-center">
                        <Eye className="stroke-1.5 h-4 w-4" />
                    </span>
                </a>
            </div>
            <div className="mt-5 grid grid-cols-11 gap-x-6 pb-20">
                <div className="intro-y col-span-11 2xl:col-span-9">
                    <div className="intro-y box mt-5 p-5">
                        <div className="rounded-md border border-slate-200/60 p-5 dark:border-darkmode-400">
                            <div className="flex items-center border-b border-slate-200/60 pb-5 text-base font-medium dark:border-darkmode-400">
                                Edit Employee
                            </div>
                            <div className="mt-5">
                                {/* Name, Gender & Finger ID */}
                                <div className="block sm:flex group form-inline mt-5 flex-col items-start pt-5 first:mt-0 first:pt-0 xl:flex-row">
                                    <label className="inline-block mb-2 group-[.form-inline]:mb-2 group-[.form-inline]:sm:mb-0 group-[.form-inline]:sm:mr-5 group-[.form-inline]:sm:text-right xl:!mr-10 xl:w-64">
                                        <div className="text-left">
                                            <div className="flex items-center">
                                                <div className="font-medium">Name, Gender & Finger ID</div>
                                                <div className="ml-2 rounded-md bg-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:bg-darkmode-300 dark:text-slate-400">Required</div>
                                            </div>
                                            <div className="mt-3 text-xs leading-relaxed text-slate-500">
                                                Please enter the employee’s full name, select their gender, and provide a unique finger ID. All fields are required for identification.
                                            </div>
                                        </div>
                                    </label>
                                    <div className="mt-3 w-full flex-1 xl:mt-0">
                                        <div className="grid-cols-3 gap-3 sm:grid">
                                            <input
                                                type="text"
                                                placeholder="Enter Employee Name"
                                                className="disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-darkmode-800/50 dark:disabled:border-transparent [&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed [&[readonly]]:dark:bg-darkmode-800/50 [&[readonly]]:dark:border-transparent transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:placeholder:text-slate-500/80 group-[.form-inline]:flex-1"
                                            />
                                            <select className="disabled:bg-slate-100 disabled:cursor-not-allowed disabled:dark:bg-darkmode-800/50 [&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed [&[readonly]]:dark:bg-darkmode-800/50 transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 pr-8 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 group-[.form-inline]:flex-1">
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                            <input
                                                type="number"
                                                placeholder="Finger ID"
                                                className="disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-darkmode-800/50 dark:disabled:border-transparent [&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed [&[readonly]]:dark:bg-darkmode-800/50 [&[readonly]]:dark:border-transparent transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:placeholder:text-slate-500/80 group-[.form-inline]:flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email & Phone Number */}
                                <div className="block sm:flex group form-inline mt-5 flex-col items-start pt-5 first:mt-0 first:pt-0 xl:flex-row">
                                    <label className="inline-block mb-2 group-[.form-inline]:mb-2 group-[.form-inline]:sm:mb-0 group-[.form-inline]:sm:mr-5 group-[.form-inline]:sm:text-right xl:!mr-10 xl:w-64">
                                        <div className="text-left">
                                            <div className="flex items-center">
                                                <div className="font-medium">Email & Phone Number</div>
                                                <div className="ml-2 rounded-md bg-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:bg-darkmode-300 dark:text-slate-400">Required</div>
                                            </div>
                                            <div className="mt-3 text-xs leading-relaxed text-slate-500">
                                                Provide a valid email address and primary phone number for contact purposes. Both fields are required.
                                            </div>
                                        </div>
                                    </label>
                                    <div className="mt-3 w-full flex-1 xl:mt-0">
                                        <div className="grid-cols-2 gap-3 sm:grid">
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                className="disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-darkmode-800/50 dark:disabled:border-transparent [&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed [&[readonly]]:dark:bg-darkmode-800/50 [&[readonly]]:dark:border-transparent transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:placeholder:text-slate-500/80 group-[.form-inline]:flex-1"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Enter Phone Number"
                                                className="disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-darkmode-800/50 dark:disabled:border-transparent [&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed [&[readonly]]:dark:bg-darkmode-800/50 [&[readonly]]:dark:border-transparent transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:placeholder:text-slate-500/80 group-[.form-inline]:flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Department & Salary */}
                                <div className="block sm:flex group form-inline mt-5 flex-col items-start pt-5 first:mt-0 first:pt-0 xl:flex-row">
                                    <label className="inline-block mb-2 group-[.form-inline]:mb-2 group-[.form-inline]:sm:mb-0 group-[.form-inline]:sm:mr-5 group-[.form-inline]:sm:text-right xl:!mr-10 xl:w-64">
                                        <div className="text-left">
                                            <div className="flex items-center">
                                                <div className="font-medium">Department & Salary</div>
                                                <div className="ml-2 rounded-md bg-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:bg-darkmode-300 dark:text-slate-400">Required</div>
                                            </div>
                                            <div className="mt-3 text-xs leading-relaxed text-slate-500">
                                                Specify the employee’s department and monthly salary. These fields are mandatory for proper record-keeping.
                                            </div>
                                        </div>
                                    </label>
                                    <div className="mt-3 w-full flex-1 xl:mt-0">
                                        <div className="grid-cols-2 gap-3 sm:grid">
                                            <select className="disabled:bg-slate-100 disabled:cursor-not-allowed disabled:dark:bg-darkmode-800/50 [&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed [&[readonly]]:dark:bg-darkmode-800/50 transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 pr-8 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 group-[.form-inline]:flex-1">
                                                <option value="">Select Department</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                            <input
                                                type="number"
                                                placeholder="Enter Employee Salary"
                                                className="disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-darkmode-800/50 dark:disabled:border-transparent [&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed [&[readonly]]:dark:bg-darkmode-800/50 [&[readonly]]:dark:border-transparent transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:placeholder:text-slate-500/80 group-[.form-inline]:flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-5 flex flex-col justify-end gap-2 md:flex-row">
                            <a
                                href="/employees"
                                type="button"
                                className="transition duration-200 border shadow-sm inline-flex items-center justify-center px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed w-full border-slate-300 py-3 text-slate-500 dark:border-darkmode-400 md:w-52"
                            >
                                Cancel
                                <span className="flex h-5 w-5 items-center justify-center">
                                    <ToggleLeft className="stroke-1.5 h-4 w-4" />
                                </span>
                            </a>
                            <button
                                type="button"
                                className="transition duration-200 border shadow-sm inline-flex items-center justify-center px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-primary border-primary text-white dark:border-primary w-full py-3 md:w-52"
                            >
                                Save
                                <span className="flex h-5 w-5 items-center justify-center">
                                    <CloudUpload className="stroke-1.5 h-4 w-4" />
                                </span>
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
                            <div className="mt-5 font-medium">Price</div>
                            <div className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-500">
                                <div>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                                    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                                    ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                                    reprehenderit in voluptate velit esse.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EditEmployee