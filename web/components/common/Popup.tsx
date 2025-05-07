import cn from "@/utils/helpers/cn";
import React, { Dispatch, SetStateAction, useState } from "react";

type PopupProps = {
  title: string;
  desc?: string;
  onClickOutside?: Dispatch<SetStateAction<boolean>>;
  children?: React.ReactNode;
};

const Popup = ({ title, desc, onClickOutside, children }: PopupProps) => {
  return (
    <div
      className={cn(
        `fixed top-0 left-0 grid place-items-center w-dvw h-dvh p-3
          backdrop-filter backdrop-brightness-50 dark:backdrop-brightness-25`
      )}
      // If there's onIgnore value, set value to false.
      onClick={() => onClickOutside && onClickOutside(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(`flex flex-col gap-4 w-full max-w-96 p-4
            bg-surfaceContainer border border-outline rounded-lg`)}
      >
        <div className={cn(`flex flex-col gap-1`)}>
          <p>{title}</p>
          <p className="min-h-12 opacity-50 text-bodySmall">{desc}</p>
        </div>
        <div className="flex gap-1 w-full [&>button]:w-full">{children}</div>
      </div>
    </div>
  );
};

export default Popup;
