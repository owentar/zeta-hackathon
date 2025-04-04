import axios from "axios";

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
    cloudinaryPublicId: string;
    isRewarded: boolean;
    estimationId: string;
  }>(`${API_URL}/estimate-age`, {
    imageDataURL,
    walletAddress,
    chainId,
  });
  return data;
};

export const getAgeEstimation = async (id: string) => {
  const response = await fetch(`${API_URL}/age-estimation/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch age estimation");
  }
  return response.json();
};

export interface AgeEstimation {
  id: string;
  cloudinary_public_id: string;
  estimated_age: number;
  wallet_address: string;
  chain_id: number;
  created_at: string;
}

export interface AgeEstimationsResponse {
  items: AgeEstimation[];
  total: number;
  limit: number;
  offset: number;
}

export const getAgeEstimations = async (
  limit: number = 5,
  offset: number = 0
) => {
  const { data } = await axios.get<AgeEstimationsResponse>(
    `${API_URL}/age-estimations`,
    {
      params: { limit, offset },
    }
  );
  return data;
};

const BackendAPI = {
  estimateAge,
};

export default BackendAPI;
