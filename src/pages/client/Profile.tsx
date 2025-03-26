import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Camera, Check, LogOut, MapPin, Mail, Phone, Target, Calendar, FileText } from "lucide-react";
import { userAPI } from "@/lib/api";

// Mock data
const goals = [
  {
    id: "1",
    title: "Improve public speaking confidence",
    dueDate: "March 15, 2023",
    progress: 65,
    description: "Develop confidence and skills for presenting to large groups",
    coach: "Sarah Johnson",
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
    description: "Enhance ability to lead teams effectively and inspire others",
    coach: "Michael Stevens",
    milestones: [
      { id: "m5", title: "Complete leadership assessment", completed: true },
      { id: "m6", title: "Read assigned leadership book", completed: true },
      { id: "m7", title: "Shadow senior leader for a day", completed: false },
      { id: "m8", title: "Lead team meeting", completed: false }
    ]
  }
];

const assessments = [
  {
    id: "1",
    title: "Leadership Strengths Assessment",
    completedDate: "February 5, 2023",
    coach: "Michael Stevens",
    type: "Strengths Finder"
  },
  {
    id: "2",
    title: "Communication Style Analysis",
    completedDate: "January 20, 2023",
    coach: "Sarah Johnson",
    type: "DISC Assessment"
  },
  {
    id: "3",
    title: "360 Feedback Survey",
    completedDate: "In Progress",
    coach: "Michael Stevens",
    type: "Peer Feedback"
  }
];

const ClientProfile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+1 (555) 987-6543",
    bio: "Marketing Director with 7 years of experience seeking to enhance leadership and public speaking skills. Currently focused on transitioning to a more strategic role within my organization.",
    company: "Acme Marketing Solutions",
    location: "Chicago, IL",
    title: "Marketing Director"
  });
  
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
    // In a real implementation, you would call your API here
    // userAPI.updateProfile(formData);
  };
  
  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    try {
      setIsUploading(true);
      // Call your API to upload the avatar
      await userAPI.updateAvatar(file);
      toast.success("Profile photo updated successfully");
      // Refresh user data or update local state
      // This would typically involve updating the global user state
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Failed to update profile photo");
    } finally {
      setIsUploading(false);
    }
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
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
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
                    <Avatar className={`h-32 w-32 ${isEditing ? 'cursor-pointer' : ''}`} onClick={handleAvatarClick}>
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="text-3xl">{user?.name ? getInitials(user.name) : "C"}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                          onClick={handleAvatarClick}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Camera className="h-4 w-4" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {!isEditing && (
                    <div className="mt-4 text-center">
                      <h2 className="text-xl font-bold">{formData.name}</h2>
                      <p className="text-muted-foreground">{formData.title}</p>
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
                          <Label htmlFor="title">Job Title</Label>
                          <Input
                            id="title"
                            name="title"
                            value={formData.title}
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
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium">About Me</h3>
                        <p className="text-muted-foreground">{formData.bio}</p>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formData.location}</span>
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
                        <h3 className="text-lg font-medium">Coaching Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card className="hover-lift">
                            <CardContent className="p-6">
                              <div className="flex flex-col items-center text-center">
                                <Target className="h-8 w-8 text-primary mb-2" />
                                <h4 className="text-2xl font-bold">{goals.length}</h4>
                                <p className="text-sm text-muted-foreground">Active Goals</p>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="hover-lift">
                            <CardContent className="p-6">
                              <div className="flex flex-col items-center text-center">
                                <Calendar className="h-8 w-8 text-primary mb-2" />
                                <h4 className="text-2xl font-bold">12</h4>
                                <p className="text-sm text-muted-foreground">Sessions Completed</p>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="hover-lift">
                            <CardContent className="p-6">
                              <div className="flex flex-col items-center text-center">
                                <FileText className="h-8 w-8 text-primary mb-2" />
                                <h4 className="text-2xl font-bold">{assessments.length}</h4>
                                <p className="text-sm text-muted-foreground">Assessments</p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="goals" className="space-y-6">
          <div className="grid gap-6">
            {goals.map((goal) => (
              <Card key={goal.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Coach: {goal.coach} • Due: {goal.dueDate}</p>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0">
                        <div className="bg-muted px-3 py-1 rounded-full">
                          <span className="text-sm font-medium">{goal.progress}% Complete</span>
                        </div>
                      </div>
                    </div>
                    
                    <Progress value={goal.progress} className="h-2" />
                    
                    <p className="text-sm">{goal.description}</p>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Milestones</h4>
                      <div className="space-y-2">
                        {goal.milestones.map((milestone) => (
                          <div 
                            key={milestone.id} 
                            className={`flex items-center p-3 rounded-lg ${
                              milestone.completed ? "bg-muted/50" : "border-l-2 border-primary"
                            }`}
                          >
                            <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${
                              milestone.completed 
                                ? "bg-primary border-primary" 
                                : "border-muted-foreground"
                            }`}>
                              {milestone.completed && (
                                <Check className="h-3 w-3 text-primary-foreground" />
                              )}
                            </div>
                            <span className={`text-sm ${milestone.completed ? "line-through text-muted-foreground" : ""}`}>
                              {milestone.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="assessments" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{assessment.title}</h3>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline">{assessment.type}</Badge>
                        <span className="text-sm text-muted-foreground ml-3">Coach: {assessment.coach}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {assessment.completedDate === "In Progress" 
                          ? "Status: In Progress" 
                          : `Completed: ${assessment.completedDate}`
                        }
                      </p>
                    </div>
                    <Button variant="outline" className="mt-3 md:mt-0">
                      View Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Available Assessments</CardTitle>
              <CardDescription>Take these assessments to gain insights into your strengths and development areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="hover-lift">
                  <CardContent className="p-5">
                    <h3 className="font-medium">Emotional Intelligence Assessment</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Measures your ability to understand and manage emotions effectively
                    </p>
                    <Button variant="outline" className="w-full mt-4">
                      Start Assessment
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="hover-lift">
                  <CardContent className="p-5">
                    <h3 className="font-medium">Leadership Style Inventory</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Identifies your natural leadership approach and tendencies
                    </p>
                    <Button variant="outline" className="w-full mt-4">
                      Start Assessment
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="hover-lift">
                  <CardContent className="p-5">
                    <h3 className="font-medium">Work Values Assessment</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Determines what motivates you and drives satisfaction at work
                    </p>
                    <Button variant="outline" className="w-full mt-4">
                      Start Assessment
                    </Button>
                  </CardContent>
                </Card>
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
                <h3 className="text-lg font-medium">Privacy Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Share Progress with Coach</h4>
                      <p className="text-sm text-muted-foreground">Allow your coach to view your goal progress and assessment results</p>
                    </div>
                    <div className="h-6 w-12 bg-primary rounded-full relative cursor-pointer">
                      <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientProfile;
