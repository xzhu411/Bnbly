import Link from "next/link";
import ConversationDetail from "@/app/components/inbox/ConversationDetail";

interface ConversationInfo {
    property_title: string | null;
    property_id: string | null;
    participants: { id: string; name: string; avatar: string | null }[];
}

async function getConversationInfo(id: string): Promise<ConversationInfo | null> {
    try {
        // We fetch without auth here just to get basic info - detail view handles auth
        return null;
    } catch {
        return null;
    }
}

const ConversationPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6 space-y-4">
            <div className="flex items-center gap-4 my-4">
                <Link href="/inbox" className="text-gray-500 hover:text-gray-900 font-semibold">
                    ← Back to inbox
                </Link>
            </div>
            <ConversationDetail conversationId={id} />
        </main>
    );
};

export default ConversationPage;
