type Choice = {
  id: string;
  label: string;
  description?: string;
};

type ChoiceGroupProps = {
  id: string;
  name: string;
  legend: string;
  hint?: string;
  value: string | null;
  options: Choice[];
  error?: string;
  layout?: "stack" | "scale";
  onChange: (id: string) => void;
};

export function ChoiceGroup({
  id,
  name,
  legend,
  hint,
  value,
  options,
  error,
  layout = "stack",
  onChange,
}: ChoiceGroupProps) {
  const hintId = `${name}-hint`;
  const errorId = `${name}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <fieldset className="choice-set" id={id} aria-describedby={describedBy || undefined}>
      <legend>{legend}</legend>
      {hint ? (
        <p className="hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      <div className={layout === "scale" ? "choices scale" : "choices"}>
        {options.map((option) => (
          <label className="choice" key={option.id}>
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
            />
            <span>
              <span className="choice-title">{option.label}</span>
              {option.description ? <span className="choice-copy">{option.description}</span> : null}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
