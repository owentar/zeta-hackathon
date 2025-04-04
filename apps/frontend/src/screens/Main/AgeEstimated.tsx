import { Link } from "react-router-dom";
import { Button, Logo, ShareIcon } from "../../components";

export const AgeEstimated: React.FC<{
  photo: string;
  age: number;
  estimationId: string;
}> = ({ photo, age, estimationId }) => {
  return (
    <div className="flex flex-col justify-between items-center px-4 py-10 h-dvh">
      <Link to="/">
        <Logo />
      </Link>
      <div className="rounded-full w-64 h-64 overflow-hidden">
        <img className="w-full h-full object-cover" src={photo} />
      </div>
      <div className="flex flex-col items-center">
        <p className="text-[42px] font-bold">The Lens’ Guess</p>
        <span className="text-[126px] font-bold">{age}</span>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            const text = `The lens guessed my age as ${age}!`;
            const url = `${window.location.href}/${estimationId}`;
            window.open(
              `https://x.com/intent/tweet?text=${encodeURIComponent(
                text
              )}&url=${encodeURIComponent(url)}`,
              "_blank"
            );
          }}
          icon={<ShareIcon />}
          className="w-full"
        >
          SHARE GUESS
        </Button>
      </div>
    </div>
  );
};
