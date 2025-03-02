import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    Eye,
    Search
} from 'lucide-react'
import { fetchAttendances, fetchFoodMenus } from '../../api'
import { useNavigate } from 'react-router-dom'

const GetAttendances = () => {
    const navigate = useNavigate()
    const [attendanceData, setAttendanceData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Filters & search
    const [searchTerm, setSearchTerm] = useState('')
    const [attendanceFilter, setAttendanceFilter] = useState('') // "Present" or "Absent"
    const [genderFilter, setGenderFilter] = useState('')
    const [positionFilter, setPositionFilter] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [foodMenuFilter, setFoodMenuFilter] = useState('')

    // New state: Today-only mode
    const [todayOnly, setTodayOnly] = useState(false)

    // Retrieve food menus for filtering options
    const [foodMenus, setFoodMenus] = useState([])

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    // 7-day window: 4 past days, 1 current day, and 2 future days
    const dayOffsets = [-4, -3, -2, -1, 0, 1, 2]
    const daysArray = dayOffsets.map(offset => {
        const d = new Date()
        d.setDate(d.getDate() + offset)
        return d
    })

    // Today’s date string
    const todayStr = new Date().toISOString().split('T')[0]

    // Fetch attendance records (complete history)
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

    // Fetch food menus for filtering
    useEffect(() => {
        const fetchFoodMenusData = async () => {
            try {
                const res = await fetchFoodMenus()
                if (res.data) {
                    setFoodMenus(res.data)
                }
            } catch (err) {
                console.error('Error fetching food menus', err)
            }
        }
        fetchFoodMenusData()
    }, [])

    // --------------------------------------
    //  Filtering & Search
    // --------------------------------------
    const filteredData = attendanceData.filter(emp => {
        // Filter by search term (name or phone)
        const matchesSearch =
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.phone.toLowerCase().includes(searchTerm.toLowerCase())

        // Compute today's attendance status from attendance_history
        const todayRecord =
            (emp.attendance_history || []).find(hist => hist.attendance_date === todayStr) || {}
        const todayStatus = todayRecord.attendance_status || "Absent"
        const matchesAttendance = attendanceFilter ? todayStatus === attendanceFilter : true

        // Filter by gender
        let matchesGender = true
        if (genderFilter && emp.gender) {
            matchesGender = emp.gender === genderFilter
        } else if (genderFilter && !emp.gender) {
            matchesGender = false
        }

        // Filter by position
        const matchesPosition = positionFilter
            ? (emp.position || '').toLowerCase() === positionFilter.toLowerCase()
            : true

        // Filter by date range
        let matchesDateRange = true
        if (startDate) {
            const start = new Date(startDate)
            const hasRecord = (emp.attendance_history || []).some(
                hist => new Date(hist.attendance_date) >= start
            )
            if (!hasRecord) matchesDateRange = false
        }
        if (endDate) {
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            const hasRecord = (emp.attendance_history || []).some(
                hist => new Date(hist.attendance_date) <= end
            )
            if (!hasRecord) matchesDateRange = false
        }

        // Filter by food menu
        let matchesFoodMenu = true
        if (foodMenuFilter) {
            const history = emp.attendance_history || []
            const hasFoodMenu = history.some(
                hist =>
                    hist.food_menu &&
                    hist.food_menu.length > 0 &&
                    hist.food_menu[0].name.toLowerCase() === foodMenuFilter.toLowerCase()
            )
            if (!hasFoodMenu) matchesFoodMenu = false
        }

        // NEW: If Today-Only is enabled, ensure employee has a "Present" record for today.
        if (todayOnly) {
            const hasToday = (emp.attendance_history || []).some(
                hist => hist.attendance_date === todayStr && hist.attendance_status === "Present"
            )
            if (!hasToday) return false
        }

        return (
            matchesSearch &&
            matchesAttendance &&
            matchesGender &&
            matchesPosition &&
            matchesDateRange &&
            matchesFoodMenu
        )
    })

    // --------------------------------------
    //  Pagination
    // --------------------------------------
    const totalRecords = filteredData.length
    const totalPages = Math.ceil(totalRecords / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = filteredData.slice(startIndex, endIndex)

    const handlePageChange = page => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const handleShowEmployee = employee_id => {
        navigate(`/employee/${employee_id}`)
    }

    // --------------------------------------
    //  Helper: Format Date
    // --------------------------------------
    const formatDate = dateObj => {
        return dateObj.toISOString().split('T')[0] // "YYYY-MM-DD"
    }

    // --------------------------------------
    //  Determine attendance for a given day by looking up the history.
    //  Modified to accept a date object.
    // --------------------------------------
    const getDayStatus = (emp, dateObj) => {
        const dateStr = dateObj.toISOString().split('T')[0]
        const record = (emp.attendance_history || []).find(
            hist => hist.attendance_date === dateStr
        )
        if (record) {
            return { status: record.attendance_status, time: record.time }
        } else {
            const today = new Date()
            if (dateObj < today || dateObj.toDateString() === today.toDateString()) {
                return { status: "Absent", time: null }
            } else {
                return { status: "Future", time: null }
            }
        }
    }

    // Determine which days to show in the table:
    // If Today-Only mode is enabled, only show today's date. Otherwise, show the 7-day window.
    const tableDaysArray = todayOnly ? [new Date()] : daysArray

    if (loading) {
        return <div className="text-center py-10">Loading attendance...</div>
    }

    return (
        <>
            <div className="intro-y col-span-12 mt-8 flex flex-wrap items-center xl:flex-nowrap">
                <h2 className="mr-auto text-lg font-medium">
                    Employee Attendance {todayOnly ? '(Today Only)' : '(Last 4 days, Today, Next 2 days)'}
                </h2>
                {/* Today Attendance toggle button */}
                <button
                    onClick={() => {
                        setTodayOnly(!todayOnly)
                        setCurrentPage(1)
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition duration-200"
                >
                    {todayOnly ? 'Show All Attendance' : 'Today Attendance'}
                </button>
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
                            onChange={e => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-800/50 transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 dark:bg-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 !box w-56 pr-10"
                        />
                        <Search className="stroke-1.5 absolute inset-y-0 right-0 my-auto mr-3 h-4 w-4" />
                    </div>

                    {/* Attendance Status Filter */}
                    <select
                        value={attendanceFilter}
                        onChange={e => {
                            setAttendanceFilter(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent dark:focus:ring-slate-700 !box w-44"
                    >
                        <option value="">All</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                    </select>

                    {/* Gender Filter */}
                    <select
                        value={genderFilter}
                        onChange={e => {
                            setGenderFilter(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent dark:focus:ring-slate-700 !box w-44"
                    >
                        <option value="">All Genders</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                    </select>

                    {/* Position Filter */}
                    <select
                        value={positionFilter}
                        onChange={e => {
                            setPositionFilter(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent dark:focus:ring-slate-700 !box w-44"
                    >
                        <option value="">All Positions</option>
                        <option value="Staff">Staff</option>
                        <option value="Umwubatsi">Umwubatsi</option>
                        <option value="Umufundi">Umufundi</option>
                        <option value="Umuyede">Umuyede</option>
                    </select>

                    {/* Date Range Filters (hide if Today mode is on) */}
                    {!todayOnly && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-700">From:</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => {
                                    setStartDate(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="w-40 disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-800/50 transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary focus:ring-opacity-20 dark:bg-800 dark:border-transparent dark:focus:ring-slate-700"
                            />
                            <span className="text-sm text-slate-700">To:</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => {
                                    setEndDate(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="w-40 disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-800/50 transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary focus:ring-opacity-20 dark:bg-800 dark:border-transparent dark:focus:ring-slate-700"
                            />
                        </div>
                    )}

                    {/* Food Menu Filter */}
                    <div className="relative w-56">
                        <select
                            value={foodMenuFilter}
                            onChange={e => {
                                setFoodMenuFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent dark:focus:ring-slate-700 w-full"
                        >
                            <option value="">All Food Menus</option>
                            {foodMenus.map(menu => (
                                <option key={menu.id} value={menu.name.toLowerCase()}>
                                    {menu.name}
                                </option>
                            ))}
                        </select>
                    </div>
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
                                            className="transition-all duration-200 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded"
                                        />
                                    </th>
                                    <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0">
                                        Name
                                    </th>
                                    {tableDaysArray.map((d, idx) => (
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
                                    <tr key={emp.employee_id} className="intro-x">
                                        <td className="px-5 py-3 border-b dark:border-300 box w-10 whitespace-nowrap border-x-0 shadow-[5px_3px_5px_#00000005] dark:bg-600">
                                            <input
                                                type="checkbox"
                                                className="transition-all duration-200 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded"
                                            />
                                        </td>
                                        <td className="px-5 py-3 border-b dark:border-300 box whitespace-nowrap border-x-0 !py-3.5 shadow-[5px_3px_5px_#00000005] dark:bg-600">
                                            <div className="flex items-center">
                                                <div className="image-fit zoom-in h-9 w-9">
                                                    <img
                                                        src="https://cdn-icons-png.flaticon.com/512/5951/5951752.png"
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
                                        {tableDaysArray.map((d, dayIdx) => {
                                            const { status, time } = getDayStatus(emp, d)
                                            let bgColor = 'bg-slate-400'
                                            if (status === 'Present') bgColor = 'bg-success'
                                            else if (status === 'Absent') bgColor = 'bg-danger'
                                            else if (status === 'Future') bgColor = 'bg-warning'
                                            return (
                                                <td
                                                    key={dayIdx}
                                                    className="px-5 py-3 border-b dark:border-300 box w-56 border-x-0 text-center shadow-[5px_3px_5px_#00000005] dark:bg-600"
                                                >
                                                    <span
                                                        className={`px-3 py-1 inline-block rounded-full text-xs text-white ${bgColor}`}
                                                    >
                                                        {status}
                                                    </span>
                                                    {dayIdx === 0 && time && (
                                                        <div className="text-xs mt-1">{time}</div>
                                                    )}
                                                </td>
                                            )
                                        })}
                                        <td className="px-5 py-3 border-b dark:border-300 box w-56 border-x-0 shadow-[5px_3px_5px_#00000005] dark:bg-600">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    className="mr-3 flex items-center text-blue-600"
                                                    onClick={() => handleShowEmployee(emp.employee_id)}
                                                >
                                                    <Eye className="stroke-1.5 mr-1 h-4 w-4" />
                                                    View
                                                </button>
                                            </div>
                                        </td>
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

            {/* Button to download Attendance History as PDF */}
            <div className="flex justify-center mt-4">
                <button
                    onClick={downloadAttendancePDF}
                    className="px-5 py-2 bg-secondary text-white rounded-md shadow hover:bg-secondary-dark transition duration-200"
                >
                    Download Attendance PDF
                </button>
            </div>

            {/* Enhanced Stunning Modal for Food Menu Selection */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-1/3 p-8 transform transition-all duration-300">
                        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
                            Select Food Menu
                        </h3>
                        <ul className="space-y-4 max-h-60 overflow-y-auto">
                            {foodMenus.map(menu => (
                                <li
                                    key={menu.id}
                                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 transition-colors"
                                    onClick={() => setSelectedFoodMenu(menu)}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-800 dark:text-gray-100 font-medium">
                                            {menu.name}
                                        </span>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                            {menu.price} RWF
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8 flex justify-end space-x-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAttendanceSubmit}
                                className="px-5 py-2 bg-primary text-white rounded-md shadow hover:bg-primary-dark transition duration-200"
                            >
                                Submit Attendance
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="transition duration-200 border shadow-sm inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 bg-primary border-primary text-white"
                >
                    Record Today's Attendance
                </button>
            </div>
        </>
    )
}

export default GetAttendances
