import React, { useEffect, useRef, useState } from "react";
import "./RockPaperScissorsGame.css";

const BOX_SIZE = 600;
const IMAGE_SIZE = 40;
const INITIAL_PER_TYPE = 33;
const MAX_ADDITIONS_PER_TYPE = 12;
const BASE_SPEED = 0.3;
const SPAWN_ANIMATION_MS = 900;
const SPAWN_PROTECTION_MS = 1000;

const PARTY_CONFIG = {
  cjp: {
    label: "CJP",
    name: "Cockroach Janta Party",
    asset: "cjp.svg",
    color: "#5c3417",
  },
  bjp: {
    label: "BJP",
    name: "Bharti Chanta Party",
    asset: "bjp.svg",
    color: "#f0861d",
  },
  congress: {
    label: "Congress",
    name: "Congress",
    asset: "congress.svg",
    color: "#2d8f5b",
  },
};

const TYPES = Object.keys(PARTY_CONFIG);

const STARTING_ZONES = {
  cjp: {
    xRange: [BOX_SIZE / 2 - 75, BOX_SIZE / 2 + 75],
    yRange: [10, 80],
  },
  bjp: {
    xRange: [10, 100],
    yRange: [BOX_SIZE - 150, BOX_SIZE - IMAGE_SIZE],
  },
  congress: {
    xRange: [BOX_SIZE - 150, BOX_SIZE - IMAGE_SIZE],
    yRange: [BOX_SIZE - 150, BOX_SIZE - IMAGE_SIZE],
  },
};

const DEFEATS = {
  cjp: "congress",
  congress: "bjp",
  bjp: "cjp",
};

const createEmptyCounts = () =>
  TYPES.reduce((counts, type) => {
    counts[type] = 0;
    return counts;
  }, {});

const randRange = (min, max) => Math.random() * (max - min) + min;

const getRandomVelocity = () => {
  const angle = Math.random() * Math.PI * 2;
  const vx = BASE_SPEED * Math.cos(angle) + randRange(-0.3, 0.3);
  const vy = BASE_SPEED * Math.sin(angle) + randRange(-0.3, 0.3);
  return { vx, vy };
};

const getWinnerType = (typeA, typeB) => {
  if (typeA === typeB) return typeA;
  return DEFEATS[typeA] === typeB ? typeA : typeB;
};

const createImage = (
  type,
  id,
  xRange = [0, BOX_SIZE - IMAGE_SIZE],
  yRange = [0, BOX_SIZE - IMAGE_SIZE],
  isNew = false
) => {
  const { vx, vy } = getRandomVelocity();
  const spawnedAt = isNew ? Date.now() : null;

  return {
    id: `img-${type}-${id}`,
    type,
    x: randRange(...xRange),
    y: randRange(...yRange),
    vx,
    vy,
    isNew,
    spawnedAt,
    protectedUntil: isNew ? spawnedAt + SPAWN_PROTECTION_MS : 0,
  };
};

const countImagesByType = (images) =>
  images.reduce((counts, img) => {
    counts[img.type] += 1;
    return counts;
  }, createEmptyCounts());

const createInitialImages = () => {
  const images = [];

  TYPES.forEach((type) => {
    const { xRange, yRange } = STARTING_ZONES[type];

    for (let i = 0; i < INITIAL_PER_TYPE; i += 1) {
      images.push(createImage(type, i, xRange, yRange));
    }
  });

  return images;
};

