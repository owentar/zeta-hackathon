import { Link } from "react-router-dom";

export const HowToPlay = () => {
  const steps = [
    {
      title: "Connect Your Wallet",
      description:
        "Connect your wallet to the ZetaChain network to start playing.",
    },
    {
      title: "Take a Photo",
      description: "Use your camera to take a photo of yourself.",
    },
    {
      title: "Get Your Age Estimate",
      description: "Our AI will analyze your photo and estimate your age.",
    },
    {
      title: "Win Rewards",
      description:
        "If our estimate is close to your actual age, you win rewards!",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#01184D] to-[#232194] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <Link
            to="/"
            className="text-white/80 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold">How to Play</h1>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white/10 p-6 rounded-lg backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">{step.title}</h2>
                  <p className="text-white/80">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/guess"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Start Playing
          </Link>
        </div>
      </div>
    </div>
  );
};
