import { jwtDecode } from "jwt-decode";
import { createContext, ReactNode, useState } from "react";
import { UserInterface } from "../../interfaces/UserInterface";

interface AuthContextInterface {
  token: string | null;
  login: (token: string) => void;
  isTokenExpiried: () => boolean;
  logoutUser: () => void;
  getUserInfo: () => UserInterface | null;
  userRoles: () => string[];
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextInterface | undefined>(
  undefined
);

interface JwtPayloadExpiried {
  exp: number;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("babyspa-token")
  );

  const userRoles = () => {
    const token = localStorage.getItem("babyspa-token");

    if (!token) {
      return [];
    }

    const decodedToken = jwtDecode<{ role: string[] }>(token);
    return decodedToken.role || [];
  };

  const login = (token: string) => {
    setToken(token);
    localStorage.setItem("babyspa-token", token);
  };

  const getUserInfo = () => {
    if (token) {
      let user: UserInterface = {
        firstName: jwtDecode<{ firstName: string }>(token).firstName,
        username: jwtDecode<{ sub: string }>(token).sub,
        email: jwtDecode<{ email: string }>(token).email,
        lastName: jwtDecode<{ lastName: string }>(token).lastName,
      };
      return user;
    } else {
      return null;
    }
  };

  const logoutUser = () => {
    setToken(null);
    localStorage.removeItem("babyspa-token");
  };

  const isAuthenticated = !!localStorage.getItem("babyspa-token");

  const isTokenExpiried = (): boolean => {
    try {
      const token = localStorage.getItem("babyspa-token");
      if (!token) {
        return true;
      }
      const decodedToken = jwtDecode<JwtPayloadExpiried>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = decodedToken.exp;
      return expirationTime < currentTime;
    } catch (e) {
      console.error("Greška pri dekodiranju tokena:", e);
      return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        getUserInfo,
        login,
        isTokenExpiried,
        logoutUser,
        userRoles,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
