import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Main } from "./screens/Main";

export const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#01184D] to-[#232194] text-white">
      <header className="shadow flex justify-between items-center p-4 mx-20">
        <div className="">
          <h1 className="text-3xl font-bold">Age Lens</h1>
        </div>
        <div>
          <ConnectButton />
        </div>
      </header>
      <main>
        <Main />
      </main>
    </div>
  );
};

export default App;
