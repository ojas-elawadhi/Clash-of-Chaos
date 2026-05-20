import React, { useEffect, useRef, useState } from "react";
import "./RockPaperScissorsGame.css";

const BOX_SIZE = 600;
const IMAGE_SIZE = 40;
const INITIAL_PER_TYPE = 33;
const BASE_SPEED = 0.3;
const SPAWN_ANIMATION_MS = 900;
const SPAWN_PROTECTION_MS = 1000;
const SHUFFLE_PROTECTION_MS = 750;
const GLOBAL_COOLDOWN_MS = 3000;
const SPEED_BOOST_MS = 3000;
const SPEED_BOOST_MULTIPLIER = 2;
const MAGNET_MS = 2000;
const MAGNET_PULL_STRENGTH = 0.7;
const SHUFFLE_FLASH_MS = 500;
const PLUS_TEN_AMOUNT = 10;
const COOLDOWN_TICK_MS = 100;

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
const POWER_UP_CONFIG = {
  plusTen: {
    label: "+10",
    maxUses: 5,
  },
  speed: {
    label: "Speed",
    maxUses: 5,
  },
  shuffle: {
    label: "Shuffle",
    maxUses: 2,
  },
  magnet: {
    label: "Magnet",
    maxUses: 2,
  },
};
const POWER_UPS = Object.keys(POWER_UP_CONFIG);

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

const createEmptyPowerUpUses = () =>
  POWER_UPS.reduce((uses, powerUp) => {
    uses[powerUp] = 0;
    return uses;
  }, {});

