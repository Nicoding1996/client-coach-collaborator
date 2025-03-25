
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Search, Plus, Filter } from "lucide-react";
import { Link } from "react-router-dom";

// Mock clients data
const clients = [
  {
    id: "1",
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    programProgress: 75,
    startDate: "Jan 15, 2023",
    nextSession: "Today, 2:00 PM",
    status: "Active"
  },
  {
    id: "2",
    name: "David Chen",
    email: "david.chen@example.com",
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    programProgress: 40,
    startDate: "Feb 2, 2023",
    nextSession: "Tomorrow, 10:30 AM",
    status: "Active"
  },
  {
    id: "3",
    name: "Sophie Martin",
    email: "sophie.m@example.com",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    programProgress: 60,
    startDate: "Dec 10, 2022",
    nextSession: "Feb 16, 3:15 PM",
    status: "Active"
  },
  {
    id: "4",
    name: "Michael Johnson",
    email: "michael.j@example.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    programProgress: 90,
    startDate: "Nov 5, 2022",
    nextSession: "Feb 18, 1:00 PM",
    status: "Active"
  },
  {
    id: "5",
    name: "Lisa Brooks",
    email: "lisa.brooks@example.com",
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    programProgress: 100,
    startDate: "Aug 20, 2022",
    nextSession: "None",
    status: "Completed"
  }
];

const CoachClients = () => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
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
          <Card key={client.id} className="hover-lift">
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
                    <Button variant="outline" size="sm" className="w-full md:w-auto">
                      Profile
                    </Button>
                    <Button size="sm" className="w-full md:w-auto">
                      Message
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
