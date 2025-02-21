import React, { useEffect, useState } from 'react';
import { fetchFoodMenus, deleteFoodMenu } from '../../api';
import { toast } from 'react-toastify';
import { Trash2, Eye, Edit, Plus } from 'lucide-react';
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
        navigate(`/food-menu/${menuId}/edit`);
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
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Food Menus</h2>
                <button
                    onClick={() => navigate('/food-menu/add')}
                    className="btn-primary"
                >
                    Add New Food Menu
                    <Plus className="h-4 w-4 ml-1" />
                </button>
            </div>
            <div className="mt-6 grid grid-cols-12 gap-6">
                {loading ? (
                    <div>Loading food menus...</div>
                ) : error ? (
                    <div>{error}</div>
                ) : foodMenus.length === 0 ? (
                    <div>No food menus found</div>
                ) : (
                    <div className="col-span-12 overflow-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    <th className="font-medium px-5 py-3">Name</th>
                                    <th className="font-medium px-5 py-3">Price</th>
                                    <th className="font-medium px-5 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {foodMenus.map((menu) => (
                                    <tr key={menu.id}>
                                        <td className="px-5 py-3">{menu.name}</td>
                                        <td className="px-5 py-3">{menu.price} RWF</td>
                                        <td className="px-5 py-3">
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleShowFoodMenu(menu.id)}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    <Eye className="h-4 w-4" /> View
                                                </button>
                                                <button
                                                    onClick={() => handleEditFoodMenu(menu.id)}
                                                    className="text-green-600 hover:underline"
                                                >
                                                    <Edit className="h-4 w-4" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFoodMenu(menu.id)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    <Trash2 className="h-4 w-4" /> Delete
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
        </div>
    );
};

export default GetFoodMenus;
