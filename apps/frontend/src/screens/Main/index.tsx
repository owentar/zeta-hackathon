import { useMutation } from "@tanstack/react-query";
import { Reducer, useCallback, useReducer, useRef } from "react";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import BackendAPI from "../../services/backend";
import { AgeEstimated } from "./AgeEstimated";
import { NoPhoto } from "./NoPhoto";
import { PhotoTaken } from "./PhotoTaken";

type State = {
  state: "no_photo" | "photo_taken" | "age_estimated";
  photo: string | null;
  age: number | null;
  estimationId: number | null;
};

type Action =
  | {
      type: "TAKE_PHOTO";
      payload: string;
    }
  | {
      type: "AGE_ESTIMATED";
      payload: { estimationId: number };
    }
  | { type: "RESET" };

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "TAKE_PHOTO":
      return { ...state, photo: action.payload, state: "photo_taken" };
    case "AGE_ESTIMATED":
      return {
        ...state,
        estimationId: action.payload.estimationId,
        state: "age_estimated",
      };
    case "RESET":
      return { photo: null, age: null, estimationId: null, state: "no_photo" };
  }
};

export const Main: React.FC = () => {
  const { address, chainId } = useAccount();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, dispatch] = useReducer(reducer, {
    photo: null,
    age: null,
    estimationId: null,
    state: "no_photo",
  });

  const retakePhoto = useCallback(async () => {
    dispatch({ type: "RESET" });
  }, []);

  const captureFrame = useCallback(
    (frame: HTMLVideoElement) => {
      if (!canvasRef.current) return;

      const ctx = canvasRef.current.getContext("2d")!;

      canvasRef.current.width = frame.videoWidth;
      canvasRef.current.height = frame.videoHeight;
      ctx.drawImage(
        frame,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      const imageDataURL = canvasRef.current.toDataURL("image/jpeg");
      dispatch({ type: "TAKE_PHOTO", payload: imageDataURL });
    },
    [canvasRef.current]
  );

  const { mutate: estimateAge, isPending: isEstimating } = useMutation({
    mutationFn: async () => {
      if (!state.photo) {
        toast.warning("Please take a photo first");
        return;
      }
      return BackendAPI.estimateAge({
        imageDataURL: state.photo,
        walletAddress: address!,
        chainId: chainId!,
      });
    },
    onSuccess: (data) => {
      if (!data) return;

      dispatch({
        type: "AGE_ESTIMATED",
        payload: { estimationId: data.estimationId },
      });
    },
    onError: (error) => {
      console.error("Error estimating age", error);
      if (error) {
        toast.warning("Please make sure there's only one person in the photo");
      } else {
        toast.error("Error trying to estimate age");
      }
    },
  });

  return (
    <>
      <canvas ref={canvasRef} id="canvas" className="hidden"></canvas>
      {state.state === "no_photo" && <NoPhoto onTakePhoto={captureFrame} />}
      {state.state === "photo_taken" && (
        <PhotoTaken
          photo={state.photo!}
          onRetakePhoto={retakePhoto}
          onEstimateAge={estimateAge}
          isEstimating={isEstimating}
        />
      )}
      {state.state === "age_estimated" && (
        <AgeEstimated photo={state.photo!} estimationId={state.estimationId!} />
      )}
    </>
  );
};
