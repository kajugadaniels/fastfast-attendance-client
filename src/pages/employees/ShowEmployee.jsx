import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import QRCode from 'react-qr-code'
import { addAttendance, fetchEmployee, fetchFoodMenus } from '../../api'
import { Eye, Edit, ChevronLeft, ChevronRight } from 'lucide-react'
import { toPng } from 'html-to-image'

const ShowEmployee = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [employeeData, setEmployeeData] = useState(null)
    const [foodMenus, setFoodMenus] = useState([]) // Holds food menu options
    const [loading, setLoading] = useState(true)
    const [attendanceStatus, setAttendanceStatus] = useState('')
    const [dateStart, setDateStart] = useState('')
    const [dateEnd, setDateEnd] = useState('')
    const [sortOption, setSortOption] = useState('dateDesc')
    const [message, setMessage] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false) // Controls modal visibility
    const [selectedFoodMenu, setSelectedFoodMenu] = useState(null) // Selected food menu for attendance
    const qrCodeRef = useRef() // For QR code download

    const pageSize = 10
    const [currentPage, setCurrentPage] = useState(1)

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
                const res = await fetchFoodMenus()
                setFoodMenus(res.data)
            } catch (error) {
                toast.error('Failed to load food menus.')
            }
        }
        getFoodMenus()
    }, [id])

    const handleGoBack = () => {
        navigate('/employees')
    }

    const handleAttendanceSubmit = async () => {
        if (selectedFoodMenu) {
            try {
                const response = await addAttendance({
                    // Using finger_id from employeeData.employee
                    finger_id: employeeData.employee.finger_id,
                    food_menu: selectedFoodMenu.id,
                })
                if (response && response.message) {
                    const successMessage = response.message.detail
                    setMessage(successMessage)
                    toast.success(successMessage)

                    // Append the new attendance record to the employee's attendance history
                    setEmployeeData(prevData => ({
                        ...prevData,
                        attendance_history: [...prevData.attendance_history, response.data],
                    }))

                    setIsModalOpen(false)
                }
            } catch (error) {
                const errorMessage =
                    error.response?.data?.message?.detail || 'Failed to record attendance.'
                setMessage(errorMessage)
                toast.error(errorMessage)
            }
        } else {
            toast.error('Please select a food menu.')
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

    // QR code generation: already defined above

    // If loading or no data
    if (loading) {
        return <div>Loading employee details...</div>
    }
    if (!employeeData) {
        return (
            <div className="text-center">
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
                    <div className="mb-5 flex justify-between items-center border-b pb-5">
                        <span className="text-base font-medium">Employee Info</span>
                        <button onClick={() => navigate(`/employee/${id}/edit`)} className="text-primary hover:underline">
                            <Edit className="mr-2" /> Edit Employee
                        </button>
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
                            <span>{employeeData.employee.position}</span>
                        </div>
                        {/* Salary field removed as per new requirements */}
                    </div>
                </div>

                {/* Attendance History */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="box p-5">
                        <div className="mb-5 flex justify-between items-center border-b pb-5">
                            <span className="text-base font-medium">Attendance History</span>
                            <div className="flex gap-3">
                                <input
                                    type="date"
                                    value={dateStart}
                                    onChange={e => setDateStart(e.target.value)}
                                    className="input-date"
                                />
                                <span className="text-slate-500">to</span>
                                <input
                                    type="date"
                                    value={dateEnd}
                                    onChange={e => setDateEnd(e.target.value)}
                                    className="input-date"
                                />
                                <select
                                    value={sortOption}
                                    onChange={e => setSortOption(e.target.value)}
                                    className="select-sort"
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
                                    <tr key={att.id}>
                                        <td className="px-5 py-3">{formatDateTime(att.time_in)}</td>
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
                            {paginatedAttendance.length > 0 && (
                                <tfoot>
                                    <tr>
                                        <td colSpan="3" className="font-medium px-5 py-3 border-t text-right">
                                            Total Earnings:{" "}
                                            {
                                                paginatedAttendance
                                                    .reduce((sum, att) => {
                                                        // Sum the food menu prices for attended records.
                                                        if (att.attendance_status === "Present" && att.food_menu && att.food_menu.length > 0) {
                                                            return sum + parseFloat(att.food_menu[0].price)
                                                        }
                                                        return sum
                                                    }, 0)
                                                    .toFixed(2)
                                            }{" "}
                                            RWF
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>

                        {/* Pagination */}
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                className="btn-pagination"
                            >
                                First
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="btn-pagination"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="px-3 py-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="btn-pagination"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className="btn-pagination"
                            >
                                Last
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Section */}
            <div className="flex justify-center mt-6">
                <div ref={qrCodeRef}>
                    <QRCode value={qrCodeValue} size={128} />
                </div>
            </div>
            <div className="mt-4 text-center">
                <button onClick={downloadQRCode} className="btn-primary">
                    Download QR Code
                </button>
            </div>

            {/* Modal for food menu selection */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-md shadow-md w-96">
                        <h3 className="text-xl font-semibold mb-4">Select Food Menu</h3>
                        <ul className="space-y-3">
                            {foodMenus.map(menu => (
                                <li
                                    key={menu.id}
                                    className="cursor-pointer hover:bg-gray-200 px-3 py-2 rounded-md"
                                    onClick={() => setSelectedFoodMenu(menu)}
                                >
                                    {menu.name} - {menu.price} RWF
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 flex justify-end gap-4">
                            <button onClick={() => setIsModalOpen(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleAttendanceSubmit} className="btn-primary">
                                Submit Attendance
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-6">
                <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                    Record Today's Attendance
                </button>
            </div>
        </div>
    )
}

export default ShowEmployee