const randRange = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(randRange(min, max + 1));
const getRandomType = () => TYPES[randInt(0, TYPES.length - 1)];

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
  const [powerUpUses, setPowerUpUses] = useState(createEmptyPowerUpUses);
  const [powerUpCooldownActive, setPowerUpCooldownActive] = useState(false);
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0);
  const [speedBoostActive, setSpeedBoostActive] = useState(false);
  const [magnetActive, setMagnetActive] = useState(false);
  const [shuffleFlashActive, setShuffleFlashActive] = useState(false);
  const animationRef = useRef(null);
  const nextIdRef = useRef(INITIAL_PER_TYPE);
  const powerUpUsesRef = useRef(createEmptyPowerUpUses());
  const powerUpCooldownTimerRef = useRef(null);
  const powerUpCooldownIntervalRef = useRef(null);
  const powerUpCooldownEndsAtRef = useRef(0);
  const speedBoostTimerRef = useRef(null);
  const magnetTimerRef = useRef(null);
  const shuffleFlashTimerRef = useRef(null);

  const isColliding = (a, b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy) < IMAGE_SIZE;
  };

  useEffect(() => {
    return () => {
      clearTimeout(powerUpCooldownTimerRef.current);
      clearInterval(powerUpCooldownIntervalRef.current);
      clearTimeout(speedBoostTimerRef.current);
      clearTimeout(magnetTimerRef.current);
      clearTimeout(shuffleFlashTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!started || gameOver) return undefined;

    const updatePositions = () => {
      setImages((prevImages) => {
        const now = Date.now();
        const newImages = prevImages.map((img) => ({ ...img }));
        const speedMultiplier = speedBoostActive ? SPEED_BOOST_MULTIPLIER : 1;
        const magnetTargetX = BOX_SIZE / 2 - IMAGE_SIZE / 2;
        const magnetTargetY = BOX_SIZE / 2 - IMAGE_SIZE / 2;

        newImages.forEach((img) => {
          img.x += img.vx * speedMultiplier;
          img.y += img.vy * speedMultiplier;

          if (magnetActive) {
            const dx = magnetTargetX - img.x;
            const dy = magnetTargetY - img.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 1) {
              img.x += (dx / distance) * MAGNET_PULL_STRENGTH;
              img.y += (dy / distance) * MAGNET_PULL_STRENGTH;
            }
          }

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
        const nextTypes = new Map();
        const resolvedIndices = new Set();

        for (let i = 0; i < newImages.length; i += 1) {
          for (let j = i + 1; j < newImages.length; j += 1) {
            if (
              isProtected(newImages[i]) ||
              isProtected(newImages[j]) ||
              resolvedIndices.has(i) ||
              resolvedIndices.has(j)
            ) {
              continue;
            }

            if (isColliding(newImages[i], newImages[j])) {
              const typeA = nextTypes.get(i) ?? newImages[i].type;
              const typeB = nextTypes.get(j) ?? newImages[j].type;

              if (typeA === typeB) {
                continue;
              }

              const winnerType = getWinnerType(
                typeA,
                typeB
              );

              nextTypes.set(i, winnerType);
              nextTypes.set(j, winnerType);
              resolvedIndices.add(i);
              resolvedIndices.add(j);
            }
          }
        }

        nextTypes.forEach((type, index) => {
          newImages[index].type = type;
        });

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
  }, [gameOver, magnetActive, speedBoostActive, started]);

  const startSharedCooldown = () => {
    clearTimeout(powerUpCooldownTimerRef.current);
    clearInterval(powerUpCooldownIntervalRef.current);
    powerUpCooldownEndsAtRef.current = Date.now() + GLOBAL_COOLDOWN_MS;
    setPowerUpCooldownActive(true);
    setCooldownRemainingMs(GLOBAL_COOLDOWN_MS);

    powerUpCooldownIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, powerUpCooldownEndsAtRef.current - Date.now());
      setCooldownRemainingMs(remaining);

      if (remaining === 0) {
        clearInterval(powerUpCooldownIntervalRef.current);
      }
    }, COOLDOWN_TICK_MS);

    powerUpCooldownTimerRef.current = setTimeout(() => {
      setPowerUpCooldownActive(false);
      setCooldownRemainingMs(0);
      clearInterval(powerUpCooldownIntervalRef.current);
    }, GLOBAL_COOLDOWN_MS);
  };

  const registerPowerUpUse = (powerUp) => {
    const nextUses = {
      ...powerUpUsesRef.current,
      [powerUp]: powerUpUsesRef.current[powerUp] + 1,
    };

    powerUpUsesRef.current = nextUses;
    setPowerUpUses(nextUses);
    startSharedCooldown();
  };

  const createSpawnedBatch = (count, getRanges) => {
    const createdAt = Date.now();

    return Array.from({ length: count }, () => {
      const type = getRandomType();
      const { xRange, yRange } = getRanges(type);
      const image = createImage(type, nextIdRef.current++, xRange, yRange, true);
      image.spawnedAt = createdAt;
      image.protectedUntil = createdAt + SPAWN_PROTECTION_MS;
      return image;
    });
  };

  const spawnRandomObjects = (count) => {
    const newImages = createSpawnedBatch(count, () => ({
      xRange: [0, BOX_SIZE - IMAGE_SIZE],
      yRange: [0, BOX_SIZE - IMAGE_SIZE],
    }));

    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const triggerSpeedBoost = () => {
    clearTimeout(speedBoostTimerRef.current);
    setSpeedBoostActive(true);
    speedBoostTimerRef.current = setTimeout(() => {
      setSpeedBoostActive(false);
    }, SPEED_BOOST_MS);
  };

  const triggerMagnet = () => {
    clearTimeout(magnetTimerRef.current);
    setMagnetActive(true);
    magnetTimerRef.current = setTimeout(() => {
      setMagnetActive(false);
    }, MAGNET_MS);
  };

  const shuffleAllObjects = () => {
    const now = Date.now();
    setShuffleFlashActive(true);
    clearTimeout(shuffleFlashTimerRef.current);
    shuffleFlashTimerRef.current = setTimeout(() => {
      setShuffleFlashActive(false);
    }, SHUFFLE_FLASH_MS);

    setImages((prevImages) =>
      prevImages.map((img) => ({
        ...img,
        x: randRange(0, BOX_SIZE - IMAGE_SIZE),
        y: randRange(0, BOX_SIZE - IMAGE_SIZE),
        isNew: false,
        spawnedAt: null,
        protectedUntil: now + SHUFFLE_PROTECTION_MS,
      }))
    );
  };

  const activatePowerUp = (powerUp) => {
    if (gameOver || powerUpCooldownActive) return;
    if (powerUpUsesRef.current[powerUp] >= POWER_UP_CONFIG[powerUp].maxUses) {
      return;
    }

    if (powerUp === "plusTen") {
      spawnRandomObjects(PLUS_TEN_AMOUNT);
    }

    if (powerUp === "speed") {
      triggerSpeedBoost();
    }

    if (powerUp === "shuffle") {
      shuffleAllObjects();
    }

    if (powerUp === "magnet") {
      triggerMagnet();
    }

    registerPowerUpUse(powerUp);
  };

  const restartGame = () => {
    cancelAnimationFrame(animationRef.current);
    clearTimeout(powerUpCooldownTimerRef.current);
    clearInterval(powerUpCooldownIntervalRef.current);
    clearTimeout(speedBoostTimerRef.current);
    clearTimeout(magnetTimerRef.current);
    clearTimeout(shuffleFlashTimerRef.current);
    setImages(createInitialImages());
    setGameOver(null);
    setStarted(false);
    nextIdRef.current = INITIAL_PER_TYPE;
    powerUpUsesRef.current = createEmptyPowerUpUses();
    setPowerUpUses(createEmptyPowerUpUses());
    setPowerUpCooldownActive(false);
    powerUpCooldownEndsAtRef.current = 0;
    setCooldownRemainingMs(0);
    setSpeedBoostActive(false);
    setMagnetActive(false);
    setShuffleFlashActive(false);
  };

  const counts = countImagesByType(images);
  const getUsesLeft = (powerUp) =>
    POWER_UP_CONFIG[powerUp].maxUses - powerUpUses[powerUp];
  const cooldownSeconds = (cooldownRemainingMs / 1000).toFixed(1);

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
        {POWER_UPS.map((powerUp) => (
          <button
            key={powerUp}
            type="button"
            className={
              (powerUp === "speed" && speedBoostActive) ||
              (powerUp === "magnet" && magnetActive)
                ? "powerup-button powerup-button--active"
                : "powerup-button"
            }
            onClick={() => activatePowerUp(powerUp)}
            disabled={
              gameOver ||
              powerUpCooldownActive ||
              powerUpUses[powerUp] >= POWER_UP_CONFIG[powerUp].maxUses
            }
          >
            {powerUpCooldownActive
              ? `${POWER_UP_CONFIG[powerUp].label} (${cooldownSeconds}s)`
              : `${POWER_UP_CONFIG[powerUp].label} (${getUsesLeft(powerUp)} left)`}
          </button>
        ))}
      </div>

      <div className={`game-container ${shuffleFlashActive ? "game-container--shuffle-flash" : ""}`}>
        {magnetActive && (
          <div className="magnet-anchor">
            <img src="/magnet.svg" alt="Magnet power-up" className="magnet-anchor__icon" />
          </div>
        )}
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
