import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const getJobs = async () => {
  const response = await API.get("/");
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await API.post("/", jobData);
  return response.data;
};

export const updateJob = async (id, jobData) => {
  const response = await API.put(`/${id}`, jobData);
  return response.data;
};

export const deleteJob = async (id) => {
  const response = await API.delete(`/${id}`);
  return response.data;
};

export const getJobsStats = async () => {
  const response = await API.get("/stats");

  return response.data;
};
