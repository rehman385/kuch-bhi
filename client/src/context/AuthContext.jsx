import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, restore user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Register function
  const register = async (name, email, password, registrationSecret) => {
    const { data } = await api.post('/auth/register', {
      name,
      email,
      password,
      registrationSecret,
    });
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
    setUser(data.data);
    return data;
  };

  // Login function
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
    setUser(data.data);
    return data;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update mood function
  const updateMood = async (mood, moodNote) => {
    const { data } = await api.put('/auth/mood', { mood, moodNote });
    const updatedUser = { ...user, mood: data.mood, moodNote: data.moodNote };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateMood }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy context access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
