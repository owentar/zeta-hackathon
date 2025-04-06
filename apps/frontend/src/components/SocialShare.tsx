import { FaFacebook, FaTwitter } from "react-icons/fa";

interface SocialShareProps {
  title: string;
  url: string;
  imageUrl: string;
}

export const SocialShare = ({ title, url }: SocialShareProps) => {
  const shareText = `I just placed a bet on Age Lens! Can you guess the age better than me? ${title}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(url)}`;

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    url
  )}`;

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <p className="text-xl font-bold">Share your bet!</p>
      <div className="flex gap-6">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-full bg-[#1DA1F2] hover:bg-[#1a8cd8] transition-colors"
        >
          <FaTwitter className="text-white text-2xl" />
        </a>
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-full bg-[#4267B2] hover:bg-[#365899] transition-colors"
        >
          <FaFacebook className="text-white text-2xl" />
        </a>
      </div>
    </div>
  );
};
