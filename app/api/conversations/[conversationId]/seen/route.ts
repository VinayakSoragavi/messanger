import prisma from "../../../../../prisma/index";
import { NextResponse } from "next/server";
import { pusherServer } from "@/app/libs/pusher";
import getCurrentUser from "@/app/action/getCurrentUser";

interface IParams {
  conversationId?: string;
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const conversationId = url.searchParams.get("conversationId");

    if (!conversationId) {
      console.error("Invalid params: conversationId is missing");
      return NextResponse.json(null, { status: 400 });
    }

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      console.error("Current user not found");
      return NextResponse.json(null, { status: 401 });
    }

    const existingConversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    });

    if (!existingConversation) {
      console.error("Invalid conversation ID:", conversationId);
      return new NextResponse("Invalid ID", { status: 400 });
    }

    console.log("Existing Conversation:", existingConversation);

    const deletedConversation = await prisma.conversation.deleteMany({
      where: {
        id: conversationId,
        userIds: {
          hasSome: [currentUser.id],
        },
      },
    });

    console.log("Deleted Conversation:", deletedConversation);

    existingConversation.users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(
          user.email,
          "conversation:remove",
          existingConversation
        );
      }
    });

    return NextResponse.json(deletedConversation);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
