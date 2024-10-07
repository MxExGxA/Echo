import { ChangeEventHandler } from "react";

const TextInput = ({
  placeholder,
  value,
  onChange,
  readOnly,
  error,
}: {
  placeholder: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  readOnly?: boolean;
  error?: string;
}) => {
  return (
    <div className="relative">
      <input
        className={`rounded-[4px] px-5 w-64 h-12 mt-5 border-2 ${
          error ? "border-main-red" : "border-main-blue"
        } outline-none`}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
      {error && (
        <p className="text-xs text-main-red absolute whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextInput;
