"use client";

export function FunnelFooter({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className="funnelFooter">
      <button
        type="button"
        className="funnelPrimaryBtn funnelFooterBtn"
        disabled={disabled}
        onClick={onClick}
      >
        {label}
      </button>
    </div>
  );
}
