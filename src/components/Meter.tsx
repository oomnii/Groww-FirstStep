export function Meter({
  label,
  value,
  detail,
  percent,
  tone = "indigo",
}: {
  label: string;
  value: string;
  detail?: string;
  percent: number | null;
  tone?: "indigo" | "sky" | "mint" | "stone";
}) {
  const width = percent === null ? 0 : Math.min(100, Math.max(0, percent));

  return (
    <div className="meter">
      <div className="meter-top">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      {percent !== null ? (
        <div
          className="meter-track"
          role="img"
          aria-label={`${label}: ${value}${detail ? `. ${detail}` : ""}`}
        >
          <span className={`meter-fill tone-${tone}`} style={{ width: `${width}%` }} />
        </div>
      ) : null}
      {detail ? <p className="hint">{detail}</p> : null}
    </div>
  );
}
