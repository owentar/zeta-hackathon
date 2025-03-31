import axios from "axios";

const API_KEY = process.env.FACEPLUSPLUS_API_KEY;
const API_SECRET = process.env.FACEPLUSPLUS_API_SECRET;
const API_URL = "https://api-us.faceplusplus.com/facepp/v3/detect";

type FacePlusPlusResponse = {
  faces: {
    face_token: string;
    attributes: {
      age: { value: number };
    };
    face_num: number;
  }[];
};

export const estimateAge = async (imageDataURL: string) => {
  const formData = new FormData();
  formData.append("api_key", API_KEY);
  formData.append("api_secret", API_SECRET);
  formData.append("image_base64", imageDataURL.split(",")[1]);
  formData.append("return_attributes", "age");
  console.log("formData", formData);

  const response = await axios.post<FacePlusPlusResponse>(API_URL, formData);

  return response.data;
};
