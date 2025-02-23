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

    if (loading) {
        return <div className="text-center py-10">Loading food menu details...</div>
    }
    if (!data) {
        return <div className="text-center py-10">No food menu found.</div>
    }

    // Destructure the returned data (assuming backend returns { food_menu: {...}, employees: [...] })
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

                {/* Employees Assigned */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="box p-5">
                        <div className="mb-5 border-b pb-5">
                            <span className="text-base font-medium">Employees with Attendance History</span>
                        </div>
                        {employees && employees.length > 0 ? (
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
                                    {employees.map(emp => (
                                        <tr key={emp.employee_id} className="border-b dark:border-darkmode-300">
                                            <td className="px-5 py-3">{emp.name}</td>
                                            <td className="px-5 py-3">{emp.phone}</td>
                                            <td className="px-5 py-3">{emp.gender}</td>
                                            <td className="px-5 py-3">{emp.position}</td>
                                            <td className="px-5 py-3">
                                                {emp.attendance_history && emp.attendance_history.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {emp.attendance_history.map((att, idx) => (
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
                            <div className="text-center py-10">No employees found for this food menu.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShowFoodMenu
