import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchFoodMenu, updateFoodMenu } from '../../api';
import { toast } from 'react-toastify';
import { CloudUpload, ChevronLeft } from 'lucide-react';

const EditFoodMenu = () => {
    const { foodMenuId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const loadFoodMenu = async () => {
            try {
                setInitialLoading(true);
                const data = await fetchFoodMenu(foodMenuId);
                setFormData({
                    name: data.name || '',
                    price: data.price || '',
                });
            } catch (error) {
                toast.error('Error fetching food menu details.');
            } finally {
                setInitialLoading(false);
            }
        };
        loadFoodMenu();
    }, [foodMenuId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
            setLoading(true);
            await updateFoodMenu(foodMenuId, formData);
            toast.success('Food menu updated successfully.');
            navigate('/food-menus');
        } catch (error) {
            toast.error('Error updating food menu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Edit Food Menu</h2>
                <button
                    onClick={() => navigate('/food-menus')}
                    className="transition duration-200 border inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 bg-secondary border-secondary text-white dark:border-secondary mr-2 shadow-md"
                >
                    <ChevronLeft className="stroke-1.5 h-4 w-4 mr-1" />
                    Go Back
                </button>
            </div>
            {initialLoading ? (
                <div className="text-center py-10">Loading food menu details...</div>
            ) : (
                <form onSubmit={handleUpdateFoodMenu} className="mt-5">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input-field mt-1 block w-full"
                            placeholder="Enter food menu name"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Price
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="input-field mt-1 block w-full"
                            placeholder="Enter food menu price"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/food-menus')}
                            className="transition duration-200 border inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 bg-secondary border-secondary text-white dark:border-secondary shadow-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="transition duration-200 border inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 bg-primary border-primary text-white dark:border-primary shadow-md"
                        >
                            {loading ? (
                                'Updating...'
                            ) : (
                                <>
                                    Update
                                    <CloudUpload className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default EditFoodMenu;
