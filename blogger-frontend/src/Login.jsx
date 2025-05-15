import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Home } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // Initialize theme based on localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    } else if (savedTheme === 'light') {
      setIsDarkMode(false);
    } else {
      // Use system preference as fallback
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
      const response = await fetch('http://localhost:3000/api/v1/users/login', {
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
        <a href={`/`} className="text-3xl font-bold">Blogger Access</a>
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
            <a href="/register" className="text-primary hover:underline">
              Register here
            </a>
          </p>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto p-6 border-t border-border text-center text-sm text-muted-foreground">
        © 2025 Blogger CMS / Blog API. jonorl@gmail.com.
      </footer>
    </div>
  );
};

export default Login;