import React, { createContext, useContext, useState, useEffect } from 'react';

const MockDataContext = createContext();

export const useMockData = () => useContext(MockDataContext);

// API Base URL
const API_URL = 'http://localhost:3000/api';

export const MockDataProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(() => {
        return JSON.parse(localStorage.getItem('user')) || null;
    });

    // Fetch Initial Data
    const refreshData = async () => {
        try {
            const projectsRes = await fetch(`${API_URL}/projects`);
            if (projectsRes.ok) setProjects(await projectsRes.json());

            const usersRes = await fetch(`${API_URL}/users`);
            if (usersRes.ok) setUsers(await usersRes.json());
        } catch (err) {
            console.error("Failed to fetch data:", err);
        }
    };

    useEffect(() => {
        refreshData();
        // Poll for updates every 5 seconds (to keep "live" feel similar to previous interval)
        const interval = setInterval(refreshData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Actions
    const createProject = async (project) => {
        try {
            const res = await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(project)
            });
            if (res.ok) {
                await refreshData();
                return true;
            }
        } catch (err) {
            console.error(err);
        }
        return false;
    };

    const placeBid = async (projectId, supplierName, amount, attachments = []) => {
        try {
            const res = await fetch(`${API_URL}/projects/${projectId}/bid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ supplier: supplierName, amount, attachments })
            });
            if (res.ok) {
                await refreshData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Operator: Add Supplier to active project
    const autoAddSupplier = async (projectId, supplierName) => {
        try {
            const res = await fetch(`${API_URL}/projects/${projectId}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ supplier: supplierName })
            });
            if (res.ok) await refreshData();
        } catch (err) {
            console.error(err);
        }
    };

    // Admin: Cancel project
    const cancelProject = async (projectId) => {
        try {
            const res = await fetch(`${API_URL}/projects/${projectId}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Cancelled' })
            });
            if (res.ok) await refreshData();
        } catch (err) {
            console.error(err);
        }
    };

    const closeProject = async (projectId) => {
        try {
            const res = await fetch(`${API_URL}/projects/${projectId}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Ended' })
            });
            if (res.ok) await refreshData();
        } catch (err) {
            console.error(err);
        }
    };

    const openProject = async (projectId, auditorName) => {
        try {
            const res = await fetch(`${API_URL}/projects/${projectId}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Opened', openedBy: auditorName })
            });
            if (res.ok) await refreshData();
        } catch (err) {
            console.error(err);
        }
    };

    // User Management API Calls
    const register = async (newUser) => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            const data = await res.json();

            if (res.ok) {
                await refreshData();
                return { success: true, message: data.message, user: data.user };
            } else {
                return { success: false, message: data.message || '註冊失敗' };
            }
        } catch (err) {
            console.error(err);
            return { success: false, message: '網路錯誤，請稍後再試' };
        }
    };

    const updateUser = async (username, updates) => {
        try {
            const res = await fetch(`${API_URL}/users/${username}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (res.ok) await refreshData();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteUser = async (username) => {
        try {
            const res = await fetch(`${API_URL}/users/${username}`, {
                method: 'DELETE'
            });
            if (res.ok) await refreshData();
        } catch (err) {
            console.error(err);
        }
    };

    // Password Reset (Client-side simulation or API?)
    // API logic for this didn't exist in my routes yet.
    // I'll keep it client-side mock for now as per "MockDataContext" legacy, 
    // strictly for the "reset" flow which sends a code.
    const [resetTokens, setResetTokens] = useState({});

    const requestPasswordReset = (username) => {
        // Keeping mock behavior for simplicity unless requested otherwise
        // Real implementation requires email service.
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setResetTokens(prev => ({ ...prev, [username]: code }));
        console.log(`[MOCK EMAIL] Password Reset Code for ${username}: ${code}`);
        return { success: true, code };
    };

    const confirmPasswordReset = async (username, code, newPassword) => {
        if (resetTokens[username] === code) {
            await updateUser(username, { password: newPassword });
            setResetTokens(prev => {
                const newTokens = { ...prev };
                delete newTokens[username];
                return newTokens;
            });
            return { success: true };
        }
        return { success: false, message: 'Invalid Verification Code' };
    };

    const changePassword = async (username, oldPassword, newPassword) => {
        // Since API `updateUser` doesn't verify old password, we should probably add a specific endpoint.
        // But `MockDataContext` did logic here.
        // Ideally we login first to verify old password.
        const loginRes = await loginMock(username, oldPassword);
        if (loginRes && !loginRes.error) {
            await updateUser(username, { password: newPassword });
            return { success: true };
        }
        return { success: false, message: 'Incorrect old password' };
    };

    const loginMock = async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const user = await res.json();
                setCurrentUser(user);
                localStorage.setItem('user', JSON.stringify(user));
                return user;
            } else {
                const err = await res.json();
                return { error: err.code || err.message || 'Login failed' };
            }
        } catch (err) {
            console.error(err);
            return { error: 'Network Error' };
        }
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('user');
    };

    return (
        <MockDataContext.Provider value={{
            projects,
            currentUser,
            users,
            createProject,
            placeBid,
            closeProject,
            openProject,
            loginMock,
            logout,
            register,
            deleteUser,
            updateUser,
            autoAddSupplier,
            cancelProject,
            requestPasswordReset,
            confirmPasswordReset,
            changePassword
        }}>
            {children}
        </MockDataContext.Provider>
    );
};
