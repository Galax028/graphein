import cn from "@/utils/helpers/cn";
import React, { useState } from 'react';
import Button from "@/components/common/Button";
import SegmentedGroup from "@/components/common/SegmentedGroup";

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
    <SegmentedGroup>
      <Button appearance="tonal" icon="remove" onClick={decrement}/>
      <div className={cn("text-bodyMedium flex items-center justify-center p-2 h-10 w-full border border-outline")}>
        <p>{count}</p>
      </div>
      <Button appearance="tonal" icon="add" onClick={increment}/>
    </SegmentedGroup>
  );
}1

export default NumberInput;