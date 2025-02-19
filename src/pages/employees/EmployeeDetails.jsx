import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEmployee, addAttendance } from '../../api';

const EmployeeDetails = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();

    const [employeeData, setEmployeeData] = useState(null);
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

        getEmployeeDetails();
    }, [employeeId, navigate]);

    const handleAttendanceSubmit = async () => {
        try {
            const response = await addAttendance({ finger_id: employeeData.employee.finger_id });
            if (response && response.message) {
                const successMessage = response.message.detail;
                toast.success(successMessage);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message?.detail || 'Failed to record attendance.';
            toast.error(errorMessage);
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
                onClick={handleAttendanceSubmit}
                className="btn-primary"
            >
                Record Attendance for {employeeData.employee.name}
            </button>
        </div>
    );
};

export default EmployeeDetails;
