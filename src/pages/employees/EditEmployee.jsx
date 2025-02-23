import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEmployee, updateEmployee } from '../../api';
import { toast } from 'react-toastify';
import { CloudUpload } from 'lucide-react';

const EditEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        gender: '',
        position: '',
        salary: '',
        finger_id: '',
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const getEmployeeDetails = async () => {
            try {
                setLoading(true);
                const response = await fetchEmployee(id);
                // If your API returns data as an object with an 'employee' property, adjust accordingly:
                const employee = response.data.employee || response.data;
                setFormData({
                    name: employee.name || '',
                    phone: employee.phone || '',
                    gender: employee.gender || '',
                    position: employee.position || '',
                    salary: employee.salary || '',
                    finger_id: employee.finger_id || '',
                });
            } catch (error) {
                toast.error('Failed to load employee details.');
            } finally {
                setLoading(false);
            }
        };
        getEmployeeDetails();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const { name, phone, gender, position, salary, finger_id } = formData;
        if (!name.trim() || !phone.trim() || !gender.trim() || !position.trim() || !salary.toString().trim() || !finger_id.toString().trim()) {
            toast.error('Please fill in all required fields.');
            return false;
        }
        return true;
    };

    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            setUpdating(true);
            await updateEmployee(id, formData);
            toast.success('Employee updated successfully');
            navigate('/employees');
        } catch (error) {
            toast.error('Error updating employee.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading employee details...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Edit Employee</h2>
                <button onClick={() => navigate('/employees')} className="btn-secondary">
                    Go Back
                </button>
            </div>
            <form onSubmit={handleUpdateEmployee}>
                <div className="mt-5">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter employee name"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter phone number"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="input-field"
                        >
                            <option value="">Select Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="O">Other</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Position</label>
                        <input
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter position"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Salary</label>
                        <input
                            type="number"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter salary"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Finger ID</label>
                        <input
                            type="text"
                            name="finger_id"
                            value={formData.finger_id}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter finger ID"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/employees')}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updating}
                            className="btn-primary"
                        >
                            {updating ? (
                                <span>Updating...</span>
                            ) : (
                                <span>
                                    Update
                                    <CloudUpload className="h-4 w-4 ml-1" />
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditEmployee;
