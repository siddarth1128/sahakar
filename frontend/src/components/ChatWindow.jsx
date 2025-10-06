import React, { useState, useEffect, useRef } from 'react';
import Input from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { apiGet, apiPost } from '../lib/api';
import { useSocket } from '../context/SocketProvider';

const ChatWindow = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);
  const user = useSelector((state) => state.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (socket && chatId) {
      socket.emit('joinChat', chatId);
      const onNewMessage = (message) => {
        if (!message) return;
        // ensure message belongs to this chat
        if (message.chatId === chatId) {
          setMessages((prev) => [...prev, message]);
        }
      };
      socket.on('newMessage', onNewMessage);
      return () => {
        socket.off('newMessage', onNewMessage);
        socket.emit('leaveChat', chatId);
      };
    }
  }, [socket, chatId]);

  const { data: initialMessages = [] } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const data = await apiGet(`/api/chat/${chatId}`);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user?.token && !!chatId,
  });

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const mutation = useMutation({
    mutationFn: async (messageText) => {
      return apiPost('/api/chat/send', { chatId, content: messageText });
    },
    onSuccess: (data) => {
      if (data?.message) setMessages((prev) => [...prev, data.message]);
      setNewMessage('');
      queryClient.invalidateQueries(['chat', chatId]);
    },
  });

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      mutation.mutate(newMessage);
      socket.emit('sendMessage', { chatId, message: newMessage, senderId: user.id });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  if (!chatId) return <div>Select a chat to start messaging</div>;

  return (
    <Card className="h-[600px] flex flex-col">
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.senderId === user.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{msg.content || msg.text}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage} disabled={mutation.isPending || !newMessage.trim()}>
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatWindow;