import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

/**
 * Custom hook to access auth state and helpers.
 */
export const useAuth = () => useContext(AuthContext);

/**
 * AuthProvider — manages user state, login, register, logout, and anonymous sessions.
 * Persists user data (including JWT) and anonymous token in localStorage.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [anonToken, setAnonToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Rehydrate user and anonymous token from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
        const storedAnonToken = localStorage.getItem('anonToken');
        if (storedAnonToken) {
            setAnonToken(JSON.parse(storedAnonToken));
        }
        setLoading(false);
    }, []);

    /**
     * Register a new account and auto-login.
     */
    const register = async (name, email, password, role = 'citizen', department) => {
        try {
            const payload = {
                name,
                email,
                password,
                role,
            };
            if (department) {
                payload.department = department;
            }

            const { data } = await api.post('/auth/register', payload);
            
            if (data.success && data.data) {
                localStorage.setItem('user', JSON.stringify(data.data));
                setUser(data.data);
                return data;
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    /**
     * Login with email & password.
     */
    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.data));
            setUser(data.data);
        }
        return data;
    };

    /**
     * Generate anonymous session token for guest submissions.
     */
    const generateAnonToken = async (latitude, longitude, userAgent) => {
        try {
            const { data } = await api.post('/auth/anonymous', {
                latitude,
                longitude,
                userAgent: userAgent || navigator.userAgent,
            });

            if (data.success && data.data) {
                localStorage.setItem('anonToken', JSON.stringify(data.data));
                setAnonToken(data.data);
                return data.data;
            }
        } catch (error) {
            console.error('Anonymous token error:', error);
            throw error;
        }
    };

    /**
     * Logout — clear state and storage.
     */
    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    /**
     * Logout anonymous session.
     */
    const logoutAnon = () => {
        localStorage.removeItem('anonToken');
        setAnonToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                anonToken,
                loading,
                login,
                register,
                logout,
                generateAnonToken,
                logoutAnon,
                isAdmin: user?.role === 'admin',
                isOfficial: user?.role === 'official',
                isCitizen: user?.role === 'citizen',
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
