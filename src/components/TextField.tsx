type TextFieldProps = {
  id: string;
  label: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  prefix?: string;
};

export function TextField({
  id,
  label,
  className,
  value,
  onChange,
  hint,
  error,
  prefix,
}: TextFieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  const input = (
    <input
      id={id}
      name={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={value}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy || undefined}
      onChange={(event) => onChange(event.target.value)}
    />
  );

  return (
    <div className={className ? `field ${className}` : "field"}>
      <label htmlFor={id}>{label}</label>
      {hint ? (
        <p className="hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {prefix ? (
        <div className="money-input">
          <span aria-hidden="true">{prefix}</span>
          {input}
        </div>
      ) : (
        input
      )}
      {error ? (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
