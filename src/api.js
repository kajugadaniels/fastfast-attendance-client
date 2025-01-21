import axios from 'axios';

const baseURL =
    import.meta.env.MODE === 'production'
        ? import.meta.env.VITE_API_BASE_URL_PROD
        : import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
    baseURL,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const loginUser = async (email, password) => {
    try {
        const response = await apiClient.post('/auth/login/', { email, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        const response = await apiClient.post('/api/auth/logout/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateUserProfile = async (updateData) => {
    try {
        const response = await apiClient.patch('/api/auth/profile-update/', updateData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchUsers = async () => {
    try {
        const response = await apiClient.get('/api/users/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await apiClient.post('/api/user/add/', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchUser = async (userId) => {
    try {
        const response = await apiClient.get(`/api/user/${userId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateUser = async (userId, userData) => {
    try {
        const response = await apiClient.patch(`/api/user/${userId}/edit/`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await apiClient.delete(`/api/user/${userId}/delete/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchEmployees = async () => {
    try {
        const response = await apiClient.get('/api/employees/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createEmployee = async (employeeData) => {
    try {
        const response = await apiClient.post('/api/employee/add/', employeeData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchEmployee = async (empId) => {
    try {
        const response = await apiClient.get(`/api/employee/${empId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateEmployee = async (empId, employeeData) => {
    try {
        const response = await apiClient.patch(`/api/employee/${empId}/edit/`, employeeData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteEmployee = async (empId) => {
    try {
        const response = await apiClient.delete(`/api/employee/${empId}/delete/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchAttendances = async () => {
    try {
        const response = await apiClient.get('/api/attendance/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

