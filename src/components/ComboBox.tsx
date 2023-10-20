import React, { useState, useEffect } from "react";
import axios from "axios";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command";
import { cn } from "../lib/utils";
import { CheckIcon } from "lucide-react";

interface PokemonOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean; // Propriedade disabled
}

export function Combobox({ value, onChange, disabled }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [pokemonOptions, setPokemonOptions] = useState<PokemonOption[]>([]);

  useEffect(() => {
    axios
      .get("https://pokeapi.co/api/v2/pokemon/?limit=809")
      .then(response => {
        const options = response.data.results.map((pokemon: { name: string }) => ({
          value: pokemon.name,
          label: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
        }));
        setPokemonOptions(options);
      })
      .catch(error => {
        console.error("Erro ao buscar a lista de Pokémon:", error);
      });
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-expanded={open}
          className={`w-[300px] justify-between ${disabled ? "cursor-not-allowed" : ""}`}
          disabled={disabled}
        >
          {value
            ? pokemonOptions.find(pokemon => pokemon.value === value)?.label
            : "Select pokemon..."}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 z-10">
        <Command>
          <CommandInput
            placeholder="Search pokemon..."
            className={`h-9 ${disabled ? "cursor-not-allowed" : ""}`}
            disabled={disabled}
          />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {pokemonOptions.map(pokemon => (
              <CommandItem
                key={pokemon.value}
                onSelect={currentValue => {
                  onChange(currentValue);
                  setOpen(false);
                }}
                disabled={disabled} // Desativar itens se o Combobox estiver desativado
              >
                {pokemon.label}
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === pokemon.value ? "opacity-100" : "opacity-0",
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
