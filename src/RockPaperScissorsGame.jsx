// // // import React, { useState, useRef, useEffect } from "react";
// // // import "./RockPaperScissorsGame.css";

// // // // --- Constants ---
// // // const BOX_SIZE = 600; // Size of the square container in pixels
// // // const IMAGE_SIZE = 40; // Assume each image is 40x40 pixels
// // // const NUM_IMAGES = 33; // Total images

// // // // Directions for each group (based on game design)
// // // // Group 1 (top-middle): will move downward (0, +speed)
// // // // Group 2 (bottom-right): will move up-left (-speed, -speed)
// // // // Group 3 (bottom-left): will move up-right (+speed, -speed)
// // // const SPEED = 2; // Base speed for all images

// // // // Standard RPS rules: returns winning type if different, or same if same.
// // // const getWinnerType = (typeA, typeB) => {
// // //   if (typeA === typeB) return typeA;
// // //   // rock loses to paper, paper loses to scissors, scissors lose to rock
// // //   if (
// // //     (typeA === "rock" && typeB === "paper") ||
// // //     (typeA === "paper" && typeB === "scissors") ||
// // //     (typeA === "scissors" && typeB === "rock")
// // //   ) {
// // //     return typeB;
// // //   }
// // //   return typeA;
// // // };

// // // // Utility to generate a random number in [min, max)
// // // const randRange = (min, max) => Math.random() * (max - min) + min;

// // // // Create initial image objects
// // // const createInitialImages = () => {
// // //   const images = [];
// // //   const types = ["rock", "paper", "scissors"];
// // //   // Determine approximate counts for three groups (for simplicity, first group gets extra if not divisible by 3)
// // //   const countGroup1 = Math.ceil(NUM_IMAGES / 3);
// // //   const countGroup2 = Math.floor(NUM_IMAGES / 3);
// // //   const countGroup3 = NUM_IMAGES - countGroup1 - countGroup2;

// // //   // Group 1: top-middle region, moving downward.
// // //   for (let i = 0; i < countGroup1; i++) {
// // //     images.push({
// // //       id: `img-${i}`,
// // //       type: types[Math.floor(Math.random() * types.length)],
// // //       // Scatter in a small region near the top middle
// // //       x: randRange(BOX_SIZE / 2 - 50, BOX_SIZE / 2 + 50),
// // //       y: randRange(10, 60),
// // //       vx: 0, // will move downward
// // //       vy: SPEED,
// // //     });
// // //   }

// // //   // Group 2: bottom-right region, moving up-left.
// // //   for (let i = countGroup1; i < countGroup1 + countGroup2; i++) {
// // //     images.push({
// // //       id: `img-${i}`,
// // //       type: types[Math.floor(Math.random() * types.length)],
// // //       // Scatter in bottom right area
// // //       x: randRange(BOX_SIZE - 120, BOX_SIZE - IMAGE_SIZE),
// // //       y: randRange(BOX_SIZE - 120, BOX_SIZE - IMAGE_SIZE),
// // //       vx: -SPEED,
// // //       vy: -SPEED,
// // //     });
// // //   }

// // //   // Group 3: bottom-left region, moving up-right.
// // //   for (let i = countGroup1 + countGroup2; i < NUM_IMAGES; i++) {
// // //     images.push({
// // //       id: `img-${i}`,
// // //       type: types[Math.floor(Math.random() * types.length)],
// // //       // Scatter in bottom left area
// // //       x: randRange(0, 70),
// // //       y: randRange(BOX_SIZE - 120, BOX_SIZE - IMAGE_SIZE),
// // //       vx: SPEED,
// // //       vy: -SPEED,
// // //     });
// // //   }

// // //   return images;
// // // };

// // // const RockPaperScissorsGame = () => {
// // //   const [images, setImages] = useState(createInitialImages());
// // //   const animationRef = useRef(null);
// // //   const containerRef = useRef(null);

// // //   // Collision detection: simple circular detection
// // //   const isColliding = (a, b) => {
// // //     const dx = a.x - b.x;
// // //     const dy = a.y - b.y;
// // //     // approximate each as circle with radius IMAGE_SIZE/2
// // //     const distance = Math.sqrt(dx * dx + dy * dy);
// // //     return distance < IMAGE_SIZE;
// // //   };

