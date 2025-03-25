
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Send, Paperclip, MoreVertical, Phone, Video } from "lucide-react";

// Mock data
const conversations = [
  {
    id: "1",
    name: "Emma Wilson",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    lastMessage: "Thanks for the session today!",
    timestamp: "5:32 PM",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "David Chen",
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    lastMessage: "Can we reschedule tomorrow's session?",
    timestamp: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: "3",
    name: "Sophie Martin",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    lastMessage: "I've completed the assignment",
    timestamp: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: "4",
    name: "Michael Johnson",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastMessage: "Looking forward to our next session",
    timestamp: "Feb 10",
    unread: 0,
    online: true,
  },
];

// Mock messages for Emma Wilson
const emmaMessages = [
  {
    id: "m1",
    sender: "client",
    content: "Hello! I wanted to follow up on our session",
    timestamp: "Yesterday, 2:30 PM",
  },
  {
    id: "m2",
    sender: "coach",
    content: "Hi Emma! Of course, how can I help?",
    timestamp: "Yesterday, 2:35 PM",
  },
  {
    id: "m3",
    sender: "client",
    content: "I've been working on those goals we discussed. I've completed the first milestone!",
    timestamp: "Yesterday, 2:40 PM",
  },
  {
    id: "m4",
    sender: "coach",
    content: "That's fantastic progress, Emma! I knew you could do it. How did it feel to accomplish that?",
    timestamp: "Yesterday, 2:45 PM",
  },
  {
    id: "m5",
    sender: "client",
    content: "It felt really good. I was nervous at first, but once I got started, it wasn't as difficult as I thought it would be.",
    timestamp: "Yesterday, 3:00 PM",
  },
  {
    id: "m6",
    sender: "coach",
    content: "That's often the case! Getting started is usually the hardest part. I'm proud of you for pushing through that initial resistance.",
    timestamp: "Yesterday, 3:05 PM",
  },
  {
    id: "m7",
    sender: "client",
    content: "Thanks! Do you have any suggestions for the next milestone?",
    timestamp: "Today, 11:30 AM",
  },
  {
    id: "m8",
    sender: "coach",
    content: "Absolutely. Let's discuss that in our session today. I have some ideas that might work well with your strengths.",
    timestamp: "Today, 12:15 PM",
  },
  {
    id: "m9",
    sender: "client",
    content: "Sounds great! Thanks for the session today!",
    timestamp: "Today, 5:32 PM",
  },
];

const CoachMessages = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState(emmaMessages);
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };
  
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    const newMessage = {
      id: `m${messages.length + 1}`,
      sender: "coach",
      content: messageInput,
      timestamp: "Just now",
    };
    
    setMessages([...messages, newMessage]);
    setMessageInput("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] animate-fadeIn">
      <div className="flex h-full rounded-lg overflow-hidden border">
        {/* Conversations sidebar */}
        <div className="w-full sm:w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search messages..." 
                className="pl-10" 
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            {conversations.map((conversation) => (
              <div 
                key={conversation.id}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedConversation.id === conversation.id ? "bg-muted" : ""
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={conversation.avatar} alt={conversation.name} />
                    <AvatarFallback>{getInitials(conversation.name)}</AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card"></span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">{conversation.name}</h3>
                    <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                </div>
                
                {conversation.unread > 0 && (
                  <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">{conversation.unread}</span>
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
        </div>
        
        {/* Chat area */}
        <div className="hidden sm:flex flex-1 flex-col bg-background">
          {/* Chat header */}
          <div className="flex items-center justify-between p-4 border-b bg-card">
            <div className="flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                <AvatarFallback>{getInitials(selectedConversation.name)}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <h3 className="font-medium">{selectedConversation.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedConversation.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender === "coach" ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-end gap-2 max-w-[80%]">
                    {message.sender === "client" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                        <AvatarFallback>{getInitials(selectedConversation.name)}</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div 
                      className={`rounded-lg p-3 ${
                        message.sender === "coach" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                    </div>
                    
                    {message.sender === "coach" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>{user?.name ? getInitials(user.name) : "C"}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {/* Message input */}
          <div className="p-4 border-t bg-card">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input 
                placeholder="Type a message..." 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!messageInput.trim()} 
                className="rounded-full"
                size="icon"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile: Select a conversation prompt */}
        <div className="flex flex-1 items-center justify-center sm:hidden">
          <div className="text-center p-6">
            <h3 className="font-medium mb-2">Select a conversation</h3>
            <p className="text-sm text-muted-foreground">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachMessages;
