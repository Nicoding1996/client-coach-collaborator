
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Calendar, ChevronRight } from "lucide-react";

// Mock coaches data
const coaches = [
  {
    id: "1",
    name: "Sarah Johnson",
    title: "Executive Coach",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 4.9,
    specialties: ["Leadership Development", "Career Transitions", "Work-Life Balance"],
    nextSession: "Today, 2:00 PM",
    bio: "Certified Executive Coach with 8+ years of experience helping professionals achieve their career goals.",
    relationship: "Primary Coach"
  },
  {
    id: "2",
    name: "Michael Stevens",
    title: "Leadership Coach",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4.8,
    specialties: ["Team Management", "Public Speaking", "Strategic Planning"],
    nextSession: "Feb 18, 11:00 AM",
    bio: "Specialized in helping emerging leaders develop their full potential through personalized coaching.",
    relationship: "Secondary Coach"
  }
];

const ClientCoaches = () => {
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
        <h1 className="text-3xl font-bold tracking-tight">My Coaches</h1>
        <Button>Find a Coach</Button>
      </div>
      
      <div className="grid gap-6">
        {coaches.map((coach) => (
          <Card key={coach.id} className="hover-lift">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center md:items-start md:flex-row gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={coach.avatar} alt={coach.name} />
                    <AvatarFallback>{getInitials(coach.name)}</AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <Badge variant="outline" className="mb-2">{coach.relationship}</Badge>
                    <h2 className="text-xl font-bold">{coach.name}</h2>
                    <p className="text-muted-foreground">{coach.title}</p>
                    
                    <div className="flex items-center mt-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < Math.floor(coach.rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-medium">{coach.rating}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {coach.specialties.map((specialty, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-muted rounded-full">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4 md:ml-6">
                  <p className="text-sm">{coach.bio}</p>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Next Session</p>
                      <p className="text-sm text-muted-foreground">{coach.nextSession}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Find More Coaches</CardTitle>
          <CardDescription>
            Connect with additional coaches who specialize in areas that interest you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover-lift">
              <CardContent className="p-5">
                <h3 className="font-medium">Leadership Development</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Find coaches who specialize in helping you grow as a leader
                </p>
                <Button variant="ghost" className="w-full mt-4 justify-between">
                  Browse Coaches
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover-lift">
              <CardContent className="p-5">
                <h3 className="font-medium">Career Transitions</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Connect with coaches who can guide you through career changes
                </p>
                <Button variant="ghost" className="w-full mt-4 justify-between">
                  Browse Coaches
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover-lift">
              <CardContent className="p-5">
                <h3 className="font-medium">Work-Life Balance</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Discover coaches specializing in well-being and balance
                </p>
                <Button variant="ghost" className="w-full mt-4 justify-between">
                  Browse Coaches
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientCoaches;
