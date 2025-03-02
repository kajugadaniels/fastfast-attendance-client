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
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

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

    // Handler for "Today Attendance" button
    const handleTodayAttendance = () => {
        const today = new Date().toISOString().split('T')[0]
        setStartDate(today)
        setEndDate(today)
        setCurrentPage(1)
    }

    // --------------------------------------
    //  Filtering & Search
    // --------------------------------------
    const filteredData = attendanceData.filter(emp => {
        // Filter by search term (name or phone)
        const matchesSearch =
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.phone.toLowerCase().includes(searchTerm.toLowerCase())

        // Compute today's attendance status from attendance_history
        const todayStr = new Date().toISOString().split('T')[0]
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

        // Filter by food menu: Check if any attendance record has a food_menu with the given name.
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
    //  Returns an object: { status, time } for that day.
    // --------------------------------------
    const getDayStatus = (emp, dayIndex) => {
        const thatDay = daysArray[dayIndex]
        const dateStr = formatDate(thatDay)
        const record = (emp.attendance_history || []).find(
            hist => hist.attendance_date === dateStr
        )
        if (record) {
            return { status: record.attendance_status, time: record.time }
        } else {
            const today = new Date()
            if (thatDay < today || thatDay.toDateString() === today.toDateString()) {
                return { status: "Absent", time: null }
            } else {
                return { status: "Future", time: null }
            }
        }
    }

    // --------------------------------------
    //  Download Attendance PDF Functionality
    // --------------------------------------
    const downloadAttendancePDF = () => {
        // Check if user has not applied any filters
        const noFiltersApplied =
            !searchTerm && !attendanceFilter && !genderFilter && !positionFilter && !startDate && !endDate && !foodMenuFilter

        // If no filters, override with today's attendance filter
        let effectiveStartDate = startDate
        let effectiveEndDate = endDate
        if (noFiltersApplied) {
            const today = new Date().toISOString().split('T')[0]
            effectiveStartDate = today
            effectiveEndDate = today
        }

        // Create a temporary element to render the attendance table based on effective filters
        const tempDiv = document.createElement('div')
        tempDiv.style.position = 'absolute'
        tempDiv.style.top = '-9999px'
        tempDiv.style.left = '-9999px'
        tempDiv.style.width = '1000px' // Fixed width for PDF rendering

        // Generate HTML content for PDF – mimicking the attendance table structure
        let htmlContent = `
            <h2 style="text-align: center; font-family: Arial, sans-serif;">Attendance History</h2>
            <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; font-family: Arial, sans-serif; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th>Name</th>`
        daysArray.forEach(d => {
            htmlContent += `<th>${formatDate(d)}</th>`
        })
        htmlContent += `</tr>
                </thead>
                <tbody>`

        // For PDF: if no filters applied, consider only today's attendance; otherwise use filteredData.
        let pdfData
        if (noFiltersApplied) {
            const todayStr = effectiveStartDate
            pdfData = attendanceData.filter(emp => {
                const todayRecord = (emp.attendance_history || []).find(hist => hist.attendance_date === todayStr)
                return todayRecord && todayRecord.attendance_status === 'Present'
            })
        } else {
            pdfData = filteredData
        }

        pdfData.forEach(emp => {
            htmlContent += `<tr>
                                <td>${emp.name}</td>`
            daysArray.forEach((_, idx) => {
                const { status, time } = getDayStatus(emp, idx)
                htmlContent += `<td>${status}${time ? `<br/><small>${time}</small>` : ''}</td>`
            })
            htmlContent += `</tr>`
        })

        htmlContent += `
                </tbody>
            </table>`
        tempDiv.innerHTML = htmlContent
        document.body.appendChild(tempDiv)

        // Convert the temporary div to an image then generate PDF
        toPng(tempDiv)
            .then(dataUrl => {
                const pdf = new jsPDF('l', 'mm', 'a4')
                const pdfWidth = pdf.internal.pageSize.getWidth()
                const imgProps = pdf.getImageProperties(dataUrl)
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
                pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
                pdf.save(`attendance_${new Date().toISOString().split('T')[0]}.pdf`)
                document.body.removeChild(tempDiv)
            })
            .catch(error => {
                console.error('Error generating PDF:', error)
                toast.error('Failed to download PDF.')
                document.body.removeChild(tempDiv)
            })
    }

    if (loading) {
        return <div className="text-center py-10">Loading attendance...</div>
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>
    }

    if (filteredData.length === 0) {
        return (
            <div className="text-center py-10">
                <h3 className="text-lg font-medium">No Attendance Found</h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Looks like no employees match your criteria.
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="intro-y col-span-12 mt-8 flex flex-wrap items-center xl:flex-nowrap">
                <h2 className="mr-auto text-lg font-medium">
                    Employee Attendance (Last 4 days, Today, Next 2 days)
                </h2>
                {/* Today Attendance Button */}
                <button
                    onClick={handleTodayAttendance}
                    className="transition duration-200 border shadow-sm inline-flex items-center justify-center py-2 px-4 rounded-full mb-2 mr-1 bg-dark border-dark text-white dark:bg-darkmode-800 dark:border-transparent dark:text-slate-300 [&:hover:not(:disabled)]:dark:dark:bg-darkmode-800/70"
                >
                    Today Attendance
                </button>
                <button
                    onClick={downloadAttendancePDF}
                    className="transition duration-200 border shadow-sm inline-flex items-center justify-center py-2 px-4 rounded-full mb-2 mr-1 bg-pending border-pending text-white dark:bg-darkmode-800 dark:border-transparent dark:text-slate-300 [&:hover:not(:disabled)]:dark:dark:bg-darkmode-800/70"
                >
                    Download Attendance PDF
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

                    {/* Date Range Filters */}
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
                                        {daysArray.map((d, dayIdx) => {
                                            const { status, time } = getDayStatus(emp, dayIdx)
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
                                                    {dayOffsets[dayIdx] === 0 && time && (
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
        </>
    )
}

export default GetAttendances