// // //   // Update positions, check collisions and bounce
// // //   const updatePositions = () => {
// // //     setImages((prevImages) => {
// // //       // copy images for mutation
// // //       const newImages = prevImages.map((img) => ({ ...img }));

// // //       // update position and handle boundary bounces
// // //       newImages.forEach((img) => {
// // //         img.x += img.vx;
// // //         img.y += img.vy;

// // //         // Bounce off left/right boundaries
// // //         if (img.x <= 0 || img.x + IMAGE_SIZE >= BOX_SIZE) {
// // //           img.vx = -img.vx;
// // //           // adjust position to avoid sticking to the boundary
// // //           img.x = Math.max(0, Math.min(img.x, BOX_SIZE - IMAGE_SIZE));
// // //         }
// // //         // Bounce off top/bottom boundaries
// // //         if (img.y <= 0 || img.y + IMAGE_SIZE >= BOX_SIZE) {
// // //           img.vy = -img.vy;
// // //           img.y = Math.max(0, Math.min(img.y, BOX_SIZE - IMAGE_SIZE));
// // //         }
// // //       });

// // //       // Collision detection and conversion (brute-force pair check)
// // //       for (let i = 0; i < newImages.length; i++) {
// // //         for (let j = i + 1; j < newImages.length; j++) {
// // //           if (isColliding(newImages[i], newImages[j])) {
// // //             // Determine winning type from the collision
// // //             const winnerType = getWinnerType(
// // //               newImages[i].type,
// // //               newImages[j].type
// // //             );
// // //             newImages[i].type = winnerType;
// // //             newImages[j].type = winnerType;
// // //           }
// // //         }
// // //       }
// // //       return newImages;
// // //     });
// // //   };

// // //   // Animation loop
// // //   const animate = () => {
// // //     updatePositions();
// // //     animationRef.current = requestAnimationFrame(animate);
// // //   };

// // //   useEffect(() => {
// // //     // Start the animation loop when component mounts
// // //     animationRef.current = requestAnimationFrame(animate);
// // //     return () => cancelAnimationFrame(animationRef.current);
// // //   }, []);

// // //   return (
// // //     <div className="game-container" ref={containerRef}>
// // //       {images.map((img) => (
// // //         <img
// // //           key={img.id}
// // //           src={`/${img.type}.png`} // assume your images are in public folder: rock.png, paper.png, scissors.png
// // //           alt={img.type}
// // //           className="rps-image"
// // //           style={{
// // //             left: img.x,
// // //             top: img.y,
// // //             width: IMAGE_SIZE,
// // //             height: IMAGE_SIZE,
// // //             position: "absolute",
// // //           }}
// // //         />
// // //       ))}
// // //     </div>
// // //   );
// // // };

// // // export default RockPaperScissorsGame;
// // import React, { useState, useRef, useEffect } from "react";
// // import "./RockPaperScissorsGame.css";

// // const BOX_SIZE = 600; // Size of the square container in pixels
// // const IMAGE_SIZE = 40; // Image dimensions in pixels
// // const NUM_IMAGES = 33; // Total number of images
// // const BASE_SPEED = 0.3; // Lower base speed for slow, smooth movement

// // // Returns the winning type given two types (RPS rules)
// // const getWinnerType = (typeA, typeB) => {
// //   if (typeA === typeB) return typeA;
// //   if (
// //     (typeA === "rock" && typeB === "paper") ||
// //     (typeA === "paper" && typeB === "scissors") ||
// //     (typeA === "scissors" && typeB === "rock")
// //   ) {
// //     return typeB;
// //   }
// //   return typeA;
// // };

// // // Utility for random number in [min, max)
// // const randRange = (min, max) => Math.random() * (max - min) + min;

// // // Utility to add small randomness to a base velocity
// // const addRandomOffset = (base) => base + randRange(-0.3, 0.3);

// // // Create initial images with random starting positions and slightly varied velocities
// // const createInitialImages = () => {
// //   const images = [];
// //   const types = ["rock", "paper", "scissors"];

// //   // Divide into three groups
// //   const countGroup1 = Math.ceil(NUM_IMAGES / 3);
// //   const countGroup2 = Math.floor(NUM_IMAGES / 3);
// //   const countGroup3 = NUM_IMAGES - countGroup1 - countGroup2;

