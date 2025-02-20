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
        if (error.response && error.response.status === 401) {
            // Handle invalid token scenario
            console.error('Unauthorized access. Please log in again.');
            // Optionally, clear the token and redirect to login page
            localStorage.removeItem('token');
            window.location.href = '/';
        }
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
        const response = await apiClient.post('/auth/logout/')
        return response.data
    } catch (error) {
        throw error
    }
}

export const updateUserProfile = async (updateData) => {
    try {
        const response = await apiClient.patch('/auth/profile-update/', updateData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchUsers = async () => {
    try {
        const response = await apiClient.get('/users/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await apiClient.post('/user/add/', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchUser = async (userId) => {
    try {
        const response = await apiClient.get(`/user/${userId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateUser = async (userId, userData) => {
    try {
        const response = await apiClient.patch(`/user/${userId}/edit/`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await apiClient.delete(`/user/${userId}/delete/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchEmployees = async () => {
    try {
        const response = await apiClient.get('/employees/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createEmployee = async (employeeData) => {
    try {
        const response = await apiClient.post('/employee/add/', employeeData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchEmployee = async (empId) => {
    try {
        const response = await apiClient.get(`/employee/${empId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateEmployee = async (empId, employeeData) => {
    try {
        const response = await apiClient.patch(`/employee/${empId}/edit/`, employeeData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteEmployee = async (empId) => {
    try {
        const response = await apiClient.delete(`/employee/${empId}/delete/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchAttendances = async () => {
    try {
        const response = await apiClient.get('/attendance/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addAttendance = async (attendanceData) => {
    try {
        const response = await apiClient.post('/attendance/add/', attendanceData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchEmployeeAttendanceHistory = async (employeeId) => {
    try {
        const response = await apiClient.get(`/attendance/${employeeId}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateAttendance = async (attendanceId, attendanceData) => {
    try {
        const response = await apiClient.patch(`/attendance/${attendanceId}/edit/`, attendanceData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteAttendance = async (attendanceId) => {
    try {
        const response = await apiClient.delete(`/attendance/${attendanceId}/delete/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};