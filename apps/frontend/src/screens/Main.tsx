import clsx from "clsx";
import { Reducer, useCallback, useEffect, useReducer, useRef } from "react";
import { Button } from "../components";
import BackendAPI from "../services/backend";

type State = {
  state: "idle" | "no_photo" | "photo_taken" | "age_estimated";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, dispatch] = useReducer(reducer, {
    photo: null,
    age: null,
    state: "idle",
  });

  useEffect(() => {
    if (state.state === "no_photo" && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => (videoRef.current!.srcObject = stream));
    }
  }, [state.state, videoRef.current]);

  const startCamera = useCallback(async () => {
    dispatch({ type: "RESET" });
  }, [videoRef.current]);

  const captureFrame = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext("2d")!;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    const imageDataURL = canvasRef.current.toDataURL("image/jpeg");
    dispatch({ type: "TAKE_PHOTO", payload: imageDataURL });
  }, [canvasRef.current, videoRef.current]);

  const estimateAge = useCallback(async () => {
    if (!canvasRef.current || !state.photo) return;

    const { age } = await BackendAPI.estimateAge(state.photo);
    dispatch({ type: "SET_AGE", payload: age });
  }, [canvasRef.current, state.photo]);

  const applyFilter = useCallback(() => {}, []);

  return (
    <div className="max-w-7xl mx-20 py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center">
          {state.state === "no_photo" && (
            <video
              ref={videoRef}
              id="video"
              autoPlay
              playsInline
              className={clsx({
                "w-88 h-80": true,
              })}
            ></video>
          )}
          <canvas
            ref={canvasRef}
            id="canvas"
            className={clsx({
              "w-88 h-80": true,
              hidden: !["photo_taken", "age_estimated"].includes(state.state),
            })}
          ></canvas>
          <div className="flex gap-2">
            {state.state !== "no_photo" && (
              <Button onClick={startCamera}>
                {["idle"].includes(state.state)
                  ? "Start Camera"
                  : "Take another photo"}
              </Button>
            )}
            {state.state === "no_photo" && (
              <Button onClick={captureFrame}>Take Photo</Button>
            )}
            {state.state === "photo_taken" && (
              <Button onClick={estimateAge}>Estimate Age</Button>
            )}
            <select id="filter" onChange={applyFilter}>
              <option value="none">None</option>
              <option value="grayscale">Grayscale</option>
              <option value="invert">Invert</option>
              <option value="sepia">Sepia</option>
            </select>
          </div>
          {!!state.age && (
            <p id="age-result">We estimate you are {state.age} years old</p>
          )}
        </div>
      </div>
    </div>
  );
};
