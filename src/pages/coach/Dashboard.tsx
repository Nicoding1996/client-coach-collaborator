import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Clock, CreditCard, ChevronRight, ArrowUpRight, Plus } from "lucide-react"; // Added Plus
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { authAPI } from "@/services/api";
import { toast } from "sonner"; // Changed to sonner
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"; // Added Dialog imports
import ScheduleSessionForm from "@/components/forms/ScheduleSessionForm"; // Fixed import to default

// Mock data
const upcomingSessions = [
  {
    id: "1",
    clientName: "Emma Wilson",
    clientAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
    date: "Today",
    time: "2:00 PM",
    duration: "60 min",
    type: "Career Development"
  },
  {
    id: "2",
    clientName: "David Chen",
    clientAvatar: "https://randomuser.me/api/portraits/men/44.jpg",
    date: "Tomorrow",
    time: "10:30 AM",
    duration: "45 min",
    type: "Leadership Coaching"
  },
  {
    id: "3",
    clientName: "Sophie Martin",
    clientAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
    date: "Feb 16, 2023",
    time: "3:15 PM",
    duration: "30 min",
    type: "Check-in"
  }
];

const recentClients = [
  {
    id: "1",
    name: "Emma Wilson",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    email: "emma.wilson@example.com",
    progress: 75,
    nextSession: "Today, 2:00 PM"
  },
  {
    id: "2",
    name: "David Chen",
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    email: "david.chen@example.com",
    progress: 40,
    nextSession: "Tomorrow, 10:30 AM"
  },
  {
    id: "3",
    name: "Sophie Martin",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    email: "sophie.m@example.com",
    progress: 60,
    nextSession: "Feb 16, 3:15 PM"
  },
  {
    id: "4",
    name: "Michael Johnson",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    email: "michael.j@example.com",
    progress: 90,
    nextSession: "Feb 18, 1:00 PM"
  }
];

const tasks = [
  {
    id: "1",
    title: "Review Emma's progress report",
    dueDate: "Today",
    priority: "High",
    completed: false
  },
  {
    id: "2",
    title: "Prepare materials for David's session",
    dueDate: "Tomorrow",
    priority: "Medium",
    completed: false
  },
  {
    id: "3",
    title: "Follow up with Sophie about goals",
    dueDate: "Feb 16",
    priority: "Medium",
    completed: false
  },
  {
    id: "4",
    title: "Send invoice to Michael",
    dueDate: "Feb 18",
    priority: "Low",
    completed: true
  }
];

// Stats for the dashboard
const stats = [
  {
    title: "Total Clients",
    value: "24",
    icon: Users,
    change: "+2 this month",
    trend: "up"
  },
  {
    title: "Sessions This Week",
    value: "12",
    icon: Calendar,
    change: "3 remaining",
    trend: "neutral"
  },
  {
    title: "Average Session Time",
    value: "52m",
    icon: Clock,
    change: "+5m from last month",
    trend: "up"
  },
  {
    title: "Revenue This Month",
    value: "$4,250",
    icon: CreditCard,
    change: "+15% from last month",
    trend: "up"
  }
];

// Define specific types based on usage and mock data
interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

interface RecentClient {
  id: string;
  name: string;
  avatar: string;
  email: string;
  progress: number;
  nextSession: string;
}

interface RecentSession {
  id: string;
  clientName: string;
  clientAvatar: string;
  date: string;
  time: string;
  duration: string;
  type: string;
}


// Define the type for the dashboard summary
interface DashboardSummaryType {
  clientCount: number;
  upcomingSessionsCount: number;
  totalOutstanding: number;
  totalPaidLast30Days: number;
  recentSessions: RecentSession[];
  recentClients: RecentClient[];
  tasks: Task[];
}

const CoachDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState<DashboardSummaryType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false); // Added Dialog state
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await authAPI.getCoachDashboardSummary();
        setDashboardData(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard data");
        setLoading(false);
        toast.error("Error loading dashboard data");
      }
    };

    fetchDashboardData();
  }, []);

  // Handler for successful session scheduling
  const handleSessionScheduled = () => {
    setIsScheduleDialogOpen(false); // Close the dialog
    toast.success("Session scheduled successfully!"); // Show success toast
    // Optionally: Trigger data refresh if needed
    // fetchDashboardData();
  };

  const getInitials = (name: string | undefined | null) => { // Allow potentially invalid name types
    if (typeof name !== 'string' || !name) {
      return '?'; // Return '?' or some default for invalid input
    }
    // Existing logic for splitting valid names
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {loading ? (
        <div>Loading...</div> // Replace with a spinner or skeleton component
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0]}</h1>
            <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Schedule Session
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                {/* Render ScheduleSessionForm inside DialogContent */}
                <ScheduleSessionForm onSuccess={handleSessionScheduled} onClose={() => setScheduleDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs defaultValue="overview" className="space-y-8" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="hover-lift overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                          <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                          <p className={`text-xs mt-1 ${
                            stat.trend === "up" 
                              ? "text-green-500" 
                              : stat.trend === "down" 
                                ? "text-red-500" 
                                : "text-muted-foreground"
                          }`}>
                            {stat.change}
                          </p>
                        </div>
                        <div className="bg-primary/10 p-2 rounded-full">
                          <stat.icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Upcoming Sessions */}
              <Card className="hover-lift">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Upcoming Sessions</CardTitle>
                  <CardDescription>Your scheduled coaching sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.recentSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between border-b last:border-b-0 pb-3 last:pb-0">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={session.clientAvatar} alt={session.clientName} />
                            <AvatarFallback>{getInitials(session.clientName)}</AvatarFallback>
                          </Avatar>
                          <div className="ml-4">
                            <p className="font-medium">{session.clientName}</p>
                            <p className="text-xs text-muted-foreground">
                              {session.date} at {session.time} • {session.duration}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm mr-4 px-2 py-1 bg-muted rounded">{session.type}</span>
                          <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Sessions
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Clients */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="hover-lift">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Client Progress</CardTitle>
                    <CardDescription>Recent client activity and progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData?.recentClients.slice(0, 3).map((client) => (
                        <div key={client.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={client.avatar} alt={client.name} />
                                <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                              </Avatar>
                              <span className="ml-2 font-medium text-sm">{client.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{client.progress}% complete</span>
                          </div>
                          <Progress value={client.progress} className="h-2" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Clients
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Tasks */}
                <Card className="hover-lift">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Tasks</CardTitle>
                    <CardDescription>Your upcoming tasks and follow-ups</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Array.isArray(dashboardData?.tasks) ? (
                        dashboardData.tasks.slice(0, 4).map((task) => (
                          <div key={task.id} className={`flex items-start p-3 rounded-lg ${task.completed ? "bg-muted/50 text-muted-foreground" : task.priority === "High" ? "border-l-4 border-red-500" : ""}`}>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className={`text-sm font-medium ${task.completed ? "line-through" : ""}`}>{task.title}</span>
                              </div>
                              <div className="flex items-center mt-1">
                                <span className="text-xs text-muted-foreground">Due: {task.dueDate}</span>
                                {task.priority === "High" && <span className="ml-2 text-xs font-medium text-red-500">High Priority</span>}
                              </div>
                            </div>
                            {!task.completed && <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full p-0"><ChevronRight className="h-4 w-4" /></Button>}
                          </div>
                        ))
                      ) : (
                        <p>No tasks available.</p>
                      )}
                    </div>
                    <div className="mt-4 text-center">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Tasks
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="sessions">
              <div className="grid gap-6">
                {Array.isArray(dashboardData?.recentSessions) ? (
                  dashboardData.recentSessions.map((session) => (
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
                              <p className="text-sm text-muted-foreground">{session.date} at {session.time} • {session.duration}</p>
                            </div>
                          </div>
                          <div className="space-x-2 flex md:justify-end">
                            <Button variant="outline" size="sm">Reschedule</Button>
                            <Button size="sm">Join Session</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p>No sessions available.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="clients">
              <div className="grid gap-6">
                {Array.isArray(dashboardData?.recentClients) ? (
                  dashboardData.recentClients.map((client) => (
                    <Card key={client.id} className="hover-lift">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
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
                          <div className="space-y-2 md:text-right">
                            <p className="text-sm font-medium">Next Session: {client.nextSession}</p>
                            <div className="w-full md:w-48">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span>Program Progress</span>
                                <span className="font-medium">{client.progress}%</span>
                              </div>
                              <Progress value={client.progress} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p>No clients available.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="tasks">
              <div className="grid gap-4">
                {/* Check if tasks exists and is an array before mapping */}
                {Array.isArray(dashboardData?.tasks) ? dashboardData.tasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className={`hover-lift ${
                      task.completed 
                        ? "bg-muted/50" 
                        : task.priority === "High" 
                          ? "border-l-4 border-red-500" 
                          : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </h3>
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-muted-foreground">Due: {task.dueDate}</span>
                            {task.priority === "High" && (
                              <span className="ml-2 text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded">High Priority</span>
                            )}
                          </div>
                        </div>
                        <div className="space-x-2">
                          {!task.completed && (
                            <Button size="sm">
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : <p className="text-muted-foreground text-sm">No tasks found.</p>}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default CoachDashboard;
