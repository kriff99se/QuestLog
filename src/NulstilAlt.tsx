type Props = {
  onNulstil: () => void; // kaldes når brugeren har bekræftet
};

// En "farezone" nederst i appen: knappen sletter ALT og starter forfra.
// Vi spørger to gange, fordi det ikke kan fortrydes.
export function NulstilAlt({ onNulstil }: Props) {
  function haandterKlik() {
    const foerste = window.confirm(
      "Nulstil ALT?\n\nAlle vaner, afkrydsninger, streaks, point og opgaver " +
        "slettes, og appen starter helt forfra. Det kan ikke fortrydes.",
    );
    if (!foerste) return;

    const anden = window.confirm("Er du helt sikker? Sidste chance.");
    if (!anden) return;

    onNulstil();
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-red-500/30 p-3 text-sm">
      <span className="text-slate-400">Slet alt og start forfra</span>
      <button
        type="button"
        onClick={haandterKlik}
        className="rounded-lg px-3 py-1 text-red-400 hover:bg-red-500/10"
      >
        Nulstil alt
      </button>
    </div>
  );
}
