import React, { useEffect, useState } from 'react';
import { messagingService } from '../services';
import { toast } from 'react-toastify';
import useAuthStore from '../store/auth';
import useSocket, { useConversationSocket } from '../hooks/useSocket';

const Messaging = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await messagingService.getConversations();
        setConversations(resp.data || []);
      } catch (err) {
        toast.error('Erreur lors du chargement des conversations');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const payload = {
        content: newMessage.trim(),
        receiverId: selectedConversation?.partnerId
      };

      const resp = await messagingService.sendMessage(payload);
      // server will emit 'message_received' to recipients; append locally as well
      setMessages((m) => [resp.data, ...m]);
      setNewMessage('');
    } catch (error) {
      toast.error('Erreur lors de l'envoi du message');
    }
  };

  // Auto-join selected conversation via hook
  useConversationSocket(selectedConversation?.partnerId);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handler = (message) => {
      // Only append messages relevant to the selected conversation
      const partnerId = selectedConversation?.partnerId;
      const isForThisConversation = (
        (message.receiverId && message.receiverId === user?.id && message.senderId === partnerId) ||
        (message.senderId && message.senderId === partnerId && message.receiverId === user?.id) ||
        (message.groupId && selectedConversation?.groupId && message.groupId === selectedConversation.groupId)
      );

      if (isForThisConversation) {
        setMessages((prev) => [message, ...prev]);
      }
    };

    socket.on('message_received', handler);

    return () => {
      socket.off('message_received', handler);
    };
  }, [socket, selectedConversation, user]);

  // Load messages when selecting a conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const params = { conversationWith: selectedConversation.partnerId, limit: 100 };
        const resp = await messagingService.getMessages(params);
        setMessages(resp.data || []);
      } catch (err) {
        toast.error('Erreur lors du chargement des messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [selectedConversation]);

  return (
    <div className="h-screen flex">
      {/* Conversations list */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-600">
              Aucune conversation
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <p className="font-semibold">{conv.name}</p>
                <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <h2 className="text-lg font-bold">{selectedConversation.name}</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.senderId === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Tapez un message..."
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600">
            Sélectionnez une conversation
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
