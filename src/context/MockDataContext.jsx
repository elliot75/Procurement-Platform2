import React, { createContext, useContext, useState, useEffect } from 'react';

const MockDataContext = createContext();

export const useMockData = () => useContext(MockDataContext);

// Initial Seed Data
const INITIAL_PROJECTS = [
    {
        id: 1,
        title: 'Office Supplies - Q1 2026',
        description: 'Procurement of stationary, paper, and toners for HQ.',
        status: 'Active',
        createdBy: 'operator1',
        createdAt: new Date().toISOString(),
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Ends in 24h
        invitedSuppliers: ['supplier1'],
        bids: []
    },
    {
        id: 2,
        title: 'IT Equipment Upgrade',
        description: 'Laptops and Monitors for Development Team.',
        status: 'Ended',
        createdBy: 'operator1',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // Created 48h ago
        endTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // Ended 1h ago
        invitedSuppliers: ['supplier1', 'supplier2'],
        bids: [
            { supplierId: 'supplier1', price: 50000, submittedAt: new Date().toISOString() }
        ]
    }
];

export const MockDataProvider = ({ children }) => {
    const [projects, setProjects] = useState(() => {
        const saved = localStorage.getItem('mock_projects');
        return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    });

    const [currentUser, setCurrentUser] = useState(() => {
        return JSON.parse(localStorage.getItem('user')) || null;
    });

    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('mock_users');
        const defaults = [
            { name: 'Admin User', username: 'admin', role: 'Admin', password: 'password' },
            { name: 'Supplier One', username: 'supplier1', role: 'Supplier', password: 'pass' },
            { name: 'Operator One', username: 'operator1', role: 'Operator', password: 'pass' },
            { name: 'Auditor One', username: 'auditor1', role: 'Auditor', password: 'pass' }
        ];
        return saved ? JSON.parse(saved) : defaults;
    });

    useEffect(() => {
        localStorage.setItem('mock_projects', JSON.stringify(projects));
    }, [projects]);

    useEffect(() => {
        localStorage.setItem('mock_users', JSON.stringify(users));
    }, [users]);

    // Automatic Expiry Check
    useEffect(() => {
        const interval = setInterval(() => {
            setProjects(prev => {
                let hasChanges = false;
                const updated = prev.map(p => {
                    if (p.status === 'Active' && new Date(p.endTime) < new Date()) {
                        hasChanges = true;
                        return { ...p, status: 'Ended' };
                    }
                    return p;
                });
                return hasChanges ? updated : prev;
            });
        }, 5000); // Check every 5s

        return () => clearInterval(interval);
    }, []);

    // Actions
    const createProject = (project) => {
        const newProject = {
            ...project,
            id: Date.now(),
            status: 'Active',
            bids: [],
            createdAt: new Date().toISOString(),
            currency: project.currency || 'TWD', // Default currency
            attachment: project.attachment || null, // Mock attachment URL
        };
        setProjects(prev => [...prev, newProject]);
    };

    const placeBid = (projectId, supplierName, amount) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                const newBid = {
                    supplier: supplierName,
                    amount: Number(amount),
                    timestamp: new Date().toISOString() // Store submission time
                };
                return { ...p, bids: [...p.bids, newBid] };
            }
            return p;
        }));
    };

    // Operator: Add Supplier to active project
    const autoAddSupplier = (projectId, supplierName) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                if (p.invitedSuppliers.includes(supplierName)) return p;
                return { ...p, invitedSuppliers: [...p.invitedSuppliers, supplierName] };
            }
            return p;
        }));
    };

    // Admin: Cancel project if no bids
    const cancelProject = (projectId) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                if (p.bids.length > 0) return p; // Cannot cancel if bids exist
                return { ...p, status: 'Cancelled' };
            }
            return p;
        }));
    };

    const closeProject = (projectId) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) return { ...p, status: 'Ended' };
            return p;
        }));
    };

    const openProject = (projectId, auditorName) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) return { ...p, status: 'Opened', openedBy: auditorName, openedAt: new Date().toISOString() };
            return p;
        }));
    };

    const [resetTokens, setResetTokens] = useState({});

    // User Management
    const register = (newUser) => {
        if (users.find(u => u.username === newUser.username)) {
            return false; // User exists
        }
        // Force Pending Role
        const userWithRole = { ...newUser, role: 'Pending' };
        setUsers(prev => [...prev, userWithRole]);
        return true;
    };

    const updateUser = (username, updates) => {
        setUsers(prev => prev.map(u => {
            if (u.username === username) {
                return { ...u, ...updates };
            }
            return u;
        }));
    };

    const deleteUser = (username) => {
        setUsers(prev => prev.filter(u => u.username !== username));
    };

    // Password Reset
    const requestPasswordReset = (username) => {
        const user = users.find(u => u.username === username);
        if (!user) return { success: false, message: 'User not found' };

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setResetTokens(prev => ({ ...prev, [username]: code }));

        // In a real app, this would email the code. Here we return it to show in UI/Console.
        console.log(`[MOCK EMAIL] Password Reset Code for ${username}: ${code}`);
        return { success: true, code };
    };

    const confirmPasswordReset = (username, code, newPassword) => {
        if (resetTokens[username] === code) {
            updateUser(username, { password: newPassword });
            setResetTokens(prev => {
                const newTokens = { ...prev };
                delete newTokens[username];
                return newTokens;
            });
            return { success: true };
        }
        return { success: false, message: 'Invalid Verification Code' };
    };

    // Change Password (Authenticated)
    const changePassword = (username, oldPassword, newPassword) => {
        const user = users.find(u => u.username === username);
        if (!user) return { success: false, message: 'User not found' };

        if (user.password !== oldPassword) {
            return { success: false, message: 'Incorrect old password' };
        }

        updateUser(username, { password: newPassword });
        return { success: true };
    };

    const loginMock = (username, password) => {
        const user = users.find(u => (u.username === username || u.email === username) && u.password === password);

        // Fallback for demo simplicity if user tries 'admin' with 'Admin@123' used in original code, but mapped to new list
        if (!user && username === 'admin' && password === 'Admin@123') {
            const admin = users.find(u => u.username === 'admin');
            if (admin) {
                setCurrentUser(admin);
                localStorage.setItem('user', JSON.stringify(admin));
                return admin;
            }
        }

        if (user) {
            if (user.role === 'Pending') {
                return { error: 'Pending Approval' };
            }
            setCurrentUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        }
        return null;
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
