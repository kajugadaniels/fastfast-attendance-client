import React, { useEffect, useState } from 'react';
import { fetchFoodMenus, deleteFoodMenu } from '../../api';
import { toast } from 'react-toastify';
import { Trash2, Eye, CheckSquare, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GetFoodMenus = () => {
    const navigate = useNavigate();
    const [foodMenus, setFoodMenus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const getFoodMenuList = async () => {
            try {
                setLoading(true);
                const res = await fetchFoodMenus();
                setFoodMenus(res.data);
            } catch (err) {
                setError('Failed to fetch food menus.');
                toast.error('Error fetching food menus.');
            } finally {
                setLoading(false);
            }
        };
        getFoodMenuList();
    }, []);

    const handleShowFoodMenu = (menuId) => {
        navigate(`/food-menu/${menuId}`);
    };

    const handleEditFoodMenu = (menuId) => {
        navigate(`/food-menu/edit/${menuId}`);
    };

    const handleDeleteFoodMenu = async (menuId) => {
        try {
            await deleteFoodMenu(menuId);
            toast.success('Food menu deleted successfully');
            setFoodMenus(foodMenus.filter(menu => menu.id !== menuId));
        } catch (error) {
            toast.error('Failed to delete food menu.');
        }
    };

    return (
        <>
            <div className="intro-y col-span-12 mt-8 flex flex-wrap items-center xl:flex-nowrap">
                <h2 className="mr-auto text-lg font-medium">Food Menus</h2>
                <button
                    onClick={() => navigate('/food-menu/add')}
                    className="transition duration-200 border inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-primary border-primary text-white dark:border-primary mr-2 shadow-md"
                >
                    Add New Food Menu
                    <span className="flex h-5 w-5 items-center justify-center ml-1">
                        <Plus className="stroke-1.5 h-4 w-4" />
                    </span>
                </button>
            </div>

            <div className="mt-5 grid grid-cols-12 gap-6">
                {loading ? (
                    <div className="text-center py-10">Loading food menus...</div>
                ) : error ? (
                    <div className="text-center py-10 text-red-500">{error}</div>
                ) : foodMenus.length === 0 ? (
                    <div className="text-center py-10">
                        <h3 className="text-lg font-medium">No Food Menus Found</h3>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            Looks like no food menus are available.
                        </p>
                    </div>
                ) : (
                    <div className="intro-y col-span-12 overflow-auto 2xl:overflow-visible">
                        <table className="w-full text-left -mt-2 border-separate border-spacing-y-[10px]">
                            <thead>
                                <tr>
                                    <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0">
                                        <input
                                            type="checkbox"
                                            className="transition-all duration-200 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50"
                                        />
                                    </th>
                                    <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0">
                                        Name
                                    </th>
                                    <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0 text-center">
                                        Price
                                    </th>
                                    <th className="font-medium px-5 py-3 dark:border-300 whitespace-nowrap border-b-0 text-center">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {foodMenus.map((menu) => (
                                    <tr key={menu.id} className="intro-x">
                                        <td className="px-5 py-3 border-b dark:border-300 box w-10 whitespace-nowrap border-x-0 shadow-[5px_3px_5px_#00000005] dark:bg-600">
                                            <input
                                                type="checkbox"
                                                className="transition-all duration-200 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 dark:bg-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50"
                                            />
                                        </td>
                                        <td className="px-5 py-3 border-b dark:border-300 box whitespace-nowrap border-x-0 !py-3.5 shadow-[5px_3px_5px_#00000005] dark:bg-600">
                                            <div className="flex items-center">
                                                <div className="image-fit zoom-in h-9 w-9">
                                                    <img
                                                        src="https://midone-html.left4code.com/dist/images/fakers/preview-6.jpg"
                                                        className="tooltip cursor-pointer rounded-lg border-white shadow-[0px_0px_0px_2px_#fff,_1px_1px_5px_rgba(0,0,0,0.32)]"
                                                        alt="menu avatar"
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <span className="whitespace-nowrap font-medium">
                                                        {menu.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 border-b dark:border-300 box whitespace-nowrap border-x-0 text-center shadow-[5px_3px_5px_#00000005] dark:bg-600">
                                            {menu.price} RWF
                                        </td>
                                        <td className="px-5 py-3 border-b dark:border-300 box w-56 border-x-0 shadow-[5px_3px_5px_#00000005] dark:bg-600">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    className="mr-3 flex items-center text-blue-600"
                                                    onClick={() => handleShowFoodMenu(menu.id)}
                                                >
                                                    <Eye className="stroke-1.5 mr-1 h-4 w-4" />
                                                    View
                                                </button>
                                                <button
                                                    className="mr-3 flex items-center text-green-600"
                                                    onClick={() => handleEditFoodMenu(menu.id)}
                                                >
                                                    <CheckSquare className="stroke-1.5 mr-1 h-4 w-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    className="flex items-center text-danger"
                                                    onClick={() => handleDeleteFoodMenu(menu.id)}
                                                >
                                                    <Trash2 className="stroke-1.5 mr-1 h-4 w-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default GetFoodMenus;
