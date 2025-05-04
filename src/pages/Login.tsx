
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check if admin user exists with the provided email and password
      const { data: adminUsers, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError || !adminUsers) {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // In a real app, we would hash the password and compare
      // This is a simplified implementation
      if (adminUsers.password_hash === password) {
        // Store admin info in localStorage for session management
        localStorage.setItem('admin_user', JSON.stringify(adminUsers));
        
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard",
        });
        
        navigate("/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-admin-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-admin-primary">
            Admin Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-admin-primary hover:bg-admin-secondary"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            This is an admin-only portal
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
