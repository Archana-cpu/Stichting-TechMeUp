import { auth } from '@seq/auth';
import { setRequestLocale } from 'next-intl/server';
import { db } from '@seq/database';
import { MessagesView } from '@/components/messages/messages-view';
import type { Locale } from '@seq/i18n';

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function MessagesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Auth is guaranteed by layout
  const session = await auth();
  const userId = session!.user.id;

  const conversations = await db.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    },
    include: {
      sender: {
        select: { id: true, username: true, name: true, image: true },
      },
      receiver: {
        select: { id: true, username: true, name: true, image: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const groupedConversations = conversations.reduce((acc, message) => {
    const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
    const otherUser = message.senderId === userId ? message.receiver : message.sender;

    if (!acc[otherUserId]) {
      acc[otherUserId] = {
        user: otherUser,
        messages: [],
        unreadCount: 0,
      };
    }

    acc[otherUserId].messages.push(message);
    if (!message.read && message.receiverId === userId) {
      acc[otherUserId].unreadCount++;
    }

    return acc;
  }, {} as Record<string, { user: typeof conversations[0]['sender']; messages: typeof conversations; unreadCount: number }>);

  return <MessagesView conversations={Object.values(groupedConversations)} currentUserId={userId} />;
}
