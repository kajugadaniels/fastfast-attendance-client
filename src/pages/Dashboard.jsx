import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchEmployees, fetchAttendances, fetchFoodMenus } from '../api';
import { Line, Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
    CookingPot,
    HandCoins,
    RefreshCw,
    UserCheck,
    UserSquare,
    ChevronLeft,
    ChevronRight,
    UserCog,
    BookUser,
} from 'lucide-react';
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
    // State declarations for dashboard data
    const [employees, setEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [foodMenus, setFoodMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Consumption date range filtering (default to today)
    const currentDate = new Date().toISOString().split('T')[0];
    const [consumptionStartDate, setConsumptionStartDate] = useState(currentDate);
    const [consumptionEndDate, setConsumptionEndDate] = useState(currentDate);

    // Pagination state for Food Menu Consumption table
    const [consumptionCurrentPage, setConsumptionCurrentPage] = useState(1);
    const consumptionPageSize = 5;

    // Fetch all necessary data when component mounts
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

    // --------------------------------------------
    // Attendance Summary for Selected Date Range (by Food Menu)
    // --------------------------------------------
    const filteredAttendanceRecords = attendanceData.reduce((acc, emp) => {
        if (emp.attendance_history && emp.attendance_history.length > 0) {
            const filteredRecords = emp.attendance_history.filter(
                (record) =>
                    record.attendance_date >= consumptionStartDate &&
                    record.attendance_date <= consumptionEndDate &&
                    record.attendance_status === 'Present' &&
                    record.food_menu &&
                    record.food_menu.length > 0
            );
            acc.push(...filteredRecords);
        }
        return acc;
    }, []);

    const foodMenuSummary = filteredAttendanceRecords.reduce((acc, record) => {
        const menu = record.food_menu[0]; // Assuming one food menu per attendance record
        const menuName = menu.name;
        if (acc[menuName]) {
            acc[menuName].count++;
        } else {
            acc[menuName] = { count: 1, price: menu.price };
        }
        return acc;
    }, {});

    const totalAttendedInDateRange = filteredAttendanceRecords.length;

    // --------------------------------------------
    // Total Number of All Food Menus
    // --------------------------------------------
    const totalFoodMenus = foodMenus.length;

    // --------------------------------------------
    // Graph 1: Monthly Attendance Trend (Filtered by Date Range)
    // --------------------------------------------
    const monthlyAttendance = {};
    attendanceData.forEach((emp) => {
        if (emp.attendance_history && emp.attendance_history.length > 0) {
            emp.attendance_history.forEach((record) => {
                const recordDate = new Date(record.attendance_date);
                if (
                    recordDate >= new Date(consumptionStartDate) &&
                    recordDate <= new Date(consumptionEndDate) &&
                    record.attendance_status === 'Present'
                ) {
                    const dayStr = record.attendance_date;
                    if (!monthlyAttendance[dayStr]) {
                        monthlyAttendance[dayStr] = 0;
                    }
                    monthlyAttendance[dayStr]++;
                }
            });
        }
    });

    const attendanceLabels = Object.keys(monthlyAttendance);
    const attendanceCounts = Object.values(monthlyAttendance);

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
    const foodMenuEmployeeAssignment = {};
    attendanceData.forEach((emp) => {
        if (emp.attendance_history && emp.attendance_history.length > 0) {
            emp.attendance_history.forEach((record) => {
                if (
                    record.attendance_date >= consumptionStartDate &&
                    record.attendance_date <= consumptionEndDate &&
                    record.attendance_status === 'Present' &&
                    record.food_menu &&
                    record.food_menu.length > 0
                ) {
                    const menuName = record.food_menu[0].name;
                    if (!foodMenuEmployeeAssignment[menuName]) {
                        foodMenuEmployeeAssignment[menuName] = new Set();
                    }
                    foodMenuEmployeeAssignment[menuName].add(emp.employee_id || emp.id);
                }
            });
        }
    });

    const foodMenuEmployeeCounts = {};
    Object.keys(foodMenuEmployeeAssignment).forEach((menuName) => {
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
    const latestAttendanceRecords = [];
    attendanceData.forEach((emp) => {
        if (emp.attendance_history && emp.attendance_history.length > 0) {
            emp.attendance_history.forEach((record) => {
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
    latestAttendanceRecords.sort(
        (a, b) => new Date(b.attendance_date) - new Date(a.attendance_date)
    );
    const latest5Records = latestAttendanceRecords.slice(0, 5);

    // --------------------------------------------
    // Food Menu Consumption for Filtered Date Range
    // --------------------------------------------
    const consumptionAttendanceRecords = [];
    attendanceData.forEach((emp) => {
        if (emp.attendance_history && emp.attendance_history.length > 0) {
            emp.attendance_history.forEach((record) => {
                if (
                    record.attendance_status === 'Present' &&
                    record.food_menu &&
                    record.food_menu.length > 0 &&
                    record.attendance_date >= consumptionStartDate &&
                    record.attendance_date <= consumptionEndDate
                ) {
                    consumptionAttendanceRecords.push(record);
                }
            });
        }
    });

    const foodMenuConsumptionSummary = consumptionAttendanceRecords.reduce((acc, record) => {
        const menu = record.food_menu[0];
        const menuName = menu.name;
        if (acc[menuName]) {
            acc[menuName].count++;
        } else {
            acc[menuName] = { count: 1, price: menu.price };
        }
        return acc;
    }, {});

    // Build consumption table data by looping through ALL food menus
    const consumptionTableData = foodMenus.map((menu) => {
        const summary = foodMenuConsumptionSummary[menu.name] || { count: 0, price: menu.price };
        const totalAmount = summary.count * parseFloat(menu.price);
        return {
            name: menu.name,
            count: summary.count,
            totalAmount: totalAmount.toFixed(2),
            price: menu.price,
        };
    });

    // Pagination for Food Menu Consumption
    const totalConsumptionRecords = consumptionTableData.length;
    const totalConsumptionPages = Math.ceil(totalConsumptionRecords / consumptionPageSize);
    const consumptionPaginatedData = consumptionTableData.slice(
        (consumptionCurrentPage - 1) * consumptionPageSize,
        consumptionCurrentPage * consumptionPageSize
    );

    const handleConsumptionPageChange = (page) => {
        if (page >= 1 && page <= totalConsumptionPages) {
            setConsumptionCurrentPage(page);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading dashboard...</div>;
    }
    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="intro-y col-span-12 mb-0 mt-8 flex flex-wrap items-center xl:flex-nowrap">
                <h2 className="mr-auto text-lg font-medium">
                    Dashboard
                </h2>
                <div className='flex'>
                    <div className='px-5 py-5'>
                        <label className="text-slate-500">Start Date</label>
                        <input
                            type="date"
                            value={consumptionStartDate}
                            onChange={(e) => {
                                setConsumptionStartDate(e.target.value);
                                setConsumptionCurrentPage(1);
                            }}
                            className="w-40 border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary"
                        />
                        <span className="text-slate-500">to</span>
                        <label className="text-slate-500">End Date</label>
                        <input
                            type="date"
                            value={consumptionEndDate}
                            onChange={(e) => {
                                setConsumptionEndDate(e.target.value);
                                setConsumptionCurrentPage(1);
                            }}
                            className="w-40 border-slate-200 shadow-sm rounded-md py-2 px-3 focus:ring-4 focus:ring-primary"
                        />
                    </div>
                    <Link className="ml-auto flex items-center text-primary" to="/dashboard">
                        <RefreshCw className="stroke-1.5 mr-3 h-4 w-4" />
                        Summary for {currentDate}
                    </Link>
                </div>
            </div>
            {/* Main Dashboard Content */}
            <div className="col-span-12 2xl:col-span-9">
                <div className="grid grid-cols-12 gap-6">
                    {/* Summary Cards */}
                    <div className="col-span-12 mt-8">
                        <div className="mt-5 grid grid-cols-12 gap-6">
                            <div className="intro-y col-span-12 sm:col-span-6 xl:col-span-4">
                                <div className="relative zoom-in before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50">
                                    <div className="box p-5">
                                        <div className="flex">
                                            <UserCheck className="stroke-1.5 h-[28px] w-[28px] text-primary" />
                                        </div>
                                        <div className="mt-6 text-3xl font-medium leading-8">{totalAttendedInDateRange}</div>
                                        <div className="mt-1 text-base text-slate-500">Total Attendance in Selected Date Range</div>
                                    </div>
                                </div>
                            </div>
                            <div className="intro-y col-span-12 sm:col-span-6 xl:col-span-4">
                                <div className="relative zoom-in before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50">
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
                                <div className="relative zoom-in before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50">
                                    <div className="box p-5">
                                        <div className="flex">
                                            <UserSquare className="stroke-1.5 h-[28px] w-[28px] text-warning" />
                                        </div>
                                        <div className="mt-6 text-3xl font-medium leading-8">{employees.length}</div>
                                        <div className="mt-1 text-base text-slate-500">Total Employees</div>
                                    </div>
                                </div>
                            </div>
                            <div className="intro-y col-span-12 sm:col-span-6 xl:col-span-4">
                                <div className="relative zoom-in before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50">
                                    <div className="box p-5">
                                        <div className="flex">
                                            <HandCoins className="stroke-1.5 h-[28px] w-[28px] text-success" />
                                        </div>
                                        <div className="mt-6 text-3xl font-medium leading-8">
                                            {consumptionTableData.reduce((sum, item) => sum + parseFloat(item.totalAmount), 0).toFixed(2)} RWF
                                        </div>
                                        <div className="mt-1 text-base text-slate-500">Total Consumption Amount</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Attendance Trend Graph */}
                    <div className="col-span-12 mt-8 lg:col-span-6">
                        <div className="intro-y block h-10 items-center sm:flex">
                            <h2 className="mr-5 truncate text-lg font-medium">Monthly Attendance Trend</h2>
                        </div>
                        <div className="intro-y box mt-12 p-5">
                            <div className="w-auto h-[275px]">
                                <Line
                                    data={monthlyAttendanceData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'top' },
                                            title: {
                                                display: true,
                                                text: 'Daily Attendance in Selected Date Range',
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Employees by Food Menu Graph */}
                    <div className="col-span-12 mt-8 sm:col-span-6 lg:col-span-6">
                        <div className="intro-y flex h-10 items-center">
                            <h2 className="mr-5 truncate text-lg font-medium">Employees by Food Menu</h2>
                        </div>
                        <div className="intro-y box mt-5 p-5">
                            <div className="w-auto h-[300px]">
                                <Bar
                                    data={foodMenuChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'top' },
                                            title: {
                                                display: true,
                                                text: 'Unique Employee Distribution by Food Menu (Filtered)',
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Food Menu Consumption (Filtered) Table with Date Range Filters & Pagination */}
                    <div className="col-span-12 mt-6">
                        <div className="intro-y block h-10 items-center sm:flex">
                            <h2 className="mr-5 truncate text-lg font-medium">Food Menu Consumption (Filtered)</h2>
                        </div>
                        <div className="intro-y mt-8 overflow-auto sm:mt-0 lg:overflow-visible">
                            <table className="w-full text-left border-separate border-spacing-y-[10px] sm:mt-2">
                                <thead>
                                    <tr>
                                        <th className="font-medium px-5 py-3 dark:border-darkmode-300 whitespace-nowrap border-b-0">
                                            Food Menu
                                        </th>
                                        <th className="font-medium px-5 py-3 dark:border-darkmode-300 whitespace-nowrap border-b-0 text-center">
                                            Number of Employees
                                        </th>
                                        <th className="font-medium px-5 py-3 dark:border-darkmode-300 whitespace-nowrap border-b-0 text-center">
                                            Total Amount (RWF)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {consumptionPaginatedData.map((item) => (
                                        <tr key={item.name} className="intro-x">
                                            <td className="px-5 py-3 border-b dark:border-darkmode-300 box shadow-sm">{item.name}</td>
                                            <td className="px-5 py-3 text-center border-b dark:border-darkmode-300 shadow-sm">{item.count}</td>
                                            <td className="px-5 py-3 text-center border-b dark:border-darkmode-300 shadow-sm">{item.totalAmount} RWF</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Controls */}
                        {totalConsumptionPages > 1 && (
                            <div className="intro-y mt-3 flex flex-wrap items-center sm:flex-row sm:flex-nowrap">
                                <nav className="w-full sm:mr-auto sm:w-auto">
                                    <ul className="flex w-full gap-2">
                                        <li>
                                            <button
                                                onClick={() => handleConsumptionPageChange(1)}
                                                disabled={consumptionCurrentPage === 1}
                                                className="transition duration-200 border py-2 px-2 rounded-md cursor-pointer focus:ring-4 focus:ring-primary text-slate-800 dark:text-slate-300 border-transparent disabled:opacity-50"
                                            >
                                                First
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() => handleConsumptionPageChange(consumptionCurrentPage - 1)}
                                                disabled={consumptionCurrentPage === 1}
                                                className="transition duration-200 border py-2 px-2 rounded-md cursor-pointer focus:ring-4 focus:ring-primary text-slate-800 dark:text-slate-300 border-transparent disabled:opacity-50"
                                            >
                                                <ChevronLeft className="stroke-1.5 h-4 w-4" />
                                            </button>
                                        </li>
                                        <li>
                                            <span className="px-3 py-2 text-slate-700 dark:text-slate-300">
                                                Page {consumptionCurrentPage} of {totalConsumptionPages}
                                            </span>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() => handleConsumptionPageChange(consumptionCurrentPage + 1)}
                                                disabled={consumptionCurrentPage === totalConsumptionPages}
                                                className="transition duration-200 border py-2 px-2 rounded-md cursor-pointer focus:ring-4 focus:ring-primary text-slate-800 dark:text-slate-300 border-transparent disabled:opacity-50"
                                            >
                                                <ChevronRight className="stroke-1.5 h-4 w-4" />
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() => handleConsumptionPageChange(totalConsumptionPages)}
                                                disabled={consumptionCurrentPage === totalConsumptionPages}
                                                className="transition duration-200 border py-2 px-2 rounded-md cursor-pointer focus:ring-4 focus:ring-primary text-slate-800 dark:text-slate-300 border-transparent disabled:opacity-50"
                                            >
                                                Last
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar: Latest 5 Attended Employees */}
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
