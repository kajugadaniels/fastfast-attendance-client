import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchEmployees, fetchAttendances, fetchFoodMenus } from '../api';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [employees, setEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [foodMenus, setFoodMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch employees, attendance data, and food menus on component mount
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [empRes, attRes, fmRes] = await Promise.all([
                    fetchEmployees(),
                    fetchAttendances(),
                    fetchFoodMenus(),
                ]);
                setEmployees(empRes.data);
                setAttendanceData(attRes.data);
                setFoodMenus(fmRes.data);
            } catch (err) {
                setError('Failed to fetch dashboard data.');
                toast.error('Failed to fetch dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0];

    // --------------------------------------------
    // Attendance Summary for Today (by Food Menu)
    // --------------------------------------------
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

    // Group today's attendance by food menu name
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

    // Total number of employees attended today
    const totalAttendedToday = todayAttendanceRecords.length;

    // --------------------------------------------
    // Group Employees by Position
    // --------------------------------------------
    const positions = ['Umufundi', 'Umuyede', 'Umwubatsi', 'Staff'];
    const employeesByPosition = positions.reduce((acc, pos) => {
        acc[pos] = employees.filter((emp) => emp.position === pos);
        return acc;
    }, {});

    // --------------------------------------------
    // Total Number of All Food Menus
    // --------------------------------------------
    const totalFoodMenus = foodMenus.length;

    // --------------------------------------------
    // Graph 1: Monthly Attendance Trend
    // --------------------------------------------
    // Aggregate attendance counts per day for the current month
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-indexed
    const currentYear = now.getFullYear();
    const monthlyAttendance = {};

    attendanceData.forEach(emp => {
        if (emp.attendance_history && emp.attendance_history.length > 0) {
            emp.attendance_history.forEach(record => {
                const recordDate = new Date(record.attendance_date);
                if (
                    recordDate.getMonth() === currentMonth &&
                    recordDate.getFullYear() === currentYear &&
                    record.attendance_status === 'Present'
                ) {
                    // record.attendance_date is assumed to be in YYYY-MM-DD format
                    const dayStr = record.attendance_date;
                    if (!monthlyAttendance[dayStr]) {
                        monthlyAttendance[dayStr] = 0;
                    }
                    monthlyAttendance[dayStr]++;
                }
            });
        }
    });

    // Build data arrays for the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const attendanceLabels = [];
    const attendanceCounts = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        attendanceLabels.push(dayStr);
        attendanceCounts.push(monthlyAttendance[dayStr] || 0);
    }

    const monthlyAttendanceData = {
        labels: attendanceLabels,
        datasets: [
            {
                label: 'Employees Attended',
                data: attendanceCounts,
                fill: false,
                backgroundColor: '#3b82f6',
                borderColor: '#3b82f6',
                tension: 0.3,
            },
        ],
    };

    // --------------------------------------------
    // Graph 2: Employees by Food Menu (Unique Count)
    // --------------------------------------------
    // For each employee, add their id to a set corresponding to a food menu
    const foodMenuEmployeeAssignment = {};
    attendanceData.forEach(emp => {
        if (emp.attendance_history && emp.attendance_history.length > 0) {
            emp.attendance_history.forEach(record => {
                if (record.food_menu && record.food_menu.length > 0) {
                    const menuName = record.food_menu[0].name;
                    if (!foodMenuEmployeeAssignment[menuName]) {
                        foodMenuEmployeeAssignment[menuName] = new Set();
                    }
                    // Use a unique identifier (employee_id or id)
                    foodMenuEmployeeAssignment[menuName].add(emp.employee_id || emp.id);
                }
            });
        }
    });
    const foodMenuEmployeeCounts = {};
    Object.keys(foodMenuEmployeeAssignment).forEach(menuName => {
        foodMenuEmployeeCounts[menuName] = foodMenuEmployeeAssignment[menuName].size;
    });
    const foodMenuGraphLabels = Object.keys(foodMenuEmployeeCounts);
    const foodMenuGraphData = Object.values(foodMenuEmployeeCounts);

    const foodMenuChartData = {
        labels: foodMenuGraphLabels,
        datasets: [
            {
                label: 'Unique Employees',
                data: foodMenuGraphData,
                backgroundColor: '#10b981',
            },
        ],
    };

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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Total Attendance Today */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-2">Total Attendance Today</h3>
                    <p className="text-3xl font-bold">{totalAttendedToday}</p>
                </div>

                {/* Total Food Menus */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-2">Total Food Menus</h3>
                    <p className="text-3xl font-bold">{totalFoodMenus}</p>
                </div>

                {/* Food Menu Attendance Summary */}
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

            {/* Employees by Position */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
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

            {/* --------------------------------------------------- */}
            {/* Graphs Section */}
            {/* --------------------------------------------------- */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-6">Graphs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Graph 1: Monthly Attendance Trend */}
                    <div>
                        <h4 className="text-xl font-semibold mb-4">Monthly Attendance Trend</h4>
                        <Line
                            data={monthlyAttendanceData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: 'top' },
                                    title: {
                                        display: true,
                                        text: 'Daily Attendance in Current Month',
                                    },
                                },
                            }}
                        />
                    </div>

                    {/* Graph 2: Employees by Food Menu */}
                    <div>
                        <h4 className="text-xl font-semibold mb-4">Employees by Food Menu</h4>
                        <Bar
                            data={foodMenuChartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: 'top' },
                                    title: {
                                        display: true,
                                        text: 'Unique Employee Distribution by Food Menu',
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
