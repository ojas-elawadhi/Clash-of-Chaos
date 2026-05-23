import React, { useEffect, useRef, useState } from "react";
import "./RockPaperScissorsGame.css";

const BOX_SIZE = 600;
const IMAGE_SIZE = 40;
const INITIAL_PER_TYPE = 33;
const BASE_SPEED = 0.39;
const SPAWN_ANIMATION_MS = 900;
const SPAWN_PROTECTION_MS = 1000;
const SHUFFLE_PROTECTION_MS = 750;
const GLOBAL_COOLDOWN_MS = 3000;
const SPEED_BOOST_MS = 3000;
const SPEED_BOOST_MULTIPLIER = 3;
const MAGNET_MS = 2000;
const MAGNET_PULL_STRENGTH = 0.7;
const SHUFFLE_FLASH_MS = 500;
const PLUS_TEN_AMOUNT = 10;
const COOLDOWN_TICK_MS = 100;

const PARTY_CONFIG = {
  cjp: {
    asset: "cjp.svg",
    color: "#5c3417",
    glow: "#f59e0b",
  },
  bjp: {
    asset: "bjp.svg",
    color: "#f0861d",
    glow: "#fb923c",
  },
  congress: {
    asset: "congress.svg",
    color: "#2d8f5b",
    glow: "#10b981",
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

const POWER_UP_ICONS = {
  plusTen: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 4v16M4 12h16"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),
  speed: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14 2L4 14h7l-2 8 11-14h-8l2-6z"
        fill="currentColor"
      />
    </svg>
  ),
  shuffle: (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  ),
  magnet: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {/* Red horseshoe body, opening upward */}
      <path
        d="M3.5 5.5V13a8 8 0 0 0 17 0V5.5h-5.5v8a3 3 0 0 1-6 0V5.5z"
        fill="#e53935"
      />
      {/* Thin white separator between the body and the pole tips */}
      <rect x="3.2" y="5" width="6.1" height="0.9" fill="#ffffff" />
      <rect x="14.7" y="5" width="6.1" height="0.9" fill="#ffffff" />
      {/* Blue pole tips at the top of each arm */}
      <rect x="3.5" y="2.4" width="5.5" height="2.7" fill="#1e88e5" rx="0.4" />
      <rect x="15" y="2.4" width="5.5" height="2.7" fill="#1e88e5" rx="0.4" />
    </svg>
  ),
};

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
  cjp: "bjp",
  congress: "cjp",
  bjp: "congress",
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
  const speed = BASE_SPEED * randRange(0.8, 1.2);
  return { vx: speed * Math.cos(angle), vy: speed * Math.sin(angle) };
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
  const [paused, setPaused] = useState(false);
  const [powerUpUses, setPowerUpUses] = useState(createEmptyPowerUpUses);
  const [powerUpCooldownActive, setPowerUpCooldownActive] = useState(false);
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0);
  const [speedBoostActive, setSpeedBoostActive] = useState(false);
  const [magnetActive, setMagnetActive] = useState(false);
  const [shuffleFlashActive, setShuffleFlashActive] = useState(false);
  const [burst, setBurst] = useState(null);
  const animationRef = useRef(null);
  const nextIdRef = useRef(INITIAL_PER_TYPE);
  const powerUpUsesRef = useRef(createEmptyPowerUpUses());
  const powerUpCooldownTimerRef = useRef(null);
  const powerUpCooldownIntervalRef = useRef(null);
  const powerUpCooldownEndsAtRef = useRef(0);
  const speedBoostTimerRef = useRef(null);
  const speedBoostEndsAtRef = useRef(0);
  const magnetTimerRef = useRef(null);
  const magnetEndsAtRef = useRef(0);
  const shuffleFlashTimerRef = useRef(null);
  const burstTimerRef = useRef(null);
  const pausedAtRef = useRef(0);
  const pausedCooldownRemainingRef = useRef(0);
  const pausedSpeedBoostRemainingRef = useRef(0);
  const pausedMagnetRemainingRef = useRef(0);

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
      clearTimeout(burstTimerRef.current);
    };
  }, []);

  const startSharedCooldown = (durationMs = GLOBAL_COOLDOWN_MS) => {
    if (durationMs <= 0) {
      setPowerUpCooldownActive(false);
      setCooldownRemainingMs(0);
      powerUpCooldownEndsAtRef.current = 0;
      clearTimeout(powerUpCooldownTimerRef.current);
      clearInterval(powerUpCooldownIntervalRef.current);
      return;
    }

    clearTimeout(powerUpCooldownTimerRef.current);
    clearInterval(powerUpCooldownIntervalRef.current);
    powerUpCooldownEndsAtRef.current = Date.now() + durationMs;
    setPowerUpCooldownActive(true);
    setCooldownRemainingMs(durationMs);

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
      powerUpCooldownEndsAtRef.current = 0;
      clearInterval(powerUpCooldownIntervalRef.current);
    }, durationMs);
  };

  const startSpeedBoost = (durationMs = SPEED_BOOST_MS) => {
    if (durationMs <= 0) {
      setSpeedBoostActive(false);
      speedBoostEndsAtRef.current = 0;
      clearTimeout(speedBoostTimerRef.current);
      return;
    }

    clearTimeout(speedBoostTimerRef.current);
    speedBoostEndsAtRef.current = Date.now() + durationMs;
    setSpeedBoostActive(true);
    speedBoostTimerRef.current = setTimeout(() => {
      setSpeedBoostActive(false);
      speedBoostEndsAtRef.current = 0;
    }, durationMs);
  };

  const startMagnet = (durationMs = MAGNET_MS) => {
    if (durationMs <= 0) {
      setMagnetActive(false);
      magnetEndsAtRef.current = 0;
      clearTimeout(magnetTimerRef.current);
      return;
    }

    clearTimeout(magnetTimerRef.current);
    magnetEndsAtRef.current = Date.now() + durationMs;
    setMagnetActive(true);
    magnetTimerRef.current = setTimeout(() => {
      setMagnetActive(false);
      magnetEndsAtRef.current = 0;
    }, durationMs);
  };

  useEffect(() => {
    if (!started || gameOver || paused) return undefined;

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
  }, [gameOver, magnetActive, paused, speedBoostActive, started]);

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
    startSpeedBoost();
  };

  const triggerMagnet = () => {
    startMagnet();
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

  const triggerBurst = (type) => {
    clearTimeout(burstTimerRef.current);
    setBurst({ type, key: Date.now() });
    burstTimerRef.current = setTimeout(() => setBurst(null), 600);
  };

  const activatePowerUp = (powerUp) => {
    if (gameOver || paused || powerUpCooldownActive) return;
    if (powerUpUsesRef.current[powerUp] >= POWER_UP_CONFIG[powerUp].maxUses) {
      return;
    }

    if (powerUp === "plusTen") {
      spawnRandomObjects(PLUS_TEN_AMOUNT);
      triggerBurst("plusTen");
    }

    if (powerUp === "speed") {
      triggerSpeedBoost();
      triggerBurst("speed");
    }

    if (powerUp === "shuffle") {
      shuffleAllObjects();
      triggerBurst("shuffle");
    }

    if (powerUp === "magnet") {
      triggerMagnet();
    }

    registerPowerUpUse(powerUp);
  };

  const togglePause = () => {
    if (!started || gameOver) return;

    if (!paused) {
      const now = Date.now();
      pausedAtRef.current = now;
      pausedCooldownRemainingRef.current = powerUpCooldownActive
        ? Math.max(0, powerUpCooldownEndsAtRef.current - now)
        : 0;
      pausedSpeedBoostRemainingRef.current = speedBoostActive
        ? Math.max(0, speedBoostEndsAtRef.current - now)
        : 0;
      pausedMagnetRemainingRef.current = magnetActive
        ? Math.max(0, magnetEndsAtRef.current - now)
        : 0;

      cancelAnimationFrame(animationRef.current);
      clearTimeout(powerUpCooldownTimerRef.current);
      clearInterval(powerUpCooldownIntervalRef.current);
      clearTimeout(speedBoostTimerRef.current);
      clearTimeout(magnetTimerRef.current);
      setPaused(true);
      setCooldownRemainingMs(pausedCooldownRemainingRef.current);
      return;
    }

    const pausedDuration = Date.now() - pausedAtRef.current;

    setImages((prevImages) =>
      prevImages.map((img) => ({
        ...img,
        spawnedAt: img.spawnedAt ? img.spawnedAt + pausedDuration : img.spawnedAt,
        protectedUntil: img.protectedUntil
          ? img.protectedUntil + pausedDuration
          : img.protectedUntil,
      }))
    );

    startSharedCooldown(pausedCooldownRemainingRef.current);
    startSpeedBoost(pausedSpeedBoostRemainingRef.current);
    startMagnet(pausedMagnetRemainingRef.current);

    pausedAtRef.current = 0;
    pausedCooldownRemainingRef.current = 0;
    pausedSpeedBoostRemainingRef.current = 0;
    pausedMagnetRemainingRef.current = 0;
    setPaused(false);
  };

  const restartGame = () => {
    cancelAnimationFrame(animationRef.current);
    clearTimeout(powerUpCooldownTimerRef.current);
    clearInterval(powerUpCooldownIntervalRef.current);
    clearTimeout(speedBoostTimerRef.current);
    clearTimeout(magnetTimerRef.current);
    clearTimeout(shuffleFlashTimerRef.current);
    clearTimeout(burstTimerRef.current);
    setImages(createInitialImages());
    setGameOver(null);
    setStarted(false);
    setPaused(false);
    nextIdRef.current = INITIAL_PER_TYPE;
    powerUpUsesRef.current = createEmptyPowerUpUses();
    setPowerUpUses(createEmptyPowerUpUses());
    setPowerUpCooldownActive(false);
    powerUpCooldownEndsAtRef.current = 0;
    speedBoostEndsAtRef.current = 0;
    magnetEndsAtRef.current = 0;
    pausedAtRef.current = 0;
    pausedCooldownRemainingRef.current = 0;
    pausedSpeedBoostRemainingRef.current = 0;
    pausedMagnetRemainingRef.current = 0;
    setCooldownRemainingMs(0);
    setSpeedBoostActive(false);
    setMagnetActive(false);
    setShuffleFlashActive(false);
    setBurst(null);
  };

  const counts = countImagesByType(images);
  const totalPieces = images.length;
  const getUsesLeft = (powerUp) =>
    POWER_UP_CONFIG[powerUp].maxUses - powerUpUses[powerUp];
  const cooldownSeconds = (cooldownRemainingMs / 1000).toFixed(1);

  return (
    <div className="game-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand__mark" aria-hidden="true">
            <div className="brand__mark-inner">
              <img src="/cockroach.svg" alt="" />
            </div>
          </div>
          <div className="brand__text">
            <span className="brand__eyebrow">Battle Royale</span>
            <h1>CockroachClash</h1>
          </div>
        </div>
      </header>

      <div className="game-shell__panel">
        <div className="scoreboard">
          {TYPES.map((type) => {
            const isEliminated = counts[type] === 0;
            const isLeader =
              !isEliminated &&
              counts[type] === Math.max(...TYPES.map((t) => counts[t]));
            return (
              <div
                key={type}
                className={`score-card score-card--${type}${
                  isEliminated ? " is-eliminated" : ""
                }${isLeader ? " is-leader" : ""}`}
              >
                <img
                  src={`/${PARTY_CONFIG[type].asset}`}
                  alt=""
                  aria-hidden="true"
                  className="score-card__icon"
                />
                <div className="score-card__meta">
                  <span className="score-card__count">{counts[type]}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="play-row">
          <div className="arena-frame">
          <div className="arena-viewport">
            <div
              className={`game-container${
                shuffleFlashActive ? " game-container--shuffle-flash" : ""
              }`}
            >
              {magnetActive && (
                <div className="magnet-anchor">
                  <img
                    src="/magnet.svg"
                    alt=""
                    aria-hidden="true"
                    className="magnet-anchor__icon"
                  />
                </div>
              )}
              {images.map((img) => (
                <div
                  key={img.id}
                  className={`rps-piece ${
                    img.isNew ? `rps-piece--spawned rps-piece--${img.type}` : ""
                  }`}
                  style={{
                    transform: `translate3d(${img.x}px, ${img.y}px, 0)`,
                    width: IMAGE_SIZE,
                    height: IMAGE_SIZE,
                  }}
                >
                  <img
                    src={`/${PARTY_CONFIG[img.type].asset}`}
                    alt=""
                    aria-hidden="true"
                    className="rps-image"
                  />
                </div>
              ))}
            </div>
          </div>

          {burst && (
            <div
              key={burst.key}
              className={`powerup-burst powerup-burst--${burst.type.toLowerCase()}`}
              aria-hidden="true"
            >
              <div className="powerup-burst__content">
                {burst.type === "plusTen" && <span>+10</span>}
                {burst.type === "speed" && (
                  <>
                    <span className="powerup-burst__icon">
                      {POWER_UP_ICONS.speed}
                    </span>
                    <span>3× SPEED</span>
                  </>
                )}
                {burst.type === "shuffle" && (
                  <span className="powerup-burst__big-icon">
                    {POWER_UP_ICONS.shuffle}
                  </span>
                )}
              </div>
            </div>
          )}

          {started && !gameOver && (
            <div className="arena-controls">
              <button
                type="button"
                className={`arena-control arena-control--pause${
                  paused ? " is-active" : ""
                }`}
                onClick={togglePause}
                aria-label={paused ? "Resume game" : "Pause game"}
                title={paused ? "Resume" : "Pause"}
              >
                {paused ? (
                  <svg
                    className="arena-control__icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M8 5.14v13.72c0 .74.8 1.2 1.44.82l10.8-6.86a.97.97 0 0 0 0-1.64L9.44 4.32A.96.96 0 0 0 8 5.14z"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                  <svg
                    className="arena-control__icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 5h3v14H7zm7 0h3v14h-3z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </button>
              <button
                type="button"
                className="arena-control arena-control--restart"
                onClick={restartGame}
                aria-label="Restart game"
                title="Restart"
              >
                <svg
                  className="arena-control__icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M12 5V2L7 6l5 4V7a5 5 0 1 1-4.9 6h-2.02A7 7 0 1 0 12 5z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          )}

          {started && paused && !gameOver && (
            <div className="pause-overlay">
              <div className="pause-overlay__content">
                <span className="pause-overlay__eyebrow">Match Paused</span>
                <button
                  type="button"
                  className="start-button"
                  onClick={togglePause}
                >
                  Resume
                </button>
              </div>
            </div>
          )}

          {!started && !gameOver && (
            <div className="start-overlay">
              <div className="start-overlay__content">
                <span className="start-overlay__eyebrow">New Round</span>
                <h2 className="start-overlay__title">CockroachClash</h2>
                <p className="start-overlay__tagline">
                  {totalPieces} pieces. {TYPES.length} parties. One ruler.
                </p>
                <button
                  type="button"
                  className="start-button"
                  onClick={() => setStarted(true)}
                >
                  Start Game
                </button>
                <p className="start-overlay__hint">
                  Use power-ups below to tip the balance once the clash begins.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="powerup-rail" role="group" aria-label="Power-ups">
          {POWER_UPS.map((powerUp) => {
            const usesLeft = getUsesLeft(powerUp);
            const isActive =
              (powerUp === "speed" && speedBoostActive) ||
              (powerUp === "magnet" && magnetActive);
            const isDisabled =
              gameOver ||
              paused ||
              powerUpCooldownActive ||
              usesLeft <= 0 ||
              !started;
            return (
              <button
                key={powerUp}
                type="button"
                className={`powerup-button powerup-button--${powerUp.toLowerCase()}${
                  isActive ? " powerup-button--active" : ""
                }`}
                onClick={() => activatePowerUp(powerUp)}
                disabled={isDisabled}
                aria-label={POWER_UP_CONFIG[powerUp].label}
                title={POWER_UP_CONFIG[powerUp].label}
              >
                <span className="powerup-button__icon" aria-hidden="true">
                  {POWER_UP_ICONS[powerUp]}
                </span>
                <span className="powerup-button__label">
                  {POWER_UP_CONFIG[powerUp].label}
                </span>
                <span className="powerup-button__meta">
                  {powerUpCooldownActive ? (
                    `${cooldownSeconds}s`
                  ) : (
                    <>
                      {usesLeft}
                      <span className="powerup-button__meta-unit"> left</span>
                    </>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        </div>

      </div>

      {gameOver && (
        <div className="popup" role="dialog" aria-modal="true">
          <div
            className="popup-content"
            style={{
              "--winner-color": PARTY_CONFIG[gameOver.winner].color,
              "--winner-glow": PARTY_CONFIG[gameOver.winner].glow,
            }}
          >
            <span className="popup-content__eyebrow">Game Over</span>
            <div className="popup-content__winner">
              <img
                src={`/${PARTY_CONFIG[gameOver.winner].asset}`}
                alt=""
                aria-hidden="true"
              />
            </div>
            <h2 className="popup-content__title">Victory!</h2>
            <p>The last one standing.</p>
            <button
              type="button"
              className="start-button"
              onClick={restartGame}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RockPaperScissorsGame;
