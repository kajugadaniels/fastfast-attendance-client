import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createFoodMenu } from '../../api';
import { CloudUpload } from 'lucide-react';

const AddFoodMenu = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const { name, price } = formData;
        if (!name.trim() || !price.trim()) {
            toast.error('Please fill in all required fields.');
            return false;
        }
        return true;
    };

    const handleSaveFoodMenu = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        try {
            setLoading(true);
            await createFoodMenu(formData);
            toast.success('Food menu added successfully');
            navigate('/food-menus');
        } catch (error) {
            toast.error('Error adding food menu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Add Food Menu</h2>
                <button onClick={() => navigate('/food-menus')} className="btn-secondary">
                    Go Back
                </button>
            </div>
            <form onSubmit={handleSaveFoodMenu}>
                <div className="mt-5">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter food name"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter food price"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/food-menus')}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? (
                                <span>Saving...</span>
                            ) : (
                                <span>
                                    Save
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

export default AddFoodMenu;
