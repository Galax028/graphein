import cn from "@/utils/helpers/cn";
import React, { useState } from 'react';
import Button from "@/components/common/Button";

function NumberInput() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    setCount(count - 1);
    if (count === 0){
        setCount(0);
    } 
  };
  

  return (
    <div className={cn(`flex flex-row gap-2 p-2 bg-surfaceContainer border border-outline rounded-lg justify-around`)}>
      <Button appearance="tonal" icon="remove" onClick={decrement}/>
      <p>{count}</p>
      <Button appearance="tonal" icon="add" onClick={increment}/>
    </div>
  );
}

export default NumberInput;