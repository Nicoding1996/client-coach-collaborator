import { useState, useEffect } from "react"; // useEffect already present
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge"; // Remove Badge import
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, Video, FileText, MessageSquare, Clock } from "lucide-react"; // Added Clock
import { format, parseISO } from "date-fns"; // Keep basic date-fns functions for now
import { cn } from "@/lib/utils"; // Keep one cn import
import { authAPI } from "@/services/api"; // Keep authAPI

// Removed Mock Data
// Removed Mock Data

// Define Types
interface CoachInfo {
  _id: string;
  name: string;
  avatar?: string;
}

interface SessionType {
  _id: string;
  coachId: CoachInfo; // Expecting populated coach object from backend
  clientId: string;
  sessionDate: string; // ISO Date string from backend
  startTime?: string;
  endTime?: string;
  location?: string;
  status?: string;
  notes?: string;
  duration?: number; // Will be calculated later
}

// Helper function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

const ClientSessions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [upcomingSessions, setUpcomingSessions] = useState<SessionType[]>([]);
  const [pastSessions, setPastSessions] = useState<SessionType[]>([]);

  // Fetch sessions data
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch sessions from API when ready
        // For now, set empty arrays
        setUpcomingSessions([]);
        setPastSessions([]);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError("Failed to load sessions. Please try again.");
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {loading && <p>Loading sessions...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
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
                      <Card key={session._id} className="hover-lift">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={session.coachId?.avatar} alt={session.coachId?.name} />
                                <AvatarFallback>{getInitials(session.coachId?.name || '')}</AvatarFallback>
                              </Avatar>
                              <div className="ml-4">
                                <div className="flex items-center">
                                  <h3 className="font-medium">{session.coachId?.name || 'Unknown Coach'}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {format(parseISO(session.sessionDate), 'MMM d, yyyy')} • {session.startTime || 'N/A'} {session.duration ? `(${session.duration} Mins)` : ''}
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
                  {pastSessions.length > 0 ? (
                    pastSessions.map((session) => (
                      <Card key={session._id} className="hover-lift">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={session.coachId?.avatar} alt={session.coachId?.name} />
                                <AvatarFallback>{getInitials(session.coachId?.name || '')}</AvatarFallback>
                              </Avatar>
                              <div className="ml-4">
                                <div className="flex items-center">
                                  <h3 className="font-medium">{session.coachId?.name || 'Unknown Coach'}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {format(parseISO(session.sessionDate), 'MMM d, yyyy')} • {session.startTime || 'N/A'} {session.duration ? `(${session.duration} Mins)` : ''}
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
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-12">
                        <h3 className="text-lg font-medium mb-2">No past sessions</h3>
                        <p className="text-muted-foreground text-center mb-6">
                          You don't have any past coaching sessions
                        </p>
                      </CardContent>
                    </Card>
                  )}
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
                  
                  {upcomingSessions.filter(session => 
                    date && format(parseISO(session.sessionDate), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                  ).length > 0 ? (
                    upcomingSessions
                      .filter(session => 
                        date && format(parseISO(session.sessionDate), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                      )
                      .map((session) => (
                        <div key={session._id} className="flex items-center justify-between border-b last:border-b-0 py-3">
                          <div>
                            <p className="font-medium text-sm">{session.coachId?.name || 'Unknown Coach'}</p>
                            <p className="text-xs text-muted-foreground">
                              {session.startTime || 'N/A'} {session.duration ? `• ${session.duration} min` : ''}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </div>
                      ))
                  ) : (
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
        </>
      )}
    </div>
  );
};

export default ClientSessions;
