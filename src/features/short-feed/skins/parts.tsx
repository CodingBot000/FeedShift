import type { LucideIcon } from "lucide-react";

type ActionButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  filled?: boolean;
  showLabel?: boolean;
  count?: string;
};

export function ActionButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  filled = false,
  showLabel = false,
  count,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className={[
        "action-btn",
        active ? "is-active" : "",
        active && filled ? "is-filled" : "",
        showLabel ? "has-label" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      aria-label={count ? `${label} ${count}` : label}
      aria-pressed={active}
    >
      <Icon size={26} strokeWidth={2} aria-hidden="true" />
      {showLabel ? <span className="action-label">{label}</span> : null}
      {count ? <span className="action-count">{count}</span> : null}
    </button>
  );
}

export function AvatarCircle({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <span
      className="avatar-circle"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      aria-hidden="true"
    >
      {name.replace("@", "").charAt(0).toUpperCase()}
    </span>
  );
}

export function formatCount(value: number): string {
  if (value >= 1000) {
    const compact = value / 1000;
    return `${compact >= 10 ? Math.round(compact) : compact.toFixed(1)}K`;
  }
  return String(value);
}
