import { MainMenu } from "../components";

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
      title: "Bet on the Lens' Guess",
      description:
        "Bet on the Lens' Guess! if your bet is correct (or the closest), you win the pot!",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="min-h-20">
        <MainMenu withLogo />
      </div>
      <div className="flex flex-col justify-center items-center mb-12">
        <h1 className="text-[56px] font-bold mt-4">How to Play</h1>
        <div className="space-y-8 mt-4">
          {steps.map((step, index, steps) => (
            <div
              key={index}
              className="flex flex-col gap-4 items-center text-center font-montserrat"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center border-white border-2 border-opacity-40 text-[22px] font-normal">
                {index + 1}
              </div>
              <div>
                <h2 className="text-[22px] font-normal mb-2">{step.title}</h2>
                <p className="text-[16px] font-normal">{step.description}</p>
              </div>
              {index !== steps.length - 1 && (
                <div className="w-0 h-[24px] bg-white/20 border-[1px] border-solid border-white/20"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    // <div className="min-h-screen bg-gradient-to-b from-[#01184D] to-[#232194] text-white p-8">
    //   <div className="max-w-4xl mx-auto">
    //       <Link
    //         to="/"
    //         className="text-white/80 hover:text-white transition-colors"
    //       >
    //         ← Back to Home
    //       </Link>
    //       <h1 className="text-4xl font-bold">How to Play</h1>
    //     </div>

    //     <div className="space-y-8">
    //       {steps.map((step, index) => (
    //         <div
    //           key={index}
    //           className="bg-white/10 p-6 rounded-lg backdrop-blur-sm"
    //         >
    //           <div className="flex items-start gap-4">
    //             <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
    //               {index + 1}
    //             </div>
    //             <div>
    //               <h2 className="text-xl font-semibold mb-2">{step.title}</h2>
    //               <p className="text-white/80">{step.description}</p>
    //             </div>
    //           </div>
    //         </div>
    //       ))}
    //     </div>

    //     <div className="mt-12 text-center">
    //       <Link
    //         to="/guess"
    //         className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
    //       >
    //         Start Playing
    //       </Link>
    //     </div>
    //   </div>
    // </div>
  );
};
