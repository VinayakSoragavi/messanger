import { NextResponse } from "next/server";

import prisma from "@/app/libs/Prismadb";
import { pusherServer } from "@/app/libs/pusher";
import getCurrentUser from "@/app/action/getCurrentUser";

interface IParams {
  conversationId?: string;
}

export async function DELETE(
  { params }: { params?: IParams }
) {
  try {
    if (!params || !params.conversationId) {
      console.error('Invalid params:', params);
      return NextResponse.json(null);
    }
    const { conversationId } = params;
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      console.error('Current user not found');
      return NextResponse.json(null);
    }

    const existingConversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId
      },
      include: {
        users: true
      }
    });

    if (!existingConversation) {
      console.error('Invalid conversation ID:', conversationId);
      return new NextResponse('Invalid ID', { status: 400 });
    }

    console.log('Existing Conversation:', existingConversation);

    const deletedConversation = await prisma.conversation.deleteMany({
      where: {
        id: conversationId,
        userIds: {
          hasSome: [currentUser.id]
        },
      },
    });

    console.log('Deleted Conversation:', deletedConversation);

    existingConversation.users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, 'conversation:remove', existingConversation);
      }
    });

    return NextResponse.json(deletedConversation);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(null);
  }
}
