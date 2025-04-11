import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Search, Plus, Filter, MessageSquare } from "lucide-react"; // Added MessageSquare
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { authAPI } from '@/services/api';
import { debounce } from 'lodash';
import { toast } from 'sonner'; // Import toast for feedback

const CoachClients = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatLoading, setChatLoading] = useState<string | null>(null); // State to track loading for specific client chat
  const navigate = useNavigate(); // Navigation hook

  useEffect(() => {
    const fetchClients = async (search = '') => {
      try {
        const data = await authAPI.getClients({ search });
        setClients(data);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      }
    };

    const debouncedFetch = debounce(fetchClients, 300);
    debouncedFetch(searchTerm);

    return () => {
      debouncedFetch.cancel();
    };
  }, [searchTerm]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  // Function to handle starting a chat
  const handleStartChat = async (clientUserId: string, clientRecordId: string) => {
      if (!clientUserId) {
          toast.error("Cannot start chat: Client user ID is missing.");
          console.error("Client record is missing userId:", clientRecordId);
          return;
      }
      setChatLoading(clientRecordId); // Set loading state for this specific client
      try {
          console.log(`[Start Chat] Requesting conversation for clientUserId: ${clientUserId}`);
          // Call the API function
          const conversation = await authAPI.findOrCreateConversation(clientUserId);
          console.log('[Start Chat] Conversation found/created:', conversation);

          if (conversation && conversation._id) {
              // Navigate to the messages page with the conversation ID
              // Note: Navigation call updated in Step 4 below
              navigate(`/coach/messages/${conversation._id}`);
          } else {
              throw new Error("Failed to get conversation ID from API response.");
          }
      } catch (error) {
          console.error("Failed to start chat:", error);
          toast.error("Could not start chat. Please try again.");
      } finally {
          setChatLoading(null); // Clear loading state regardless of outcome
      }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <Link to="/coach/invite">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Invite Client
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search clients..." 
            className="pl-10 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none">
            <Clock className="mr-2 h-4 w-4" />
            Recent
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6">
        {clients.map((client) => (
          <Card key={client._id || client.id} className="hover-lift"> {/* Use client._id or client.id as key */}
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={client.avatar} alt={client.name} />
                    <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <h3 className="font-medium">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:flex items-center">
                  <div className="min-w-[140px]">
                    <p className="text-xs text-muted-foreground mb-1">Program Progress</p>
                    <div className="flex items-center gap-2">
                      <Progress value={client.programProgress} className="h-2 flex-1" />
                      <span className="text-xs font-medium">{client.programProgress}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                      <p className="text-sm">{client.startDate}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Next Session</p>
                    <p className="text-sm">{client.nextSession}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link to={`/coach/clients/${client.id}`} className="w-full md:w-auto">
                      <Button variant="outline" size="sm" className="w-full md:w-auto">
                        Profile
                      </Button>
                    </Link>
                    {/* Remove Link, add onClick and disabled state */}
                    <Button
                      size="sm"
                      className="w-full md:w-auto"
                      // Pass client.userId and client._id (or client.id)
                      onClick={() => handleStartChat(client.userId, client._id || client.id)}
                      disabled={chatLoading === (client._id || client.id)} // Disable only the clicked button
                    >
                       {chatLoading === (client._id || client.id) ? (
                           <>
                             {/* Loading spinner */}
                             <div className="h-4 w-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                             Starting...
                           </>
                       ) : (
                           <>
                             <MessageSquare className="mr-2 h-4 w-4" /> {/* Optional: Add icon */}
                             Message
                           </>
                       )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoachClients;
