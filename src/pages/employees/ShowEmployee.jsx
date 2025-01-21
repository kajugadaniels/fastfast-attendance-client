import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Eye, User, FileText, ClipboardList, RefreshCcw } from 'lucide-react'
import { fetchEmployee } from '../../api' // <-- Adjust to match your API function name

const ShowEmployee = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [employeeData, setEmployeeData] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const getEmployeeDetails = async () => {
            try {
                setLoading(true)
                const res = await fetchEmployee(id)
                // Expecting res => { data: { employee: {...}, attendance_history: [...], total_salary, recent_activities: [...] }, message: ... }
                setEmployeeData(res.data)
            } catch (error) {
                toast.error(
                    error.response?.data?.message?.detail ||
                    error.response?.data?.detail ||
                    'Failed to load employee details.'
                )
            } finally {
                setLoading(false)
            }
        }

        getEmployeeDetails()
    }, [id])

    const handleGoBack = () => {
        navigate('/employees')
    }

    // While data is loading
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <svg
                        className="animate-spin h-8 w-8 mb-2 text-primary inline-block"
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
                    <p>Loading employee details...</p>
                </div>
            </div>
        )
    }

    // If there's no data (e.g., not found or error)
    if (!employeeData) {
        return (
            <div className="intro-y col-span-12 mt-8 text-center">
                <h2 className="text-lg font-medium">No Employee Data</h2>
                <p className="text-slate-500 mt-2">
                    Unable to find the requested employee details.
                </p>
                <button
                    onClick={handleGoBack}
                    className="mt-4 transition duration-200 border inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 bg-primary border-primary text-white shadow-md"
                >
                    Go Back
                </button>
            </div>
        )
    }

    // Destructure data for convenience
    const { employee, attendance_history, total_salary, recent_activities } = employeeData

    return (
        <>
            {/* Header Section */}
            <div className="intro-y col-span-12 mt-8 flex flex-wrap items-center xl:flex-nowrap">
                <h2 className="mr-auto text-lg font-medium">
                    Employee Details
                </h2>
                <button
                    onClick={handleGoBack}
                    className="transition duration-200 border inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 bg-primary border-primary text-white mr-2 shadow-md"
                >
                    Go Back
                    <span className="flex h-5 w-5 items-center justify-center ml-1">
                        <Eye className="stroke-1.5 h-4 w-4" />
                    </span>
                </button>
            </div>

            {/* Main Content */}
            <div className="mt-5 grid grid-cols-12 gap-6">
                {/* Employee Info Card */}
                <div className="intro-y col-span-12 md:col-span-4 box p-5">
                    <div className="flex items-center border-b pb-3">
                        <User className="mr-2 text-primary" />
                        <h3 className="font-medium text-base">Employee Info</h3>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400 text-sm">Name:</span>
                            <span className="font-medium">{employee.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Finger ID:</span>
                            <span className="font-medium">{employee.finger_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Gender:</span>
                            <span className="font-medium">
                                {employee.gender === 'M'
                                    ? 'Male'
                                    : employee.gender === 'F'
                                        ? 'Female'
                                        : 'Other'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Phone:</span>
                            <span className="font-medium">{employee.phone}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Position:</span>
                            <span className="font-medium">{employee.position}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Salary:</span>
                            <span className="font-medium">{employee.salary} RWF</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activities & Total Salary */}
                <div className="intro-y col-span-12 md:col-span-8 space-y-6">
                    <div className="box p-5">
                        <div className="flex items-center border-b pb-3">
                            <RefreshCcw className="mr-2 text-primary" />
                            <h3 className="font-medium text-base">Recent Activities</h3>
                        </div>
                        {recent_activities && recent_activities.length > 0 ? (
                            <div className="mt-4 overflow-x-auto">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th className="whitespace-nowrap">Date/Time In</th>
                                            <th className="whitespace-nowrap">Attended</th>
                                            <th className="whitespace-nowrap">Salary Snapshot</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recent_activities.map((att) => (
                                            <tr key={att.id} className="align-top">
                                                <td className="whitespace-nowrap">
                                                    {new Date(att.time_in).toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap">
                                                    {att.attended ? 'Present' : 'Absent'}
                                                </td>
                                                <td className="whitespace-nowrap">{att.salary} RWF</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="mt-2 text-slate-500">
                                No recent attendance records found.
                            </div>
                        )}
                    </div>

                    <div className="box p-5">
                        <div className="flex items-center border-b pb-3">
                            <FileText className="mr-2 text-primary" />
                            <h3 className="font-medium text-base">Total Salary from Attendance</h3>
                        </div>
                        <div className="mt-4 text-center">
                            <h1 className="text-3xl font-bold text-green-600">
                                {total_salary} RWF
                            </h1>
                            <p className="mt-2 text-slate-500 text-sm">
                                This is the sum of the salary snapshots from all attendance records.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Full Attendance History */}
                <div className="intro-y col-span-12 box p-5">
                    <div className="flex items-center border-b pb-3">
                        <ClipboardList className="mr-2 text-primary" />
                        <h3 className="font-medium text-base">Attendance History</h3>
                    </div>
                    {attendance_history && attendance_history.length > 0 ? (
                        <div className="mt-4 overflow-x-auto">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th className="whitespace-nowrap">ID</th>
                                        <th className="whitespace-nowrap">Date/Time In</th>
                                        <th className="whitespace-nowrap">Attended</th>
                                        <th className="whitespace-nowrap">Salary Snapshot</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance_history.map((att) => (
                                        <tr key={att.id}>
                                            <td className="whitespace-nowrap">{att.id}</td>
                                            <td className="whitespace-nowrap">
                                                {new Date(att.time_in).toLocaleString()}
                                            </td>
                                            <td className="whitespace-nowrap">
                                                {att.attended ? 'Present' : 'Absent'}
                                            </td>
                                            <td className="whitespace-nowrap">
                                                {att.salary} RWF
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="mt-2 text-slate-500">
                            No attendance records found for this employee.
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default ShowEmployee
