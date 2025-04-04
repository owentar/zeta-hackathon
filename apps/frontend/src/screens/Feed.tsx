import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MainMenu } from "../components";
import { getAgeEstimations } from "../services/backend";
import CloudinaryService from "../services/cloudinary.service";

const LensGuess: React.FC<{ id: string; age: number; imageUrl: string }> = ({
  id,
  age,
  imageUrl,
}) => {
  return (
    <Link to={`/guess/${id}`} className="block">
      <div className="flex flex-col gap-7 items-center text-center">
        <div className="rounded-full w-48 h-48 overflow-hidden">
          <img className="w-full h-full object-cover" src={imageUrl} />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[32px] font-bold">The Lens' Guess</span>
          <span className="text-[104px] font-bold">{age}</span>
        </div>
      </div>
    </Link>
  );
};

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
      <div className="min-h-20">
        <MainMenu withLogo />
      </div>
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 mt-8">
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
            <LensGuess
              key={estimation.id}
              id={estimation.id}
              age={estimation.estimated_age}
              imageUrl={imageUrl}
            />
          );
        })}
      </div>
    </div>
  );
};
