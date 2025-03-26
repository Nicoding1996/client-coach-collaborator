import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Camera, Check, LogOut, Building, MapPin, Globe, Mail, Phone, Calendar, Clock, FileText, CreditCard, Users, File } from "lucide-react";

const CoachProfile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+1 (555) 123-4567",
    bio: "Certified Executive Coach with 8+ years of experience helping professionals achieve their career goals. Specializing in leadership development, career transitions, and work-life balance.",
    company: "Breakthrough Coaching LLC",
    location: "San Francisco, CA",
    website: "www.breakthroughcoaching.com",
    specialties: "Executive Coaching, Leadership Development, Career Transitions",
    certifications: "ICF PCC, CPCC, MBA"
  });
  
  // Schedule data
  const availabilitySchedule = [
    { day: "Monday", hours: "9:00 AM - 5:00 PM" },
    { day: "Tuesday", hours: "9:00 AM - 5:00 PM" },
    { day: "Wednesday", hours: "10:00 AM - 6:00 PM" },
    { day: "Thursday", hours: "9:00 AM - 5:00 PM" },
    { day: "Friday", hours: "9:00 AM - 3:00 PM" },
    { day: "Saturday", hours: "Not Available" },
    { day: "Sunday", hours: "Not Available" }
  ];
  
  const sessionTypes = [
    { name: "Initial Consultation", duration: 30, description: "Get to know each other and discuss goals" },
    { name: "Standard Coaching Session", duration: 60, description: "Regular coaching sessions" },
    { name: "Extended Coaching Session", duration: 90, description: "In-depth coaching for complex topics" },
    { name: "Quick Check-in", duration: 15, description: "Brief follow-up on progress" }
  ];
  
  // Resources data
  const resources = [
    { 
      id: 1, 
      title: "Leadership Assessment Framework", 
      type: "PDF", 
      size: "2.4 MB", 
      dateAdded: "2023-10-15", 
      description: "Comprehensive framework for assessing leadership capabilities and growth areas."
    },
    { 
      id: 2, 
      title: "Career Transition Workbook", 
      type: "PDF", 
      size: "3.8 MB", 
      dateAdded: "2023-11-02", 
      description: "Step-by-step guide for navigating career changes successfully."
    },
    { 
      id: 3, 
      title: "Executive Presence Workshop", 
      type: "Video", 
      size: "156 MB", 
      dateAdded: "2023-12-10", 
      description: "Video workshop on developing and enhancing executive presence."
    },
    { 
      id: 4, 
      title: "Emotional Intelligence Toolkit", 
      type: "PDF", 
      size: "1.5 MB", 
      dateAdded: "2024-01-05", 
      description: "Practical exercises and tools for improving emotional intelligence."
    }
  ];
  
  // Invoices data
  const invoices = [
    { 
      id: "INV-2024-001", 
      client: "Michael Brown", 
      date: "2024-04-01", 
      amount: "$450.00", 
      status: "Paid", 
      description: "3 coaching sessions (March 2024)" 
    },
    { 
      id: "INV-2024-002", 
      client: "Sarah Johnson", 
      date: "2024-04-05", 
      amount: "$600.00", 
      status: "Pending", 
      description: "4 coaching sessions (March 2024)" 
    },
    { 
      id: "INV-2024-003", 
      client: "David Wilson", 
      date: "2024-04-10", 
      amount: "$300.00", 
      status: "Paid", 
      description: "2 coaching sessions (March 2024)" 
    },
    { 
      id: "INV-2024-004", 
      client: "Emily Chen", 
      date: "2024-04-15", 
      amount: "$750.00", 
      status: "Overdue", 
      description: "5 coaching sessions (March 2024)" 
    }
  ];
  
  // Engagements data
  const engagements = [
    { 
      id: 1, 
      client: "Michael Brown", 
      program: "Executive Leadership", 
      startDate: "2024-01-15", 
      endDate: "2024-07-15", 
      status: "Active", 
      progress: 45, 
      nextSession: "2024-04-22"
    },
    { 
      id: 2, 
      client: "Sarah Johnson", 
      program: "Career Transition", 
      startDate: "2024-02-01", 
      endDate: "2024-05-01", 
      status: "Active", 
      progress: 70, 
      nextSession: "2024-04-25"
    },
    { 
      id: 3, 
      client: "David Wilson", 
      program: "Leadership Development", 
      startDate: "2023-11-10", 
      endDate: "2024-05-10", 
      status: "Active", 
      progress: 85, 
      nextSession: "2024-04-20"
    },
    { 
      id: 4, 
      client: "Emily Chen", 
      program: "Work-Life Balance", 
      startDate: "2024-03-15", 
      endDate: "2024-06-15", 
      status: "Active", 
      progress: 25, 
      nextSession: "2024-04-28"
    }
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };
  
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
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <Button variant="outline" onClick={() => logout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="schedule">Availability</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="engagements">Engagements</TabsTrigger>
          <TabsTrigger value="settings">Account Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader className="relative pb-0">
              <div className="absolute right-6 top-6">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      <Check className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="text-3xl">{user?.name ? getInitials(user.name) : "C"}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {!isEditing && (
                    <div className="mt-4 text-center">
                      <h2 className="text-xl font-bold">{formData.name}</h2>
                      <p className="text-muted-foreground">Executive Coach</p>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Company/Organization</Label>
                          <Input
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="specialties">Specialties</Label>
                        <Input
                          id="specialties"
                          name="specialties"
                          value={formData.specialties}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="certifications">Certifications</Label>
                        <Input
                          id="certifications"
                          name="certifications"
                          value={formData.certifications}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium">About</h3>
                        <p className="text-muted-foreground">{formData.bio}</p>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formData.company}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formData.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formData.website}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formData.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formData.phone}</span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium">Specialties</h3>
                        <div className="flex flex-wrap gap-2">
                          {formData.specialties.split(",").map((specialty, index) => (
                            <div key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                              {specialty.trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium">Certifications</h3>
                        <div className="flex flex-wrap gap-2">
                          {formData.certifications.split(",").map((cert, index) => (
                            <div key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                              {cert.trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Availability Schedule</CardTitle>
              <CardDescription>Set your general availability for coaching sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availabilitySchedule.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{schedule.day}</span>
                      </div>
                      <span className={schedule.hours === "Not Available" ? "text-muted-foreground" : ""}>
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Session Types</h3>
                    <Button variant="outline" size="sm">Edit Session Types</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessionTypes.map((session, index) => (
                      <Card key={index} className="hover-lift overflow-hidden">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{session.name}</h4>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                              <span className="text-sm">{session.duration} min</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{session.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Calendar Integration</CardTitle>
              <CardDescription>Connect your external calendars to sync your availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Google Calendar</h4>
                      <p className="text-sm text-muted-foreground">Connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Disconnect</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-8.29 13.29a1 1 0 01-1.42 0l-3.29-3.29a1 1 0 011.41-1.41L10 14.17l6.88-6.88a1 1 0 011.41 1.41l-7.58 7.59z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Microsoft Outlook</h4>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button size="sm">Connect</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Coaching Resources</CardTitle>
                  <CardDescription>Manage your coaching resources and materials</CardDescription>
                </div>
                <Button>
                  <File className="mr-2 h-4 w-4" />
                  Upload Resource
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4">
                  {resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors group">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{resource.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Badge variant="outline" className="rounded-sm">{resource.type}</Badge>
                            <span>{resource.size}</span>
                            <span>•</span>
                            <span>Added {resource.dateAdded}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm">
                          Share
                        </Button>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {resources.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No resources yet</h3>
                    <p className="text-muted-foreground mb-4">Upload coaching materials to share with your clients.</p>
                    <Button>Upload Resource</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>Manage your billing and payments</CardDescription>
                </div>
                <Button>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-md border">
                  <div className="w-full overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-12 px-4 text-left font-medium">Invoice</th>
                          <th className="h-12 px-4 text-left font-medium">Client</th>
                          <th className="h-12 px-4 text-left font-medium">Date</th>
                          <th className="h-12 px-4 text-left font-medium">Amount</th>
                          <th className="h-12 px-4 text-left font-medium">Status</th>
                          <th className="h-12 px-4 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle font-medium">{invoice.id}</td>
                            <td className="p-4 align-middle">{invoice.client}</td>
                            <td className="p-4 align-middle">{invoice.date}</td>
                            <td className="p-4 align-middle">{invoice.amount}</td>
                            <td className="p-4 align-middle">
                              <Badge 
                                variant={
                                  invoice.status === "Paid" ? "success" : 
                                  invoice.status === "Pending" ? "outline" : 
                                  "destructive"
                                }
                              >
                                {invoice.status}
                              </Badge>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">View</Button>
                                <Button variant="ghost" size="sm">Send</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {invoices.length === 0 && (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first invoice to bill a client.</p>
                    <Button>Create Invoice</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagements" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Client Engagements</CardTitle>
                  <CardDescription>Manage your coaching programs and client progress</CardDescription>
                </div>
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  New Engagement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4">
                  {engagements.map((engagement) => (
                    <Card key={engagement.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold">{engagement.client}</h3>
                              <p className="text-sm text-muted-foreground">{engagement.program}</p>
                            </div>
                            <Badge
                              variant={
                                engagement.status === "Active" ? "outline" :
                                engagement.status === "Completed" ? "success" :
                                "secondary"
                              }
                            >
                              {engagement.status}
                            </Badge>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-muted-foreground">Progress</span>
                              <span className="text-sm font-medium">{engagement.progress}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${engagement.progress}%` }} 
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Start Date</p>
                              <p className="font-medium">{engagement.startDate}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">End Date</p>
                              <p className="font-medium">{engagement.endDate}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                                <span className="text-sm">Next Session: {engagement.nextSession}</span>
                              </div>
                              <Button variant="outline" size="sm">View Details</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {engagements.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No active engagements</h3>
                    <p className="text-muted-foreground mb-4">Start a new coaching program with a client.</p>
                    <Button>New Engagement</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button className="w-fit">Update Password</Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive email notifications for new messages and session reminders</p>
                    </div>
                    <div className="h-6 w-12 bg-primary rounded-full relative cursor-pointer">
                      <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive push notifications on your browser</p>
                    </div>
                    <div className="h-6 w-12 bg-muted rounded-full relative cursor-pointer">
                      <div className="h-5 w-5 bg-muted-foreground rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Delete Account</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="destructive" className="w-fit">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoachProfile;
