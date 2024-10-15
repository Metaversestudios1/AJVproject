import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

// const socket = io(`http://localhost:8000`);
// const socket = io('https://aviatorgame-backend.vercel.app', {
//   transports: ['websocket'], // Ensure you're using WebSocket for better connectivity
// });

const socket = io('http://localhost:8000', {
  path: '/socket.io', // Ensure this matches the server setup
  transports: ['websocket'], // Specify the transport method if necessary
});


socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err);
});

console.log(socket);
function AviatorGame() {
  const [betAmount, setBetAmount] = useState(5);
  const [multiplier, setMultiplier] = useState(0);
  const [isBetPlaced, setIsBetPlaced] = useState(false);
  const [isBettingOpen, setIsBettingOpen] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [showLoader, setShowLoader] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [planePosition, setPlanePosition] = useState({ x: 0, y: 0 });
  const [isPlaneVisible, setIsPlaneVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [cashOutMultiplier, setCashOutMultiplier] = useState("");
  const [crashPoint, setCrashPoint] = useState("");

  const gameRef = useRef(null);

  useEffect(() => {
    socket.on("multiplier_reset", () => {
      setIsBetPlaced(false);
      setBetAmount(0);
      setLoadingComplete(false);
      setIsPlaneVisible(false); // Hide the plane during loading
      setTimeout(() => {
        setIsCrashed(false);
        setShowLoader(true);
        setMessage("");
        setCrashPoint("");
      }, 2000);
      setTimeout(() => {
        setShowLoader(false);
        setLoadingComplete(true);
        setIsPlaneVisible(true); // Show the plane after loading
        movePlaneDiagonally(); // Start plane movement
        setMessage("");
        setWinnings(0);
      }, 5000);
    });

    socket.on("betting_open", () => {
      setIsBettingOpen(true);
    });

    socket.on("betting_close", () => {
      setIsBettingOpen(false);
    });

    socket.on("multiplier_update", (data) => {
      setMultiplier(data.multiplier);

      // Ensure the plane becomes visible when multiplier updates
      if (!isCrashed && !isPlaneVisible) {
        setIsPlaneVisible(true);
        movePlaneDiagonally(); // Move the plane if it's not crashed
      }
    });

    socket.on("plane_crash", ({ crashPoint }) => {
      setIsCrashed(true);
      setShowLoader(true);
      setMessage(`Flew away`);
      setCrashPoint(crashPoint);
      resetPlanePosition();
    });

    socket.on("cash_out_success", (data) => {
      setCashOutMultiplier(data.message);
      setWinnings(data.winnings);
    });

    return () => {
      socket.off("multiplier_reset");
      socket.off("betting_open");
      socket.off("betting_close");
      socket.off("multiplier_update");
      socket.off("plane_crash");
      socket.off("cash_out_success");
    };
  }, [isPlaneVisible, isCrashed]);

  const resetPlanePosition = () => {
    setTimeout(() => {
      setPlanePosition({ x: 0, y: 0 });
      setShowLoader(false);
    }, 5000);
  };

  const movePlaneDiagonally = () => {
    const gameWidth = gameRef.current.offsetWidth;
    const gameHeight = gameRef.current.offsetHeight;

    let xPos = 0;
    let yPos = 0;

    const interval = setInterval(() => {
      xPos += gameWidth / 100; // Move by 1% of the width each interval
      yPos += gameHeight / 100; // Move by 1% of the height each interval

      setPlanePosition({ x: xPos, y: yPos });

      // Stop when it reaches the end of the screen (with 10px margin)
      if (xPos >= gameWidth - 70 || yPos >= gameHeight - 95) {
        clearInterval(interval);
        oscillatePlane(xPos, yPos); // Pass the final position to the oscillate function
      }
    }, 50); // Update every 50ms
  };

  const oscillatePlane = (finalX, finalY) => {
    const oscillationAmplitude = 14; // Height of oscillation
    const oscillationFrequency = 0.1; // Speed of oscillation
    let oscillationPhase = 0;

    // Start oscillating from the final position
    const oscillationInterval = setInterval(() => {
      oscillationPhase += oscillationFrequency;
      const newY = finalY + oscillationAmplitude * Math.sin(oscillationPhase);
      setPlanePosition({ x: finalX, y: newY }); // Keep X position constant and update Y

      // Stop oscillation after a certain period (e.g., 2 seconds)
      if (isCrashed) {
        clearInterval(oscillationInterval);
      }
    }, 50); // Update every 50ms
  };

  const handlePlaceBet = () => {
    if (betAmount > 0 && isBettingOpen) {
      socket.emit("place_bet", betAmount);
      setIsBetPlaced(true);
    }
  };

  const handleCashOut = () => {
    if (multiplier > 0 && !isCrashed) {
      socket.emit("cash_out");
      setIsBetPlaced(false); // Disable cashout after it's clicked
    }
  };

  // Conditionally render the bet or cashout button based on game state
  const renderActionButton = () => {
    if (isCrashed) {
      return (
        <button disabled className="bg-green-900 p-3 text-white rounded-lg">
          Place Bet
        </button>
      );
    }

    if (isBetPlaced) {
      return (
        <button
          onClick={handleCashOut}
          disabled={isCrashed}
          className="bg-green-900 p-3 text-white rounded-lg"
        >
          Cash Out
        </button>
      );
    }

    return (
      <button
        onClick={handlePlaceBet}
        disabled={!isBettingOpen || isBetPlaced}
        className="bg-green-900 p-3 text-white rounded-lg"
      >
        Place Bet
      </button>
    );
  };

  return (
    <div className="game-container">
      <div className="game-screen">
        <div className="history text-xl">History of bets</div>
        <div
          className="game"
          ref={gameRef}
          style={{ position: "relative", overflow: "hidden" }}
        >
          {isPlaneVisible && (
            <img
              className="plane"
              src="/plane.png"
              alt="Flying Plane"
              style={{
                transform: `translate(${planePosition.x}px, -${planePosition.y}px)`,
                transition: "transform 50ms linear",
              }}
            />
          )}
          {(!isCrashed && !showLoader) ? (
            <div className="absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 z-50 text-5xl font-extrabold">
              {multiplier}x
            </div>
          ) : (
            <>
              <div className="absolute top-[15%] left-2/4 -translate-x-2/4 -translate-y-2/4 z-50 ">
                <div className="text-3xl font-bold">{message}</div>
                <div className="text-3xl text-[#de3232] font-bold">{crashPoint}</div>
              </div>
            </>
          )}
          {showLoader && (
            <img
              src="/loading.png"
              alt="loading"
              className={`${showLoader ? "loading" : "hidden"}`}
            />
          )}
          <p
            className={`${
              showLoader ? "mt-36 text-[#d20637] text-lg" : "hidden"
            }`}
          >
            Loading...
          </p>
        </div>
        <div className="bet flex justify-center items-center">
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="Place Bet"
            className="p-[10px] rounded-lg"
          />
          {renderActionButton()}
          <p className="text-lg text-white ml-5">
            {winnings
              ? `Your Winnings: ${winnings} at ${cashOutMultiplier}`
              : `Your Winnings: $0`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AviatorGame;
