import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getAgeEstimations } from "../services/backend";
import CloudinaryService from "../services/cloudinary.service";

export const Feed = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["ageEstimations"],
    queryFn: () => getAgeEstimations(),
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Recent Guesses</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.items.map((estimation) => {
          const imageUrl = CloudinaryService.getImageUrl(
            estimation.cloudinary_public_id,
            {
              width: 400,
              quality: 80,
              format: "webp",
            }
          );

          return (
            <Link
              key={estimation.id}
              to={`/guess/${estimation.id}`}
              className="block"
            >
              <div className="bg-white/10 rounded-lg shadow-lg overflow-hidden backdrop-blur-sm hover:bg-white/20 transition-colors">
                <img
                  src={imageUrl}
                  alt="Age estimation"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">
                    Estimated Age: {estimation.estimated_age} years
                  </h2>
                  <div className="text-white/80 text-sm">
                    <p>
                      Wallet: {estimation.wallet_address.slice(0, 6)}...
                      {estimation.wallet_address.slice(-4)}
                    </p>
                    <p>Chain ID: {estimation.chain_id}</p>
                    <p>
                      Created:{" "}
                      {new Date(estimation.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
