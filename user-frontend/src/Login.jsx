import React, { useState, useEffect } from 'react';
import { BookOpen, Rss, LogIn, LogOut, UserRoundPlus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const SignUp = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrors([]);

        // Basic client-side validation
        const newErrors = [];
        if (!formData.email) newErrors.push({ msg: 'Email is required' });
        if (!formData.password) newErrors.push({ msg: 'Password is required' });

        try {
            const response = await fetch('https://bold-corabella-jonorl-a167c351.koyeb.app/api/v1/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrors(errorData.errors || [{ msg: 'An error occurred during sign-up' }]);
            } else {
                // Parse the response body as JSON
                const data = await response.json();
                // Handle successful sign-up (e.g., redirect to login)
                if (data.token) {
                    console.log("response.token", data.token)
                    localStorage.setItem("authtoken", "bearer " + data.token);
                    console.log("Token stored in localStorage");
                } else {
                    console.error("No token received");
                }
                window.location.href = '/';
            }
        }


        catch (error) {
            setErrors([{ msg: error }]);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem("authtoken");
                if (!token) {
                    console.warn("No auth token found");
                    return;
                }

                const response = await fetch(`https://bold-corabella-jonorl-a167c351.koyeb.app/api/v1/users/verified/${localStorage.getItem("authtoken")}`, {
                    headers: { Authorization: token },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch current user");
                }

                const userData = await response.json();
                setCurrentUser(userData.user);
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };

        fetchCurrentUser();
    }, []);



    return (
        <div className="flex flex-col min-h-screen bg-slate-900 text-slate-200">
            {/* Navigation Header */}
            <header className="sticky top-0 z-10 bg-slate-800 shadow-sm">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <a href="/" className="text-slate-300 hover:text-blue-400 flex items-center">
                                <BookOpen className="h-6 w-6 text-blue-400" />
                                <span className="ml-2 text-xl font-bold text-white">Blog API Project</span>
                            </a>
                        </div>
                        <nav className="hidden md:flex space-x-8">
                            {currentUser ? (
                                <>
                                    <span>Hello {currentUser.first_name}&nbsp; </span>

                                    <a href="#" className="text-slate-300 hover:text-blue-400 flex items-center">
                                        <span>Logout&nbsp; </span>
                                        <LogOut className="h-4 w-4 mr-1" />
                                    </a>
                                </>
                            ) : (
                                <>
                                    <a href="/signup" className="text-slate-300 hover:text-blue-400 flex items-center">
                                        <span>Sign up&nbsp; </span>
                                        <UserRoundPlus className="h-4 w-4 mr-1" />
                                    </a>
                                    <a href="/login" className="text-slate-300 hover:text-blue-400 flex items-center">
                                        <span>Login&nbsp; </span>
                                        <LogIn className="h-4 w-4 mr-1" />
                                    </a>
                                </>
                            )}

                            <a href="https://bloggers-frontend.netlify.app/" className="text-slate-300 hover:text-blue-400 flex items-center">
                                <span>Blogger CMS access&nbsp;</span>
                                <Rss className="h-4 w-4 mr-1" />
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
                <Card className="bg-slate-800 border-slate-700 text-slate-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-white text-center">Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-200">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    placeholder="john@doe.com"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-200">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    minLength={8}
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.length > 0 && (
                                <ul className="text-red-400 text-sm space-y-1">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error.msg}</li>
                                    ))}
                                </ul>
                            )}
                            <div className="flex justify-center">
                                <Button
                                    onClick={handleSubmit}
                                    className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Logging in...' : 'Login'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* Footer */}
            <footer className="bg-slate-800 shadow-inner mt-auto">
                <div className="container mx-auto px-4 py-6 max-w-4xl">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex items-center mb-4">
                            <BookOpen className="h-6 w-6 text-blue-400" />
                            <span className="ml-2 text-xl font-bold text-white">Blog API Project</span>
                        </div>
                        <div className="text-slate-400 text-sm">
                            © 2025 Blog API Project. 8hqczgwx8@mozmail.com
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default SignUp;