import axios from "axios";

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // your API URL
  headers: {
    "Content-Type": "application/json",
  },
});
