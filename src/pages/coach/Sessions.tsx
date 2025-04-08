import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, Plus, Video, Clock, FileText, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns"; // Removed unused date-fns functions
import { cn } from "@/lib/utils";
import { authAPI } from "@/services/api";
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import ScheduleSessionForm from '@/components/forms/ScheduleSessionForm';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker'; // Import DatePicker for testing
import { toast } from 'sonner'; 
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';

export interface SessionType { // Export the interface
  _id: string; // Match backend data structure
  clientName?: string; // Make optional to handle backend data
  sessionDate: string; // Match backend property name
  time?: string; // Made optional
  duration: number;
  type?: string; // Made optional
  notes: string;
  clientAvatar?: string; // Made optional
}

const CoachSessions = () => {
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSessionData, setSelectedSessionData] = useState<SessionType | null>(null);
  const [editedNotes, setEditedNotes] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [testDate, setTestDate] = useState<Date | undefined>(undefined); // State for test DatePicker
  
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await authAPI.getSessions();
        setSessions(data);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Updated to accept the newly created session object for optimistic update
  const handleSessionCreated = (newSession: SessionType) => {
    setDialogOpen(false);
    // Add the new session directly to the state
    setSessions(prevSessions => [...prevSessions, newSession]);
    toast("Session scheduled successfully!"); // Update toast message
  };

  const handleViewNotes = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setNotesLoading(true);
    try {
      const sessionData = await authAPI.getSessionById(sessionId);
      setSelectedSessionData(sessionData);
      setEditedNotes(sessionData.notes);
      setNotesDialogOpen(true);
    } catch (error) {
      toast('Failed to fetch session details');
    } finally {
      setNotesLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedSessionId) return;
    setNotesLoading(true);
    try {
      await authAPI.updateSession(selectedSessionId, { notes: editedNotes });
      toast('Notes updated successfully');
      setNotesDialogOpen(false);
      // Optionally update the session notes in the main list
      setSessions(prevSessions => prevSessions.map(session =>
        session._id === selectedSessionId ? { ...session, notes: editedNotes } : session
      ));
    } catch (error) {
      toast('Failed to update notes');
    } finally {
      setNotesLoading(false);
    }
  };

  const handleEditSession = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setLoading(true);
    try {
      const sessionData = await authAPI.getSessionById(sessionId);
      setSelectedSessionData(sessionData);
      setDialogOpen(true);
    } catch (error) {
      toast('Failed to fetch session details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    setLoading(true);
    try {
      await authAPI.deleteSession(sessionToDelete);
      toast('Session deleted successfully');
      setSessions(prevSessions => prevSessions.filter(session => session._id !== sessionToDelete));
    } catch (error) {
      toast('Failed to delete session');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  // console.log('Sessions state updated:', sessions); // Removed log
  // Refined filtering logic to compare dates only
  const todayString = format(new Date(), 'yyyy-MM-dd'); // Get today's date string

  const upcomingSessions = sessions.filter(session => {
    // The existing if check
    if (!session) { // Absolute minimal check: just ensure session exists
       // console.error(`Skipping session with invalid/missing fields for upcoming filter:`, session); // Removed log
       return false;
    }
    try {
      // Add Pre-Parse Check Inside try Block exactly as requested
      if (typeof session.sessionDate !== 'string' || !session.sessionDate) { // Use sessionDate
        // console.warn(`[Filter Internal] Session ${session._id} has invalid date string: ${session.sessionDate}`); // Optional
        return false; // Exclude sessions with invalid date strings before parsing
      }
      const parsedSessionDate = parseISO(session.sessionDate); // Use sessionDate

      if (isNaN(parsedSessionDate.getTime())) {
         // console.error(`[Filter Debug Upcoming] Failed to parse date for session ID ${session._id}: ${session.sessionDate}`); // Removed log
         return false;
      }

      const sessionDateString = format(parsedSessionDate, 'yyyy-MM-dd');
      const isUpcoming = sessionDateString >= todayString;

      // Comparison log already commented

      return isUpcoming;
    } catch (e) {
      // console.error(`[Filter Error Upcoming] Session ${session._id} Date='${session.sessionDate}'`, e); // Removed log
      return false;
    }
  });
  // console.log('Filtered Upcoming:', upcomingSessions); // Removed log
  const pastSessions = sessions.filter(session => {
      // The existing if check
     if (!session) { // Absolute minimal check: just ensure session exists
       // console.error(`Skipping session with invalid/missing fields for past filter:`, session); // Removed log
       return false;
     }
     try {
      // Add Pre-Parse Check Inside try Block exactly as requested
      if (typeof session.sessionDate !== 'string' || !session.sessionDate) { // Use sessionDate
        // console.warn(`[Filter Internal] Session ${session._id} has invalid date string: ${session.sessionDate}`); // Optional
        return false; // Exclude sessions with invalid date strings before parsing
      }
      const parsedSessionDate = parseISO(session.sessionDate); // Use sessionDate

      if (isNaN(parsedSessionDate.getTime())) {
         // console.error(`[Filter Debug Past] Failed to parse date for session ID ${session._id}: ${session.sessionDate}`); // Removed log
         return false;
      }

      const sessionDateString = format(parsedSessionDate, 'yyyy-MM-dd');
      const isPast = sessionDateString < todayString;

      // Comparison log already commented

      return isPast;
     } catch (e) {
       // console.error(`[Filter Error Past] Session ${session._id} Date='${session.sessionDate}'`, e); // Removed log
       return false;
     }
  });
  // console.log('Filtered Past:', pastSessions); // Removed log

  const getInitials = (name: string | undefined | null) => { // Allow potentially invalid name types
    if (typeof name !== 'string' || !name) return '?'; // Return '?' for invalid input
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };
  
  const formatSessionDate = (date: Date | undefined | null) => { // Allow potentially invalid date inputs
    if (!date || isNaN(date.getTime())) return "Invalid Date"; // Check for invalid date object
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
      {loading ? (
        <p>Loading sessions...</p>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Session
            </Button>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <ScheduleSessionForm onSuccess={handleSessionCreated} onClose={() => setDialogOpen(false)} /> {/* Removed initialData, added onClose */}
          </Dialog>
          <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
            <DialogContent>
              {selectedSessionData && (
                <div>
                  <h2>{selectedSessionData.clientName}</h2>
                  <p>{formatSessionDate(new Date(selectedSessionData.sessionDate))}</p> // Use sessionDate
                  <Textarea value={editedNotes} onChange={(e) => setEditedNotes(e.target.value)} />
                </div>
              )}
            </DialogContent>
            <DialogFooter>
              <Button onClick={handleSaveNotes} disabled={notesLoading}>{notesLoading ? 'Saving...' : 'Save Notes'}</Button>
              <Button onClick={() => setNotesDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </Dialog>
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                <AlertDialogDescription>Are you sure you want to delete this session? This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button onClick={handleDeleteSession}>Delete</Button>
                <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
                  {upcomingSessions.map((session) => { // Keep block for log
                    // console.log('Rendering Upcoming Session:', session._id); // Removed log
                    return ( // Now use implicit return for JSX
                      <Card key={session._id} className="hover-lift">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={session.clientAvatar} alt={session.clientName} />
                                <AvatarFallback>{getInitials(session.clientName)}</AvatarFallback>
                              </Avatar>
                              <div className="ml-4">
                                <h3 className="font-medium">{session.clientName || 'Unknown Client'}</h3>
                                <div className="flex items-center mt-1">
                                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    {formatSessionDate(new Date(session.sessionDate))} • {session.duration} min // Use sessionDate
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                              <Badge variant="outline" className="md:ml-auto">{session.type}</Badge>
                              <div className="flex items-center gap-2 w-full md:w-auto">
                                <Button variant="outline" size="sm" className="w-full md:w-auto" onClick={() => handleViewNotes(session._id)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Notes
                                </Button>
                                <Button variant="outline" size="sm" className="w-full md:w-auto" onClick={() => handleEditSession(session._id)}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm" className="w-full md:w-auto" onClick={() => { setSessionToDelete(session._id); setDeleteDialogOpen(true); }}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ); // Closing parenthesis for return
                  })} {/* CORRECT Closing brace for map block and parenthesis for map call */}
                </TabsContent>
                <TabsContent value="past" className="space-y-4">
                  {pastSessions.map((session) => (
                    <Card key={session._id} className="hover-lift">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={session.clientAvatar} alt={session.clientName} />
                              <AvatarFallback>{getInitials(session.clientName)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4">
                              <h3 className="font-medium">{session.clientName || 'Unknown Client'}</h3>
                              <div className="flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(session.sessionDate), "MMM d, h:mm a")} • {session.duration} min // Use sessionDate
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                            <Badge variant="outline" className="md:ml-auto">{session.type}</Badge>
                            <Button variant="outline" size="sm" className="w-full md:w-auto" onClick={() => handleViewNotes(session._id)}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Notes
                            </Button>
                            <Button variant="outline" size="sm" className="w-full md:w-auto" onClick={() => handleEditSession(session._id)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="w-full md:w-auto" onClick={() => { setSessionToDelete(session._id); setDeleteDialogOpen(true); }}>
                              <Plus className="mr-2 h-4 w-4" />
                              Delete
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
                      date && format(new Date(session.sessionDate), "yyyy-MM-dd") === format(date, "yyyy-MM-dd") // Use sessionDate
                    )
                    .map((session) => (
                      <div key={session._id} className="flex items-center justify-between border-b last:border-b-0 py-3">
                        <div>
                          <p className="font-medium text-sm">{session.clientName || 'Unknown Client'}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(session.sessionDate), "h:mm a")} • {session.duration} min // Use sessionDate
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  
                  {upcomingSessions.filter(session => 
                    date && format(new Date(session.sessionDate), "yyyy-MM-dd") === format(date, "yyyy-MM-dd") // Use sessionDate
                  ).length === 0 && (
                    <div className="py-3 text-center">
                      <p className="text-sm text-muted-foreground">No sessions scheduled</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CoachSessions;
