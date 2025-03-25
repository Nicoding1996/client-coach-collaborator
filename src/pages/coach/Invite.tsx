
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, Check, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CoachInvite = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  
  // Generate a mock invite link
  const inviteLink = `${window.location.origin}/invite/${Math.random().toString(36).substring(2, 12)}`;
  
  const handleSendInvite = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    
    setIsSending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setInviteSent(true);
      toast.success(`Invitation sent to ${email}`);
      
      // Reset form after success
      setEmail("");
      setMessage("");
    } catch (error) {
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setIsSending(false);
    }
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    toast.success("Invite link copied to clipboard");
    
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };
  
  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Invite Client</h1>
      
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Send Email Invitation</CardTitle>
            <CardDescription>
              Send an email invitation to your client directly from the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Client Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal message to your invitation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleSendInvite} 
              disabled={isSending || !email}
            >
              {isSending ? (
                <span className="flex items-center">
                  <span className="animate-pulse">Sending...</span>
                </span>
              ) : (
                <span className="flex items-center">
                  <Send className="mr-2 h-4 w-4" />
                  Send Invitation
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Share Invite Link</CardTitle>
            <CardDescription>
              Copy the invite link and share it with your client manually.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex">
              <Input
                value={inviteLink}
                readOnly
                className="flex-1 rounded-r-none"
              />
              <Button
                className="rounded-l-none"
                variant="secondary"
                onClick={handleCopyLink}
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              This link will expire in 7 days. Your client will be automatically connected to you when they sign up.
            </p>
          </CardContent>
        </Card>
        
        {inviteSent && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Invitation Sent!</h3>
                  <p className="text-sm text-muted-foreground">
                    You'll be notified when your client accepts the invitation and creates an account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CoachInvite;
