import { useState, useEffect, useMemo } from "react"; // Added useMemo
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge"; // Remove Badge import
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, Video, FileText, MessageSquare, Clock } from "lucide-react"; // Added Clock
import { format, parseISO, differenceInMinutes, parse } from "date-fns"; // Add functions for duration calculation
import { cn } from "@/lib/utils"; // Keep one cn import
import { authAPI } from "@/services/api"; // Keep authAPI
import { toast } from 'sonner'; // Import toast
import { useWebSocket } from "@/contexts/WebSocketContext"; // Import WebSocket hook
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
  const [sessions, setSessions] = useState<SessionType[]>([]); // Single sessions state
  const { socket } = useWebSocket(); // Get socket instance

  // Fetch sessions data
   useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the same endpoint as coach, backend filters based on logged-in user
        const sessionsData = await authAPI.getSessions();

        // Data Augmentation (Calculate Duration) - Similar to Coach view
        const processedSessions = sessionsData.map(session => {
            let calculatedDuration: number | undefined = undefined;
            if (session.sessionDate && typeof session.startTime === 'string' && typeof session.endTime === 'string') {
                try {
                    const baseDateStr = format(parseISO(session.sessionDate), 'yyyy-MM-dd');
                    const startDateTime = parse(`${baseDateStr} ${session.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
                    const endDateTime = parse(`${baseDateStr} ${session.endTime}`, 'yyyy-MM-dd HH:mm', new Date());
                    if (!isNaN(startDateTime.getTime()) && !isNaN(endDateTime.getTime())) {
                        calculatedDuration = differenceInMinutes(endDateTime, startDateTime);
                        if (calculatedDuration < 0) calculatedDuration += 24 * 60;
                    }
                } catch (parseError) {
                    console.error(`Error calculating duration for session ${session._id}:`, parseError);
                }
            }
            return {
              ...session,
              duration: calculatedDuration,
              // Ensure coachId is correctly populated or handle potential undefined
              coachId: session.coachId || { _id: 'unknown', name: 'Unknown Coach' } // Provide fallback
            };
          });


        setSessions(processedSessions);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError("Failed to load sessions. Please try again.");
        toast.error("Failed to load session data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []); // Empty dependency array means fetch only on mount

  // WebSocket Event Listeners
  useEffect(() => {
    if (socket) {
      console.log('[WS Client] Setting up listeners for ClientSessions...');

      const handleSessionCreated = (newSession: SessionType) => {
        console.log('[WS Client] Session Created:', newSession);
         // TODO: Data augmentation might be needed if backend doesn't send full object
        // Assuming backend sends augmented data for now
        setSessions(prev => [...prev, newSession]);
        toast.info(`New session scheduled with ${newSession.coachId?.name || 'your coach'}`);
      };

      const handleSessionUpdated = (updatedSession: SessionType) => {
        console.log('[WS Client] Session Updated:', updatedSession);
         // TODO: Data augmentation might be needed
         // Assuming backend sends augmented data for now
        setSessions(prev => prev.map(s => s._id === updatedSession._id ? updatedSession : s));
         toast.info(`Session with ${updatedSession.coachId?.name || 'your coach'} updated.`);
      };

      const handleSessionDeleted = (data: { sessionId: string }) => {
        const { sessionId } = data;
        console.log('[WS Client] Session Deleted:', sessionId);
        setSessions(prev => prev.filter(s => s._id !== sessionId));
        toast.info(`A session was cancelled.`);
      };

      socket.on('session_created', handleSessionCreated);
      socket.on('session_updated', handleSessionUpdated);
      socket.on('session_deleted', handleSessionDeleted);

      return () => {
        console.log('[WS Client] Cleaning up listeners for ClientSessions...');
        socket.off('session_created', handleSessionCreated);
        socket.off('session_updated', handleSessionUpdated);
        socket.off('session_deleted', handleSessionDeleted);
      };
    } else {
       console.log('[WS Client] Socket not available yet for ClientSessions listeners.');
    }
  }, [socket]); // Re-run if socket changes

  // Filter sessions into upcoming and past using useMemo for efficiency
  const { upcomingSessions, pastSessions } = useMemo(() => {
    const todayString = format(new Date(), 'yyyy-MM-dd');
    const upcoming: SessionType[] = [];
    const past: SessionType[] = [];

    sessions.forEach(session => {
       try {
         // Basic validation before parsing
         if (typeof session.sessionDate !== 'string' || !session.sessionDate) {
           console.warn(`[Filter] Session ${session._id} has invalid date string: ${session.sessionDate}`);
           return; // Skip this session
         }
         const parsedSessionDate = parseISO(session.sessionDate);
         // Define sessionDateString here to use in the log message
         const sessionDateString = format(parsedSessionDate, 'yyyy-MM-dd');
         if (isNaN(parsedSessionDate.getTime())) {
            // Add specific debug log format
            console.error(`[Filter Debug ${sessionDateString >= todayString ? 'Upcoming' : 'Past'}] Failed to parse date for session ID ${session._id}: ${session.sessionDate}`);
            return; // Skip session with invalid date
         }
         // const sessionDateString = format(parsedSessionDate, 'yyyy-MM-dd'); // REMOVE THIS LINE (Duplicate declaration)
         if (sessionDateString >= todayString) {
           upcoming.push(session);
         } else {
           past.push(session);
         }
       } catch (e) {
         console.error(`[Filter Error] Session ${session._id} Date='${session.sessionDate}'`, e);
       }
    });

    // Sort
    upcoming.sort((a, b) => parseISO(a.sessionDate).getTime() - parseISO(b.sessionDate).getTime());
    past.sort((a, b) => parseISO(b.sessionDate).getTime() - parseISO(a.sessionDate).getTime());

    return { upcomingSessions: upcoming, pastSessions: past };
  }, [sessions]); // Recalculate when sessions state changes

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
                    upcomingSessions.map((session) => {
                      // Add rendering log
                      console.log('[Rendering Upcoming]', session);
                      return (
                      <Card key={session._id} className="hover-lift">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={session.coachId?.avatar} alt={session.coachId?.name || 'Coach'} className="object-cover" />
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
                      ); // Close return
                    })
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
                    pastSessions.map((session) => {
                      // Add rendering log
                      console.log('[Rendering Past]', session);
                      return (
                      <Card key={session._id} className="hover-lift">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={session.coachId?.avatar} alt={session.coachId?.name || 'Coach'} className="object-cover" />
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
                      ); // Close return
                    })
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
