import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const estimateAge = async (payload: {
  imageDataURL: string;
  walletAddress: string;
  chainId: number;
}) => {
  const { data } = await axios.post<{
    cloudinaryPublicId: string;
    estimationId: number;
  }>(`${API_URL}/age-estimation`, payload);
  return data;
};

const getAgeEstimation = async (id: number) => {
  const { data } = await axios.get<{
    id: number;
    cloudinary_public_id: string;
    estimated_age: number;
    wallet_address: string;
    chain_id: number;
    created_at: string;
    status: "REVEALED" | "UNREVEALED";
  }>(`${API_URL}/age-estimation/${id}`);
  return data;
};

const revealAgeEstimation = async (id: number) => {
  const { data } = await axios.post<{
    id: number;
    cloudinary_public_id: string;
    estimated_age: number;
    wallet_address: string;
    chain_id: number;
    created_at: string;
    status: string;
  }>(`${API_URL}/age-estimation/${id}/reveal`);
  return data;
};

const startGame = async (id: number) => {
  const { data } = await axios.post<{
    id: number;
    ageHash: string;
    isRewarded: boolean;
  }>(`${API_URL}/age-estimation/${id}/start-game`);
  return data;
};

export interface AgeEstimation {
  id: number;
  cloudinary_public_id: string;
  estimated_age?: number;
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

const getAgeEstimations = async (
  limit: number = 5,
  offset: number = 0,
  chainId?: number
) => {
  const { data } = await axios.get<AgeEstimationsResponse>(
    `${API_URL}/age-estimations`,
    {
      params: { limit, offset, chain_id: chainId },
    }
  );
  return data;
};

const finishGame = async (id: number) => {
  const { data } = await axios.post<{
    id: number;
    cloudinary_public_id: string;
    estimated_age: number;
    wallet_address: string;
    chain_id: number;
    created_at: string;
    status: string;
  }>(`${API_URL}/age-estimation/${id}/finish-game`);
  return data;
};

const BackendAPI = {
  estimateAge,
  revealAgeEstimation,
  startGame,
  getAgeEstimation,
  getAgeEstimations,
  finishGame,
};

export default BackendAPI;
