import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
const req = axios.create({ baseURL: apiUrl });

export const baseRequest = () => {
  const token = localStorage.getItem("babyspa-token");
  if (token) {
    req.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete req.defaults.headers.common["Authorization"];
  }
  return req;
};
