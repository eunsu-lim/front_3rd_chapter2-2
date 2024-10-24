import { useState } from "react";

export const useForm = <T>(initialInputState: T) => {
  const [inputState, setInputState] = useState<T>(initialInputState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = "";
    switch (name) {
      case "stock":
      case "price":
      case "discountValue":
      case "quantity":
        parsedValue = parseInt(value);
        break;
      case "rate":
        parsedValue = parseInt(value) / 100;
        break;
      default:
        parsedValue = value;
        break;
    }
    setInputState({ ...inputState, [name]: parsedValue });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputState({
      ...inputState,
      [name]:
        name === "discountType" ? (value as "amount" | "percentage") : value,
    });
  };

  const resetInputState = () => {
    setInputState(initialInputState);
  };

  return {
    inputState: inputState,
    onChange: handleInputChange,
    onSelect: handleSelectChange,
    onReset: resetInputState,
  };
};
