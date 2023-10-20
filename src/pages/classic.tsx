import Image from "next/image";
import { cn, type Pokemon, type PokemonComparisonResult, comparePokemonValues } from "../lib/utils";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Tip from "../components/Tip";
import FullPage from "../components/FullPage";
import { useSession } from "next-auth/react";

async function getPokemon() {
  return axios.get<{ pokemon: number }>("/api/daily").then(res => res.data.pokemon);
}

async function registerScore() {
  return axios.post("/api/score");
}

const Home = () => {
  const [pkmnIdx, setPkmnIdx] = useState<number | null>(null);

  const session = useSession();

  useEffect(() => {
    const now = new Date();
    const date = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
    const storedGuesses = localStorage.getItem("classic");
    if (storedGuesses) {
      const [storedDate, storedGuessesJson] = storedGuesses.split(" ");
      if (Number(storedDate) !== date) {
        localStorage.removeItem("classic");
      } else {
        setGuesses(JSON.parse(storedGuessesJson));
      }
    }
    getPokemon().then(setPkmnIdx);
  }, []);

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

  useEffect(() => {
    if (pkmnIdx !== null) {
      const now = new Date();
      const date = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));

      localStorage.setItem("classic", date + " " + JSON.stringify(guesses));
    }
  }, [pkmnIdx, guesses]);

  const guessedCorrectly = guesses.some(g => g !== null && g.comparison.pokemon);

  return (
    <FullPage>
      <div className="flex items-center justify-center h-56">
        <div className="w-40"></div>
        {pokemon.isLoading ? (
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
          {!pokemon.isLoading && (
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
        <div className="font-bold pl-1">
          {pokemon.data?.name.charAt(0).toUpperCase()! + pokemon.data?.name.slice(1)}
        </div>
      )}
      <div className="pt-4 pb-2">
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

              setGuesses(g => {
                const newGuesses = [...g] as typeof g;
                const index = newGuesses.findIndex(g => g === null);
                newGuesses[index] = { pokemon: guess, comparison };
                return newGuesses;
              });

              if (comparison.pokemon && session.data) registerScore();

              setError("");
              setInput("");
            } catch (e) {
              setError("Pokémon não encontrado");
            }
          }}
        >
          <input
            className="grow px-2 outline-none"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
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
      </div>
      <div className="text-red-300 font-bold">{error}</div>
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
    </FullPage>
  );
};

export default Home;
