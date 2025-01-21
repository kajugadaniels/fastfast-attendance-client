import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    Search
} from 'lucide-react'
import { fetchAttendances } from '../../api'

const GetAttendances = () => {
    const [attendanceData, setAttendanceData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Filters & search
    const [searchTerm, setSearchTerm] = useState('')
    const [attendanceFilter, setAttendanceFilter] = useState('')
    const [genderFilter, setGenderFilter] = useState('')
    const [positionFilter, setPositionFilter] = useState('')

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true)
                const res = await fetchAttendances()
                if (res.data) {
                    setAttendanceData(res.data)
                }
            } catch (err) {
                setError('Failed to fetch attendance.')
                toast.error(
                    err.response?.data?.message?.detail ||
                    err.response?.data?.detail ||
                    'Error fetching attendance records.'
                )
            } finally {
                setLoading(false)
            }
        }
        fetchAttendance()
    }, [])

    // --------------------------------------
    //  Filtering & Search
    // --------------------------------------
    const filteredData = attendanceData.filter((emp) => {
        // 1) Search by name or phone
        const matchesSearch =
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.phone.toLowerCase().includes(searchTerm.toLowerCase())

        // 2) Filter by attendance status (Present/Absent)
        const matchesAttendance = attendanceFilter
            ? emp.attendance_status === attendanceFilter
            : true

        // 3) Filter by gender (if you have gender in your data or backend returns it)
        //  - If your `getAttendances` also returns `gender`, you can filter:
        let matchesGender = true
        if (genderFilter && emp.gender) {
            matchesGender = emp.gender === genderFilter
        } else if (genderFilter && !emp.gender) {
            matchesGender = false
        }

        // 4) Filter by position
        const matchesPosition = positionFilter
            ? emp.position.toLowerCase() === positionFilter.toLowerCase()
            : true

        return matchesSearch && matchesAttendance && matchesGender && matchesPosition
    })

    // --------------------------------------
    //  Pagination
    // --------------------------------------
    const totalRecords = filteredData.length
    const totalPages = Math.ceil(totalRecords / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = filteredData.slice(startIndex, endIndex)

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    return (
        <>
            <div className="intro-y col-span-12 mt-8 flex flex-wrap items-center xl:flex-nowrap">
                <h2 className="mr-auto text-lg font-medium">Employee Attendance</h2>
            </div>

            <div className="mt-5 grid grid-cols-12 gap-6">
                {/* SEARCH & FILTERS */}
                <div className="intro-y col-span-12 mt-2 flex flex-wrap items-center gap-2 xl:flex-nowrap">
                    {/* Search by name or phone */}
                    <div className="relative w-56 text-slate-500">
                        <input
                            type="text"
                            placeholder="Search name or phone..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-800/50 transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:bg-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:placeholder:text-slate-500/80 !box w-56 pr-10"
                        />
                        <Search className="stroke-1.5 absolute inset-y-0 right-0 my-auto mr-3 h-4 w-4" />
                    </div>

                    {/* Attendance Status Filter */}
                    <select
                        className="transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent dark:focus:ring-slate-700 !box w-44"
                        value={attendanceFilter}
                        onChange={(e) => {
                            setAttendanceFilter(e.target.value)
                            setCurrentPage(1)
                        }}
                    >
                        <option value="">All</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                    </select>

                    {/* Gender Filter (optional, only if data includes emp.gender) */}
                    <select
                        className="transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent dark:focus:ring-slate-700 !box w-44"
                        value={genderFilter}
                        onChange={(e) => {
                            setGenderFilter(e.target.value)
                            setCurrentPage(1)
                        }}
                    >
                        <option value="">All Genders</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                    </select>

                    {/* Position Filter */}
                    <select
                        className="transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent dark:focus:ring-slate-700 !box w-44"
                        value={positionFilter}
                        onChange={(e) => {
                            setPositionFilter(e.target.value)
                            setCurrentPage(1)
                        }}
                    >
                        <option value="">All Positions</option>
                        <option value="Construction">Construction</option>
                        <option value="Manager">Manager</option>
                        <option value="Finance">Finance</option>
                        <option value="HR">HR</option>
                        {/* Add more if needed */}
                    </select>
                </div>

                <div className="intro-y col-span-12 overflow-auto 2xl:overflow-visible">
                    {loading ? (
                        <div className="text-center py-10">Loading attendance...</div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-500">{error}</div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-10">
                            <h3 className="text-lg font-medium">No Attendance Found</h3>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">
                                Looks like no employees match your criteria.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left -mt-2 border-separate border-spacing-y-[10px]">
                            <thead>
                                <tr>
                                    <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0">
                                        <input
                                            type="checkbox"
                                            className="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-800 dark:border-transparent"
                                        />
                                    </th>
                                    <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0">
                                        Name
                                    </th>
                                    <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0 text-center">
                                        Phone Number
                                    </th>
                                    <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0 text-center">
                                        Gender
                                    </th>
                                    <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0 text-center">
                                        Position
                                    </th>
                                    <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0 text-center">
                                        Attendance
                                    </th>
                                    {/* If you want to display Salary, add a column:
                  <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0 text-center">
                    Salary
                  </th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((emp, idx) => (
                                    <tr key={idx} className="intro-x">
                                        <td className="px-5 py-3 border-b dark:border-300 box w-10 whitespace-nowrap border-x-0 shadow-[5px_3px_5px_#00000005] dark:bg-600">
                                            <input
                                                type="checkbox"
                                                className="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded"
                                            />
                                        </td>
                                        <td className="px-5 py-3 border-b dark:border-300 box whitespace-nowrap border-x-0 !py-3.5 shadow-[5px_3px_5px_#00000005] dark:bg-600">
                                            <div className="flex items-center">
                                                <div className="image-fit zoom-in h-9 w-9">
                                                    {/* Placeholder image */}
                                                    <img
                                                        src="https://midone-html.left4code.com/dist/images/fakers/preview-6.jpg"
                                                        className="tooltip cursor-pointer rounded-lg border-white shadow-[0px_0px_0px_2px_#fff,_1px_1px_5px_rgba(0,0,0,0.32)]"
                                                        alt="employee avatar"
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <span className="whitespace-nowrap font-medium">
                                                        {emp.name}
                                                    </span>
                                                    <div className="mt-0.5 whitespace-nowrap text-xs text-slate-500">
                                                        ID: {emp.employee_id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 border-b dark:border-300 box whitespace-nowrap border-x-0 text-center shadow-[5px_3px_5px_#00000005] dark:bg-600">
                                            {emp.phone}
                                        </td>
                                        <td className="px-5 py-3 border-b dark:border-300 box whitespace-nowrap border-x-0 text-center shadow-[5px_3px_5px_#00000005] dark:bg-600">
                                            {emp.gender || 'N/A'}
                                        </td>
                                        <td className="px-5 py-3 border-b dark:border-300 box whitespace-nowrap border-x-0 text-center shadow-[5px_3px_5px_#00000005] dark:bg-600">
                                            {emp.position || 'N/A'}
                                        </td>
                                        <td className="px-5 py-3 border-b dark:border-300 box w-56 border-x-0 text-center shadow-[5px_3px_5px_#00000005] dark:bg-600">
                                            {/* Display attendance_status from backend */}
                                            <span
                                                className={
                                                    emp.attendance_status === 'Present'
                                                        ? 'text-green-600 font-semibold'
                                                        : 'text-red-600 font-semibold'
                                                }
                                            >
                                                {emp.attendance_status}
                                            </span>
                                        </td>
                                        {/* If you want Salary:
                    <td className="px-5 py-3 border-b dark:border-300 box w-56 border-x-0 text-center shadow-[5px_3px_5px_#00000005] dark:bg-600">
                      {emp.salary ? `${emp.salary} RWF` : 'N/A'}
                    </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination area */}
                {filteredData.length > 0 && (
                    <div className="intro-y col-span-12 flex flex-wrap items-center sm:flex-row sm:flex-nowrap mt-4">
                        <nav className="w-full sm:mr-auto sm:w-auto">
                            <ul className="flex w-full mr-0 sm:mr-auto sm:w-auto gap-2">
                                <li>
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                        className="transition duration-200 border items-center justify-center py-2 px-2 rounded-md cursor-pointer focus:ring-4 focus:ring-primary text-slate-800 dark:text-slate-300 border-transparent disabled:opacity-50"
                                    >
                                        First
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="transition duration-200 border items-center justify-center py-2 px-2 rounded-md cursor-pointer focus:ring-4 focus:ring-primary text-slate-800 dark:text-slate-300 border-transparent disabled:opacity-50"
                                    >
                                        <ChevronLeft className="stroke-1.5 h-4 w-4" />
                                    </button>
                                </li>

                                {/* Page indicator */}
                                <li>
                                    <span className="px-3 py-2 text-slate-700 dark:text-slate-300">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                </li>

                                <li>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="transition duration-200 border items-center justify-center py-2 px-2 rounded-md cursor-pointer focus:ring-4 focus:ring-primary text-slate-800 dark:text-slate-300 border-transparent disabled:opacity-50"
                                    >
                                        <ChevronRight className="stroke-1.5 h-4 w-4" />
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="transition duration-200 border items-center justify-center py-2 px-2 rounded-md cursor-pointer focus:ring-4 focus:ring-primary text-slate-800 dark:text-slate-300 border-transparent disabled:opacity-50"
                                    >
                                        <ChevronsRight className="stroke-1.5 h-4 w-4" />
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </>
    )
}

export default GetAttendances