// //   // Group 1: Top-middle region, moving downward (base vx: 0, vy: BASE_SPEED)
// //   for (let i = 0; i < countGroup1; i++) {
// //     images.push({
// //       id: `img-${i}`,
// //       type: types[Math.floor(Math.random() * types.length)],
// //       // Scatter within a 150px wide region around the center top
// //       x: randRange(BOX_SIZE / 2 - 75, BOX_SIZE / 2 + 75),
// //       y: randRange(10, 80),
// //       vx: addRandomOffset(0),
// //       vy: addRandomOffset(BASE_SPEED),
// //     });
// //   }

// //   // Group 2: Bottom-right region, moving up-left (base vx: -BASE_SPEED, vy: -BASE_SPEED)
// //   for (let i = countGroup1; i < countGroup1 + countGroup2; i++) {
// //     images.push({
// //       id: `img-${i}`,
// //       type: types[Math.floor(Math.random() * types.length)],
// //       // Scatter within bottom right area
// //       x: randRange(BOX_SIZE - 150, BOX_SIZE - IMAGE_SIZE),
// //       y: randRange(BOX_SIZE - 150, BOX_SIZE - IMAGE_SIZE),
// //       vx: addRandomOffset(-BASE_SPEED),
// //       vy: addRandomOffset(-BASE_SPEED),
// //     });
// //   }

// //   // Group 3: Bottom-left region, moving up-right (base vx: BASE_SPEED, vy: -BASE_SPEED)
// //   for (let i = countGroup1 + countGroup2; i < NUM_IMAGES; i++) {
// //     images.push({
// //       id: `img-${i}`,
// //       type: types[Math.floor(Math.random() * types.length)],
// //       // Scatter within bottom left area
// //       x: randRange(10, 100),
// //       y: randRange(BOX_SIZE - 150, BOX_SIZE - IMAGE_SIZE),
// //       vx: addRandomOffset(BASE_SPEED),
// //       vy: addRandomOffset(-BASE_SPEED),
// //     });
// //   }

// //   return images;
// // };

// // const RockPaperScissorsGame = () => {
// //   const [images, setImages] = useState(createInitialImages());
// //   const animationRef = useRef(null);

// //   // Simple collision detection: treating each image as a circle with radius IMAGE_SIZE/2
// //   const isColliding = (a, b) => {
// //     const dx = a.x - b.x;
// //     const dy = a.y - b.y;
// //     return Math.sqrt(dx * dx + dy * dy) < IMAGE_SIZE;
// //   };

// //   // Update positions, handle bouncing, and process collisions
// //   const updatePositions = () => {
// //     setImages((prevImages) => {
// //       const newImages = prevImages.map((img) => ({ ...img }));

// //       newImages.forEach((img) => {
// //         img.x += img.vx;
// //         img.y += img.vy;

// //         // Check for collisions with vertical boundaries
// //         if (img.x <= 0 || img.x + IMAGE_SIZE >= BOX_SIZE) {
// //           img.vx = -img.vx;
// //           img.x = Math.max(0, Math.min(img.x, BOX_SIZE - IMAGE_SIZE));
// //         }
// //         // Check for collisions with horizontal boundaries
// //         if (img.y <= 0 || img.y + IMAGE_SIZE >= BOX_SIZE) {
// //           img.vy = -img.vy;
// //           img.y = Math.max(0, Math.min(img.y, BOX_SIZE - IMAGE_SIZE));
// //         }
// //       });

// //       // Check for collisions between images and apply RPS logic
// //       for (let i = 0; i < newImages.length; i++) {
// //         for (let j = i + 1; j < newImages.length; j++) {
// //           if (isColliding(newImages[i], newImages[j])) {
// //             const winnerType = getWinnerType(
// //               newImages[i].type,
// //               newImages[j].type
// //             );
// //             newImages[i].type = winnerType;
// //             newImages[j].type = winnerType;
// //           }
// //         }
// //       }
// //       return newImages;
// //     });
// //   };

// //   const animate = () => {
// //     updatePositions();
// //     animationRef.current = requestAnimationFrame(animate);
// //   };

// //   useEffect(() => {
// //     animationRef.current = requestAnimationFrame(animate);
// //     return () => cancelAnimationFrame(animationRef.current);
// //   }, []);

