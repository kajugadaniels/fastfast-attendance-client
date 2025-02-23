import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    Eye,
    Search
} from 'lucide-react'
import { fetchAttendances } from '../../api'
import { useNavigate } from 'react-router-dom'

const GetAttendances = () => {
    const navigate = useNavigate()
    const [attendanceData, setAttendanceData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Main filters for employee basic info & current day's attendance
    const [searchTerm, setSearchTerm] = useState('')
    const [attendanceFilter, setAttendanceFilter] = useState('')
    const [genderFilter, setGenderFilter] = useState('')
    const [positionFilter, setPositionFilter] = useState('')

    // Additional history filters (for expanded history view)
    const [historyStartDate, setHistoryStartDate] = useState('')
    const [historyEndDate, setHistoryEndDate] = useState('')
    const [foodMenuFilter, setFoodMenuFilter] = useState('')

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    // Define a fixed 7-day window: 4 past days, current day, 2 future days
    const dayOffsets = [-4, -3, -2, -1, 0, 1, 2]
    const daysArray = dayOffsets.map(offset => {
        const d = new Date()
        d.setDate(d.getDate() + offset)
        return d
    })

    // Helper: format Date object as "YYYY-MM-DD"
    const formatDate = (dateObj) => {
        return dateObj.toISOString().split('T')[0]
    }

    // Fetch attendance data from API
    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true)
                const res = await fetchAttendances()
                if (res.data) {
                    // Expect each employee record to include:
                    // employee_id, name, phone, gender, position, and attendance_history (array)
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

    // Helper: Given an employee and a target date (string), find the matching attendance record
    const getAttendanceRecordForDate = (employee, dateStr) => {
        if (!employee.attendance_history) return null
        return employee.attendance_history.find(
            record => record.attendance_date === dateStr
        )
    }

    // Determine the display status for a given day in the 7-day window
    const getDayStatus = (employee, dayIndex) => {
        const targetDate = formatDate(daysArray[dayIndex])
        const todayStr = formatDate(new Date())
        const record = getAttendanceRecordForDate(employee, targetDate)

        if (daysArray[dayIndex] > new Date()) {
            // Future date: always show "Future"
            return { status: 'Future', time: null }
        }
        // For today or past days: if record exists, use its status; otherwise default to "Absent"
        if (record) {
            return { status: record.attendance_status, time: record.time }
        }
        return { status: 'Absent', time: null }
    }

    // Top-level employee filtering based on basic info and current day's status
    const filteredData = attendanceData.filter(emp => {
        const matchesSearch =
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.phone.toLowerCase().includes(searchTerm.toLowerCase())

        // For current day, determine status from attendance_history
        const todayStr = formatDate(new Date())
        const currentRecord = getAttendanceRecordForDate(emp, todayStr)
        const currentStatus = currentRecord ? currentRecord.attendance_status : 'Absent'
        const matchesAttendance = attendanceFilter ? currentStatus === attendanceFilter : true

        const matchesGender = genderFilter
            ? emp.gender === genderFilter
            : true
        const matchesPosition = positionFilter
            ? (emp.position || '').toLowerCase() === positionFilter.toLowerCase()
            : true

        return matchesSearch && matchesAttendance && matchesGender && matchesPosition
    })

    // Pagination logic
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

    const handleShowEmployee = (employee_id) => {
        navigate(`/employee/${employee_id}`)
    }

    // State to manage expanded rows for attendance history
    const [expandedRows, setExpandedRows] = useState([])
    const toggleHistory = (employee_id) => {
        setExpandedRows(prev =>
            prev.includes(employee_id)
                ? prev.filter(id => id !== employee_id)
                : [...prev, employee_id]
        )
    }

    // Filter attendance_history for an employee using the history filters
    const filterAttendanceHistory = (history) => {
        return history.filter(record => {
            let matches = true
            if (historyStartDate) {
                matches = matches && record.attendance_date >= historyStartDate
            }
            if (historyEndDate) {
                matches = matches && record.attendance_date <= historyEndDate
            }
            if (foodMenuFilter) {
                if (record.food_menu && record.food_menu.name) {
                    matches =
                        matches &&
                        record.food_menu.name.toLowerCase().includes(foodMenuFilter.toLowerCase())
                } else {
                    matches = false
                }
            }
            return matches
        })
    }

    return (
        <>
            <div className="intro-y col-span-12 mt-8 flex flex-wrap items-center xl:flex-nowrap">
                <h2 className="mr-auto text-lg font-medium">
                    Employee Attendance (Past 4 days, Today, Next 2 days)
                </h2>
            </div>

            {/* Main Filters */}
            <div className="mt-5 grid grid-cols-12 gap-6">
                <div className="intro-y col-span-12 flex flex-wrap items-center gap-2 xl:flex-nowrap">
                    <div className="relative w-56 text-slate-500">
                        <input
                            type="text"
                            placeholder="Search name or phone..."
                            value={searchTerm}
                            onChange={e => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-800/50 transition duration-200 text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent"
                        />
                        <Search className="stroke-1.5 absolute inset-y-0 right-0 my-auto mr-3 h-4 w-4" />
                    </div>

                    <select
                        value={attendanceFilter}
                        onChange={e => {
                            setAttendanceFilter(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="transition duration-200 text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent"
                    >
                        <option value="">All (Current Day)</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                    </select>

                    <select
                        value={genderFilter}
                        onChange={e => {
                            setGenderFilter(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="transition duration-200 text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent"
                    >
                        <option value="">All Genders</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                    </select>

                    <select
                        value={positionFilter}
                        onChange={e => {
                            setPositionFilter(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="transition duration-200 text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent"
                    >
                        <option value="">All Positions</option>
                        <option value="Construction">Construction</option>
                    </select>
                </div>

                {/* History Filters */}
                <div className="intro-y col-span-12 flex flex-wrap items-center gap-2 xl:flex-nowrap mt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-700">History From:</span>
                        <input
                            type="date"
                            value={historyStartDate}
                            onChange={e => {
                                setHistoryStartDate(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-40 text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-700">History To:</span>
                        <input
                            type="date"
                            value={historyEndDate}
                            onChange={e => {
                                setHistoryEndDate(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-40 text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent"
                        />
                    </div>
                    <div className="relative w-56 text-slate-500">
                        <input
                            type="text"
                            placeholder="Filter by Food Menu..."
                            value={foodMenuFilter}
                            onChange={e => {
                                setFoodMenuFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-800/50 transition duration-200 text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Table Display */}
            <div className="mt-5 grid grid-cols-12 gap-6">
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
                                            className="transition-all duration-100 shadow-sm border-slate-200 cursor-pointer rounded"
                                        />
                                    </th>
                                    <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0">
                                        Name
                                    </th>
                                    {/* Render a column for each day in the 7-day window */}
                                    {daysArray.map((d, idx) => (
                                        <th
                                            key={idx}
                                            className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0 text-center"
                                        >
                                            {formatDate(d)}
                                        </th>
                                    ))}
                                    <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0 text-center">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map(emp => (
                                    <React.Fragment key={emp.employee_id}>
                                        <tr className="intro-x">
                                            <td className="px-5 py-3 border-b dark:border-300 box w-10 whitespace-nowrap shadow-md dark:bg-600">
                                                <input
                                                    type="checkbox"
                                                    className="transition-all duration-100 shadow-sm border-slate-200 cursor-pointer rounded"
                                                />
                                            </td>
                                            <td className="px-5 py-3 border-b dark:border-300 box whitespace-nowrap shadow-md dark:bg-600">
                                                <div className="flex items-center">
                                                    <div className="image-fit zoom-in h-9 w-9">
                                                        <img
                                                            src="https://midone-html.left4code.com/dist/images/fakers/preview-6.jpg"
                                                            alt="employee avatar"
                                                            className="tooltip cursor-pointer rounded-lg border-white shadow-md"
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <span className="whitespace-nowrap font-medium">{emp.name}</span>
                                                        <div className="mt-0.5 whitespace-nowrap text-xs text-slate-500">
                                                            ID: {emp.employee_id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* 7-day window cells */}
                                            {daysArray.map((d, dayIdx) => {
                                                const { status, time } = getDayStatus(emp, dayIdx)
                                                let bgColor = 'bg-slate-400'
                                                if (status === 'Present') bgColor = 'bg-success'
                                                else if (status === 'Absent') bgColor = 'bg-danger'
                                                else if (status === 'Future') bgColor = 'bg-warning'
                                                return (
                                                    <td
                                                        key={dayIdx}
                                                        className="px-5 py-3 border-b dark:border-300 box w-56 text-center shadow-md dark:bg-600"
                                                    >
                                                        <span className={`px-3 py-1 inline-block rounded-full text-xs text-white ${bgColor}`}>
                                                            {status}
                                                        </span>
                                                        {dayOffsets[dayIdx] === 0 && time && (
                                                            <div className="text-xs mt-1">{time}</div>
                                                        )}
                                                    </td>
                                                )
                                            })}
                                            <td className="px-5 py-3 border-b dark:border-300 box w-56 text-center shadow-md dark:bg-600">
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        onClick={() => handleShowEmployee(emp.employee_id)}
                                                        className="mr-3 flex items-center text-blue-600 hover:underline"
                                                    >
                                                        <Eye className="stroke-1.5 mr-1 h-4 w-4" />
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Expanded Attendance History */}
                                        {expandedRows.includes(emp.employee_id) && emp.attendance_history && emp.attendance_history.length > 0 && (
                                            <tr className="bg-gray-100 dark:bg-darkmode-600">
                                                <td colSpan={daysArray.length + 3} className="px-5 py-3">
                                                    <div className="mb-2 text-sm font-medium">Attendance History</div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left">
                                                            <thead>
                                                                <tr>
                                                                    <th className="font-medium px-3 py-2">Date</th>
                                                                    <th className="font-medium px-3 py-2">Time In</th>
                                                                    <th className="font-medium px-3 py-2">Status</th>
                                                                    <th className="font-medium px-3 py-2">Food Menu</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {filterAttendanceHistory(emp.attendance_history).map((hist, hIdx) => (
                                                                    <tr key={hIdx} className="border-b dark:border-gray-700">
                                                                        <td className="px-3 py-2">{hist.attendance_date}</td>
                                                                        <td className="px-3 py-2">{hist.time || "N/A"}</td>
                                                                        <td className="px-3 py-2">{hist.attendance_status}</td>
                                                                        <td className="px-3 py-2">
                                                                            {hist.food_menu && hist.food_menu.length > 0
                                                                                ? hist.food_menu.map((fm, i) =>
                                                                                    <span key={i}>
                                                                                        {fm.name} - {fm.price}{i !== hist.food_menu.length - 1 ? ", " : ""}
                                                                                    </span>
                                                                                )
                                                                                : "N/A"}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        <tr className="bg-gray-50 dark:bg-darkmode-700">
                                            <td colSpan={daysArray.length + 3} className="text-center py-2">
                                                <button
                                                    onClick={() => toggleHistory(emp.employee_id)}
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    {expandedRows.includes(emp.employee_id) ? "Hide History" : "View History"}
                                                </button>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {filteredData.length > 0 && (
                    <div className="intro-y col-span-12 flex flex-wrap items-center sm:flex-row sm:flex-nowrap mt-4">
                        <nav className="w-full sm:mr-auto sm:w-auto">
                            <ul className="flex w-full gap-2">
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
