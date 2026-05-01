import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Alert, AlertDescription } from "@/components/ui/alert.jsx";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setSuccess(true);
        // For demo purposes, show the token in console
        console.log("Password reset token:", result.token);
        console.log("Reset link:", `${window.location.origin}/reset-password?token=${result.token}`);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError("Failed to send reset instructions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Forgot password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you instructions to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  Reset instructions sent!
                </h3>
                <p className="text-muted-foreground mb-4">
                  We've sent password reset instructions to your email address.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Check your email and click the reset link to create a new password.
                </p>
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                  <p className="font-medium mb-1">Demo Note:</p>
                  <p>Check the browser console for the reset token and link.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                >
                  Send to another email
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  "Sending instructions..."
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reset Instructions
                  </>
                )}
              </Button>
              
              <div className="text-center">
                <Link 
                  to="/login" 
                  className="text-sm text-primary hover:underline inline-flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
