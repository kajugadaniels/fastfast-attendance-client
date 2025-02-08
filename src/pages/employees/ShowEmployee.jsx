import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
    Eye,
    User,
    FileText,
    ClipboardList,
    RefreshCcw
} from 'lucide-react'
import { fetchEmployee } from '../../api'

const ShowEmployee = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [employeeData, setEmployeeData] = useState(null)
    const [loading, setLoading] = useState(false)

    // ------------------------------
    //   FILTER & SORT STATES
    // ------------------------------
    const [attendanceStatus, setAttendanceStatus] = useState('') // '', 'true', or 'false'
    const [dateStart, setDateStart] = useState('')
    const [dateEnd, setDateEnd] = useState('')
    // Sort can be 'dateAsc', 'dateDesc', 'salaryAsc', 'salaryDesc'
    const [sortOption, setSortOption] = useState('dateDesc')

    useEffect(() => {
        const getEmployeeDetails = async () => {
            try {
                setLoading(true)
                const res = await fetchEmployee(id)
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

    // ------------------------------
    //   FILTER & SORT LOGIC
    // ------------------------------
    const getFilteredSortedAttendance = () => {
        if (!employeeData || !employeeData.attendance_history) return []

        let filtered = [...employeeData.attendance_history]

        // 1) Filter by attendance status
        if (attendanceStatus === 'true') {
            filtered = filtered.filter((att) => att.attended === true)
        } else if (attendanceStatus === 'false') {
            filtered = filtered.filter((att) => att.attended === false)
        }

        // 2) Filter by date range
        if (dateStart) {
            const start = new Date(dateStart)
            filtered = filtered.filter((att) => {
                const attDate = new Date(att.time_in)
                return attDate >= start
            })
        }
        if (dateEnd) {
            const end = new Date(dateEnd)
            // end time is end-of-day for inclusive range
            end.setHours(23, 59, 59, 999)
            filtered = filtered.filter((att) => {
                const attDate = new Date(att.time_in)
                return attDate <= end
            })
        }

        // 3) Sorting
        filtered.sort((a, b) => {
            const dateA = new Date(a.time_in)
            const dateB = new Date(b.time_in)
            const salaryA = parseFloat(a.salary)
            const salaryB = parseFloat(b.salary)

            switch (sortOption) {
                case 'dateAsc':
                    return dateA - dateB
                case 'dateDesc':
                    return dateB - dateA
                case 'salaryAsc':
                    return salaryA - salaryB
                case 'salaryDesc':
                    return salaryB - salaryA
                default:
                    return 0
            }
        })

        return filtered
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
    const {
        employee,
        attendance_history,
        total_salary,
        recent_activities
    } = employeeData

    // Filter + Sort attendance
    const filteredSortedAttendance = getFilteredSortedAttendance()

    return (
        <>
            {/* Header Section */}
            <div className="intro-y col-span-12 mt-8 flex flex-wrap items-center xl:flex-nowrap">
                <h2 className="mr-auto text-lg font-medium">Employee Details</h2>
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
                            <span className="text-slate-500 dark:text-slate-400 text-sm">
                                Name:
                            </span>
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
                                {/* Updated Table Design */}
                                <table className="w-full text-left -mt-2 border-separate border-spacing-y-[10px]">
                                    <thead>
                                        <tr>
                                            <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0">
                                                Date/Time In
                                            </th>
                                            <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0">
                                                Attended
                                            </th>
                                            <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0">
                                                Salary Snapshot
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recent_activities.map((att) => (
                                            <tr
                                                key={att.id}
                                                className="intro-x bg-white dark:bg-darkmode-600 shadow-[5px_3px_5px_#00000005]"
                                            >
                                                <td className="px-5 py-3 border-b dark:border-300 box whitespace-nowrap border-x-0">
                                                    {new Date(att.time_in).toLocaleString()}
                                                </td>
                                                <td className="px-5 py-3 border-b dark:border-300 box whitespace-nowrap border-x-0">
                                                    {att.attended ? 'Present' : 'Absent'}
                                                </td>
                                                <td className="px-5 py-3 border-b dark:border-300 box whitespace-nowrap border-x-0">
                                                    {att.salary} RWF
                                                </td>
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
                            <h3 className="font-medium text-base">
                                Total Salary from Attendance
                            </h3>
                        </div>
                        <div className="mt-4 text-center">
                            <h1 className="text-3xl font-bold text-green-600">
                                {total_salary} RWF
                            </h1>
                            <p className="mt-2 text-slate-500 text-sm">
                                This is the sum of the salary snapshots from all attendance
                                records.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Full Attendance History with Filters & Sorting */}
                <div className="intro-y col-span-12 box p-5">
                    <div className="flex items-center border-b pb-3">
                        <ClipboardList className="mr-2 text-primary" />
                        <h3 className="font-medium text-base">Attendance History</h3>
                    </div>

                    {/* FILTERS & SORTING UI */}
                    <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        {/* Attendance Status Filter */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="attendanceStatus" className="text-sm">
                                Attendance:
                            </label>
                            <select
                                id="attendanceStatus"
                                value={attendanceStatus}
                                onChange={(e) => setAttendanceStatus(e.target.value)}
                                className="transition duration-200 border-slate-200 text-sm rounded-md px-2 py-1 focus:ring-4 focus:ring-primary"
                            >
                                <option value="">All</option>
                                <option value="true">Present</option>
                                <option value="false">Absent</option>
                            </select>
                        </div>

                        {/* Date Range Filters */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="dateStart" className="text-sm">
                                From:
                            </label>
                            <input
                                type="date"
                                id="dateStart"
                                value={dateStart}
                                onChange={(e) => setDateStart(e.target.value)}
                                className="transition duration-200 border-slate-200 text-sm rounded-md px-2 py-1 focus:ring-4 focus:ring-primary"
                            />
                            <label htmlFor="dateEnd" className="text-sm">
                                To:
                            </label>
                            <input
                                type="date"
                                id="dateEnd"
                                value={dateEnd}
                                onChange={(e) => setDateEnd(e.target.value)}
                                className="transition duration-200 border-slate-200 text-sm rounded-md px-2 py-1 focus:ring-4 focus:ring-primary"
                            />
                        </div>

                        {/* Sort Options */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="sortOption" className="text-sm">
                                Sort By:
                            </label>
                            <select
                                id="sortOption"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="transition duration-200 border-slate-200 text-sm rounded-md px-2 py-1 focus:ring-4 focus:ring-primary"
                            >
                                <option value="dateDesc">Date (Newest)</option>
                                <option value="dateAsc">Date (Oldest)</option>
                                <option value="salaryAsc">Salary (Lowest)</option>
                                <option value="salaryDesc">Salary (Highest)</option>
                            </select>
                        </div>
                    </div>

                    {/* Filtered & Sorted Attendance History Table */}
                    {filteredSortedAttendance.length > 0 ? (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left -mt-2 border-separate border-spacing-y-[10px]">
                                <thead>
                                    <tr>
                                        <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0">
                                            ID
                                        </th>
                                        <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0">
                                            Date/Time In
                                        </th>
                                        <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0">
                                            Attended
                                        </th>
                                        <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0">
                                            Salary Snapshot
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSortedAttendance.map((att) => (
                                        <tr
                                            key={att.id}
                                            className="intro-x bg-white dark:bg-darkmode-600 shadow-[5px_3px_5px_#00000005]"
                                        >
                                            <td className="px-5 py-3 border-b dark:border-300 box whitespace-nowrap border-x-0">
                                                {att.id}
                                            </td>
                                            <td className="px-5 py-3 border-b dark:border-300 box whitespace-nowrap border-x-0">
                                                {new Date(att.time_in).toLocaleString()}
                                            </td>
                                            <td className="px-5 py-3 border-b dark:border-300 box whitespace-nowrap border-x-0">
                                                {att.attended ? 'Present' : 'Absent'}
                                            </td>
                                            <td className="px-5 py-3 border-b dark:border-300 box whitespace-nowrap border-x-0">
                                                {att.salary} RWF
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="mt-2 text-slate-500">
                            No attendance records match your criteria.
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default ShowEmployee
