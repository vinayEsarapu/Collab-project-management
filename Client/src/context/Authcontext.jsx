import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import api from "../services/api";

import {
  setAccessToken as storeAccessToken,
  clearAccessToken
} from "../services/tokenManager";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const restoreSession = async () => {
    try {
      const response = await api.post("/auth/refresh");

      const newAccessToken = response.data.accessToken;

      setAccessToken(newAccessToken);
      storeAccessToken(newAccessToken);

      const userResponse = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${newAccessToken}`
        }
      });

      setUser(userResponse.data.user);

    } catch (error) {
      setAccessToken(null);
      setUser(null);

    } finally {
      setIsLoading(false);
    }
  };

  restoreSession();
}, []);

  const login = (userData, token) => {
  setUser(userData);
  setAccessToken(token);
  storeAccessToken(token);
};
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    clearAccessToken();
  };

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};