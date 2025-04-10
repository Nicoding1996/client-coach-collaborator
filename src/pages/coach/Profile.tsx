import { useState, useRef, useEffect } from "react";
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
import { authAPI } from "@/services/api";

const CoachProfile = () => {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    bio: "",
    company: "",
    location: "",
    website: "",
    specialties: "",
    certifications: ""
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
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoadingInitialData(true);

        // Try to fetch profile from API
        try {
          const profileData = await authAPI.getProfile();
          setFormData({
            name: profileData.name || user?.name || "",
            email: profileData.email || user?.email || "",
            phone: profileData.phone || "",
            bio: profileData.bio || "",
            company: profileData.company || "",
            location: profileData.location || "",
            website: profileData.website || "",
            specialties: profileData.specialties || "",
            certifications: profileData.certifications || ""
          });
          console.log("Profile loaded successfully from API");
        } catch (error) {
          console.error('Error fetching profile from API:', error);
          
          // If the API fails, try to get data from localStorage
          const localUserData = localStorage.getItem('user');
          if (localUserData) {
            try {
              const userData = JSON.parse(localUserData);
              setFormData({
                name: userData.name || user?.name || "",
                email: userData.email || user?.email || "",
                phone: userData.phone || "",
                bio: userData.bio || "",
                company: userData.company || "",
                location: userData.location || "",
                website: userData.website || "",
                specialties: userData.specialties || "",
                certifications: userData.certifications || ""
              });
              console.log("Profile loaded from localStorage (fallback)");
            } catch (parseError) {
              console.error('Error parsing user data from localStorage:', parseError);
              toast.error('Failed to load profile data');
            }
          } else {
            toast.error('Failed to load profile data');
          }
        }
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSaveProfile = async (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent) => {
    // Prevent default behavior that could cause page refresh
    e.preventDefault();
    if (e.currentTarget) {
      e.stopPropagation();
    }
    
    try {
      // Use isSaving state specifically for save operations
      setIsSaving(true);

      // Log the profile data we're sending
      console.log("Saving profile data:", formData);

      try {
        // Try to update profile via API
        await updateProfile(formData);
        setIsEditing(false);
        toast.success("Profile updated successfully");
        
        // Also update localStorage as fallback
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUserData = { ...userData, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
      } catch (error) {
        console.error('Error updating profile:', error);
        
        if (!navigator.onLine) {
          toast.error("You're offline. Please check your internet connection.");
        } else {
          toast.error("Failed to update profile. Please try again later.");
        }
      }
    } finally {
      setIsSaving(false);
    }
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
    console.log('Selected file for upload:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Validate file type and size client-side before attempting upload
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    // Check file type
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, or GIF)");
      return;
    }
    
    // Max size 1MB (same as server) - convert to more understandable message
    const MAX_SIZE = 1000000; // 1MB in bytes
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / 1000000).toFixed(2);
      toast.error(`File is too large (${sizeMB}MB). Maximum size is 1MB. Please resize your image.`);
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Create a FormData object for the file upload
      const formData = new FormData();
      formData.append('avatar', file);
      
      console.log('Uploading avatar file');
      
      // Set a longer timeout for avatar uploads specifically
      const response = await authAPI.updateAvatar(formData);
      console.log('Avatar upload response:', response);
      
      if (response && response.avatar) {
        // Update user context with the new avatar URL
        if (user) {
          const updatedUserData = { 
            ...user, 
            avatar: response.avatar 
          };
          
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(updatedUserData));
          
          // Force refresh the avatar image by triggering a state update
          // This ensures the UI shows the new avatar immediately
          const avatarElem = document.querySelector('.avatar-image') as HTMLImageElement;
          if (avatarElem) {
            // Add cache-busting parameter
            avatarElem.src = `${response.avatar}?t=${new Date().getTime()}`;
          }
        }
        
        toast.success("Profile photo updated successfully");
      } else {
        console.error('Invalid avatar response:', response);
        toast.error("Unexpected response from server. Avatar may not be updated.");
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      if (error.code === 'ECONNABORTED') {
        toast.error("Avatar upload timed out. Please try a smaller image or check your internet connection.");
      } else if (!navigator.onLine) {
        toast.error("You're offline. Please check your internet connection.");
      } else {
        toast.error("Failed to update profile photo. Please try again.");
      }
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
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="schedule">Availability</TabsTrigger>
          <TabsTrigger value="settings">Account Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader className="relative pb-0">
              <div className="absolute right-6 top-6">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSaveProfile(e);
                      }}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <div className="h-4 w-4 mr-2 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
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
                      <AvatarImage
                        src={user?.avatar}
                        alt={user?.name || 'User'} // Add fallback alt text
                        className="avatar-image object-cover" // Ensure object-cover is present
                      />
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
