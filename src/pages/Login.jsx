import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Alert, AlertDescription } from "@/components/ui/alert.jsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.jsx";
import { LogIn, ShieldCheck, User, Eye, EyeOff, Mail, Lock, UserCircle, Info } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await login(email, password, userType);
      if (!result.success) {
        setError(result.error.message);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your email to access ProjectHub
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            <div className="flex items-center justify-between">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>

              <div className="space-y-3">
                <Label>Select User Type</Label>
                <RadioGroup 
                  value={userType} 
                  onValueChange={(value) => {
                    setUserType(value);
                  }} 
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="flex items-center cursor-pointer flex-1">
                      <ShieldCheck className="h-4 w-4 mr-2 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium">Admin</div>
                        <div className="text-sm text-muted-foreground">Full access to projects, team management</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                    <RadioGroupItem value="member" id="member" />
                    <Label htmlFor="member" className="flex items-center cursor-pointer flex-1">
                      <User className="h-4 w-4 mr-2 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium">Member</div>
                        <div className="text-sm text-muted-foreground">View assigned tasks and projects</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !email.trim() || !password.trim()}
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
          </form>
          
          <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
