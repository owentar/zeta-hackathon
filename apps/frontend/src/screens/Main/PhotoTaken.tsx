import { Button } from "../../components";

export const PhotoTaken: React.FC<{
  photo: string;
  onRetakePhoto: () => void;
  onEstimateAge: () => void;
}> = ({ photo, onRetakePhoto, onEstimateAge }) => {
  return (
    <div className="flex flex-col justify-between items-center px-4 py-10 h-dvh">
      <h1 className="text-[64px]">Looking Good!</h1>
      <div className="rounded-full w-64 h-64 overflow-hidden">
        <img className="w-full h-full object-cover" src={photo} />
      </div>
      <div className="flex gap-2">
        <Button onClick={onRetakePhoto}>Retake</Button>
        <Button onClick={onEstimateAge}>Estimate Age</Button>
      </div>
    </div>
  );
};
