import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import QRCode from 'react-qr-code'
import { addAttendance, fetchEmployee, fetchFoodMenus } from '../../api'
import { Eye, Edit, ChevronLeft, ChevronRight } from 'lucide-react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

const ShowEmployee = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [employeeData, setEmployeeData] = useState(null)
    const [foodMenus, setFoodMenus] = useState([]) // Holds food menu options
    const [loading, setLoading] = useState(true)
    const [attendanceStatus, setAttendanceStatus] = useState('')
    // Default date filters set to current date so that only today's attendance is shown by default.
    const currentDate = new Date().toISOString().split('T')[0]
    const [dateStart, setDateStart] = useState(currentDate)
    const [dateEnd, setDateEnd] = useState(currentDate)
    const [sortOption, setSortOption] = useState('dateDesc')
    const [message, setMessage] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false) // Controls modal visibility
    const [selectedFoodMenuId, setSelectedFoodMenuId] = useState(null)
    const qrCodeRef = useRef() // For QR code download

    // Ref for attendance history section for PDF generation (used in old PDF method)
    // Now we generate PDF programmatically so we don't rely on the DOM.
    const attendanceRef = useRef()

    // Pagination state for attendance history (5 rows per page)
    const pageSize = 5
    const [currentPage, setCurrentPage] = useState(1)

    const [filteredMenus, setFilteredMenus] = useState([]);

    // QR code URL based on employee id
    const qrCodeValue = `https://www.fastfast.nexcodes.dev/employee/${employeeData?.employee?.id}/details`

    useEffect(() => {
        const getEmployeeDetails = async () => {
            try {
                setLoading(true)
                const res = await fetchEmployee(id)
                setEmployeeData(res.data)
            } catch (error) {
                toast.error('Failed to load employee details.')
            } finally {
                setLoading(false)
            }
        }
        getEmployeeDetails()

        // Fetch food menus
        const getFoodMenus = async () => {
            try {
                const res = await fetchFoodMenus();
                setFoodMenus(res.data);
                setFilteredMenus(res.data); // Keep original set as fallback
            } catch (error) {
                toast.error('Failed to load food menus.');
            }
        };
        getFoodMenus()
    }, [id])

    const handleGoBack = () => {
        navigate('/employees')
    }

    const handleAttendanceSubmit = async () => {
        if (!selectedFoodMenuId) {
            toast.error('Please select a food menu.')
            return
        }
        try {
            const response = await addAttendance({
                finger_id: employeeData.employee.finger_id,
                food_menu: selectedFoodMenuId,
            })
            if (response && response.message) {
                toast.success(response.message.detail)
                // Update the attendance history so that new record shows immediately
                setEmployeeData(prevData => ({
                    ...prevData,
                    attendance_history: [...prevData.attendance_history, response.data],
                }))
                setCurrentPage(1)
                setIsModalOpen(false)
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message?.detail || 'Failed to record attendance.'
            toast.error(errorMessage)
        }
    }

    const downloadQRCode = () => {
        if (qrCodeRef.current) {
            toPng(qrCodeRef.current)
                .then(dataUrl => {
                    const link = document.createElement('a')
                    link.download = `employee_${employeeData?.employee?.id}_qr_code.png`
                    link.href = dataUrl
                    link.click()
                })
                .catch(error => {
                    console.error('Error generating QR code image:', error)
                    toast.error('Failed to download QR code.')
                })
        }
    }

    // Download Attendance History as a professionally formatted PDF Report.
    // The report includes the company header, total consumed amount, and a table with:
    // Employee Name, Food Menu, Price, and Date.
    const downloadAttendancePDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4')
        const margin = 10
        let y = margin

        // Company Header
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(16)
        doc.text("FAST FAST FOOD", margin, y)
        y += 7
        // doc.setFontSize(10)
        // doc.setFont('helvetica', 'normal')
        // doc.text("Address: 1234 Company Address, City, Country", margin, y)
        // y += 5
        // doc.text("Contact: +1234567890 | Email: info@company.com", margin, y)
        // y += 10

        // Report Title
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text("Attendance Report", margin, y)
        y += 8

        // Total Consumption Summary
        const totalConsumed = filteredSortedAttendance.reduce((sum, att) => {
            if (att.attendance_status === "Present" && att.food_menu && att.food_menu.length > 0) {
                return sum + parseFloat(att.food_menu[0].price)
            }
            return sum
        }, 0).toFixed(2)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text(`Total Consumption: ${totalConsumed} RWF`, margin, y)
        y += 10

        // Table Header
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        const col1X = margin
        const col2X = margin + 50
        const col3X = margin + 100
        const col4X = margin + 140
        doc.text("Employee Name", col1X, y)
        doc.text("Food Menu", col2X, y)
        doc.text("Price (RWF)", col3X, y)
        doc.text("Date", col4X, y)
        y += 6
        doc.setFont('helvetica', 'normal')

        // Table Rows (all filtered attendance records)
        filteredSortedAttendance.forEach((att, index) => {
            const empName = employeeData.employee.name
            const menuName = att.food_menu && att.food_menu.length > 0 ? att.food_menu[0].name : "N/A"
            const menuPrice = att.food_menu && att.food_menu.length > 0 ? att.food_menu[0].price : "N/A"
            const date = att.attendance_date
            doc.text(empName, col1X, y)
            doc.text(menuName, col2X, y)
            doc.text(`${menuPrice}`, col3X, y)
            doc.text(date, col4X, y)
            y += 6
            if (y > 280) {
                doc.addPage()
                y = margin
            }
        })

        doc.save(`employee_${employeeData.employee.id}_attendance_report.pdf`)
    }

    // Filter and sort the attendance history (based on date only)
    const getFilteredSortedAttendance = () => {
        if (!employeeData || !employeeData.attendance_history) return []

        let filtered = [...employeeData.attendance_history]

        // Filter by attendance status if provided (expects "Present" or "Absent")
        if (attendanceStatus === 'true') {
            filtered = filtered.filter(att => att.attendance_status === 'Present')
        } else if (attendanceStatus === 'false') {
            filtered = filtered.filter(att => att.attendance_status === 'Absent')
        }

        // Filter by date range using the attendance_date field
        if (dateStart) {
            const start = new Date(dateStart)
            filtered = filtered.filter(att => new Date(att.attendance_date) >= start)
        }
        if (dateEnd) {
            const end = new Date(dateEnd)
            end.setHours(23, 59, 59, 999)
            filtered = filtered.filter(att => new Date(att.attendance_date) <= end)
        }

        // Sort by date only
        filtered.sort((a, b) => {
            const dateA = new Date(a.attendance_date)
            const dateB = new Date(b.attendance_date)
            return sortOption === 'dateAsc' ? dateA - dateB : dateB - dateA
        })

        return filtered
    }

    const filteredSortedAttendance = getFilteredSortedAttendance()
    const totalRecords = filteredSortedAttendance.length
    const totalPages = Math.ceil(totalRecords / pageSize)
    const startIndexAttendance = (currentPage - 1) * pageSize
    const paginatedAttendance = filteredSortedAttendance.slice(startIndexAttendance, startIndexAttendance + pageSize)

    const handlePageChange = page => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    // Helper: Format date/time strings
    const formatDateTime = dateStr => {
        return new Date(dateStr).toLocaleString()
    }

    if (loading) {
        return <div className="text-center py-10">Loading employee details...</div>
    }
    if (!employeeData) {
        return (
            <div className="text-center py-10">
                <h2>No Employee Data</h2>
                <button onClick={handleGoBack} className="btn-primary">
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
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

            {/* Employee Info */}
            <div className="grid grid-cols-12 gap-6 mt-6">
                <div className="col-span-12 lg:col-span-4 box p-5">
                    <div className="mb-5 flex items-center border-b border-slate-200/60 pb-5 dark:border-darkmode-400">
                        <div className="truncate text-base font-medium">Employee Info</div>
                        {/*
                        <button onClick={() => navigate(`/employee/${id}/edit`)} className="ml-auto flex items-center text-primary" href="">
                            <Edit className="stroke-1.5 mr-2 h-4 w-4" />
                            Edit Employee
                        </button>
                        */}
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm">Name:</span>
                            <span>{employeeData.employee.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Finger ID:</span>
                            <span>{employeeData.employee.finger_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Position:</span>
                            <span>{employeeData.employee.position || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Total amount consumed:</span>
                            <span>
                                {paginatedAttendance
                                    .reduce((sum, att) => {
                                        if (att.attendance_status === "Present" && att.food_menu && att.food_menu.length > 0) {
                                            return sum + parseFloat(att.food_menu[0].price)
                                        }
                                        return sum
                                    }, 0)
                                    .toFixed(2)}{" "}
                                RWF
                            </span>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="flex justify-center mt-6">
                        <div ref={qrCodeRef}>
                            <QRCode value={qrCodeValue} size={128} />
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <button
                            onClick={downloadQRCode}
                            className="transition duration-200 border shadow-sm inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 dark:focus:ring-slate-700 dark:focus:ring-opacity-50 bg-primary border-primary text-white"
                        >
                            Download QR Code
                        </button>
                    </div>
                </div>

                {/* Attendance History */}
                <div className="col-span-12 lg:col-span-7 2xl:col-span-8">
                    <div className="box rounded-md p-5" ref={attendanceRef}>
                        <div className="mb-5 flex flex-col sm:flex-row items-center border-b border-slate-200/60 pb-5 dark:border-darkmode-400">
                            <div className="truncate text-base font-medium">Attendance History</div>
                            <div className="ml-auto flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                                <input
                                    type="date"
                                    value={dateStart}
                                    onChange={e => {
                                        setDateStart(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="w-40 border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary"
                                />
                                <span className="text-slate-500">to</span>
                                <input
                                    type="date"
                                    value={dateEnd}
                                    onChange={e => {
                                        setDateEnd(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="w-40 border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary"
                                />
                                <select
                                    value={sortOption}
                                    onChange={e => {
                                        setSortOption(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="transition duration-200 ease-in-out text-sm border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary dark:bg-800 dark:border-transparent dark:focus:ring-slate-700 !box w-44"
                                >
                                    <option value="dateDesc">Date (Newest)</option>
                                    <option value="dateAsc">Date (Oldest)</option>
                                </select>
                            </div>
                        </div>

                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    <th className="font-medium px-5 py-3">Date/Time</th>
                                    <th className="font-medium px-5 py-3">Attended</th>
                                    <th className="font-medium px-5 py-3">Food Menu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAttendance.map(att => (
                                    <tr key={att.id} className="border-t">
                                        <td className="px-5 py-3">{formatDateTime(att.time)}</td>
                                        <td className="px-5 py-3">{att.attendance_status}</td>
                                        <td className="px-5 py-3">
                                            {att.food_menu && att.food_menu.length > 0
                                                ? att.food_menu.map((menu, idx) => (
                                                      <div key={idx}>
                                                          {menu.name} - {menu.price} RWF
                                                      </div>
                                                  ))
                                                : "N/A"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls for Attendance History */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border rounded-md mx-1 disabled:opacity-50"
                                >
                                    First
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border rounded-md mx-1 disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <span className="px-3 py-1">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border rounded-md mx-1 disabled:opacity-50"
                                >
                                    Next
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border rounded-md mx-1 disabled:opacity-50"
                                >
                                    Last
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="transition duration-200 border shadow-sm inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 bg-primary border-primary text-white"
                >
                    Record Today's Attendance
                </button>
                <button
                    onClick={downloadAttendancePDF}
                    className="transition duration-200 border shadow-sm inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-success focus:ring-opacity-20 bg-success border-success text-white"
                >
                    Download Attendance PDF
                </button>
            </div>

            {/* Attendance Record Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-11/12 sm:w-1/3 p-4 sm:p-8 transform transition-all duration-300">
                        <h3 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">
                            Select Food Menu
                        </h3>
            
                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search food menu..."
                            onChange={(e) => {
                                const val = e.target.value.toLowerCase();
                                setFilteredMenus(
                                    foodMenus.filter((menu) =>
                                        menu.name.toLowerCase().includes(val)
                                    )
                                );
                            }}
                            className="w-full mb-4 p-2 border rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
            
                        {/* Scrollable List with Max Height */}
                        <ul className="space-y-4 overflow-y-auto max-h-[300px] pr-1" style={{ 'height': '300px' }}>
                            {(filteredMenus.length > 0 ? filteredMenus : foodMenus).map((menu) => (
                                <li
                                    key={menu.id}
                                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 transition-colors"
                                >
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="foodMenu"
                                            value={menu.id}
                                            checked={selectedFoodMenuId === menu.id}
                                            onChange={() => setSelectedFoodMenuId(menu.id)}
                                            className="mr-2"
                                        />
                                        <div className="flex justify-between items-center w-full">
                                            <span className="text-gray-800 dark:text-gray-100 font-medium">
                                                {menu.name}
                                            </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {menu.price} RWF
                                            </span>
                                        </div>
                                    </label>
                                </li>
                            ))}
                        </ul>
            
                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
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
        </div>
    )
}

export default ShowEmployee
