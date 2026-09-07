type Props = {
  note: string;
  onNote: (tekst: string) => void;
};

// Et lille valgfrit tekstfelt til dagens note ("træt i dag", "god træning").
// Noten gemmes pr. dato og kan ses igen i historikken. At skrive lidt om
// hvordan dagen gik gør det lettere at forstå, hvorfor gode og dårlige
// perioder opstår.
export function DagNote({ note, onNote }: Props) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-slate-700 bg-slate-800 p-3">
      <label
        htmlFor="dag-note"
        className="text-xs font-semibold text-slate-400"
      >
        Note til i dag
      </label>
      <textarea
        id="dag-note"
        value={note}
        onChange={(e) => onNote(e.target.value)}
        placeholder="Hvordan gik dagen? (valgfrit)"
        rows={2}
        className="resize-none rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600"
      />
    </div>
  );
}
