import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchFoodMenu, updateFoodMenu } from '../../api';
import { toast } from 'react-toastify';
import { CloudUpload } from 'lucide-react';

const EditFoodMenu = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', price: '' });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const getFoodMenuDetails = async () => {
            try {
                setLoading(true);
                const response = await fetchFoodMenu(id);
                if (response.data) {
                    setFormData({
                        name: response.data.name || '',
                        price: response.data.price || '',
                    });
                }
            } catch (error) {
                toast.error('Failed to load food menu details.');
            } finally {
                setLoading(false);
            }
        };
        getFoodMenuDetails();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const { name, price } = formData;
        if (!name.trim() || !price.toString().trim()) {
            toast.error('Please fill in all required fields.');
            return false;
        }
        return true;
    };

    const handleUpdateFoodMenu = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            setUpdating(true);
            await updateFoodMenu(id, formData);
            toast.success('Food menu updated successfully');
            navigate('/food-menus');
        } catch (error) {
            toast.error('Error updating food menu.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading food menu details...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Edit Food Menu</h2>
                <button onClick={() => navigate('/food-menus')} className="btn-secondary">
                    Go Back
                </button>
            </div>
            <form onSubmit={handleUpdateFoodMenu}>
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

export default EditFoodMenu;
