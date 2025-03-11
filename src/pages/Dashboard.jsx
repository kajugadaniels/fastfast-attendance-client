import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchEmployees, fetchAttendances, fetchFoodMenus } from '../api';
import { Line, Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { CookingPot, RefreshCw, UserCheck, UserSquare } from 'lucide-react';
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

    // Helper function to format a date object to "YYYY-MM-DD"
    const formatDate = (dateObj) => {
        return dateObj.toISOString().split('T')[0];
    };

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

    // --------------------------------------------
    // Latest 5 Attended Employees
    // --------------------------------------------
    // Flatten all "Present" attendance records from all employees into one list.
    const latestAttendanceRecords = [];
    attendanceData.forEach(emp => {
        if (emp.attendance_history && emp.attendance_history.length > 0) {
            emp.attendance_history.forEach(record => {
                if (
                    record.attendance_status === 'Present' &&
                    record.food_menu &&
                    record.food_menu.length > 0
                ) {
                    latestAttendanceRecords.push({
                        name: emp.name,
                        attendance_date: record.attendance_date,
                        price: record.food_menu[0].price,
                    });
                }
            });
        }
    });
    // Sort descending by attendance_date (assuming YYYY-MM-DD format)
    latestAttendanceRecords.sort(
        (a, b) => new Date(b.attendance_date) - new Date(a.attendance_date)
    );
    const latest5Records = latestAttendanceRecords.slice(0, 5);

    // --------------------------------------------
    // Today's Food Menu Consumption Table Data
    // --------------------------------------------
    // Instead of using only those menus consumed, we loop through all food menus.
    // For each menu, if it's present in foodMenuSummary, show its count and total amount,
    // otherwise display 0.
    const todayFoodMenuConsumption = foodMenus.map(menu => {
        const summary = foodMenuSummary[menu.name] || { count: 0, price: menu.price };
        const totalAmount = summary.count * parseFloat(menu.price);
        return {
            name: menu.name,
            count: summary.count,
            totalAmount: totalAmount.toFixed(2),
        };
    });

    if (loading) {
        return <div className="text-center py-10">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 2xl:col-span-9">
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 mt-8">
                        <div className="intro-y flex h-10 items-center">
                            <h2 className="mr-5 truncate text-lg font-medium">Dashboard</h2>
                            <Link className="ml-auto flex items-center text-primary" to="/dashboard">
                                <RefreshCw className="stroke-1.5 mr-3 h-4 w-4" />
                                Summary for {currentDate}
                            </Link>
                        </div>
                        <div className="mt-5 grid grid-cols-12 gap-6">
                            <div className="intro-y col-span-12 sm:col-span-6 xl:col-span-4">
                                <div className="relative zoom-in before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']">
                                    <div className="box p-5">
                                        <div className="flex">
                                            <UserCheck className="stroke-1.5 h-[28px] w-[28px] text-primary" />
                                        </div>
                                        <div className="mt-6 text-3xl font-medium leading-8">{totalAttendedToday}</div>
                                        <div className="mt-1 text-base text-slate-500">Total Attendance Today</div>
                                    </div>
                                </div>
                            </div>
                            <div className="intro-y col-span-12 sm:col-span-6 xl:col-span-4">
                                <div className="relative zoom-in before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']">
                                    <div className="box p-5">
                                        <div className="flex">
                                            <CookingPot className="stroke-1.5 h-[28px] w-[28px] text-pending" />
                                        </div>
                                        <div className="mt-6 text-3xl font-medium leading-8">{totalFoodMenus}</div>
                                        <div className="mt-1 text-base text-slate-500">Total Food Menus</div>
                                    </div>
                                </div>
                            </div>
                            <div className="intro-y col-span-12 sm:col-span-6 xl:col-span-4">
                                <div className="relative zoom-in before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']">
                                    <div className="box p-5">
                                        <div className="flex">
                                            <UserSquare className="stroke-1.5 h-[28px] w-[28px] text-warning" />
                                        </div>
                                        <div className="mt-6 text-3xl font-medium leading-8">{employees.length}</div>
                                        <div className="mt-1 text-base text-slate-500">Total Employees</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Attendance Trend */}
                    <div className="col-span-12 mt-8 lg:col-span-6">
                        <div className="intro-y block h-10 items-center sm:flex">
                            <h2 className="mr-5 truncate text-lg font-medium">Monthly Attendance Trend</h2>
                        </div>
                        <div className="intro-y box mt-12 p-5 sm:mt-5">
                            <div className="relative before:content-[''] before:block before:absolute before:w-16 before:left-0 before:top-0 before:bottom-0 before:ml-10 before:mb-7 before:bg-gradient-to-r before:from-white before:via-white/80 before:to-transparent before:dark:from-darkmode-600 after:content-[''] after:block after:absolute after:w-16 after:right-0 after:top-0 after:bottom-0 after:mb-7 after:bg-gradient-to-l after:from-white after:via-white/80 after:to-transparent after:dark:from-darkmode-600">
                                <div className="w-auto h-[275px]">
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
                            </div>
                        </div>
                    </div>

                    {/* Employees by Food Menu */}
                    <div className="col-span-12 mt-8 sm:col-span-6 lg:col-span-6">
                        <div className="intro-y flex h-10 items-center">
                            <h2 className="mr-5 truncate text-lg font-medium">
                                Employees by Food Menu
                            </h2>
                        </div>
                        <div className="intro-y box mt-5 p-5">
                            <div className="mt-3">
                                <div className="w-auto h-[300px]">
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

                    {/* Today's Food Menu Consumption Table */}
                    <div className="col-span-12 mt-8">
                        <div className="intro-y flex h-10 items-center">
                            <h2 className="mr-5 truncate text-lg font-medium">
                                Today's Food Menu Consumption
                            </h2>
                        </div>
                        <div className="intro-y box mt-5 p-5">
                            <table className="min-w-full table-auto border-collapse">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 border">Food Menu</th>
                                        <th className="px-4 py-2 border">Number of Employees</th>
                                        <th className="px-4 py-2 border">Total Amount (RWF)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {foodMenus.map(menu => {
                                        const summary = foodMenuSummary[menu.name] || { count: 0, price: menu.price };
                                        const totalAmount = summary.count * parseFloat(menu.price);
                                        return (
                                            <tr key={menu.id} className="border-t">
                                                <td className="px-4 py-2">{menu.name}</td>
                                                <td className="px-4 py-2">{summary.count}</td>
                                                <td className="px-4 py-2">{totalAmount.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-span-12 2xl:col-span-3">
                <div className="-mb-10 pb-10 2xl:border-l">
                    <div className="grid grid-cols-12 gap-x-6 gap-y-6 2xl:gap-x-0 2xl:pl-6">
                        <div className="col-span-12 mt-3 md:col-span-6 xl:col-span-4 2xl:col-span-12 2xl:mt-8">
                            <div className="intro-x flex h-10 items-center">
                                <h2 className="mr-5 truncate text-lg font-medium">
                                    Latest 5 Attended Employees
                                </h2>
                            </div>
                            {latest5Records.length > 0 ? (
                                <div className="mt-5">
                                    {latest5Records.map((record, index) => (
                                        <div key={index} className="intro-x">
                                            <div className="box zoom-in mb-3 flex items-center px-5 py-3">
                                                <div className="image-fit h-10 w-10 flex-none overflow-hidden rounded-full">
                                                    <img src="https://cdn-icons-png.flaticon.com/512/5951/5951752.png" alt="" />
                                                </div>
                                                <div className="ml-4 mr-auto">
                                                    <div className="font-medium">
                                                        {record.name}
                                                    </div>
                                                    <div className="mt-0.5 text-xs text-slate-500">
                                                        {record.attendance_date}
                                                    </div>
                                                </div>
                                                <div className="text-success">
                                                    {record.price} RWF
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Link className="intro-x block w-full rounded-md border border-dotted border-slate-400 py-3 text-center text-slate-500 dark:border-darkmode-300" to="/attendance">
                                        View More
                                    </Link>
                                </div>
                            ) : (
                                <p>No recent attendance records found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
