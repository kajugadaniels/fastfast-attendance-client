import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEmployee } from '../../api';

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
            {/* Other employee details */}
        </div>
    );
};

export default EmployeeDetails;
