import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchFoodMenu } from '../../api';

const ShowFoodMenu = () => {
    const { id } = useParams();
    const [foodMenu, setFoodMenu] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getFoodMenuDetails = async () => {
            try {
                setLoading(true);
                const menuResponse = await fetchFoodMenu(id);
                setFoodMenu(menuResponse.data);
            } catch (error) {
                toast.error('Failed to load food menu details.');
            } finally {
                setLoading(false);
            }
        };
        getFoodMenuDetails();
    }, [id]);

    if (loading) {
        return <div>Loading food menu details...</div>;
    }

    if (!foodMenu) {
        return <div>No food menu found</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-lg font-medium">{foodMenu.name}</h2>
            <p>Price: {foodMenu.price} RWF</p>
            <h3 className="text-md font-medium mt-4">Employees who selected this food:</h3>
            <ul className="mt-2">
                {employees.map((employee) => (
                    <li key={employee.id} className="py-1">
                        {employee.name} (Finger ID: {employee.finger_id})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ShowFoodMenu;
