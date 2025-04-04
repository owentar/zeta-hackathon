import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { getAgeEstimation } from "../services/backend";
import CloudinaryService from "../services/cloudinary.service";

interface AgeEstimation {
  id: string;
  cloudinary_public_id: string;
  estimated_age: number;
  wallet_address: string;
  chain_id: number;
  created_at: string;
}

export const GuessScreen = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: ageEstimation,
    isLoading,
    error,
  } = useQuery<AgeEstimation>({
    queryKey: ["ageEstimation", id],
    queryFn: () => getAgeEstimation(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error instanceof Error ? error.message : "An error occurred"}
      </div>
    );
  }

  if (!ageEstimation) {
    return (
      <div className="flex justify-center items-center h-screen">
        Age estimation not found
      </div>
    );
  }

  const imageUrl = CloudinaryService.getImageUrl(
    ageEstimation.cloudinary_public_id,
    {
      width: 800,
      quality: 90,
      format: "webp",
    }
  );

  const title = `Age Lens guessed ${ageEstimation.estimated_age} years`;
  const description = `Check out what Age Lens guessed for this photo! Can it guess your age too?`;

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={imageUrl} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 rounded-lg shadow-lg overflow-hidden backdrop-blur-sm">
            <img
              src={imageUrl}
              alt="Age estimation"
              className="w-full h-auto"
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Estimated Age: {ageEstimation.estimated_age} years
              </h2>
              <div className="text-white/80">
                <p>Wallet: {ageEstimation.wallet_address}</p>
                <p>Chain ID: {ageEstimation.chain_id}</p>
                <p>
                  Created: {new Date(ageEstimation.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
