import { useEffect, useRef } from "react";
import { TakePhoto } from "../../components";

export const NoPhoto: React.FC<{
  onTakePhoto: (frame: HTMLVideoElement) => void;
}> = ({ onTakePhoto }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => (videoRef.current!.srcObject = stream));
    }
  }, [videoRef.current]);

  return (
    <div className="flex flex-col justify-center items-center px-4">
      <div className="relative w-screen h-screen md:w-[640px] md:h-[480px]">
        <video
          ref={videoRef}
          id="video"
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        ></video>
        <TakePhoto
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          onClick={() => onTakePhoto(videoRef.current!)}
          disabled={!!videoRef.current}
        />
      </div>
    </div>
  );
};
