import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getUserFromStorage());
    setToken(localStorage.getItem("token") || "");
    setLoading(false);
  }, []);

  const login = (data) => {
    setUser(data.user || { name: data.name, phone: data.phone, role: data.role });
    setToken(data.token);
    localStorage.setItem(
      "user",
      JSON.stringify(data.user || { name: data.name, phone: data.phone, role: data.role })
    );
    localStorage.setItem("token", data.token);
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
