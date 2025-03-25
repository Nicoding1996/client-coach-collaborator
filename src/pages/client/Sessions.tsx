
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, Video, FileText, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Mock data
const upcomingSessions = [
  {
    id: "1",
    coachName: "Sarah Johnson",
    coachAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    date: new Date(2023, 1, 15, 14, 0), // Feb 15, 2023, 2:00 PM
    duration: 60,
    type: "Career Development",
    agenda: "Discuss career transition plan and next steps"
  },
  {
    id: "2",
    coachName: "Michael Stevens",
    coachAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    date: new Date(2023, 1, 18, 11, 0), // Feb 18, 2023, 11:00 AM
    duration: 45,
    type: "Leadership Coaching",
    agenda: "Review 360 feedback results and create development plan"
  }
];

const pastSessions = [
  {
    id: "3",
    coachName: "Sarah Johnson",
    coachAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    date: new Date(2023, 1, 8, 14, 0), // Feb 8, 2023, 2:00 PM
    duration: 60,
    type: "Career Development",
    summary: "Discussed strengths assessment results and identified three key areas of focus: strategic thinking, communication, and delegation.",
    completed: true
  },
  {
    id: "4",
    coachName: "Michael Stevens",
    coachAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    date: new Date(2023, 1, 5, 10, 30), // Feb 5, 2023, 10:30 AM
    duration: 45,
    type: "Check-in",
    summary: "Quick progress check on presentation preparation. Recommended additional practice techniques.",
    completed: true
  },
  {
    id: "5",
    coachName: "Sarah Johnson",
    coachAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    date: new Date(2023, 1, 1, 15, 0), // Feb 1, 2023, 3:00 PM
    duration: 60,
    type: "Goal Setting",
    summary: "Established quarterly goals related to leadership development, public speaking, and project management.",
    completed: true
  }
];

const ClientSessions = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };
  
  const formatSessionDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${format(date, "h:mm a")}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
        <Button>
          Book New Session
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="upcoming" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past Sessions</TabsTrigger>
              </TabsList>
              
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
            
            <TabsContent value="upcoming" className="space-y-4">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <Card key={session.id} className="hover-lift">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={session.coachAvatar} alt={session.coachName} />
                            <AvatarFallback>{getInitials(session.coachName)}</AvatarFallback>
                          </Avatar>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="font-medium">{session.coachName}</h3>
                              <Badge variant="outline" className="ml-2">{session.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatSessionDate(session.date)} • {session.duration} min
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                          <div className="flex items-center gap-2 w-full md:w-auto">
                            <Button variant="outline" size="sm" className="w-full md:w-auto">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Message
                            </Button>
                            <Button size="sm" className="w-full md:w-auto">
                              <Video className="mr-2 h-4 w-4" />
                              Join
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {session.agenda && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium">Agenda:</p>
                          <p className="text-sm text-muted-foreground">{session.agenda}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-12">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Calendar className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      You don't have any upcoming coaching sessions scheduled
                    </p>
                    <Button>Book a Session</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="past" className="space-y-4">
              {pastSessions.map((session) => (
                <Card key={session.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={session.coachAvatar} alt={session.coachName} />
                          <AvatarFallback>{getInitials(session.coachName)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="font-medium">{session.coachName}</h3>
                            <Badge variant="outline" className="ml-2">{session.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(session.date, "MMM d, h:mm a")} • {session.duration} min
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        <Button variant="outline" size="sm" className="w-full md:w-auto">
                          <FileText className="mr-2 h-4 w-4" />
                          View Notes
                        </Button>
                      </div>
                    </div>
                    
                    {session.summary && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">Session Summary:</p>
                        <p className="text-sm text-muted-foreground">{session.summary}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Calendar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">Sessions on {date ? format(date, "MMM d, yyyy") : "Today"}</h3>
              
              {upcomingSessions
                .filter(session => 
                  date && format(session.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                )
                .map((session) => (
                  <div key={session.id} className="flex items-center justify-between border-b last:border-b-0 py-3">
                    <div>
                      <p className="font-medium text-sm">{session.coachName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(session.date, "h:mm a")} • {session.duration} min
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                ))}
              
              {upcomingSessions.filter(session => 
                date && format(session.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
              ).length === 0 && (
                <div className="py-3 text-center">
                  <p className="text-sm text-muted-foreground">No sessions scheduled</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Book for this date
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">Quick Book</h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-muted/50 rounded-lg hover-lift cursor-pointer">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://randomuser.me/api/portraits/women/68.jpg" alt="Sarah Johnson" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium text-sm">Sarah Johnson</p>
                    <p className="text-xs text-muted-foreground">Executive Coach</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-muted/50 rounded-lg hover-lift cursor-pointer">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" alt="Michael Stevens" />
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium text-sm">Michael Stevens</p>
                    <p className="text-xs text-muted-foreground">Leadership Coach</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientSessions;
