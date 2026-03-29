interface ActionButtonProps {
  label: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

const ActionButton = ({ label, variant = "secondary", onClick }: ActionButtonProps) => {
  const isPrimary = variant === "primary";

  return (
    <button
      className={[
        "cursor-pointer w-full rounded-xl py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-all",
        isPrimary
          ? "bg-[linear-gradient(135deg,var(--dashboard-primary),#7a6bff)] text-white shadow-[0_0_20px_rgba(90,90,246,0.3)] hover:-translate-y-0.5"
          : "bg-transparent border-2 border-[var(--dashboard-border)] text-white hover:border-[color:rgba(90,90,246,0.5)]",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
    </button>
  );
};

export default ActionButton;
