import axios from "axios";

const instance = axios.create({
  baseURL: "https://nutrilens-backend-0wkr.onrender.com",
});

export default instance;