// //   return (
// //     <div className="game-container">
// //       {images.map((img) => (
// //         <img
// //           key={img.id}
// //           src={`/${img.type}.png`}
// //           alt={img.type}
// //           className="rps-image"
// //           style={{
// //             left: img.x,
// //             top: img.y,
// //             width: IMAGE_SIZE,
// //             height: IMAGE_SIZE,
// //             position: "absolute",
// //           }}
// //         />
// //       ))}
// //     </div>
// //   );
// // };

// // export default RockPaperScissorsGame;
// import React, { useState, useRef, useEffect } from "react";
// import "./RockPaperScissorsGame.css";

// const BOX_SIZE = 600; // Size of the container in pixels
// const IMAGE_SIZE = 40; // Image dimensions in pixels
// const TOTAL_IMAGES = 99; // Total images (99)
// const GROUP_COUNT = 33; // 33 images per type
// const BASE_SPEED = 0.3; // Base speed for slow, smooth movement

// // Returns the winning type based on standard RPS rules
// const getWinnerType = (typeA, typeB) => {
//   if (typeA === typeB) return typeA;
//   if (
//     (typeA === "rock" && typeB === "paper") ||
//     (typeA === "paper" && typeB === "scissors") ||
//     (typeA === "scissors" && typeB === "rock")
//   ) {
//     return typeB;
//   }
//   return typeA;
// };

// // Utility for a random number in [min, max)
// const randRange = (min, max) => Math.random() * (max - min) + min;

// // Utility to generate a random velocity vector using a random angle (with a slight random offset)
// const getRandomVelocity = () => {
//   const angle = Math.random() * Math.PI * 2;
//   const vx = BASE_SPEED * Math.cos(angle) + randRange(-0.3, 0.3);
//   const vy = BASE_SPEED * Math.sin(angle) + randRange(-0.3, 0.3);
//   return { vx, vy };
// };

// // Create initial images with fixed types and starting positions
// const createInitialImages = () => {
//   const images = [];

//   // Group 1: Scissors at middle top
//   for (let i = 0; i < GROUP_COUNT; i++) {
//     const { vx, vy } = getRandomVelocity();
//     images.push({
//       id: `img-scissors-${i}`,
//       type: "scissors",
//       // Scatter around the middle top area
//       x: randRange(BOX_SIZE / 2 - 75, BOX_SIZE / 2 + 75),
//       y: randRange(10, 80),
//       vx,
//       vy,
//     });
//   }

//   // Group 2: Rock at bottom left
//   for (let i = 0; i < GROUP_COUNT; i++) {
//     const { vx, vy } = getRandomVelocity();
//     images.push({
//       id: `img-rock-${i}`,
//       type: "rock",
//       // Scatter around the bottom left area
//       x: randRange(10, 100),
//       y: randRange(BOX_SIZE - 150, BOX_SIZE - IMAGE_SIZE),
//       vx,
//       vy,
//     });
//   }

//   // Group 3: Paper at bottom right
//   for (let i = 0; i < GROUP_COUNT; i++) {
//     const { vx, vy } = getRandomVelocity();
//     images.push({
//       id: `img-paper-${i}`,
//       type: "paper",
//       // Scatter around the bottom right area
//       x: randRange(BOX_SIZE - 150, BOX_SIZE - IMAGE_SIZE),
//       y: randRange(BOX_SIZE - 150, BOX_SIZE - IMAGE_SIZE),
//       vx,
//       vy,
//     });
//   }

//   return images;
// };

// const RockPaperScissorsGame = () => {
//   const [images, setImages] = useState(createInitialImages());
//   const animationRef = useRef(null);

//   // Simple collision detection: treat each image as a circle with radius IMAGE_SIZE/2
//   const isColliding = (a, b) => {
//     const dx = a.x - b.x;
//     const dy = a.y - b.y;
//     return Math.sqrt(dx * dx + dy * dy) < IMAGE_SIZE;
//   };

//   // Update positions, bounce off boundaries, and process collisions with RPS logic
//   const updatePositions = () => {
//     setImages((prevImages) => {
//       const newImages = prevImages.map((img) => ({ ...img }));

//       newImages.forEach((img) => {
//         img.x += img.vx;
//         img.y += img.vy;

