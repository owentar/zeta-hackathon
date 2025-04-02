import axios from "axios";

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

const estimateAge = async (imageDataURL: string) => {
  const { data } = await axios.post<{ age: number }>(
    `${API_URL}/estimate-age`,
    {
      imageDataURL,
    }
  );
  return data;
};

const BackendAPI = {
  estimateAge,
};

export default BackendAPI;
