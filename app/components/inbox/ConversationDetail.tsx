'use client';
import Image from "next/image";
import CustomButton from "@/app/components/forms/CustomButton";

const ConversationDetail = () => {
    return (
        <>
            <div className="max-h-[400px] overflow-auto flex flex-col space-y-4">
                <div className="w-[80%] py-4 px-6 rounded-xl bg-gray-200">
                    <p className="font-bold text-gray-500">Bob Li</p>
                    <p>hi</p>
                </div>

                <div className="w-[80%] ml-[20%] py-4 px-6 rounded-xl bg-blue-200">
                    <p className="font-bold text-gray-500">Xiaoai Zhu</p>
                    <p>how are u</p>
                </div>
            </div>

            <div className="mt-4 flex items-center space-x-3 rounded-xl border border-gray-300 px-4 py-3">
                <input 
                    type="text"
                    placeholder="Type your message..."
                    className="h-11 w-full rounded-xl bg-gray-200 px-4"
                    name=""
                    id="" 
                />

                <CustomButton
                    label="Send"
                    onClick={() => console.log("Send clicked")}
                    className="h-11 w-[100px] bg-airbnb px-4 py-2 text-white"
                />
            </div>
        </>
    );
}

export default ConversationDetail;
