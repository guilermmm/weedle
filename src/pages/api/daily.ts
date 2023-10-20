import { gensArray } from "../../lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";

function dailyRandom() {
  const now = new Date();
  const seed = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function randomIntSeeded(min: number, max: number): number {
  return Math.floor(dailyRandom() * (max - min + 1)) + min;
}

export function dailyPokemon(): number {
  return randomIntSeeded(gensArray.at(0)![0], gensArray.at(-1)![1]);
}

export default function handler(_: NextApiRequest, res: NextApiResponse<{ pokemon: number }>) {
  res.status(200).json({ pokemon: dailyPokemon() });
}
