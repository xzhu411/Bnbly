import Image from "next/image";
import ContactButton from "@/app/components/ContactButton";
import PropertyList from "@/app/components/properties/PropertyList";
import Conversation from "@/app/components/inbox/Conversation";

const InboxPage = () => {
    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6 space-y-4">
            <h1 className="my-6 text-2xl">Inbox</h1>
            <Conversation/>
            <Conversation/>
            <Conversation/>
        </main>
    )
}

export default InboxPage;