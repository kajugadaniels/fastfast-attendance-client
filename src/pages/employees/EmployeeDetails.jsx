import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchEmployee, addAttendance, fetchFoodMenus } from '../../api';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const EmployeeDetails = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();

    // Main data states
    const [employeeData, setEmployeeData] = useState(null);
    const [foodMenus, setFoodMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFoodMenuId, setSelectedFoodMenuId] = useState(null);

    // For QR code
    const qrCodeRef = useRef();
    const qrCodeValue = `https://www.fastfast.nexcodes.dev/employee/${employeeData?.employee?.id}/details`;

    // For attendance filtering and pagination
    const [attendanceStatus, setAttendanceStatus] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [sortOption, setSortOption] = useState('dateDesc');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Ref for attendance history section (for PDF download)
    const attendanceRef = useRef();

    const [filteredMenus, setFilteredMenus] = useState([]);

    useEffect(() => {
        const getEmployeeDetails = async () => {
            try {
                setLoading(true);
                const res = await fetchEmployee(employeeId);
                setEmployeeData(res.data);
            } catch (error) {
                toast.error('Failed to load employee details.');
                navigate('/employees');
            } finally {
                setLoading(false);
            }
        };

        const getFoodMenus = async () => {
            try {
                const res = await fetchFoodMenus();
                setFoodMenus(res.data);
                setFilteredMenus(res.data); // Keep original set as fallback
            } catch (error) {
                toast.error('Failed to load food menus.');
            }
        };

        getEmployeeDetails();
        getFoodMenus();
    }, [employeeId, navigate]);

    const handleGoBack = () => {
        navigate('/employees');
    };

    const handleAttendanceSubmit = async () => {
        if (!selectedFoodMenuId) {
            toast.error('Please select a food menu.');
            return;
        }
        try {
            const response = await addAttendance({
                finger_id: employeeData.employee.finger_id,
                food_menu: selectedFoodMenuId,
            });
            if (response && response.message) {
                toast.success(response.message.detail);
                // Optionally update local attendance history
                setEmployeeData(prevData => ({
                    ...prevData,
                    attendance_history: [...prevData.attendance_history, response.data],
                }));
                setIsModalOpen(false);
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message?.detail || 'Failed to record attendance.';
            toast.error(errorMessage);
        }
    };

    // Download PDF for attendance history
    const downloadAttendancePDF = () => {
        if (attendanceRef.current) {
            toPng(attendanceRef.current)
                .then(dataUrl => {
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    // Calculate width and height for the image to fit A4 (210 x 297 mm)
                    const imgProps = pdf.getImageProperties(dataUrl);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`employee_${employeeData?.employee?.id}_attendance_history.pdf`);
                })
                .catch(error => {
                    console.error('Error generating PDF:', error);
                    toast.error('Failed to download PDF.');
                });
        }
    };

    // Attendance History Filtering & Pagination
    const getFilteredSortedAttendance = () => {
        if (!employeeData || !employeeData.attendance_history) return [];
        let filtered = [...employeeData.attendance_history];

        // Optional: filter by attendance status ("Present" or "Absent")
        if (attendanceStatus === 'true') {
            filtered = filtered.filter(att => att.attendance_status === 'Present');
        } else if (attendanceStatus === 'false') {
            filtered = filtered.filter(att => att.attendance_status === 'Absent');
        }

        // Filter by date range
        if (dateStart) {
            const start = new Date(dateStart);
            filtered = filtered.filter(att => new Date(att.attendance_date) >= start);
        }
        if (dateEnd) {
            const end = new Date(dateEnd);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(att => new Date(att.attendance_date) <= end);
        }

        // Sort by date
        filtered.sort((a, b) => {
            const dateA = new Date(a.attendance_date);
            const dateB = new Date(b.attendance_date);
            return sortOption === 'dateAsc' ? dateA - dateB : dateB - dateA;
        });

        return filtered;
    };

    const filteredSortedAttendance = getFilteredSortedAttendance();
    const totalRecords = filteredSortedAttendance.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const startIndexAttendance = (currentPage - 1) * pageSize;
    const paginatedAttendance = filteredSortedAttendance.slice(
        startIndexAttendance,
        startIndexAttendance + pageSize
    );

    const handlePageChange = page => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const formatDateTime = dateStr => {
        return new Date(dateStr).toLocaleString();
    };

    if (loading) {
        return <div className="text-center py-10">Loading employee details...</div>;
    }

    if (!employeeData) {
        return (
            <div className="text-center py-10">
                <h2>No Employee Data</h2>
                <button onClick={handleGoBack} className="btn-primary">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 flex flex-col items-center">
            <div className="w-full max-w-xl">
                {/* Header */}
                <div className="flex flex-col items-center justify-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">
                        Employee Details
                    </h2>
                </div>

                {/* Employee Card */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 mb-8">
                    <div className="mb-4 text-center">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                            {employeeData.employee.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Finger ID: {employeeData.employee.finger_id}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="font-medium text-gray-700 dark:text-gray-200">Position:</p>
                            <p className="text-gray-600 dark:text-gray-300">
                                {employeeData.employee.position || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Record Attendance & Go Back Buttons */}
                {localStorage.getItem('token') && (
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-5 py-2 bg-primary text-white rounded-md shadow hover:bg-primary-dark transition duration-200"
                        >
                            Record Attendance for {employeeData.employee.name}
                        </button>
                        <Link
                            to="/dashboard"
                            className="px-5 py-2 bg-dark text-white rounded-md shadow hover:bg-outline-dark transition duration-200 text-center"
                        >
                            Go Back
                        </Link>
                    </div>
                )}
            </div>

            {/* Attendance History Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 mt-8 w-full max-w-4xl" ref={attendanceRef}>
                <div className="flex flex-col items-center justify-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">
                        Attendance History
                    </h2>
                </div>
                <div className="mb-5 flex flex-col sm:flex-row justify-between items-center border-b pb-5 gap-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="date"
                            value={dateStart}
                            onChange={e => {
                                setDateStart(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="input-date"
                        />
                        <span className="text-slate-500 self-center">to</span>
                        <input
                            type="date"
                            value={dateEnd}
                            onChange={e => {
                                setDateEnd(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="input-date"
                        />
                    </div>
                    <select
                        value={sortOption}
                        onChange={e => {
                            setSortOption(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="select-sort"
                    >
                        <option value="dateDesc">Date (Newest)</option>
                        <option value="dateAsc">Date (Oldest)</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
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
                                            : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {paginatedAttendance.length > 0 && (
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="font-medium px-5 py-3 border-t text-right">
                                        Total Earnings:{' '}
                                        {paginatedAttendance
                                            .reduce((sum, att) => {
                                                if (att.attendance_status === 'Present' && att.food_menu && att.food_menu.length > 0) {
                                                    return sum + parseFloat(att.food_menu[0].price);
                                                }
                                                return sum;
                                            }, 0)
                                            .toFixed(2)}{' '}
                                        RWF
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap justify-center mt-4 gap-2">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="btn-pagination px-3 py-1"
                    >
                        First
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="btn-pagination px-3 py-1"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-3 py-2">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="btn-pagination px-3 py-1"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="btn-pagination px-3 py-1"
                    >
                        Last
                    </button>
                </div>
            </div>

            {/* Button to download Attendance History as PDF */}
            <div className="flex justify-center mt-4">
                <button
                    onClick={downloadAttendancePDF}
                    className="px-5 py-2 bg-success text-white rounded-md shadow hover:bg-success-dark transition duration-200"
                >
                    Download Attendance PDF
                </button>
            </div>

            {/* Enhanced Modal for Food Menu Selection */}
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
    );
};

export default EmployeeDetails;