//         // Bounce off left/right boundaries
//         if (img.x <= 0 || img.x + IMAGE_SIZE >= BOX_SIZE) {
//           img.vx = -img.vx;
//           img.x = Math.max(0, Math.min(img.x, BOX_SIZE - IMAGE_SIZE));
//         }
//         // Bounce off top/bottom boundaries
//         if (img.y <= 0 || img.y + IMAGE_SIZE >= BOX_SIZE) {
//           img.vy = -img.vy;
//           img.y = Math.max(0, Math.min(img.y, BOX_SIZE - IMAGE_SIZE));
//         }
//       });

//       // Check for collisions between images and apply RPS conversion logic
//       for (let i = 0; i < newImages.length; i++) {
//         for (let j = i + 1; j < newImages.length; j++) {
//           if (isColliding(newImages[i], newImages[j])) {
//             const winnerType = getWinnerType(
//               newImages[i].type,
//               newImages[j].type
//             );
//             newImages[i].type = winnerType;
//             newImages[j].type = winnerType;
//           }
//         }
//       }
//       return newImages;
//     });
//   };

//   const animate = () => {
//     updatePositions();
//     animationRef.current = requestAnimationFrame(animate);
//   };

//   useEffect(() => {
//     animationRef.current = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(animationRef.current);
//   }, []);

//   return (
//     <div className="game-container">
//       {images.map((img) => (
//         <img
//           key={img.id}
//           src={`/${img.type}.png`} // Ensure these images exist in your public folder
//           alt={img.type}
//           className="rps-image"
//           style={{
//             left: img.x,
//             top: img.y,
//             width: IMAGE_SIZE,
//             height: IMAGE_SIZE,
//             position: "absolute",
//           }}
//         />
//       ))}
//     </div>
//   );
// };

// export default RockPaperScissorsGame;
import React, { useState, useRef, useEffect } from "react";
import "./RockPaperScissorsGame.css";

const BOX_SIZE = 600; // Container size in pixels
const IMAGE_SIZE = 40; // Image dimensions in pixels
const TOTAL_PER_TYPE = 33; // 33 images for each type (total 99)
const BASE_SPEED = 0.3; // Base speed for movement

// RPS rules: returns the winning type given two types.
const getWinnerType = (typeA, typeB) => {
  if (typeA === typeB) return typeA;
  if (
    (typeA === "rock" && typeB === "paper") ||
    (typeA === "paper" && typeB === "scissors") ||
    (typeA === "scissors" && typeB === "rock")
  ) {
    return typeB;
  }
  return typeA;
};

// Utility: random number between min (inclusive) and max (exclusive)
const randRange = (min, max) => Math.random() * (max - min) + min;

// Generate a random velocity vector with slight randomness.
const getRandomVelocity = () => {
  const angle = Math.random() * Math.PI * 2;
  const vx = BASE_SPEED * Math.cos(angle) + randRange(-0.3, 0.3);
  const vy = BASE_SPEED * Math.sin(angle) + randRange(-0.3, 0.3);
  return { vx, vy };
};

// Create initial images with fixed starting positions per type.
// - Scissors: middle top
// - Rock: bottom left
// - Paper: bottom right
const createInitialImages = () => {
  const images = [];

  // Scissors group (middle top)
  for (let i = 0; i < TOTAL_PER_TYPE; i++) {
    const { vx, vy } = getRandomVelocity();
    images.push({
      id: `img-scissors-${i}`,
      type: "scissors",
      x: randRange(BOX_SIZE / 2 - 75, BOX_SIZE / 2 + 75),
      y: randRange(10, 80),
      vx,
      vy,
    });
  }

  // Rock group (bottom left)
  for (let i = 0; i < TOTAL_PER_TYPE; i++) {
    const { vx, vy } = getRandomVelocity();
    images.push({
      id: `img-rock-${i}`,
      type: "rock",
      x: randRange(10, 100),
      y: randRange(BOX_SIZE - 150, BOX_SIZE - IMAGE_SIZE),
      vx,
      vy,
    });
  }

  // Paper group (bottom right)
  for (let i = 0; i < TOTAL_PER_TYPE; i++) {
    const { vx, vy } = getRandomVelocity();
    images.push({
      id: `img-paper-${i}`,
      type: "paper",
      x: randRange(BOX_SIZE - 150, BOX_SIZE - IMAGE_SIZE),
      y: randRange(BOX_SIZE - 150, BOX_SIZE - IMAGE_SIZE),
      vx,
      vy,
    });
  }
  return images;
};

