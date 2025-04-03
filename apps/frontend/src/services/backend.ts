import axios from "axios";

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

const estimateAge = async ({
  imageDataURL,
  walletAddress,
  chainId,
}: {
  imageDataURL: string;
  walletAddress: string;
  chainId: number;
}) => {
  const { data } = await axios.post<{
    age: number;
    hasMultipleFaces: boolean;
    isRewarded: boolean;
  }>(`${API_URL}/estimate-age`, {
    imageDataURL,
    walletAddress,
    chainId,
  });
  return data;
};

const BackendAPI = {
  estimateAge,
};

export default BackendAPI;
