import axios from "axios";

export const apiUrl = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 7000,
    withCredentials: true,
})