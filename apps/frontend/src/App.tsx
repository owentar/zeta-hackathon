import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Feed } from "./screens/Feed";
import { GuessScreen } from "./screens/GuessScreen";
import { HowToPlay } from "./screens/HowToPlay";
import { Landing } from "./screens/Landing";
import { Main } from "./screens/Main";

export const App = () => {
  return (
    <Router>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-b from-[#01184D] to-[#232194] text-white">
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/how_to_play" element={<HowToPlay />} />
            <Route path="/guess" element={<Main />} />
            <Route path="/guess/:id" element={<GuessScreen />} />
            <Route path="/feed" element={<Feed />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
