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

    useEffect(() => {
        localStorage.setItem('mock_projects', JSON.stringify(projects));
    }, [projects]);

    // Actions
    const createProject = (project) => {
        const newProject = {
            ...project,
            id: Date.now(),
            status: 'Active',
            createdAt: new Date().toISOString(),
            bids: []
        };
        setProjects(prev => [newProject, ...prev]);
    };

    const placeBid = (projectId, bid) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                return { ...p, bids: [...p.bids, bid] };
            }
            return p;
        }));
    };

    const closeProject = (projectId) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) return { ...p, status: 'Ended' };
            return p
        }));
    };

    const openProject = (projectId, auditorName) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) return { ...p, status: 'Opened', openedBy: auditorName, openedAt: new Date().toISOString() };
            return p
        }));
    }

    const loginMock = (username, password) => {
        // Simple role mapping logic
        let role = 'Supplier';
        if (username.toLowerCase().includes('admin')) role = 'Admin';
        if (username.toLowerCase().includes('operator')) role = 'Operator';
        if (username.toLowerCase().includes('auditor')) role = 'Auditor';

        // Default Admin
        if (username === 'admin' && password === 'Admin@123') role = 'Admin';

        const user = { name: username, role: role, username: username };
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.clear();
        // Keep projects for demo persistence
    };

    return (
        <MockDataContext.Provider value={{
            projects,
            currentUser,
            createProject,
            placeBid,
            closeProject,
            openProject,
            loginMock,
            logout
        }}>
            {children}
        </MockDataContext.Provider>
    );
};
