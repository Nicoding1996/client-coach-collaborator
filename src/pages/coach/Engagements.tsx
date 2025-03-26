
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, Search, Calendar, Plus, Users, FileText, BarChart, ChevronRight, Clock } from "lucide-react";

// Mocked engagements data
const engagements = [
  {
    id: "1",
    title: "Executive Leadership Program",
    client: "Emma Wilson",
    clientAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
    startDate: "2023-03-15",
    endDate: "2023-09-15",
    status: "active",
    progress: 65,
    sessions: 12,
    sessionsCompleted: 8,
    nextSession: "2023-07-10T14:00:00",
    type: "Leadership Development",
    value: 4800
  },
  {
    id: "2",
    title: "Career Transition Support",
    client: "David Chen",
    clientAvatar: "https://randomuser.me/api/portraits/men/44.jpg",
    startDate: "2023-05-20",
    endDate: "2023-08-20",
    status: "active",
    progress: 40,
    sessions: 8,
    sessionsCompleted: 3,
    nextSession: "2023-07-12T10:30:00",
    type: "Career Coaching",
    value: 2400
  },
  {
    id: "3",
    title: "Team Building Workshop Series",
    client: "TechCorp Team",
    clientAvatar: "",
    startDate: "2023-06-05",
    endDate: "2023-07-15",
    status: "active",
    progress: 75,
    sessions: 4,
    sessionsCompleted: 3,
    nextSession: "2023-07-15T13:00:00",
    type: "Team Coaching",
    value: 5000
  },
  {
    id: "4",
    title: "Personal Growth Coaching",
    client: "Sophie Martin",
    clientAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
    startDate: "2023-04-10",
    endDate: "2023-10-10",
    status: "active",
    progress: 50,
    sessions: 24,
    sessionsCompleted: 12,
    nextSession: "2023-07-16T15:15:00",
    type: "Personal Development",
    value: 3600
  },
  {
    id: "5",
    title: "Leadership Assessment",
    client: "Michael Johnson",
    clientAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    startDate: "2023-02-15",
    endDate: "2023-04-15",
    status: "completed",
    progress: 100,
    sessions: 6,
    sessionsCompleted: 6,
    nextSession: null,
    type: "Assessment",
    value: 1800
  },
  {
    id: "6",
    title: "Strategic Planning Facilitation",
    client: "Global Solutions Inc.",
    clientAvatar: "",
    startDate: "2023-01-10",
    endDate: "2023-02-28",
    status: "completed",
    progress: 100,
    sessions: 5,
    sessionsCompleted: 5,
    nextSession: null,
    type: "Business Coaching",
    value: 7500
  },
  {
    id: "7",
    title: "Executive Onboarding",
    client: "Lisa Brown",
    clientAvatar: "",
    startDate: "2023-08-01",
    endDate: "2023-10-31",
    status: "upcoming",
    progress: 0,
    sessions: 10,
    sessionsCompleted: 0,
    nextSession: "2023-08-01T09:00:00",
    type: "Leadership Development",
    value: 5000
  }
];

