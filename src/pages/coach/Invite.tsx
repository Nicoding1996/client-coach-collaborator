import { useState } from "react"; // Keep useState
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, Check, Send, Loader2, AlertCircle } from "lucide-react"; // Added Loader2, AlertCircle
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/services/api"; // Import authAPI

const CoachInvite = () => {
  const { user } = useAuth();
  
  // State for email invite
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false); // Keep this for email invite feedback

  // State for generating invite link
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null); // Renamed error state to avoid conflict

  // State for copy button
  const [isCopied, setIsCopied] = useState(false);

  const handleSendInvite = async () => {
    // ... (keep existing email invite logic)
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    
    setIsSending(true);
    
    try {
      // TODO: Replace with actual API call for sending email invites if needed
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

  // New handler for generating the link
  const handleGenerateLink = async () => {
    setIsGenerating(true);
    setLinkError(null); // Clear previous errors
    setInviteToken(null); // Clear previous token

    try {
      const token = await authAPI.generateInviteLink();
      setInviteToken(token);
      toast.success("Invite link generated successfully!");
    } catch (error) {
      console.error("Error generating invite link:", error);
      setLinkError("Failed to generate invite link. Please try again.");
      toast.error("Failed to generate invite link.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Updated handler for copying the generated link
  const handleCopyLink = () => {
    if (!inviteToken) return; // Don't copy if no token

    const fullInviteLink = `${window.location.origin}/invite/${inviteToken}`; // Use window.location.origin for flexibility
    navigator.clipboard.writeText(fullInviteLink);
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
        {/* Email Invite Card - Unchanged */}
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
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {/* Use Loader2 */}
                  Sending...
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
        
        {/* Share Invite Link Card - Modified */}
        <Card>
          <CardHeader>
            <CardTitle>Share Invite Link</CardTitle>
            <CardDescription>
              Generate a unique invite link to share with your client manually.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Generate Button and Error Display */}
            <div className="mb-4 space-y-2">
              <Button onClick={handleGenerateLink} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Link"
                )}
              </Button>
              {linkError && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4" /> 
                  {linkError}
                </p>
              )}
            </div>

            {/* Conditionally rendered Input and Copy button */}
            {inviteToken && (
              <>
                <div className="flex">
                  <Input
                    value={`${window.location.origin}/invite/${inviteToken}`} // Construct link using state
                    readOnly
                    className="flex-1 rounded-r-none"
                  />
                  <Button
                    className="rounded-l-none"
                    variant="secondary"
                    onClick={handleCopyLink}
                    disabled={!inviteToken} // Disable if no token
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
                  This link will expire based on your server configuration. Your client will be automatically connected to you when they sign up.
                </p>
              </>
            )}
            {!inviteToken && !isGenerating && !linkError && (
                 <p className="text-sm text-muted-foreground mt-4">
                   Click "Generate Link" to create a shareable invitation link.
                 </p>
            )}
          </CardContent>
        </Card>
        
        {/* Invite Sent Confirmation - Unchanged */}
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
