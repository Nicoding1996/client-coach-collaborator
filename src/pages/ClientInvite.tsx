import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authAPI } from "@/services/api"; // Import authAPI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext"; // Keep for redirect check

const ClientInvite = () => {
  const { inviteId } = useParams<{ inviteId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth(); // Keep for redirect check

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Optional: Keep confirm password for better UX, though not strictly required by API
  const [confirmPassword, setConfirmPassword] = useState("");

  // Invite Validation State
  const [isValidating, setIsValidating] = useState(true);
  const [isInviteValid, setIsInviteValid] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Registration State
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  // --- Validation Effect ---
  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      navigate(`/${user.role}`); // Redirect to appropriate dashboard
      return;
    }

    if (!inviteId) {
      setValidationError("No invite token provided in the URL.");
      setIsValidating(false);
      return;
    }

    const validate = async () => {
      setIsValidating(true);
      setValidationError(null);
      try {
        // Call the actual API validation endpoint
        await authAPI.validateInvite(inviteId);
        setIsInviteValid(true);
      } catch (err) {
        console.error("Invite validation failed:", err);
        setValidationError("Invalid or expired invite link. Please request a new one from your coach.");
        setIsInviteValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validate();

  }, [inviteId, navigate, isAuthenticated, user]); // Dependencies

  // --- Registration Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError(null); // Clear previous errors

    if (!name || !email || !password || !confirmPassword) {
      setRegistrationError("Please fill in all fields.");
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      setRegistrationError("Passwords do not match.");
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setRegistrationLoading(true);

    try {
      await authAPI.register({
        name,
        email,
        password,
        role: 'client',
        inviteToken: inviteId || '', // Pass the invite token
      });

      toast({
        title: "Success!",
        description: "Your account has been created.",
        variant: "default",
      });

      // Registration in authAPI handles login and token storage.
      // Navigate to the client dashboard.
      navigate('/client');

    } catch (error: unknown) {
      console.error("Registration failed:", error);
      let errorMessage = "Registration failed. An unexpected error occurred.";
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || "Registration failed. The email might already be in use or the invite is invalid.";
      }
      setRegistrationError(errorMessage);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setRegistrationLoading(false);
    }
  };

  // --- Render Logic ---

  // 1. Validating State
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-foreground">Validating invite...</p>
        </div>
      </div>
    );
  }

  // 2. Validation Error State
  if (validationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md animate-fadeIn">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-destructive">Invite Problem</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-6">{validationError}</p>
            <div className="flex justify-center">
              <Link to="/">
                <Button variant="outline">Return to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Invite Valid - Show Registration Form
  if (isInviteValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                C
              </div>
              <span className="ml-3 text-xl font-semibold">CoachConnect</span>
            </Link>
          </div>

          <Card className="w-full animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-2xl">Create Your Client Account</CardTitle>
              <CardDescription>
                You've been invited to join CoachConnect. Please complete your registration below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                    disabled={registrationLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    disabled={registrationLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    disabled={registrationLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    disabled={registrationLoading}
                  />
                </div>

                {registrationError && (
                  <p className="text-sm text-destructive text-center">{registrationError}</p>
                )}

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={registrationLoading}
                >
                  {registrationLoading ? (
                    <>
                      <span className="animate-spin mr-2">◌</span> Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Fallback (should ideally not be reached if logic is correct)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p>Something went wrong.</p>
    </div>
  );
};

export default ClientInvite;
