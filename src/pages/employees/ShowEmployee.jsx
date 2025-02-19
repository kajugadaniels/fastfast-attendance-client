import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import QRCode from 'react-qr-code';
import { addAttendance, fetchEmployee } from '../../api';
import { Eye, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

const ShowEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [employeeData, setEmployeeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [attendanceStatus, setAttendanceStatus] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [sortOption, setSortOption] = useState('dateDesc');
    const [message, setMessage] = useState('');
    const qrCodeRef = useRef();

    const pageSize = 10;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const getEmployeeDetails = async () => {
            try {
                setLoading(true);
                const res = await fetchEmployee(id);
                setEmployeeData(res.data);
            } catch (error) {
                toast.error('Failed to load employee details.');
            } finally {
                setLoading(false);
            }
        };
        getEmployeeDetails();
    }, [id]);

    const handleGoBack = () => {
        navigate('/employees');
    };

    const handleAttendanceSubmit = async () => {
        try {
            const response = await addAttendance({ finger_id: employeeData.employee.finger_id });
            if (response && response.message) {
                const successMessage = response.message.detail;
                setMessage(successMessage);
                toast.success(successMessage);

                // Update the employee data with new attendance history
                setEmployeeData({
                    ...employeeData,
                    attendance_history: [...employeeData.attendance_history, response.data],
                });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message?.detail || 'Failed to record attendance.';
            setMessage(errorMessage);
            toast.error(errorMessage);
        }
    };

    // QR Code generation logic using employee_id
    const qrCodeValue = `https://yourapp.com/employee/${employeeData?.employee?.id}`;

    const downloadQRCode = () => {
        if (qrCodeRef.current) {
            toPng(qrCodeRef.current)
                .then((dataUrl) => {
                    const link = document.createElement('a');
                    link.download = `employee_${employeeData?.employee?.id}_qr_code.png`;
                    link.href = dataUrl;
                    link.click();
                })
                .catch((error) => {
                    console.error('Error generating QR code image:', error);
                    toast.error('Failed to download QR code.');
                });
        }
    };

    const getFilteredSortedAttendance = () => {
        if (!employeeData || !employeeData.attendance_history) return [];

        let filtered = [...employeeData.attendance_history];

        if (attendanceStatus === 'true') {
            filtered = filtered.filter((att) => att.attended === true);
        } else if (attendanceStatus === 'false') {
            filtered = filtered.filter((att) => att.attended === false);
        }

        if (dateStart) {
            const start = new Date(dateStart);
            filtered = filtered.filter((att) => new Date(att.time_in) >= start);
        }
        if (dateEnd) {
            const end = new Date(dateEnd);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter((att) => new Date(att.time_in) <= end);
        }

        filtered.sort((a, b) => {
            const dateA = new Date(a.time_in);
            const dateB = new Date(b.time_in);
            const salaryA = parseFloat(a.salary);
            const salaryB = parseFloat(b.salary);
            switch (sortOption) {
                case 'dateAsc':
                    return dateA - dateB;
                case 'dateDesc':
                    return dateB - dateA;
                case 'salaryAsc':
                    return salaryA - salaryB;
                case 'salaryDesc':
                    return salaryB - salaryA;
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const totalSalary = (attendance) => {
        return attendance.reduce((sum, att) => sum + parseFloat(att.salary || 0), 0);
    };

    // If loading
    if (loading) {
        return <div>Loading employee details...</div>;
    }

    // If no employee data
    if (!employeeData) {
        return (
            <div className="text-center">
                <h2>No Employee Data</h2>
                <button onClick={handleGoBack} className="btn-primary">
                    Go Back
                </button>
            </div>
        );
    }

    const filteredSortedAttendance = getFilteredSortedAttendance();
    const totalRecords = filteredSortedAttendance.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedAttendance = filteredSortedAttendance.slice(startIndex, startIndex + pageSize);

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
                        <div className="flex justify-between">
                            <span className="text-sm">Salary:</span>
                            <span>{employeeData.employee.salary} RWF</span>
                        </div>
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
                                    onChange={(e) => setDateStart(e.target.value)}
                                    className="input-date"
                                />
                                <span className="text-slate-500">to</span>
                                <input
                                    type="date"
                                    value={dateEnd}
                                    onChange={(e) => setDateEnd(e.target.value)}
                                    className="input-date"
                                />
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="select-sort"
                                >
                                    <option value="dateDesc">Date (Newest)</option>
                                    <option value="dateAsc">Date (Oldest)</option>
                                    <option value="salaryAsc">Salary (Lowest)</option>
                                    <option value="salaryDesc">Salary (Highest)</option>
                                </select>
                            </div>
                        </div>

                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    <th className="font-medium px-5 py-3">Date/Time</th>
                                    <th className="font-medium px-5 py-3">Attended</th>
                                    <th className="font-medium px-5 py-3">Salary Snapshot</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAttendance.map((att) => (
                                    <tr key={att.id}>
                                        <td className="px-5 py-3">{new Date(att.time_in).toLocaleString()}</td>
                                        <td className="px-5 py-3">{att.attended ? 'Present' : 'Absent'}</td>
                                        <td className="px-5 py-3">{att.salary} RWF</td>
                                    </tr>
                                ))}
                            </tbody>
                            {paginatedAttendance.length > 0 && (
                                <tfoot>
                                    <tr>
                                        <td colSpan="3" className="font-medium px-5 py-3 border-t dark:border-darkmode-300 text-right">
                                            Total Salary:
                                        </td>
                                        <td className="font-medium px-5 py-3 border-t dark:border-darkmode-300 text-right">
                                            {totalSalary(paginatedAttendance)} RWF
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
                <QRCode value={qrCodeValue} size={128} />
            </div>
            <div className="mt-4 text-center">
                <button
                    onClick={downloadQRCode}
                    className="btn-primary"
                >
                    Download QR Code
                </button>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={handleAttendanceSubmit}
                    className="btn-primary"
                >
                    Record Today's Attendance
                </button>
            </div>

        </div>
    );
};

export default ShowEmployee;
