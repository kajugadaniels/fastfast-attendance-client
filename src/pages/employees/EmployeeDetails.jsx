import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEmployee, addAttendance, fetchFoodMenus } from '../../api';
import { toast } from 'react-toastify';

const EmployeeDetails = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();

    const [employeeData, setEmployeeData] = useState(null);
    const [foodMenus, setFoodMenus] = useState([]); // State to hold the food menu options
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getEmployeeDetails = async () => {
            try {
                setLoading(true);
                const res = await fetchEmployee(employeeId);
                setEmployeeData(res.data);
            } catch (error) {
                navigate('/employees');
            } finally {
                setLoading(false);
            }
        };

        // Fetch the food menus when the component mounts
        const getFoodMenus = async () => {
            try {
                const res = await fetchFoodMenus();
                setFoodMenus(res.data);
            } catch (error) {
                toast.error('Failed to load food menus.');
            }
        };

        getEmployeeDetails();
        getFoodMenus();
    }, [employeeId, navigate]);

    const handleAttendanceSubmit = async (selectedFoodMenuId) => {
        try {
            const response = await addAttendance({
                finger_id: employeeData.employee.finger_id,
                food_menu: selectedFoodMenuId,
            });
            if (response && response.message) {
                // Success message from backend
                const successMessage = response.message.detail;
                toast.success(successMessage);
            }
        } catch (error) {
            // Error message from backend
            const errorMessage = error.response?.data?.message?.detail || 'Failed to record attendance.';
            toast.error(errorMessage);
        }
    };

    const handleFoodMenuSelect = () => {
        // Create a list of food menu options for the user to select
        const foodMenuOptions = foodMenus.map((menu, index) => `${index + 1}. ${menu.name} - ${menu.price} RWF`).join('\n');

        // Use a prompt to select a food menu
        const userSelection = prompt(
            `Select a food menu:\n\n${foodMenuOptions}`,
            "Enter the number of your choice"
        );

        // If the user selects a valid option
        if (userSelection && foodMenus[userSelection - 1]) {
            const selectedFoodMenu = foodMenus[userSelection - 1];
            handleAttendanceSubmit(selectedFoodMenu.id);
        } else {
            toast.error('Invalid selection, please choose a valid food menu.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!employeeData) {
        return <div>No employee data found</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h2>Employee Details</h2>
            <p>Name: {employeeData.employee.name}</p>
            <p>Position: {employeeData.employee.position}</p>
            <p>Salary: {employeeData.employee.salary}</p>
            <button
                onClick={handleFoodMenuSelect}
                className="btn-primary"
            >
                Record Attendance for {employeeData.employee.name}
            </button>
        </div>
    );
};

export default EmployeeDetails;
