
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Calendar, Clock, Users, CheckCircle2, XCircle } from "lucide-react";

// Mock engagement data
const engagements = [
  {
    id: "1",
    title: "Career Transition Coaching",
    coach: {
      name: "Dr. Jane Smith",
      avatar: "",
    },
    startDate: "2023-05-01",
    endDate: "2023-07-31",
    status: "active",
    progress: 65,
    nextSession: "2023-06-15T10:00:00",
    goals: [
      { id: "g1", text: "Identify career strengths", completed: true },
      { id: "g2", text: "Research potential career paths", completed: true },
      { id: "g3", text: "Update resume and LinkedIn profile", completed: false },
      { id: "g4", text: "Prepare for interviews", completed: false }
    ]
  },
  {
    id: "2",
    title: "Leadership Development",
    coach: {
      name: "Robert Johnson",
      avatar: "",
    },
    startDate: "2023-03-15",
    endDate: "2023-09-15",
    status: "active",
    progress: 40,
    nextSession: "2023-06-20T14:00:00",
    goals: [
      { id: "g5", text: "Complete leadership assessment", completed: true },
      { id: "g6", text: "Develop communication strategy", completed: true },
      { id: "g7", text: "Practice conflict resolution", completed: false },
      { id: "g8", text: "Lead team project", completed: false }
    ]
  },
  {
    id: "3",
    title: "Work-Life Balance Coaching",
    coach: {
      name: "Dr. Jane Smith",
      avatar: "",
    },
    startDate: "2023-01-10",
    endDate: "2023-04-10",
    status: "completed",
    progress: 100,
    nextSession: null,
    goals: [
      { id: "g9", text: "Establish daily routine", completed: true },
      { id: "g10", text: "Set boundaries at work", completed: true },
      { id: "g11", text: "Implement stress management techniques", completed: true },
      { id: "g12", text: "Develop hobbies outside of work", completed: true }
    ]
  }
];

const ClientEngagements = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter engagements based on search query
  const filteredEngagements = engagements.filter((engagement) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      engagement.title.toLowerCase().includes(lowerCaseQuery) ||
      engagement.coach.name.toLowerCase().includes(lowerCaseQuery)
    );
  });
  
  // Get active and completed engagements
  const activeEngagements = filteredEngagements.filter(eng => eng.status === "active");
  const completedEngagements = filteredEngagements.filter(eng => eng.status === "completed");
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Format next session date and time
  const formatSessionTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return "No upcoming sessions";
    
    const dateTime = new Date(dateTimeString);
    const date = dateTime.toLocaleDateString();
    const time = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return `${date} at ${time}`;
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coaching Engagements</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and goals across coaching programs
          </p>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search engagements..."
            className="pl-8 w-full sm:w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Engagements</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-6">
          {activeEngagements.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No active engagements</h3>
              <p className="text-muted-foreground mt-1">
                You don't have any active coaching engagements
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeEngagements.map((engagement) => (
                <Card key={engagement.id} className="transition hover:shadow-md">
                  <CardHeader>
                    <div className="flex justify-between">
                      <Badge variant="default">Active</Badge>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(engagement.startDate)} - {formatDate(engagement.endDate)}
                      </div>
                    </div>
                    <CardTitle className="mt-2">{engagement.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarImage src={engagement.coach.avatar} alt={engagement.coach.name} />
                        <AvatarFallback className="text-xs">{getInitials(engagement.coach.name)}</AvatarFallback>
                      </Avatar>
                      {engagement.coach.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Next session: {formatSessionTime(engagement.nextSession)}</span>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{engagement.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${engagement.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Goals</h4>
                      <ul className="space-y-1">
                        {engagement.goals.map((goal) => (
                          <li key={goal.id} className="flex items-start text-sm">
                            {goal.completed ? (
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 mr-2 text-muted-foreground mt-0.5 flex-shrink-0" />
                            )}
                            <span className={goal.completed ? "line-through text-muted-foreground" : ""}>
                              {goal.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">View Details</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-6">
          {completedEngagements.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No completed engagements</h3>
              <p className="text-muted-foreground mt-1">
                You haven't completed any coaching engagements yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedEngagements.map((engagement) => (
                <Card key={engagement.id} className="transition hover:shadow-md">
                  <CardHeader>
                    <div className="flex justify-between">
                      <Badge variant="success">Completed</Badge>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(engagement.startDate)} - {formatDate(engagement.endDate)}
                      </div>
                    </div>
                    <CardTitle className="mt-2">{engagement.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarImage src={engagement.coach.avatar} alt={engagement.coach.name} />
                        <AvatarFallback className="text-xs">{getInitials(engagement.coach.name)}</AvatarFallback>
                      </Avatar>
                      {engagement.coach.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Completed Goals</h4>
                      <ul className="space-y-1">
                        {engagement.goals.map((goal) => (
                          <li key={goal.id} className="flex items-start text-sm">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="line-through text-muted-foreground">{goal.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">View Summary</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Missing Circle component
const Circle = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
      </svg>
    </div>
  );
};

export default ClientEngagements;
