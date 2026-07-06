import { leadLabels } from "@/lib/lead-form";

export const employeeOptions = ["5名未満", "5〜10名", "11〜30名", "31〜50名", "51名以上"];

type FieldProps = {
  label: string;
  note?: string;
  name: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "email" | "tel" | "text" | "url" | "none" | "numeric" | "decimal" | "search";
  placeholder?: string;
  required?: boolean;
};

export function Field({
  label,
  note,
  name,
  type = "text",
  autoComplete,
  inputMode,
  placeholder,
  required = false,
}: FieldProps) {
  return (
    <label className="block">
      <span className="form-label">
        {label}
        {note ? <span className="ml-2 text-sm font-bold text-[#6B7D8F]">{note}</span> : null}
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        required={required}
        className="form-input"
      />
    </label>
  );
}

export function EmployeeSelect({
  label = leadLabels.employees,
  note = "任意",
}: {
  label?: string;
  note?: string;
}) {
  return (
    <label className="block">
      <span className="form-label">
        {label}
        {note ? <span className="ml-2 text-sm font-bold text-[#6B7D8F]">{note}</span> : null}
      </span>
      <select name="employees" className="form-input">
        <option value="">選択してください</option>
        {employeeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
