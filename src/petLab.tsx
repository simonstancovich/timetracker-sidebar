import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { PetSprite, type PetSize } from "./components/PetSprite";
import {
  PET_CREATURES,
  RARITY_ORDER,
  type PetAnimKind,
  type PetCreature,
  type PetRarity,
} from "./sprites/petSprites";
import * as s from "./petLab.css";

const SIZES: PetSize[] = ["xs", "sm", "md", "lg", "xl"];

const RARITY_COPY: Record<PetRarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  unique: "Unique",
  limited: "Limited — Colleagues",
};

function CreatureCard({
  creature,
  paused,
  sad,
}: {
  creature: PetCreature;
  paused: boolean;
  sad: boolean;
}) {
  const animKinds = Object.keys(creature.animations) as PetAnimKind[];

  return (
    <article className={s.creatureCard}>
      <header className={s.creatureHeader}>
        <div className={s.creatureHeading}>
          <h3 className={s.creatureName}>{creature.name}</h3>
          <span className={s.rarityChip} data-rarity={creature.rarity}>
            {creature.rarity}
          </span>
        </div>
        <p className={s.creatureFlavor}>{creature.flavor}</p>
      </header>

      {animKinds.map((anim) => {
        const animation = creature.animations[anim];
        if (!animation) return null;
        return (
          <div key={anim} className={s.animBlock}>
            <div className={s.animMeta}>
              <span className={s.animKindLabel}>{anim}</span>
              <span className={s.animKindDetail}>
                {animation.fps.toFixed(1)} fps · {animation.frames.length} frames
              </span>
            </div>

            <div className={s.sizeRow}>
              {SIZES.map((size) => (
                <div key={size} className={s.sizeCell}>
                  <PetSprite
                    creature={creature.id}
                    anim={anim}
                    size={size}
                    paused={paused}
                    sad={sad}
                  />
                  <span className={s.sizeLabel}>{size}</span>
                </div>
              ))}
            </div>

            <div className={s.framesRow}>
              {animation.frames.map((_, i) => (
                <div key={i} className={s.frameCell}>
                  <PetSprite
                    creature={creature.id}
                    anim={anim}
                    size="lg"
                    frameIndex={i}
                  />
                  <span className={s.frameIndexLabel}>#{i}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </article>
  );
}

function RaritySection({
  rarity,
  creatures,
  paused,
  sad,
}: {
  rarity: PetRarity;
  creatures: PetCreature[];
  paused: boolean;
  sad: boolean;
}) {
  return (
    <section className={s.raritySection}>
      <header className={s.rarityHeader} data-rarity={rarity}>
        <h2 className={s.rarityTitle}>{RARITY_COPY[rarity]}</h2>
        <span className={s.rarityCount}>
          {creatures.length} creature{creatures.length !== 1 ? "s" : ""}
        </span>
      </header>
      <div className={s.creatureGrid}>
        {creatures.map((c) => (
          <CreatureCard
            key={c.id}
            creature={c}
            paused={paused}
            sad={sad}
          />
        ))}
      </div>
    </section>
  );
}

function PetLab() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sad, setSad] = useState(false);
  const [paused, setPaused] = useState(false);

  const byRarity = RARITY_ORDER.map((rarity) => ({
    rarity,
    creatures: PET_CREATURES.filter((c) => c.rarity === rarity),
  }));

  return (
    <main className={theme === "light" ? s.themeLight : s.themeDark}>
      <header className={s.topBar}>
        <h1 className={s.title}>Pet Lab</h1>
        <div className={s.controls}>
          <button
            type="button"
            className={s.btn}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            theme: {theme}
          </button>
          <button
            type="button"
            className={s.btn}
            onClick={() => setSad(!sad)}
          >
            sad: {sad ? "on" : "off"}
          </button>
          <button
            type="button"
            className={s.btn}
            onClick={() => setPaused(!paused)}
          >
            {paused ? "play" : "pause"}
          </button>
        </div>
      </header>

      <section className={s.intent}>
        <p className={s.intentLine}>
          Sprites render at 14×14 in the top-strip (xs column = actual size).
          Larger sizes are for pixel inspection. Each creature has its own
          silhouette and palette so it reads distinct from every other.
        </p>
      </section>

      <div className={s.allRarities}>
        {byRarity.map(({ rarity, creatures }) => (
          <RaritySection
            key={rarity}
            rarity={rarity}
            creatures={creatures}
            paused={paused}
            sad={sad}
          />
        ))}
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PetLab />
  </React.StrictMode>,
);
