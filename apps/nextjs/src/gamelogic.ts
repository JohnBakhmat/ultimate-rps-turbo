export const signs = [
  "AIR",
  "WATER",
  "ALIEN",
  "DRAGON",
  "DEVIL",
  "LIGHTNING",
  "GUN",
  "ROCK",
  "FIRE",
  "SCISSORS",
  "SNAKE",
  "HUMAN",
  "TREE",
  "WOLF",
  "SPONGE",
  "PAPER",
] as const;

export type SignType = (typeof signs)[number];
export type Result = "draw" | "win" | "lose";

export const getWinner = (signA: SignType, signB: SignType): Result => {
  if (signA === signB) {
    return "draw";
  }
  const a = signs.indexOf(signA);
  const beatsCount = (signs.length - 1) / 2;
  const aBeats = [];

  for (let i = a; i < a + beatsCount; i++) {
    aBeats.push(signs.at(i + 1));
  }

  console.log(aBeats);

  if (aBeats.indexOf(signB) !== -1) {
    return "win";
  }

  return "lose";
};

console.log({
  a: getWinner("AIR", "LIGHTNING"),
  b: getWinner("LIGHTNING", "AIR"),
});
