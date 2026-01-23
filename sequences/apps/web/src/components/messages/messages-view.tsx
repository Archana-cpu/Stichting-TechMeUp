'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Input,
  Separator,
} from '@seq/ui';
import { MessageCircle, Send, Search } from 'lucide-react';
import type { Message, User } from '@seq/database';
import { sendMessage } from '@/app/actions';

type Conversation = {
  user: Pick<User, 'id' | 'username' | 'name' | 'image'>;
  messages: Message[];
  unreadCount: number;
};

type MessagesViewProps = {
  conversations: Conversation[];
  currentUserId: string;
};

export function MessagesView({ conversations, currentUserId }: MessagesViewProps) {
  const t = useTranslations('messages');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    conversations[0] || null
  );
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!selectedConversation || !newMessage.trim()) return;

    startTransition(async () => {
      const result = await sendMessage({
        receiverId: selectedConversation.user.id,
        content: newMessage,
      });

      if (result.success) {
        setNewMessage('');
      }
    });
  };

  const getInitials = (name: string | null, username: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return username.slice(0, 2).toUpperCase();
  };

  if (conversations.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageCircle className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold">{t('noMessages')}</h2>
            <p className="mt-2 text-center text-muted-foreground">
              {t('noMessagesDescription')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchConversations')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.user.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-accent ${
                    selectedConversation?.user.id === conv.user.id ? 'bg-accent' : ''
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={conv.user.image ?? undefined} />
                    <AvatarFallback>
                      {getInitials(conv.user.name, conv.user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">
                        {conv.user.name || conv.user.username}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.messages[0]?.content}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat View */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.user.image ?? undefined} />
                    <AvatarFallback>
                      {getInitials(
                        selectedConversation.user.name,
                        selectedConversation.user.username
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {selectedConversation.user.name || selectedConversation.user.username}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      @{selectedConversation.user.username}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex h-[400px] flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {[...selectedConversation.messages].reverse().map((message) => {
                    const isOwn = message.senderId === currentUserId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`mt-1 text-xs ${
                              isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('typeMessage')}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={isPending}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isPending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex h-[500px] items-center justify-center">
              <p className="text-muted-foreground">{t('selectConversation')}</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
