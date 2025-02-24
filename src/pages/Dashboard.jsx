import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchEmployees, fetchAttendances } from '../api';

const Dashboard = () => {
    const [employees, setEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch employees and attendance data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const empRes = await fetchEmployees();
                const attRes = await fetchAttendances();
                // Assuming your API returns the data under a "data" key
                setEmployees(empRes.data);
                setAttendanceData(attRes.data);
            } catch (err) {
                setError('Failed to fetch dashboard data.');
                toast.error('Failed to fetch dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];

    // 1. Summary: Total attendance for today per food menu
    // For each employee, find if there is a "Present" attendance record for today
    const todayAttendanceRecords = attendanceData.reduce((acc, emp) => {
        if (emp.attendance_history && emp.attendance_history.length > 0) {
            const todayRecord = emp.attendance_history.find(
                (record) =>
                    record.attendance_date === currentDate &&
                    record.attendance_status === 'Present' &&
                    record.food_menu &&
                    record.food_menu.length > 0
            );
            if (todayRecord) {
                acc.push(todayRecord);
            }
        }
        return acc;
    }, []);

    // Group these records by the food menu name
    const foodMenuSummary = todayAttendanceRecords.reduce((acc, record) => {
        const menu = record.food_menu[0]; // assuming one food menu per attendance record
        const menuName = menu.name;
        if (acc[menuName]) {
            acc[menuName].count++;
        } else {
            acc[menuName] = { count: 1, price: menu.price };
        }
        return acc;
    }, {});

    // Total number of employees that attended today
    const totalAttendedToday = todayAttendanceRecords.length;

    // 2. Group employees by position
    const positions = ['Umufundi', 'Umuyede', 'Umwubatsi', 'Staff'];
    const employeesByPosition = positions.reduce((acc, pos) => {
        acc[pos] = employees.filter((emp) => emp.position === pos);
        return acc;
    }, {});

    if (loading) {
        return <div className="text-center py-10">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <h2 className="text-xl font-semibold mb-4">Summary for {currentDate}</h2>

            {/* Top summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Attendance Today */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-2">Total Attendance Today</h3>
                    <p className="text-3xl font-bold">{totalAttendedToday}</p>
                </div>

                {/* Food Menu Summary */}
                <div className="bg-white shadow-md rounded-lg p-6 md:col-span-2">
                    <h3 className="text-lg font-medium mb-4">Food Menu Attendance</h3>
                    {Object.keys(foodMenuSummary).length > 0 ? (
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left">Food Menu</th>
                                    <th className="px-4 py-2 text-left">Price (RWF)</th>
                                    <th className="px-4 py-2 text-left">Attendees</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(foodMenuSummary).map(([menuName, summary]) => (
                                    <tr key={menuName} className="border-t">
                                        <td className="px-4 py-2">{menuName}</td>
                                        <td className="px-4 py-2">{summary.price}</td>
                                        <td className="px-4 py-2">{summary.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No attendance records for food menus today.</p>
                    )}
                </div>
            </div>

            {/* 2. Employees by Position */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Employees by Position</h3>
                {positions.map((pos) => (
                    <div key={pos} className="mb-6">
                        <h4 className="text-md font-semibold mb-2">
                            {pos} ({employeesByPosition[pos].length})
                        </h4>
                        {employeesByPosition[pos].length > 0 ? (
                            <ul className="list-disc list-inside">
                                {employeesByPosition[pos].map((emp) => (
                                    <li key={emp.id}>
                                        {emp.name} - {emp.phone}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No employees in this position.</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
