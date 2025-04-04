import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import { MainMenu } from "../components";
import {
  getAgeEstimations,
  type AgeEstimation,
  type AgeEstimationsResponse,
} from "../services/backend";
import CloudinaryService from "../services/cloudinary.service";

const ITEMS_PER_PAGE = 9;

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
  const { ref: loadMoreRef, inView } = useInView();

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["ageEstimations"],
    queryFn: ({ pageParam = 0 }) =>
      getAgeEstimations(ITEMS_PER_PAGE, pageParam * ITEMS_PER_PAGE),
    getNextPageParam: (lastPage: AgeEstimationsResponse) => {
      const nextOffset = lastPage.offset + lastPage.items.length;
      return nextOffset < lastPage.total
        ? Math.floor(nextOffset / ITEMS_PER_PAGE)
        : undefined;
    },
    initialPageParam: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

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
        {data?.pages.map((page) =>
          page.items.map((estimation: AgeEstimation) => {
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
          })
        )}
      </div>

      {/* Loading indicator and trigger */}
      <div
        ref={loadMoreRef}
        className="flex justify-center items-center mt-8 h-20"
      >
        {isFetchingNextPage ? (
          <div className="text-white/50">Loading more...</div>
        ) : hasNextPage ? (
          <div className="text-white/30">Scroll for more</div>
        ) : (
          <div className="text-white/30">No more guesses</div>
        )}
      </div>
    </div>
  );
};