const CoachEngagements = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter engagements based on search query and active tab
  const filteredEngagements = engagements.filter((engagement) => {
    const matchesSearch = 
      engagement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      engagement.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      engagement.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") {
      return matchesSearch;
    } else {
      return matchesSearch && engagement.status === activeTab;
    }
  });
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Calculate total values
  const activeEngagements = engagements.filter(e => e.status === "active").length;
  const totalValue = engagements.reduce((total, e) => total + e.value, 0);
  const activeValue = engagements.filter(e => e.status === "active").reduce((total, e) => total + e.value, 0);
  const totalSessionsThisMonth = 12; // Placeholder value
  
  // Format date in a readable way
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Format next session time
  const formatNextSession = (dateString: string | null) => {
    if (!dateString) return "N/A";
    
    const sessionDate = new Date(dateString);
    const today = new Date();
    
    // Check if session is today
    if (
      sessionDate.getDate() === today.getDate() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getFullYear() === today.getFullYear()
    ) {
      return `Today at ${sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Format as date and time
    return `${sessionDate.toLocaleDateString()} at ${sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  // Get initials from name
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
          <h1 className="text-3xl font-bold tracking-tight">Engagements</h1>
          <p className="text-muted-foreground mt-1">
            Manage coaching programs and client engagements
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Engagement
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Engagements</p>
                <h3 className="text-2xl font-bold mt-1">{activeEngagements}</h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Engagement Value</p>
                <h3 className="text-2xl font-bold mt-1">${totalValue.toLocaleString()}</h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <BarChart className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Value</p>
                <h3 className="text-2xl font-bold mt-1">${activeValue.toLocaleString()}</h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sessions This Month</p>
                <h3 className="text-2xl font-bold mt-1">{totalSessionsThisMonth}</h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6 space-y-6">
            {filteredEngagements.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No engagements found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your search or create a new engagement
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  New Engagement
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredEngagements.map((engagement) => (
                  <Card key={engagement.id} className="hover:shadow-md transition">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge className="mb-2">{engagement.type}</Badge>
                              <h3 className="text-xl font-semibold">{engagement.title}</h3>
                            </div>
                            {getStatusBadge(engagement.status)}
                          </div>
                          
                          <div className="flex items-center mt-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={engagement.clientAvatar} alt={engagement.client} />
                              <AvatarFallback>{getInitials(engagement.client)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <p className="font-medium">{engagement.client}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(engagement.startDate)} - {formatDate(engagement.endDate)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{engagement.progress}%</span>
                            </div>
                            <Progress value={engagement.progress} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Sessions</p>
                              <p className="font-medium">{engagement.sessionsCompleted}/{engagement.sessions}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Value</p>
                              <p className="font-medium">${engagement.value.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="lg:w-1/3 lg:border-l lg:pl-6 flex flex-col justify-between">
                          {engagement.nextSession ? (
                            <div>
                              <p className="text-sm font-medium">Next Session</p>
                              <div className="flex items-center mt-2">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                <p className="text-sm">{formatNextSession(engagement.nextSession)}</p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm font-medium">Completed</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                All {engagement.sessions} sessions completed
                              </p>
                            </div>
                          )}
                          
                          <div className="flex flex-col gap-2 mt-4 lg:mt-0">
                            <Button className="text-sm justify-between">
                              View Details <ChevronRight className="h-4 w-4" />
                            </Button>
                            {engagement.status === "active" && (
                              <Button variant="outline" className="text-sm justify-between">
                                Schedule Session <Calendar className="h-4 w-4 ml-2" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active" className="mt-6 space-y-6">
            {filteredEngagements.filter(e => e.status === "active").length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No active engagements</h3>
                <p className="text-muted-foreground mt-1">
                  Create a new engagement to get started
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  New Engagement
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredEngagements
                  .filter(e => e.status === "active")
                  .map((engagement) => (
                    <Card key={engagement.id} className="hover:shadow-md transition">
                      <CardContent className="p-6">
                        {/* Same content as in the "all" tab */}
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge className="mb-2">{engagement.type}</Badge>
                                <h3 className="text-xl font-semibold">{engagement.title}</h3>
                              </div>
                              {getStatusBadge(engagement.status)}
                            </div>
                            
                            <div className="flex items-center mt-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={engagement.clientAvatar} alt={engagement.client} />
                                <AvatarFallback>{getInitials(engagement.client)}</AvatarFallback>
                              </Avatar>
                              <div className="ml-3">
                                <p className="font-medium">{engagement.client}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(engagement.startDate)} - {formatDate(engagement.endDate)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{engagement.progress}%</span>
                              </div>
                              <Progress value={engagement.progress} className="h-2" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Sessions</p>
                                <p className="font-medium">{engagement.sessionsCompleted}/{engagement.sessions}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Value</p>
                                <p className="font-medium">${engagement.value.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="lg:w-1/3 lg:border-l lg:pl-6 flex flex-col justify-between">
                            {engagement.nextSession ? (
                              <div>
                                <p className="text-sm font-medium">Next Session</p>
                                <div className="flex items-center mt-2">
                                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <p className="text-sm">{formatNextSession(engagement.nextSession)}</p>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm font-medium">Completed</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                  All {engagement.sessions} sessions completed
                                </p>
                              </div>
                            )}
                            
                            <div className="flex flex-col gap-2 mt-4 lg:mt-0">
                              <Button className="text-sm justify-between">
                                View Details <ChevronRight className="h-4 w-4" />
                              </Button>
                              {engagement.status === "active" && (
                                <Button variant="outline" className="text-sm justify-between">
                                  Schedule Session <Calendar className="h-4 w-4 ml-2" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-6 space-y-6">
            {filteredEngagements.filter(e => e.status === "upcoming").length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No upcoming engagements</h3>
                <p className="text-muted-foreground mt-1">
                  All engagements are either active or completed
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule New Engagement
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredEngagements
                  .filter(e => e.status === "upcoming")
                  .map((engagement) => (
                    <Card key={engagement.id} className="hover:shadow-md transition">
                      <CardContent className="p-6">
                        {/* Same content as in the "all" tab */}
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge className="mb-2">{engagement.type}</Badge>
                                <h3 className="text-xl font-semibold">{engagement.title}</h3>
                              </div>
                              {getStatusBadge(engagement.status)}
                            </div>
                            
                            <div className="flex items-center mt-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={engagement.clientAvatar} alt={engagement.client} />
                                <AvatarFallback>{getInitials(engagement.client)}</AvatarFallback>
                              </Avatar>
                              <div className="ml-3">
                                <p className="font-medium">{engagement.client}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(engagement.startDate)} - {formatDate(engagement.endDate)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{engagement.progress}%</span>
                              </div>
                              <Progress value={engagement.progress} className="h-2" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Sessions</p>
                                <p className="font-medium">{engagement.sessionsCompleted}/{engagement.sessions}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Value</p>
                                <p className="font-medium">${engagement.value.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="lg:w-1/3 lg:border-l lg:pl-6 flex flex-col justify-between">
                            {engagement.nextSession ? (
                              <div>
                                <p className="text-sm font-medium">Next Session</p>
                                <div className="flex items-center mt-2">
                                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <p className="text-sm">{formatNextSession(engagement.nextSession)}</p>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm font-medium">Completed</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                  All {engagement.sessions} sessions completed
                                </p>
                              </div>
                            )}
                            
                            <div className="flex flex-col gap-2 mt-4 lg:mt-0">
                              <Button className="text-sm justify-between">
                                View Details <ChevronRight className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" className="text-sm justify-between">
                                Schedule First Session <Calendar className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6 space-y-6">
            {filteredEngagements.filter(e => e.status === "completed").length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No completed engagements</h3>
                <p className="text-muted-foreground mt-1">
                  You have no completed engagements yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredEngagements
                  .filter(e => e.status === "completed")
                  .map((engagement) => (
                    <Card key={engagement.id} className="hover:shadow-md transition">
                      <CardContent className="p-6">
                        {/* Same content as in the "all" tab */}
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge className="mb-2">{engagement.type}</Badge>
                                <h3 className="text-xl font-semibold">{engagement.title}</h3>
                              </div>
                              {getStatusBadge(engagement.status)}
                            </div>
                            
                            <div className="flex items-center mt-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={engagement.clientAvatar} alt={engagement.client} />
                                <AvatarFallback>{getInitials(engagement.client)}</AvatarFallback>
                              </Avatar>
                              <div className="ml-3">
                                <p className="font-medium">{engagement.client}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(engagement.startDate)} - {formatDate(engagement.endDate)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{engagement.progress}%</span>
                              </div>
                              <Progress value={engagement.progress} className="h-2" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Sessions</p>
                                <p className="font-medium">{engagement.sessionsCompleted}/{engagement.sessions}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Value</p>
                                <p className="font-medium">${engagement.value.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="lg:w-1/3 lg:border-l lg:pl-6 flex flex-col justify-between">
                            <div>
                              <p className="text-sm font-medium">Completed</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                All {engagement.sessions} sessions completed
                              </p>
                            </div>
                            
                            <div className="flex flex-col gap-2 mt-4 lg:mt-0">
                              <Button className="text-sm justify-between">
                                View Summary <ChevronRight className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" className="text-sm justify-between">
                                Create Similar <Plus className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search engagements..."
            className="pl-8 w-full md:w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default CoachEngagements;