const RockPaperScissorsGame = () => {
  const [images, setImages] = useState(createInitialImages);
  const [gameOver, setGameOver] = useState(null);
  const [started, setStarted] = useState(false);
  const [additionCounts, setAdditionCounts] = useState(createEmptyCounts);
  const animationRef = useRef(null);
  const nextIdRef = useRef(INITIAL_PER_TYPE);
  const additionCountsRef = useRef(createEmptyCounts());

  const isColliding = (a, b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy) < IMAGE_SIZE;
  };

  useEffect(() => {
    if (!started || gameOver) return undefined;

    const updatePositions = () => {
      setImages((prevImages) => {
        const now = Date.now();
        const newImages = prevImages.map((img) => ({ ...img }));

        newImages.forEach((img) => {
          img.x += img.vx;
          img.y += img.vy;

          if (img.x <= 0 || img.x + IMAGE_SIZE >= BOX_SIZE) {
            img.vx = -img.vx;
            img.x = Math.max(0, Math.min(img.x, BOX_SIZE - IMAGE_SIZE));
          }

          if (img.y <= 0 || img.y + IMAGE_SIZE >= BOX_SIZE) {
            img.vy = -img.vy;
            img.y = Math.max(0, Math.min(img.y, BOX_SIZE - IMAGE_SIZE));
          }

          if (img.isNew && img.spawnedAt && now - img.spawnedAt > SPAWN_ANIMATION_MS) {
            img.isNew = false;
            img.spawnedAt = null;
          }

          if (img.protectedUntil && now >= img.protectedUntil) {
            img.protectedUntil = 0;
          }
        });

        const isProtected = (img) =>
          Boolean(img.protectedUntil && now < img.protectedUntil);

        for (let i = 0; i < newImages.length; i += 1) {
          for (let j = i + 1; j < newImages.length; j += 1) {
            if (isProtected(newImages[i]) || isProtected(newImages[j])) {
              continue;
            }

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

        const counts = countImagesByType(newImages);
        const activeTypes = TYPES.filter((type) => counts[type] > 0);

        if (activeTypes.length === 1) {
          setGameOver({ winner: activeTypes[0] });
          cancelAnimationFrame(animationRef.current);
        }

        return newImages;
      });
    };

    const animate = () => {
      updatePositions();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameOver, started]);

  const restartGame = () => {
    cancelAnimationFrame(animationRef.current);
    setImages(createInitialImages());
    setGameOver(null);
    setStarted(false);
    nextIdRef.current = INITIAL_PER_TYPE;
    additionCountsRef.current = createEmptyCounts();
    setAdditionCounts(createEmptyCounts());
  };

  const addImages = (typesToAdd) => {
    if (gameOver) return;

    const nextCounts = { ...additionCountsRef.current };
    const spawnQueue = [];

    typesToAdd.forEach((type) => {
      if (nextCounts[type] < MAX_ADDITIONS_PER_TYPE) {
        nextCounts[type] += 1;
        spawnQueue.push(type);
      }
    });

    if (spawnQueue.length === 0) return;

    additionCountsRef.current = nextCounts;
    setAdditionCounts(nextCounts);
    setImages((prevImages) => [
      ...prevImages,
      ...spawnQueue.map((type) =>
        createImage(type, nextIdRef.current++, undefined, undefined, true)
      ),
    ]);
  };

  const counts = countImagesByType(images);
  const canAddType = (type) => additionCounts[type] < MAX_ADDITIONS_PER_TYPE;
  const canAddAll = TYPES.every((type) => canAddType(type));
  const getAddsLeft = (type) => MAX_ADDITIONS_PER_TYPE - additionCounts[type];

  return (
    <div className="game-wrapper">
      <header className="game-header">
        {TYPES.map((type) => (
          <div className="count" key={type}>
            {PARTY_CONFIG[type].label}:{" "}
            <span
              style={{
                color: counts[type] === 0 ? "#bf1f1f" : PARTY_CONFIG[type].color,
              }}
            >
              {counts[type]}
            </span>
          </div>
        ))}
      </header>

      <div className="spawn-controls">
        <button
          type="button"
          onClick={() => addImages(TYPES)}
          disabled={!canAddAll || gameOver}
        >
          Add All
        </button>
        {TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => addImages([type])}
            disabled={!canAddType(type) || gameOver}
          >
            Add {PARTY_CONFIG[type].label} ({getAddsLeft(type)} left)
          </button>
        ))}
      </div>

      <p className="spawn-limit-note">
        Each party can be added up to {MAX_ADDITIONS_PER_TYPE} extra times.
      </p>

      <div className="game-container">
        {images.map((img) => (
          <div
            key={img.id}
            className={`rps-piece ${img.isNew ? `rps-piece--spawned rps-piece--${img.type}` : ""}`}
            style={{
              left: img.x,
              top: img.y,
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              position: "absolute",
            }}
          >
            <img
              src={`/${PARTY_CONFIG[img.type].asset}`}
              alt={PARTY_CONFIG[img.type].name}
              className="rps-image"
            />
          </div>
        ))}

        {!started && !gameOver && (
          <div className="start-overlay">
            <button className="start-button" onClick={() => setStarted(true)}>
              Start
            </button>
          </div>
        )}
      </div>

      {gameOver && (
        <div className="popup">
          <div className="popup-content">
            <h2>{PARTY_CONFIG[gameOver.winner].label} wins!</h2>
            <p>
              Game Over. {PARTY_CONFIG[gameOver.winner].name} is the last
              remaining party.
            </p>
            <button onClick={restartGame}>Restart Game</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RockPaperScissorsGame;
