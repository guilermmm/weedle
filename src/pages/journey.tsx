import Image from "next/image";
import {
  cn,
  randomPokemonFromGen,
  type Pokemon,
  type PokemonComparisonResult,
  comparePokemonValues,
  gens,
  gensArray,
  randomPokemonFromGens,
  Gen,
} from "../lib/utils";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Tip from "../components/Tip";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import FullPage from "../components/FullPage";
import { Combobox } from "../components/ComboBox";

const Home = () => {
  const session = useSession();

  const [pkmnIdx, setPkmnIdx] = useState<number | null>(null);
  const [selectedGens, setSelectedGens] = useState<Gen[]>([1]);
  const [winStreak, setWinStreak] = useState(0);
  const [onPause, setOnPause] = useState(true);
  const [started, setStarted] = useState(false);
  const [loadedLocalStorage, setLoadedLocalStorage] = useState(false);

  function newPokemon() {
    setPkmnIdx(randomPokemonFromGens(selectedGens));
    setGuesses([null, null, null, null, null, null]);
    setOnPause(!onPause);
  }

  function restart() {
    session.data && updateScore(winStreak);
    setPkmnIdx(null);
    setGuesses([null, null, null, null, null, null]);
    setOnPause(!onPause);
    setStarted(false);
    setWinStreak(0);
  }

  const pokemon = useQuery({
    queryFn: async () => {
      const result = await axios.get<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${pkmnIdx}`);

      return result.data;
    },
    queryKey: ["pokemon", pkmnIdx],
  });

  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  type Guess = { pokemon: Pokemon; comparison: PokemonComparisonResult } | null;

  const [guesses, setGuesses] = useState<[Guess, Guess, Guess, Guess, Guess, Guess]>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);

  const guessedCorrectly = guesses.some(g => g !== null && g.comparison.pokemon);

  const updateScore = (score: number) => {
    axios.put("/api/score", { score });
  };

  return (
    <FullPage>
      {!started ? (
        <div className="bg-white w-[420px] flex flex-col gap-2 rounded-xl border-[#421856] border-r-4 border-b-4 px-2 py-1">
          <p className="text-center">Select the generations you want to play with.</p>
          <div className="flex flex-row gap-2 items-center justify-center">
            {Object.entries(gens).map(([gen], index) => (
              <button
                key={index}
                className={cn(
                  "py-1 px-2 gap-1 items-center flex rounded-xl border-r-4 border-b-4",
                  {
                    "bg-[#FD1B54] border-[#421856] text-white": selectedGens.includes(
                      Number(gen) as Gen,
                    ),
                    "bg-white border-[#FD1B54]": !selectedGens.includes(Number(gen) as Gen),
                  },
                )}
                onClick={() => {
                  if (selectedGens.includes(Number(gen) as Gen)) {
                    setSelectedGens(selectedGens.filter(g => g !== Number(gen)));
                  } else {
                    setSelectedGens([...selectedGens, Number(gen) as Gen]);
                  }
                }}
              >
                {gen}
              </button>
            ))}
          </div>
          <button
            className="py-1 px-2 gap-1 items-center disabled:opacity-50 flex bg-[#FD1B54] rounded-xl border-[#421856] border-r-4 border-b-4"
            onClick={() => {
              setStarted(true);
              setOnPause(false);
              newPokemon();
            }}
          >
            <Image width={62} height={24} src="/catch.png" alt="catch" />
            <Image width={28} height={28} src="/alt_pokeball.png" alt="catch" />
          </button>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center justify-center">
          {Object.entries(gens).map(([gen], index) => (
            <div
              key={index}
              className={cn("py-1 px-2 gap-1 items-center flex rounded-xl border-r-4 border-b-4", {
                "bg-[#FD1B54] border-[#421856] text-white": selectedGens.includes(
                  Number(gen) as Gen,
                ),
                "bg-white border-[#FD1B54]": !selectedGens.includes(Number(gen) as Gen),
              })}
            >
              {gen}
            </div>
          ))}
        </div>
      )}

      <div className="font-bold pl-1">Streak: {winStreak}</div>

      <div className="flex items-center justify-center h-56">
        <div className="w-40"></div>
        {pokemon.isLoading || !started ? (
          <div className="flex items-center ">
            <Image width={96} height={96} src="/pokeball.png" alt="pokebola" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Image
              width={192}
              height={192}
              className="z-0 absolute"
              src="/screen.png"
              alt="cabeca"
            />
            <Image
              width={96}
              height={96}
              src={pokemon.data?.sprites.other["official-artwork"].front_default!}
              alt="telinha"
              className={cn("z-10 pb-8", {
                "opacity-0": !guessedCorrectly && guesses[5] == null,
              })}
            />
          </div>
        )}

        <div className="w-36 pl-14 flex flex-col gap-2">
          {!pokemon.isLoading && !onPause && (
            <div>
              <audio id="audio">
                <source
                  src={`https://pokemoncries.com/cries-old/${pkmnIdx}.mp3`}
                  type="audio/mpeg"
                />
              </audio>
              <button
                onClick={() => {
                  const audio = document.getElementById("audio") as HTMLAudioElement;
                  audio.play();
                }}
                className="flex justify-center items-center gap-2 rounded-lg border-[#421856] border-r-4 border-b-4 bg-white p-1"
              >
                <Image width={28} height={28} src="/chatot_head.png" alt="chatot" />
                <Image width={28} height={28} src="/sound.png" alt="sound" />
              </button>
            </div>
          )}
          <div>
            {guesses.map((guess, index) =>
              guess !== null ? (
                <Image
                  key={index}
                  width={20}
                  height={20}
                  src="/open_pokeball.png"
                  alt="pokebola aberta"
                  className="pt-1"
                />
              ) : (
                <Image
                  key={index}
                  width={20}
                  height={20}
                  src="/pokeball.png"
                  alt="pokebola"
                  className="pt-2"
                />
              ),
            )}
          </div>
        </div>
      </div>

      {!(!guessedCorrectly && guesses[5] == null) && (
        <div className="font-bold">
          {pokemon.data?.name.charAt(0).toUpperCase()! + pokemon.data?.name.slice(1)}
        </div>
      )}

      {guesses[5] != null && !guessedCorrectly && (
        <>
          <div className="font-bold text-lg">You lose!</div>
          {session.data ? (
            <button
              className="flex justify-center items-center rounded-lg border-[#421856] border-r-4 border-b-4 p-1 bg-[#FD1B54] text-white"
              onClick={() => restart()}
            >
              Submit score
            </button>
          ) : (
            <button
              className="flex justify-center items-center rounded-lg border-[#421856] border-r-4 border-b-4 p-1 bg-[#FD1B54] text-white"
              onClick={() => restart()}
            >
              Restart game
            </button>
          )}
        </>
      )}

      {started && (
        <div className="pt-4 pb-2">
          {!onPause ? (
            <form
              className="bg-white w-[420px] flex rounded-xl border-[#421856] border-r-4 border-b-4 px-2 py-1"
              onSubmit={async e => {
                e.preventDefault();
                try {
                  const result = await axios.get<Pokemon>(
                    `https://pokeapi.co/api/v2/pokemon/${input.trim().toLowerCase()}`,
                  );
                  const guess = result.data;

                  const comparison = comparePokemonValues(pokemon.data!, guess);

                  const yes = comparison.pokemon;

                  if (yes) {
                    setOnPause(true);
                    setWinStreak(w => w + 1);
                  }

                  setGuesses(g => {
                    const newGuesses = [...g] as typeof g;
                    const index = newGuesses.findIndex(g => g === null);
                    newGuesses[index] = { pokemon: guess, comparison };
                    return newGuesses;
                  });

                  setError("");
                  setInput("");
                } catch (e) {
                  setError("Pokémon não encontrado");
                }
              }}
            >
              <Combobox
                value={input}
                onChange={e => setInput(e)}
                disabled={!(!guessedCorrectly && guesses[5] == null)}
              />
              <button
                className="py-1 px-2 gap-1 items-center disabled:opacity-50 flex bg-[#FD1B54] rounded-xl border-[#421856] border-r-4 border-b-4"
                type="submit"
                disabled={input.trim() === "" || guesses.every(g => g !== null) || guessedCorrectly}
              >
                <Image width={62} height={24} src="/catch.png" alt="catch" />
                <Image width={28} height={28} src="/alt_pokeball.png" alt="catch" />
              </button>
            </form>
          ) : (
            <div className="bg-white w-[420px] flex flex-col gap-2 rounded-xl border-[#421856] border-r-4 border-b-4 px-2 py-1">
              <button
                className="py-1 px-2 gap-1 items-center disabled:opacity-50 flex bg-[#FD1B54] rounded-xl border-[#421856] border-r-4 border-b-4"
                onClick={() => newPokemon()}
              >
                <Image width={62} height={24} src="/catch.png" alt="catch" />
                <Image width={28} height={28} src="/alt_pokeball.png" alt="catch" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="text-red-300 font-bold">{error}</div>

      {pkmnIdx !== null && (
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-row gap-1 items-center justify-center">
            <div className="w-20 font-bold text-sm text-center">Pokémon</div>
            <div className="w-20 font-bold text-sm text-center">Nº Pokédex</div>
            <div className="w-20 font-bold text-sm text-center">Type(s)</div>
            <div className="w-20 font-bold text-sm text-center">Weight</div>
            <div className="w-20 font-bold text-sm text-center">Height</div>
          </div>

          <div className="flex pb-4 flex-col gap-1 items-center justify-center">
            {guesses.map((guess, i) => (
              <div className="flex gap-1 flex-row items-center justify-center" key={i}>
                {guess === null ? (
                  <>
                    <Tip boolean={false} />
                    <Tip boolean={false} />
                    <Tip boolean={false} />
                    <Tip boolean={false} />
                    <Tip boolean={false} />
                  </>
                ) : (
                  <>
                    <Tip boolean={guess.comparison.pokemon}>
                      <Image
                        width={82}
                        height={82}
                        src={guess.pokemon.sprites.other["official-artwork"].front_default!}
                        alt="pokemon"
                      />
                      <div className="font-bold text-xs">
                        {guess.pokemon.name.charAt(0).toUpperCase()! + guess.pokemon.name.slice(1)}
                      </div>
                    </Tip>
                    <Tip number={guess.comparison.index}>{guess.pokemon.id}</Tip>
                    <Tip type={guess.comparison.types}>
                      {guess.pokemon.types.map(t => (
                        <div key={t.type.name}>{t.type.name}</div>
                      ))}
                    </Tip>
                    <Tip number={guess.comparison.weight}>{guess.pokemon.weight / 10}kg</Tip>
                    <Tip number={guess.comparison.height}>{guess.pokemon.height / 10}m</Tip>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </FullPage>
  );
};

export default Home;