const RockPaperScissorsGame = () => {
  const [images, setImages] = useState(createInitialImages());
  const [gameOver, setGameOver] = useState(null); // null means game is running
  const animationRef = useRef(null);

  // Helper: collision detection between two images (using circle approximation)
  const isColliding = (a, b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy) < IMAGE_SIZE;
  };

  // Update positions of images, bounce off boundaries, and process collisions.
  const updatePositions = () => {
    setImages((prevImages) => {
      const newImages = prevImages.map((img) => ({ ...img }));

      // Update positions and bounce off walls.
      newImages.forEach((img) => {
        img.x += img.vx;
        img.y += img.vy;

        // Bounce off left/right boundaries.
        if (img.x <= 0 || img.x + IMAGE_SIZE >= BOX_SIZE) {
          img.vx = -img.vx;
          img.x = Math.max(0, Math.min(img.x, BOX_SIZE - IMAGE_SIZE));
        }
        // Bounce off top/bottom boundaries.
        if (img.y <= 0 || img.y + IMAGE_SIZE >= BOX_SIZE) {
          img.vy = -img.vy;
          img.y = Math.max(0, Math.min(img.y, BOX_SIZE - IMAGE_SIZE));
        }
      });

      // Check for collisions and apply RPS logic.
      for (let i = 0; i < newImages.length; i++) {
        for (let j = i + 1; j < newImages.length; j++) {
          if (isColliding(newImages[i], newImages[j])) {
            const winnerType = getWinnerType(
              newImages[i].type,
              newImages[j].type
            );
            newImages[i].type = winnerType;
            newImages[j].type = winnerType;
          }
        }
      }

      // Compute counts.
      const rockCount = newImages.filter((img) => img.type === "rock").length;
      const paperCount = newImages.filter((img) => img.type === "paper").length;
      const scissorsCount = newImages.filter(
        (img) => img.type === "scissors"
      ).length;

      // Check for game over: if two types are reduced to 0.
      if (
        (rockCount === 0 && paperCount === 0) ||
        (rockCount === 0 && scissorsCount === 0) ||
        (paperCount === 0 && scissorsCount === 0)
      ) {
        const winner =
          rockCount > 0 ? "rock" : paperCount > 0 ? "paper" : "scissors";
        setGameOver({ winner, rockCount, paperCount, scissorsCount });
        // Stop the animation loop.
        cancelAnimationFrame(animationRef.current);
      }

      return newImages;
    });
  };

  const animate = () => {
    updatePositions();
    // Continue animation if game is not over.
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // Restart the game to initial state.
  const restartGame = () => {
    setImages(createInitialImages());
    setGameOver(null);
    animationRef.current = requestAnimationFrame(animate);
  };

  // Compute current counts from images state.
  const rockCount = images.filter((img) => img.type === "rock").length;
  const paperCount = images.filter((img) => img.type === "paper").length;
  const scissorsCount = images.filter((img) => img.type === "scissors").length;

  return (
    <div className="game-wrapper">
      <header className="game-header">
        <div className="count">
          Rock:{" "}
          <span style={{ color: rockCount === 0 ? "red" : "blue" }}>
            {rockCount}
          </span>
        </div>
        <div className="count">
          Paper:{" "}
          <span style={{ color: paperCount === 0 ? "red" : "blue" }}>
            {paperCount}
          </span>
        </div>
        <div className="count">
          Scissors:{" "}
          <span style={{ color: scissorsCount === 0 ? "red" : "blue" }}>
            {scissorsCount}
          </span>
        </div>
      </header>

      <div className="game-container">
        {images.map((img) => (
          <img
            key={img.id}
            src={`/${img.type}.png`}
            alt={img.type}
            className="rps-image"
            style={{
              left: img.x,
              top: img.y,
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              position: "absolute",
            }}
          />
        ))}
      </div>

      {gameOver && (
        <div className="popup">
          <div className="popup-content">
            <h2>{gameOver.winner.toUpperCase()} wins!</h2>
            <p>
              Game Over. {gameOver.winner.toUpperCase()} is the last remaining
              type.
            </p>
            <button onClick={restartGame}>Restart Game</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RockPaperScissorsGame;
