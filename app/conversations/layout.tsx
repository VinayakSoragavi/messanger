import getConversations from "../action/getConversations";
import Sidebar from "../components/sidebar/Sidebar";
import getUser from "@/app/action/getUser";
import ConversationList from "./components/ConversationList";
export default async function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = await getConversations();
  const users = await getUser();

  return (
    <Sidebar>
      <div className="h-full">
        <ConversationList
          users={users!}
          title="Messages"
          initialItems={conversations}
        />
        {children}
      </div>
    </Sidebar>
  );
}
