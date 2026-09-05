import { useState } from "react";
import type { Todo } from "./types";

type Props = {
  todos: Todo[];
  // setTodos virker som "sæt-funktionen" fra useState: vi giver den enten
  // en ny liste, eller en funktion der laver den nye liste ud fra den gamle.
  setTodos: (nye: Todo[] | ((gamle: Todo[]) => Todo[])) => void;
};

// To-do listen: skriv en opgave, kryds den af som klaret, eller slet den.
// Alle ændringer sendes op til App via setTodos, som gemmer dem i localStorage.
export function TodoListe({ todos, setTodos }: Props) {
  // Teksten i skrivefeltet lige nu. Tømmes når opgaven er lagt til.
  const [nyTekst, setNyTekst] = useState("");

  // Læg en ny opgave nederst på listen.
  function tilfoejTodo() {
    // .trim() fjerner mellemrum i start og slut. Er feltet tomt, gør vi intet.
    const tekst = nyTekst.trim();
    if (tekst === "") return;

    const nyTodo: Todo = {
      // Id ud fra tidspunktet lige nu, så to opgaver aldrig får samme id.
      id: "todo-" + Date.now(),
      tekst,
      faerdig: false,
    };
    setTodos((gamle) => [...gamle, nyTodo]);
    setNyTekst(""); // ryd feltet, så man kan skrive den næste
  }

  // Skift én opgave mellem "klaret" og "ikke klaret".
  function skiftFaerdig(id: string) {
    setTodos((gamle) =>
      gamle.map((todo) =>
        todo.id === id ? { ...todo, faerdig: !todo.faerdig } : todo,
      ),
    );
  }

  // Fjern en opgave helt fra listen.
  function sletTodo(id: string) {
    setTodos((gamle) => gamle.filter((todo) => todo.id !== id));
  }

  // Hvor mange opgaver mangler stadig at blive klaret?
  const antalTilbage = todos.filter((todo) => !todo.faerdig).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Skrivefelt + knap til at tilføje en opgave. */}
      <div className="flex gap-2">
        <input
          aria-label="Ny opgave"
          placeholder="Skriv en opgave ..."
          value={nyTekst}
          onChange={(e) => setNyTekst(e.target.value)}
          // Tryk Enter i feltet = samme som at klikke på knappen.
          onKeyDown={(e) => {
            if (e.key === "Enter") tilfoejTodo();
          }}
          className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2"
        />
        <button
          type="button"
          onClick={tilfoejTodo}
          className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-900 hover:bg-emerald-400"
        >
          Tilføj
        </button>
      </div>

      {/* Lille status-linje. Vises kun når der er opgaver. */}
      {todos.length > 0 && (
        <p className="text-sm text-slate-500">
          {antalTilbage === 0
            ? "Alt er klaret 🎉"
            : `${antalTilbage} tilbage`}
        </p>
      )}

      {/* Selve listen. Er den tom, viser vi en lille besked i stedet. */}
      {todos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-700 p-4 text-center text-slate-500">
          Ingen opgaver endnu.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 p-3"
            >
              {/* Klik på cirklen krydser opgaven af. */}
              <button
                type="button"
                onClick={() => skiftFaerdig(todo.id)}
                aria-label={todo.faerdig ? "Fjern flueben" : "Marker som klaret"}
                className={
                  "flex h-6 w-6 flex-none items-center justify-center rounded-full border text-sm " +
                  (todo.faerdig
                    ? "border-emerald-500 bg-emerald-500 text-slate-900"
                    : "border-slate-500 text-transparent hover:border-slate-400")
                }
              >
                ✓
              </button>

              {/* Teksten. Klaret opgave får en streg over og bliver grå. */}
              <span
                className={
                  "flex-1 " +
                  (todo.faerdig ? "text-slate-500 line-through" : "text-slate-100")
                }
              >
                {todo.tekst}
              </span>

              <button
                type="button"
                onClick={() => sletTodo(todo.id)}
                className="rounded-lg px-2 py-1 text-sm text-red-400 hover:bg-red-500/10"
              >
                Slet
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
