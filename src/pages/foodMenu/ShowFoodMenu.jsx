import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { fetchFoodMenu } from '../../api'
import { Eye, ChevronLeft } from 'lucide-react'

const ShowFoodMenu = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    // Filter state for the Employees table
    const currentDate = new Date().toISOString().split('T')[0]
    const [searchTerm, setSearchTerm] = useState('')
    const [filterFromDate, setFilterFromDate] = useState(currentDate)
    const [filterToDate, setFilterToDate] = useState(currentDate)
    const [filterGender, setFilterGender] = useState('')
    const [filterPosition, setFilterPosition] = useState('')

    // Pagination state for the Employees table
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    useEffect(() => {
        const getFoodMenuDetails = async () => {
            try {
                setLoading(true)
                const res = await fetchFoodMenu(id)
                if (res.data) {
                    setData(res.data)
                }
            } catch (error) {
                toast.error('Failed to load food menu details.')
            } finally {
                setLoading(false)
            }
        }
        getFoodMenuDetails()
    }, [id])

    const handleGoBack = () => {
        navigate('/food-menus')
    }

    // Prepare filtered employees for the Attendance History table
    // First, filter employees by search term, gender, and position.
    // Then, for each employee, filter their attendance history based on the date range.
    const filteredEmployees = (data?.employees || []).filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesGender = filterGender ? emp.gender === filterGender : true
        const matchesPosition = filterPosition
            ? (emp.position || '').toLowerCase() === filterPosition.toLowerCase()
            : true
        return matchesSearch && matchesGender && matchesPosition
    }).map(emp => {
        const filteredAttendance = (emp.attendance_history || []).filter(att => {
            return att.attendance_date >= filterFromDate && att.attendance_date <= filterToDate
        })
        return { ...emp, filteredAttendance }
    }).filter(emp => emp.filteredAttendance.length > 0) // Only show employees with at least one record

    const totalRecords = filteredEmployees.length
    const totalPages = Math.ceil(totalRecords / pageSize)
    const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    // Helper: Format attendance time/date (if needed)
    const formatDateTime = (dateStr) => {
        return new Date(dateStr).toLocaleString()
    }

    if (loading) {
        return <div className="text-center py-10">Loading food menu details...</div>
    }
    if (!data) {
        return <div className="text-center py-10">No food menu found.</div>
    }

    const { food_menu, employees } = data

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="intro-y col-span-12 mt-8 flex flex-wrap items-center xl:flex-nowrap">
                <h2 className="mr-auto text-lg font-medium">Food Menu Details</h2>
                <button
                    onClick={handleGoBack}
                    className="transition duration-200 border inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 bg-primary border-primary text-white mr-2 shadow-md"
                >
                    Go Back
                    <span className="flex h-5 w-5 items-center justify-center ml-1">
                        <ChevronLeft className="stroke-1.5 h-4 w-4" />
                    </span>
                </button>
            </div>

            {/* Food Menu Info */}
            <div className="grid grid-cols-12 gap-6 mt-6">
                <div className="col-span-12 lg:col-span-4 box p-5">
                    <div className="mb-5 border-b pb-5">
                        <span className="text-base font-medium">Food Menu Info</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm">Name:</span>
                            <span>{food_menu.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">Price:</span>
                            <span>{food_menu.price} RWF</span>
                        </div>
                    </div>
                </div>

                {/* Employees with Attendance History */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="box p-5">
                        <div className="mb-5 border-b pb-5">
                            <span className="text-base font-medium">Employees with Attendance History</span>
                        </div>
                        {/* Filter Bar */}
                        <div className="flex flex-wrap gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="border rounded-md p-2"
                            />
                            <input
                                type="date"
                                value={filterFromDate}
                                onChange={(e) => {
                                    setFilterFromDate(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="border rounded-md p-2"
                            />
                            <input
                                type="date"
                                value={filterToDate}
                                onChange={(e) => {
                                    setFilterToDate(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="border rounded-md p-2"
                            />
                            <select
                                value={filterGender}
                                onChange={(e) => {
                                    setFilterGender(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="border rounded-md p-2"
                            >
                                <option value="">All Genders</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                            <select
                                value={filterPosition}
                                onChange={(e) => {
                                    setFilterPosition(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="border rounded-md p-2"
                            >
                                <option value="">All Positions</option>
                                <option value="Staff">Staff</option>
                                <option value="Umwubatsi">Umwubatsi</option>
                                <option value="Umufundi">Umufundi</option>
                                <option value="Umuyede">Umuyede</option>
                            </select>
                        </div>
                        {/* Employees Table */}
                        {paginatedEmployees.length > 0 ? (
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="font-medium px-5 py-3">Name</th>
                                        <th className="font-medium px-5 py-3">Phone</th>
                                        <th className="font-medium px-5 py-3">Gender</th>
                                        <th className="font-medium px-5 py-3">Position</th>
                                        <th className="font-medium px-5 py-3">Attendance History</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedEmployees.map(emp => (
                                        <tr key={emp.employee_id} className="border-b dark:border-darkmode-300">
                                            <td className="px-5 py-3">{emp.name}</td>
                                            <td className="px-5 py-3">{emp.phone}</td>
                                            <td className="px-5 py-3">{emp.gender}</td>
                                            <td className="px-5 py-3">{emp.position}</td>
                                            <td className="px-5 py-3">
                                                {emp.filteredAttendance && emp.filteredAttendance.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {emp.filteredAttendance.map((att, idx) => (
                                                            <div key={idx} className="border p-2 rounded-md">
                                                                <div className="text-sm">
                                                                    <strong>Date:</strong> {att.attendance_date}
                                                                </div>
                                                                <div className="text-sm">
                                                                    <strong>Time:</strong> {att.time || "N/A"}
                                                                </div>
                                                                <div className="text-sm">
                                                                    <strong>Status:</strong> {att.attendance_status}
                                                                </div>
                                                                <div className="text-sm">
                                                                    <strong>Food Menu:</strong>{" "}
                                                                    {att.food_menu && att.food_menu.length > 0
                                                                        ? `${att.food_menu[0].name} - ${att.food_menu[0].price} RWF`
                                                                        : "N/A"}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    "No Attendance Records"
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-10">
                                <h3 className="text-lg font-medium">No Attendance Found</h3>
                                <p className="mt-2 text-slate-500 dark:text-slate-400">
                                    Looks like no employees match your criteria.
                                </p>
                            </div>
                        )}
                        {/* Pagination Controls */}
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
        </div>
    )
}

export default ShowFoodMenu;
