
import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  UserCircle, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  const menuItems = [
    { path: "/client", icon: Home, label: "Dashboard" },
    { path: "/client/coaches", icon: Users, label: "My Coaches" },
    { path: "/client/sessions", icon: Calendar, label: "Sessions" },
    { path: "/client/messages", icon: MessageSquare, label: "Messages" },
    { path: "/client/profile", icon: UserCircle, label: "Profile" },
  ];
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <button 
          className="fixed top-4 left-4 z-50 p-2 rounded-full bg-primary text-primary-foreground shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen`}
      >
        <div className="flex flex-col h-full px-4 py-6">
          <div className="flex items-center mb-8 px-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              C
            </div>
            <span className="ml-3 text-xl font-semibold">CoachConnect</span>
          </div>
          
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/client"}
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-foreground hover:bg-secondary"
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          
          <div className="mt-auto pt-4">
            <Separator className="mb-4" />
            <div className="flex items-center px-4 py-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start px-4 py-3 mt-2 text-sm font-medium"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main 
        className={`flex-1 ${sidebarOpen && isMobile ? "opacity-50" : ""} transition-opacity duration-300`}
        onClick={() => isMobile && sidebarOpen && setSidebarOpen(false)}
      >
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ClientLayout;
