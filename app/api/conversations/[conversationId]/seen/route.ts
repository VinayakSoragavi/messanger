import { NextResponse, NextRequest } from "next/server";
import { pusherServer } from "@/app/libs/pusher";
import getCurrentUser from "@/app/action/getCurrentUser";
import prisma from "../../../../../prisma/index";

interface IParams {
  conversationId?: string;
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      console.error("Invalid params:", { conversationId });
      return NextResponse.json(null);
    }

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      console.error("Current user not found");
      return NextResponse.json(null);
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

    existingConversation.users.forEach((user: any) => {
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
    return NextResponse.json(null);
  }
}
