import React from "react";
import { Dispatch, SetStateAction } from "react";
import Button from "@/components/common/Button";

type Props = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    children?: React.ReactNode;
}

const Popup = (props: Props) => {
    return props.open?(
        <div className="w-full h-full absolute top-0 left-0 backdrop-filter backdrop-brightness-75 z-999 flex justify-center items-center" onClick={() => props.setOpen(false)}>
            <div className="w-96 h-44 relative bg-black z-10" onClick={(e) => e.stopPropagation()}>
                <div className="w-96 p-4 left-0 top-0 absolute rounded-lg outline-2 outline-gray-700 inline-flex flex-col justify-start items-start gap-4">
                    <div className="self-stretch flex flex-col justify-start items-start gap-1">
                        <div className="self-stretch justify-center text-base font-normal font-['Inter'] leading-snug">Send Order</div>
                        <div className="self-stretch min-h-12 opacity-50 justify-start text-xs font-normal font-['Inter'] leading-none">You won’t be able to change order details after sending order, and cancellation will no longer be possible once the shop accepts your order.</div>
                    </div>
                    <div className="self-stretch inline-flex justify-start items-start gap-1 w-96 ">
                        <Button className="w-44" appearance="tonal"><p>Nevermind</p></Button>
                        <Button className="w-44" appearance="filled"><p>Send Order</p></Button>
                    </div>
                </div>
            </div>
        </div>
    ) : <></>;
};

export default Popup; 