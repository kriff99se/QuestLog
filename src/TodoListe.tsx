import { useState } from "react";
import type { Todo } from "./types";
import { POINT_PR_OPGAVE } from "./point";

type Props = {
  todos: Todo[];
  // setTodos virker som "sæt-funktionen" fra useState: vi giver den enten
  // en ny liste, eller en funktion der laver den nye liste ud fra den gamle.
  setTodos: (nye: Todo[] | ((gamle: Todo[]) => Todo[])) => void;
};

// To-do listen: skriv en opgave, kryds den af som klaret, eller slet den.
// Hver færdig opgave giver point (se POINT_PR_OPGAVE i point.ts).
// Alle ændringer sendes op til App via setTodos, som gemmer dem i localStorage.
export function TodoListe({ todos, setTodos }: Props) {
  // Teksten i skrivefeltet lige nu. Tømmes når opgaven er lagt til.
  const [nyTekst, setNyTekst] = useState("");

  // Er "Færdige"-folderen foldet ud? Starter lukket, så en lang liste
  // med gamle opgaver hverken fylder skærmen eller skal tegnes.
  const [visFaerdige, setVisFaerdige] = useState(false);

  // Læg en ny opgave nederst i "skal gøres".
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

  // Fjern en opgave helt fra listen. En færdig opgave giver point, så der
  // spørger vi først - ellers kan man komme til at slette point væk ved et
  // uheld. Opgaver der ikke er klaret, slettes uden at spørge.
  function sletTodo(id: string) {
    const todo = todos.find((t) => t.id === id);
    if (todo?.faerdig) {
      const svar = window.confirm(
        `Slet "${todo.tekst}"? Så mister du ${POINT_PR_OPGAVE} point.`,
      );
      if (!svar) return;
    }
    setTodos((gamle) => gamle.filter((todo) => todo.id !== id));
  }

  // Del opgaverne i to bunker: dem der mangler, og dem der er klaret.
  const skalGoeres = todos.filter((todo) => !todo.faerdig);
  const faerdige = todos.filter((todo) => todo.faerdig);

  // Point fra de færdige opgaver - kun til at vise her på siden.
  // (Selve pointtallet i toppen regnes i App.tsx.)
  const opgavePoint = faerdige.length * POINT_PR_OPGAVE;

  return (
    <div className="flex flex-col gap-4">
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

      {/* Er der slet ingen opgaver, viser vi bare en lille besked. */}
      {todos.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-700 p-4 text-center text-slate-500">
          Ingen opgaver endnu.
        </p>
      )}

      {/* Bunke 1: opgaver der stadig mangler at blive gjort. */}
      {skalGoeres.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-slate-400">
            Skal gøres ({skalGoeres.length})
          </h2>
          <ul className="flex flex-col gap-2">
            {skalGoeres.map((todo) => (
              <TodoRaekke
                key={todo.id}
                todo={todo}
                onSkift={() => skiftFaerdig(todo.id)}
                onSlet={() => sletTodo(todo.id)}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Der er opgaver, men alle er klaret. */}
      {todos.length > 0 && skalGoeres.length === 0 && (
        <p className="text-sm text-emerald-400">Alt er klaret 🎉</p>
      )}

      {/* Bunke 2: færdige opgaver, gemt i en foldbar folder. */}
      {faerdige.length > 0 && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setVisFaerdige((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200"
          >
            {/* Lille pil der peger til højre (lukket) eller ned (åben). */}
            <span>{visFaerdige ? "▾" : "▸"}</span>
            Færdige ({faerdige.length}) · {opgavePoint} point
          </button>

          {/* Selve listen tegnes kun, når folderen er foldet ud. */}
          {visFaerdige && (
            <ul className="flex flex-col gap-2">
              {faerdige.map((todo) => (
                <TodoRaekke
                  key={todo.id}
                  todo={todo}
                  onSkift={() => skiftFaerdig(todo.id)}
                  onSlet={() => sletTodo(todo.id)}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// Én række i listen. Bruges både til "skal gøres" og "færdige".
function TodoRaekke({
  todo,
  onSkift,
  onSlet,
}: {
  todo: Todo;
  onSkift: () => void;
  onSlet: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 p-3">
      {/* Klik på cirklen krydser opgaven af (eller fjerner fluebenet igen). */}
      <button
        type="button"
        onClick={onSkift}
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
        onClick={onSlet}
        className="rounded-lg px-2 py-1 text-sm text-red-400 hover:bg-red-500/10"
      >
        Slet
      </button>
    </li>
  );
}
