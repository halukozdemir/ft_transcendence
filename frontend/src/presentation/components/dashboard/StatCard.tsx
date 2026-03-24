interface StatCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

const StatCard = ({ label, value, accent = false }: StatCardProps) => {
  return (
    <article
      className={[
        "rounded-lg border p-3",
        accent
          ? "border-[color:rgba(90,90,246,0.2)] bg-[color:rgba(90,90,246,0.1)]"
          : "border-white/5 bg-[color:rgba(40,40,57,0.4)]",
      ].join(" ")}
    >
      <p className={[
        "mb-1 text-[10px] font-bold uppercase tracking-wider",
        accent ? "text-[var(--dashboard-primary)]" : "text-slate-400",
      ].join(" ")}>
        {label}
      </p>
      <p className={[
        "text-xl font-bold",
        accent ? "text-[var(--dashboard-primary)]" : "text-white",
      ].join(" ")}>
        {value}
      </p>
    </article>
  );
};

export default StatCard;
