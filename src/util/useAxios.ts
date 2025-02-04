import axios from "axios";
import { jwtDecode } from "jwt-decode";

const apiUrl = import.meta.env.VITE_API_URL;
const req = axios.create({ baseURL: apiUrl });

interface JwtPayloadExpiried {
  exp: number;
}

const isTokenExpired = (): boolean => {
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

export const baseRequest = () => {
  const token = localStorage.getItem("babyspa-token");
  if (token) {
    req.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete req.defaults.headers.common["Authorization"];
  }

  return req;
};

req.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("babyspa-token");

    if (token && isTokenExpired()) {
      localStorage.removeItem("babyspa-token");
      if (window.location.hostname == "localhost") {
        window.location.href = "http://localhost:5173/login";
      } else {
        window.location.href = `http://${window.location.hostname}:3000/login`;
      }
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

req.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 403) {
      localStorage.removeItem("babyspa-token");
      if (window.location.hostname == "localhost") {
        window.location.href = "http://localhost:5173/login";
      } else {
        window.location.href = `http://${window.location.hostname}:3000/login`;
      }
    }
    return Promise.reject(error);
  }
);
