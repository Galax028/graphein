import cn from "@/utils/helpers/code/cn";
import { useState } from "react";

type TextInputProps = {
  placeholder?: string;
  type?: "text" | "email" ;
}

function TextInput ({ placeholder, type }: TextInputProps) {
  const [inputValue, setInputValue] = useState('');
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const filteredValue = value.replace(/[^a-zA-Z]/g, '');
    setInputValue(filteredValue);
  };

  return(
      <input className={cn(
        `p-2 h-10 w-full text-start !border-r z-10 text-body-md
          border border-outline [appearance:textfield] 
          [&::-webkit-outer-spin-button]:appearance-none 
          [&::-webkit-inner-spin-button]:appearance-none
          rounded-lg
        `
      )} type={type} placeholder={placeholder}
      onChange={handleChange}
      value={inputValue}
      />
  )
}

export default TextInput;