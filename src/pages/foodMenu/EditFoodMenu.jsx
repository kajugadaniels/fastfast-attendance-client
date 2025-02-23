import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchFoodMenu, updateFoodMenu } from '../../api';
import { toast } from 'react-toastify';
import { CloudUpload, Eye, Lightbulb, ToggleLeft } from 'lucide-react';

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
        <>
            {/* Header Section */}
            <div className="intro-y col-span-12 mt-8 flex flex-wrap items-center xl:flex-nowrap">
                <h2 className="mr-auto text-lg font-medium">Edit Food Menu</h2>
                <a
                    href="/food-menus"
                    className="transition duration-200 border inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 bg-primary border-primary text-white dark:border-primary mr-2 shadow-md"
                >
                    Go Back
                    <span className="flex h-5 w-5 items-center justify-center">
                        <Eye className="stroke-1.5 h-4 w-4" />
                    </span>
                </a>
            </div>

            {/* Form Layout */}
            <form onSubmit={handleUpdateFoodMenu}>
                <div className="mt-5 grid grid-cols-11 gap-x-6 pb-20">
                    {/* Main Form */}
                    <div className="intro-y col-span-11 2xl:col-span-9">
                        <div className="intro-y box mt-5 p-5">
                            <div className="rounded-md border border-slate-200/60 p-5 dark:border-darkmode-400">
                                <div className="flex items-center border-b border-slate-200/60 pb-5 text-base font-medium dark:border-darkmode-400">
                                    Add New Food Menu
                                </div>
                                <div className="mt-5">
                                    {/* Name & Price Group */}
                                    <div className="block sm:flex group form-inline mt-5 flex-col items-start pt-5 xl:flex-row">
                                        <label className="inline-block mb-2 xl:!mr-10 xl:w-64">
                                            <div className="text-left">
                                                <div className="flex items-center">
                                                    <div className="font-medium">Name & Price</div>
                                                    <div className="ml-2 rounded-md bg-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:bg-darkmode-300 dark:text-slate-400">
                                                        Required
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-xs leading-relaxed text-slate-500">
                                                    Provide the food menu name and its price.
                                                </div>
                                            </div>
                                        </label>
                                        <div className="mt-3 w-full flex-1 xl:mt-0 grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter food name"
                                                className="disabled:bg-slate-100 dark:disabled:bg-darkmode-800/50 transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary dark:bg-darkmode-800"
                                            />
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                placeholder="Enter food price"
                                                className="disabled:bg-slate-100 dark:disabled:bg-darkmode-800/50 transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary dark:bg-darkmode-800"
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-5 flex flex-col justify-end gap-2 md:flex-row">
                                        <a
                                            href="/food-menus"
                                            type="button"
                                            className="transition duration-200 border shadow-sm inline-flex items-center justify-center px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 bg-white dark:bg-darkmode-800 text-slate-500 dark:text-slate-300 dark:focus:ring-slate-700 w-full py-3 md:w-52"
                                        >
                                            Cancel
                                            <span className="flex h-5 w-5 items-center justify-center ml-1">
                                                <ToggleLeft className="stroke-1.5 h-4 w-4" />
                                            </span>
                                        </a>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="transition duration-200 border shadow-sm inline-flex items-center justify-center px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 dark:focus:ring-slate-700 bg-primary border-primary text-white dark:border-primary w-full py-3 md:w-52 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <div className="flex items-center">
                                                    <svg
                                                        className="animate-spin h-5 w-5 mr-2 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8v4l3.5-3.5L12 1V0a10 10 0 00-10 10h2z"
                                                        ></path>
                                                    </svg>
                                                    Updating...
                                                </div>
                                            ) : (
                                                <>
                                                    Update
                                                    <span className="flex h-5 w-5 items-center justify-center ml-1">
                                                        <CloudUpload className="stroke-1.5 h-4 w-4" />
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Tips Section */}
                    <div className="intro-y col-span-2 hidden 2xl:block">
                        <div className="sticky top-0">
                            <div className="relative mt-6 rounded-md border border-warning bg-warning/20 p-5 dark:border-0 dark:bg-darkmode-600">
                                <Lightbulb className="stroke-1.5 absolute right-0 top-0 mr-3 mt-5 h-12 w-12 text-warning/80" />
                                <h2 className="text-lg font-medium">Tips</h2>
                                <div className="mt-5 font-medium">Food Menu Editing</div>
                                <div className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-500">
                                    <div>
                                        Verify the details before updating. Ensure the name and price are correct.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default EditFoodMenu;
