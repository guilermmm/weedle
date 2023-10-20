import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const gens = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 898],
} as const;

export type Gen = keyof typeof gens;

export const gensArray = Object.values(gens);

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomGen(): number {
  return randomInt(1, 8);
}

export function randomPokemonFromGen(gen: Gen): number {
  return randomInt(gens[gen][0], gens[gen][1]);
}

export function randomPokemonFromGens(gens: Gen[]): number {
  const gen = gens[randomInt(0, gens.length - 1)];
  return randomPokemonFromGen(gen);
}

export type NumberComparisonResult = {
  value: "more" | "less" | "equal";
  proximity: "close" | "far" | "exact";
};

export type TypeComparisonResult = "partially" | "completely" | "not";

export type PokemonComparisonResult = {
  pokemon: boolean;
  index: NumberComparisonResult;
  types: TypeComparisonResult;
  height: NumberComparisonResult;
  weight: NumberComparisonResult;
};

export type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { slot: number; type: { name: string } }[];
  sprites: { other: { "official-artwork": { front_default: string } } };
};

export function comparePokemonValues(answer: Pokemon, guess: Pokemon): PokemonComparisonResult {
  const result: PokemonComparisonResult = {
    pokemon: answer.id === guess.id,
    index: {
      value: answer.id > guess.id ? "more" : answer.id < guess.id ? "less" : "equal",
      proximity:
        answer.id === guess.id
          ? "exact"
          : gensArray.find(([min, max]) => answer.id >= min && answer.id <= max) ===
            gensArray.find(([min, max]) => guess.id >= min && guess.id <= max)
          ? "close"
          : "far",
    },
    types: "not",
    height: {
      value:
        answer.height > guess.height ? "more" : answer.height < guess.height ? "less" : "equal",
      proximity:
        answer.height === guess.height
          ? "exact"
          : Math.abs(answer.height - guess.height) <= 10
          ? "close"
          : "far",
    },
    weight: {
      value:
        answer.weight > guess.weight ? "more" : answer.weight < guess.weight ? "less" : "equal",
      proximity:
        answer.weight === guess.weight
          ? "exact"
          : Math.abs(answer.weight - guess.weight) <= 50
          ? "close"
          : "far",
    },
  };

  const attemptTypes = answer.types.map(type => type.type.name);
  const answerTypes = guess.types.map(type => type.type.name);

  const partially = attemptTypes.some(type => answerTypes.includes(type));
  const completely =
    attemptTypes.every(type => answerTypes.includes(type)) &&
    answerTypes.length === attemptTypes.length;

  result.types = completely ? "completely" : partially ? "partially" : "not";

  return result;
}
