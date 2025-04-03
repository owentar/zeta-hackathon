import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { HowToPlay } from "./screens/HowToPlay";
import { Landing } from "./screens/Landing";
import { Main } from "./screens/Main";

export const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-b from-[#01184D] to-[#232194] text-white">
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/how_to_play" element={<HowToPlay />} />
            <Route path="/guess" element={<Main />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
