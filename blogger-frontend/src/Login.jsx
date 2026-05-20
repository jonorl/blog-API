// React import
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// ShadCN/UI components
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Lucide React icons
import { LogIn } from "lucide-react";

// .env references
const usersHost = import.meta.env.VITE_USERS_HOST;
const HOST = import.meta.env.VITE_HOST;

const Login = () => {
  
  // Hooks
  const [formData, setFormData] = useState({email: '', password: '',});
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle dark mode
  document.documentElement.classList.add('dark');
  
  // to redirect
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    // Basic client-side validation
    const newErrors = [];
    if (!formData.email) newErrors.push({ msg: 'Email is required' });
    if (!formData.password) newErrors.push({ msg: 'Password is required' });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${HOST}api/v1/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData.errors || [{ msg: 'Invalid email or password' }]);
      } else {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('authtoken', 'bearer ' + data.token);
          console.log('Token stored in localStorage');
          navigate('/'); // Redirect to the home page after successful login
        } else {
          console.error('No token received');
          setErrors([{ msg: 'Login failed: No token received' }]);
        }
      }
    } catch (error) {
      setErrors([{ msg: 'An unexpected error occurred' }]);
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="max-w-5xl mx-auto p-6 flex justify-between items-center border-b border-border">
        <Link to={`/`} className="ml-2 text-xl font-bold text-white hidden md:inline sm:hidden">Blogger Access</Link>
        <Link to={`/`} className="ml-2 text-xl font-bold text-white  lg:hidden md:hidden">BA</Link>
        <nav className="flex space-x-2 text-xs sm:text-sm md:space-x-8 md:text-base px-2 sm:px-4">
          <Link to="/login" className=" flex items-center">
            <span>Login&nbsp; </span>
            <LogIn className="h-4 w-4 mr-1" />
          </Link>
        </nav>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center mb-6">Login to Your Account</h1>

        {errors.length > 0 && (
          <Alert variant="destructive" className="bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-800">
            <AlertDescription>
              <ul className="list-disc pl-4">
                {errors.map((error, index) => (
                  <li key={index}>{error.msg}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-6 hover:shadow-lg transition-shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                className="bg-card border-border text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="bg-card border-border text-foreground"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Login <LogIn className="ml-2 h-5 w-5" />
                </span>
              )}
            </Button>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to={`${usersHost}signup`} className="text-primary hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto p-6 border-t border-border text-center text-sm text-muted-foreground">
        © 2025 Blogger CMS / Blog API. 8hqczgwx8@mozmail.com.
      </footer>
    </div>
  );
};

export default Login;