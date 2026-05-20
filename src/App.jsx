import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import RockPaperScissorsGame from "./RockPaperScissorsGame";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Rock-Paper-Scissors Game</h1>
      <RockPaperScissorsGame />
    </div>
  );
}

// export default App
// import React from 'react';
// import RockPaperScissorsGame from './RockPaperScissorsGame';

// function App() {

// }

export default App;
