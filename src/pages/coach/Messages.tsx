import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Send, Paperclip, MoreVertical, Phone, Video } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { authAPI } from "@/services/api";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { useWebSocket } from "@/contexts/WebSocketContext"; // Import WebSocket hook
import { toast } from 'sonner'; // Import toast

// --- Type Definitions ---
interface Participant {
  _id: string;
  name: string;
  avatar?: string;
  email?: string;
  role?: string;
}

interface ConversationType {
  _id: string;
  participants: Participant[];
  updatedAt: string;
  // Optional: Add fields for last message preview later
  lastMessage?: string;
  lastMessageTimestamp?: string;
  unreadCount?: number;
}

interface MessageType {
  _id: string;
  conversationId: string;
  senderId: Participant; // Expect populated sender
  content: string;
  readBy: string[];
  createdAt: string; // From timestamps
}

// --- Component ---
const CoachMessages = () => {
  const { user } = useAuth();
  const { conversationId: selectedConversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate(); // For navigation
  const { socket } = useWebSocket();

  // State
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Add state for search query if implementing search
  // const [searchQuery, setSearchQuery] = useState("");

  // --- Helper Functions ---
  const getInitials = (name: string = '') => {
    return name
      ?.split(" ")
      ?.map(part => part[0])
      ?.join("")
      ?.toUpperCase() || '?';
  };

  // --- Data Fetching Effects ---
  useEffect(() => {
    const fetchConversations = async () => {
      setLoadingConversations(true);
      setError(null);
      try {
        const data = await authAPI.getConversations();
        console.log('[Messages] Fetched Conversations:', data);
        // Add placeholder last message/unread for UI demo if needed
        const formattedData = (data || []).map((conv: ConversationType) => ({
          ...conv,
          lastMessage: "Placeholder last message...", // Replace later
          unreadCount: Math.floor(Math.random() * 3) // Random unread count for demo
        }));
        setConversations(formattedData);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        setError("Failed to load conversations.");
        toast.error("Failed to load conversations.");
      } finally {
        setLoadingConversations(false);
      }
    };
    fetchConversations();
  }, []); // Run only on mount

  useEffect(() => {
    if (selectedConversationId) {
      const fetchMessages = async () => {
        setLoadingMessages(true);
        setError(null); // Clear previous message errors
        try {
          const data = await authAPI.getMessages(selectedConversationId);
          console.log(`[Messages] Fetched Messages for ${selectedConversationId}:`, data);
          setMessages(data || []);
        } catch (err) {
          console.error(`Failed to fetch messages for ${selectedConversationId}:`, err);
          setError("Failed to load messages for this conversation.");
          toast.error("Failed to load messages.");
          setMessages([]);
        } finally {
          setLoadingMessages(false);
        }
      };
      fetchMessages();
    } else {
      setMessages([]); // Clear messages if no conversation is selected
    }
  }, [selectedConversationId]);

  // --- WebSocket Listeners Effect (Placeholder) ---
  useEffect(() => {
    if (socket) {
      console.log('[WS Coach Messages] Setting up listeners...');
      // TODO: Add listeners for 'new_message', 'message_read', etc.
      // Example:
      // socket.on('new_message', (newMessage: MessageType) => {
      //   // Check if the message belongs to the currently selected conversation
      //   if (newMessage.conversationId === selectedConversationId) {
      //     setMessages(prev => [...prev, newMessage]);
      //     // TODO: Mark as read? Update conversation list?
      //   } else {
      //     // TODO: Update unread count for the correct conversation in the list
      //     toast.info(`New message from ${newMessage.senderId?.name}`);
      //   }
      // });

      return () => {
        console.log('[WS Coach Messages] Cleaning up listeners...');
        // TODO: socket.off(...) for all listeners
      };
    }
  }, [socket, selectedConversationId]); // Add selectedConversationId dependency if needed by listeners

  // --- Event Handlers ---
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    console.log("Sending message:", newMessage, "to conversation:", selectedConversationId);
    // TODO: Implement API call to POST message
    // Example:
    // authAPI.sendMessage(selectedConversationId, newMessage)
    //   .then(sentMessage => {
    //      setMessages(prev => [...prev, sentMessage]); // Optimistic update or use WS echo
    //      setNewMessage("");
    //      // TODO: Update conversation list (last message, timestamp)
    //   })
    //   .catch(err => toast.error("Failed to send message."));
    setNewMessage(""); // Clear input for now
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- Rendering ---
  return (
    <div className="h-[calc(100vh-10rem)] animate-fadeIn flex flex-col"> {/* Full height */}
      {/* Top level loading/error check for conversations */}
      {loadingConversations ? (
        <div className="flex-1 flex items-center justify-center"><p>Loading conversations...</p></div>
      ) : error && conversations.length === 0 ? ( // Show error only if loading failed AND no convos loaded
        <div className="flex-1 flex items-center justify-center"><p className="text-red-500">{error}</p></div>
      ) : (
        // Main layout when conversations are loaded (or empty)
        <div className="flex flex-1 h-full rounded-lg overflow-hidden border"> {/* Flex row for columns */}

          {/* Conversations Sidebar */}
          <div className="w-full sm:w-80 border-r bg-card flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search conversations..." className="pl-10" />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {conversations.length === 0 && !loadingConversations ? ( // Check loading state here too
                <p className="p-4 text-center text-muted-foreground">No conversations yet.</p>
              ) : (
                conversations.map((conv) => {
                  const otherParticipant = conv.participants?.find(p => p?._id !== user?._id);
                  const displayName = otherParticipant?.name || 'Unknown User';
                  const displayAvatar = otherParticipant?.avatar;
                  const lastMessage = conv.lastMessage || "No messages yet..."; // Use placeholder
                  const timestamp = conv.updatedAt ? format(new Date(conv.updatedAt), 'p') : '';
                  const unreadCount = conv.unreadCount || 0; // Use placeholder

                  return (
                    <Link key={conv._id} to={`/coach/messages/${conv._id}`}>
                      <div className={cn("flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50", selectedConversationId === conv._id ? "bg-muted" : "")}>
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={displayAvatar} alt={displayName} className="object-cover"/>
                            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                          </Avatar>
                          {/* TODO: Online Indicator */}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium truncate">{displayName}</h3>
                            <span className="text-xs text-muted-foreground">{timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
                        </div>
                        {unreadCount > 0 && (
                          <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">{unreadCount}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </ScrollArea>
          </div>
          {/* End Conversations Sidebar */}

          {/* Chat Area */}
          <div className="hidden sm:flex flex-1 flex-col bg-background">
            {selectedConversationId ? (
              <>
                {/* Chat Header */}
                {(() => {
                   const currentConv = conversations.find(c => c._id === selectedConversationId);
                   const otherParticipant = currentConv?.participants?.find(p => p?._id !== user?._id);
                   const displayName = otherParticipant?.name || 'Conversation';
                   const displayAvatar = otherParticipant?.avatar;
                   const isOnline = false; // Placeholder

                   return (
                      <div className="flex items-center justify-between p-4 border-b bg-card">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={displayAvatar} alt={displayName} className="object-cover"/>
                            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <h3 className="font-medium">{displayName}</h3>
                            <p className="text-xs text-muted-foreground">{isOnline ? "Online" : "Offline"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>
                           <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button>
                           <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                        </div>
                      </div>
                   );
                })()}
                {/* End Chat Header */}

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                   {/* Show loading/error specific to messages */}
                  {loadingMessages ? (
                     <p className="text-center text-muted-foreground">Loading messages...</p>
                  ) : error && messages.length === 0 ? ( // Show error only if loading messages failed
                     <p className="text-center text-red-500">{error}</p>
                  ): messages.length === 0 ? (
                     <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isSenderCoach = message.senderId?._id === user?._id;
                        const senderName = message.senderId?.name || 'Unknown';
                        const senderAvatar = message.senderId?.avatar;
                        const timestamp = message.createdAt ? format(new Date(message.createdAt), 'p, MMM d') : '';

                        return (
                          <div key={message._id} className={`flex ${isSenderCoach ? "justify-end" : "justify-start"}`}>
                            <div className="flex items-end gap-2 max-w-[80%]">
                              {!isSenderCoach && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={senderAvatar} alt={senderName} className="object-cover"/>
                                  <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
                                </Avatar>
                              )}
                              <div className={cn("rounded-lg p-3", isSenderCoach ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs mt-1 opacity-70 text-right">{timestamp}</p>
                              </div>
                              {isSenderCoach && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user?.avatar} alt={user?.name || 'Me'} className="object-cover"/>
                                  <AvatarFallback>{user?.name ? getInitials(user.name) : "Me"}</AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
                {/* End Messages Area */}

                {/* Message Input */}
                <div className="p-4 border-t bg-card">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full"><Paperclip className="h-5 w-5" /></Button>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="rounded-full" size="icon">
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                {/* End Message Input */}
              </> // End fragment for selected conversation view
            ) : (
              // Placeholder when no conversation is selected
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center p-6">
                   <h3 className="font-medium mb-2">Select a conversation</h3>
                   <p className="text-sm text-muted-foreground">Choose a conversation from the list</p>
                </div>
              </div>
            )}
          </div> {/* End Chat Area */}

        </div> // End Main Flex Container (Columns)
      )} {/* End loading/error check */}
    </div> // End Root Div
  );
};

export default CoachMessages;
