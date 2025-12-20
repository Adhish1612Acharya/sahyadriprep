import { ENV } from "@/config/env";
import axios from "axios";

export const axiosClient = axios.create({
  baseURL: ENV.NEXT_PUBLIC_API_URL || "/api",
});
