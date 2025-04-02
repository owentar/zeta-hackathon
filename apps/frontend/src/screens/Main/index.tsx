import { Reducer, useCallback, useReducer, useRef } from "react";
import BackendAPI from "../../services/backend";
import { AgeEstimated } from "./AgeEstimated";
import { NoPhoto } from "./NoPhoto";
import { PhotoTaken } from "./PhotoTaken";

type State = {
  state: "no_photo" | "photo_taken" | "age_estimated";
  photo: string | null;
  age: number | null;
};

type Action =
  | {
      type: "TAKE_PHOTO";
      payload: string;
    }
  | {
      type: "SET_AGE";
      payload: number;
    }
  | { type: "RESET" };

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case "TAKE_PHOTO":
      return { ...state, photo: action.payload, state: "photo_taken" };
    case "SET_AGE":
      return { ...state, age: action.payload, state: "age_estimated" };
    case "RESET":
      return { photo: null, age: null, state: "no_photo" };
  }
};

export const Main: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, dispatch] = useReducer(reducer, {
    photo: null,
    age: null,
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

  const estimateAge = useCallback(async () => {
    if (!canvasRef.current || !state.photo) return;

    const { age } = await BackendAPI.estimateAge(state.photo);
    dispatch({ type: "SET_AGE", payload: age });
  }, [canvasRef.current, state.photo]);

  return (
    <>
      <canvas ref={canvasRef} id="canvas" className="hidden"></canvas>
      {state.state === "no_photo" && <NoPhoto onTakePhoto={captureFrame} />}
      {state.state === "photo_taken" && (
        <PhotoTaken
          photo={state.photo!}
          onRetakePhoto={retakePhoto}
          onEstimateAge={estimateAge}
        />
      )}
      {state.state === "age_estimated" && (
        <AgeEstimated photo={state.photo!} age={state.age!} />
      )}
    </>
  );
};
