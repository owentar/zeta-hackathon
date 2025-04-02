import { Button } from "../../components";

export const AgeEstimated: React.FC<{ photo: string; age: number }> = ({
  photo,
  age,
}) => {
  return (
    <div className="flex flex-col justify-between items-center px-4 py-10 h-dvh">
      <div className="rounded-full w-64 h-64 overflow-hidden">
        <img className="w-full h-full object-cover" src={photo} />
      </div>
      <p className="text-[42px] font-bold">The Lens’ Guess</p>
      <span className="text-[126px] font-bold">{age}</span>
      <div className="flex gap-2">
        <Button onClick={() => {}}>SHARE GUESS</Button>
      </div>
    </div>
  );
};
