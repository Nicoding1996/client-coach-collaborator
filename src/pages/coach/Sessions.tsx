
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, Plus, Video, Clock, FileText, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Mock data
const upcomingSessions = [
  {
    id: "1",
    clientName: "Emma Wilson",
    clientAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
    date: new Date(2023, 1, 15, 14, 0), // Feb 15, 2023, 2:00 PM
    duration: 60,
    type: "Career Development",
    notes: "Follow up on career transition plan"
  },
  {
    id: "2",
    clientName: "David Chen",
    clientAvatar: "https://randomuser.me/api/portraits/men/44.jpg",
    date: new Date(2023, 1, 16, 10, 30), // Feb 16, 2023, 10:30 AM
    duration: 45,
    type: "Leadership Coaching",
    notes: "Review 360 feedback results"
  },
  {
    id: "3",
    clientName: "Sophie Martin",
    clientAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
    date: new Date(2023, 1, 16, 15, 15), // Feb 16, 2023, 3:15 PM
    duration: 30,
    type: "Check-in",
    notes: "Quick progress update"
  }
];

const pastSessions = [
  {
    id: "4",
    clientName: "Michael Johnson",
    clientAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    date: new Date(2023, 1, 10, 13, 0), // Feb 10, 2023, 1:00 PM
    duration: 60,
    type: "Career Development",
    notes: "Discussed strengths assessment results",
    completed: true
  },
  {
    id: "5",
    clientName: "Emma Wilson",
    clientAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
    date: new Date(2023, 1, 8, 11, 0), // Feb 8, 2023, 11:00 AM
    duration: 45,
    type: "Goal Setting",
    notes: "Set Q1 professional development goals",
    completed: true
  },
  {
    id: "6",
    clientName: "Lisa Brooks",
    clientAvatar: "https://randomuser.me/api/portraits/women/17.jpg",
    date: new Date(2023, 1, 5, 16, 30), // Feb 5, 2023, 4:30 PM
    duration: 60,
    type: "Leadership Coaching",
    notes: "Discussed team communication challenges",
    completed: true
  }
];

const CoachSessions = () => {
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
          <Plus className="mr-2 h-4 w-4" />
          Schedule Session
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
              {upcomingSessions.map((session) => (
                <Card key={session.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={session.clientAvatar} alt={session.clientName} />
                          <AvatarFallback>{getInitials(session.clientName)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <h3 className="font-medium">{session.clientName}</h3>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {formatSessionDate(session.date)} • {session.duration} min
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        <Badge variant="outline" className="md:ml-auto">{session.type}</Badge>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <Button variant="outline" size="sm" className="w-full md:w-auto">
                            <FileText className="mr-2 h-4 w-4" />
                            Notes
                          </Button>
                          <Button size="sm" className="w-full md:w-auto">
                            <Video className="mr-2 h-4 w-4" />
                            Join
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="past" className="space-y-4">
              {pastSessions.map((session) => (
                <Card key={session.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={session.clientAvatar} alt={session.clientName} />
                          <AvatarFallback>{getInitials(session.clientName)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <h3 className="font-medium">{session.clientName}</h3>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {format(session.date, "MMM d, h:mm a")} • {session.duration} min
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                        <Badge variant="outline" className="md:ml-auto">{session.type}</Badge>
                        <Button variant="outline" size="sm" className="w-full md:w-auto">
                          <FileText className="mr-2 h-4 w-4" />
                          View Notes
                        </Button>
                      </div>
                    </div>
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
                      <p className="font-medium text-sm">{session.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(session.date, "h:mm a")} • {session.duration} min
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              
              {upcomingSessions.filter(session => 
                date && format(session.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
              ).length === 0 && (
                <div className="py-3 text-center">
                  <p className="text-sm text-muted-foreground">No sessions scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoachSessions;
