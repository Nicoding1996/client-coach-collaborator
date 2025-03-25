
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, FileText, Target, ChevronRight, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

// Mock data
const upcomingSessions = [
  {
    id: "1",
    coachName: "Sarah Johnson",
    coachAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    date: "Today",
    time: "2:00 PM",
    duration: "60 min",
    type: "Career Development"
  },
  {
    id: "2",
    coachName: "Michael Stevens",
    coachAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    date: "Feb 18, 2023",
    time: "11:00 AM",
    duration: "45 min",
    type: "Leadership Coaching"
  }
];

const goals = [
  {
    id: "1",
    title: "Improve public speaking confidence",
    dueDate: "March 15, 2023",
    progress: 65,
    milestones: [
      { id: "m1", title: "Complete speaking assessment", completed: true },
      { id: "m2", title: "Practice 3 speeches", completed: true },
      { id: "m3", title: "Record yourself presenting", completed: false },
      { id: "m4", title: "Present to group of 10+ people", completed: false }
    ]
  },
  {
    id: "2",
    title: "Develop leadership skills",
    dueDate: "April 22, 2023",
    progress: 40,
    milestones: [
      { id: "m5", title: "Complete leadership assessment", completed: true },
      { id: "m6", title: "Read assigned leadership book", completed: true },
      { id: "m7", title: "Shadow senior leader for a day", completed: false },
      { id: "m8", title: "Lead team meeting", completed: false }
    ]
  }
];

const resources = [
  {
    id: "1",
    title: "Public Speaking Masterclass",
    type: "Video",
    addedDate: "Feb 10, 2023",
    coach: "Sarah Johnson"
  },
  {
    id: "2",
    title: "Leadership Self-Assessment Worksheet",
    type: "PDF",
    addedDate: "Feb 8, 2023",
    coach: "Michael Stevens"
  },
  {
    id: "3",
    title: "Weekly Reflection Template",
    type: "Document",
    addedDate: "Feb 5, 2023",
    coach: "Sarah Johnson"
  }
];

const tasks = [
  {
    id: "1",
    title: "Complete the leadership assessment",
    dueDate: "Feb 15, 2023",
    completed: false,
    coach: "Michael Stevens"
  },
  {
    id: "2",
    title: "Practice presentation for 30 minutes",
    dueDate: "Today",
    completed: false,
    coach: "Sarah Johnson"
  },
  {
    id: "3",
    title: "Review feedback from last session",
    dueDate: "Yesterday",
    completed: true,
    coach: "Sarah Johnson"
  }
];

const ClientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
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
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name?.split(' ')[0]}</h1>
        <Button>
          Book New Session
        </Button>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-8" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
          {/* Upcoming Sessions */}
          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Upcoming Sessions
              </CardTitle>
              <CardDescription>Your scheduled coaching sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between border-b last:border-b-0 pb-3 last:pb-0">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.coachAvatar} alt={session.coachName} />
                          <AvatarFallback>{getInitials(session.coachName)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <p className="font-medium">Session with {session.coachName}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.date} at {session.time} • {session.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm mr-4 px-2 py-1 bg-muted rounded">{session.type}</span>
                        <Button variant="outline" size="sm">
                          Join
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No upcoming sessions scheduled</p>
                  <Button className="mt-4" variant="outline">Book a Session</Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Goals and Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Goals Progress */}
            <Card className="hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-xl">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Goal Progress
                </CardTitle>
                <CardDescription>Track your progress on current goals</CardDescription>
              </CardHeader>
              <CardContent>
                {goals.length > 0 ? (
                  <div className="space-y-6">
                    {goals.slice(0, 2).map((goal) => (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm">{goal.title}</h3>
                          <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">Due: {goal.dueDate}</p>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
                      View All Goals
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No goals set yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Tasks */}
            <Card className="hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-xl">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
                  Action Items
                </CardTitle>
                <CardDescription>Your assignments and tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div 
                        key={task.id} 
                        className={`flex items-start p-3 rounded-lg ${
                          task.completed 
                            ? "bg-muted/50 text-muted-foreground" 
                            : task.dueDate.includes("Today") 
                              ? "border-l-2 border-primary" 
                              : ""
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${task.completed ? "line-through" : ""}`}>
                              {task.title}
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-muted-foreground">Due: {task.dueDate}</span>
                            <span className="mx-2 text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">From: {task.coach}</span>
                          </div>
                        </div>
                        {!task.completed && (
                          <Button variant="outline" size="sm" className="h-7 min-w-[80px] text-xs">
                            Complete
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
                      View All Tasks
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No tasks assigned yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Resources */}
          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-xl">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Recent Resources
              </CardTitle>
              <CardDescription>Materials shared by your coaches</CardDescription>
            </CardHeader>
            <CardContent>
              {resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((resource) => (
                    <Card key={resource.id} className="hover-scale overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {resource.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {resource.addedDate}
                          </span>
                        </div>
                        <h3 className="font-medium text-sm mb-1">{resource.title}</h3>
                        <p className="text-xs text-muted-foreground">From: {resource.coach}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No resources shared yet</p>
                </div>
              )}
              <div className="text-center mt-4">
                <Button variant="outline" size="sm">
                  View All Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions">
          <div className="grid gap-6">
            {upcomingSessions.map((session) => (
              <Card key={session.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session.coachAvatar} alt={session.coachName} />
                        <AvatarFallback>{getInitials(session.coachName)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <h3 className="font-medium">Session with {session.coachName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {session.date} at {session.time} • {session.duration} • {session.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline">Reschedule</Button>
                      <Button>Join Session</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Clock className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">Need more sessions?</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Schedule a new coaching session with any of your coaches
                </p>
                <Button>Book New Session</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="goals">
          <div className="grid gap-6">
            {goals.map((goal) => (
              <Card key={goal.id} className="hover-lift">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{goal.title}</CardTitle>
                      <CardDescription>Due: {goal.dueDate}</CardDescription>
                    </div>
                    <div className="flex items-center bg-muted px-2 py-1 rounded">
                      <span className="text-sm font-medium">{goal.progress}% Complete</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={goal.progress} className="h-2 mb-6" />
                  
                  <h4 className="text-sm font-medium mb-4">Milestones</h4>
                  <div className="space-y-3">
                    {goal.milestones.map((milestone) => (
                      <div 
                        key={milestone.id} 
                        className={`flex items-center p-3 rounded-lg ${
                          milestone.completed ? "bg-muted/50" : ""
                        }`}
                      >
                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${
                          milestone.completed 
                            ? "bg-primary border-primary" 
                            : "border-muted-foreground"
                        }`}>
                          {milestone.completed && (
                            <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                          )}
                        </div>
                        <span className={`text-sm ${milestone.completed ? "line-through text-muted-foreground" : ""}`}>
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <Card key={resource.id} className="hover-scale overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {resource.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {resource.addedDate}
                    </span>
                  </div>
                  <h3 className="font-medium mb-2">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">From: {resource.coach}</p>
                  <Button variant="outline" className="w-full">View Resource</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDashboard;
