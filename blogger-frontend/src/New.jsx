import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// shadcn/ui components
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    NotebookPen,
    LogOut,
    ArrowLeft,
    Save,
} from "lucide-react";
import { Editor } from '@tinymce/tinymce-react';

const NewPostPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPublished, setIsPublished] = useState(true); // Default to published
    const [isDarkMode, setIsDarkMode] = useState(false);
    const editorRef = useRef(null);

    const currentUser = {
        user_id: "5b8872a0-dae5-4a21-8a00-5861f8d446b5"
    };

    const bearerToken = {
        authToken: "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNWI4ODcyYTAtZGFlNS00YTIxLThhMDAtNTg2MWY4ZDQ0NmI1IiwiZmlyc3RfbmFtZSI6IkpvbmFUcmVjZSIsImxhc3RfbmFtZSI6Ik9ybG9UcmVjZSIsImVtYWlsIjoiam9uMTNAb3Jsby5jb20iLCJwYXNzd29yZF9oYXNoIjoiJDJiJDEwJE9Pb3pKelVKQmk1cmxnZ2FoOFRTSU82RGVWMWQ2UG9EdGFETTRyOVhmWWNQZ0JaVFhvVFouIiwiY3JlYXRlZF9hdCI6IjIwMjUtMDUtMTNUMDY6MzY6NTkuODAxWiIsInVwZGF0ZWRfYXQiOiIyMDI1LTA1LTEzVDA2OjM2OjU5LjgwMVoiLCJyb2xlcyI6InVzZXIiLCJpYXQiOjE3NDcxNDg4NTIsImV4cCI6MTc0Nzc1MzY1Mn0.4V6v00Zvy8BdVCoGEEzpGx2SjWbt4nHgUAi-ezhSxnI"
    };

    const apiKeyTinyMCE = import.meta.env.VITE_TINYMCE_API_KEY;

    // Handle dark mode toggle
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Initialize theme based on localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
        } else if (savedTheme === 'light') {
            setIsDarkMode(false);
        } else {
            // Optional: Use system preference as fallback
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authtoken");
        navigate("/");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            alert('Please provide both title and content for your post.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:3000/api/v1/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': bearerToken.authToken,
                    'user': currentUser.user_id
                },
                body: JSON.stringify({
                    title: title,
                    text: content,
                    publish: isPublished
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            const data = await response.json();
            console.log('Post created successfully:', data);

            // Redirect to the newly created post or posts list
            navigate(`/posts/${data.newPost.post_id}`);
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="max-w-5xl mx-auto p-6 flex justify-between items-center border-b border-border">
                <a href="/" className="text-3xl font-bold">Blogger Access</a>
                <nav className="hidden md:flex space-x-8">
                    <a href="/new" className="text-slate-300 hover:text-blue-400 flex items-center">
                        <span>New Post&nbsp; </span>
                        <NotebookPen className="h-4 w-4 mr-1" />
                    </a>
                    <a href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handleLogout();
                        }} className="text-slate-300 hover:text-blue-400 flex items-center">
                        <span>Logout&nbsp; </span>
                        <LogOut className="h-4 w-4 mr-1" />
                    </a>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-6 flex items-center">
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="flex items-center"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold ml-4 text-white">Create New Post</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="bg-card text-card-foreground border shadow-sm hover:shadow-lg transition-shadow rounded-lg mb-6">
                        <CardHeader>
                            <CardTitle className="text-2xl text-white">Post Details</CardTitle>
                            <CardDescription>Fill in the information for your new blog post</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-white">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter post title"
                                    className="bg-slate-700 border-slate-600 text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content" className="text-white">Content</Label>
                                <Editor
                                    apiKey={apiKeyTinyMCE}
                                    onInit={(evt, editor) => (editorRef.current = editor)}
                                    value={content}
                                    onEditorChange={(newValue) => setContent(newValue)}
                                    init={{
                                        // height: 500,
                                        menubar: true,
                                        plugins: [
                                            'autoresize', 'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                            'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                                        ],
                                        toolbar: 'undo redo | blocks | ' +
                                            'bold italic forecolor | alignleft aligncenter ' +
                                            'alignright alignjustify | bullist numlist outdent indent | ' +
                                            'removeformat | help',
                                        content_style: `
                                            body {
                                            background: ${isDarkMode ? '#1f2937' : '#fff'};
                                            color: ${isDarkMode ? '#e5e7eb' : '#374151'};
                                            font-family: Inter, sans-serif;
                                            font-size: 14px;
                                            border: 1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'};
                                            border-radius: 4px;
                                            padding: 8px;
                                            }
                                        `,
                                        skin: isDarkMode ? 'oxide-dark' : 'oxide',
                                        content_css: isDarkMode ? 'dark' : 'default',
                                    }}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Label htmlFor="publish-toggle" className="text-white">Publish post</Label>
                                <Switch
                                    checked={isPublished}
                                    onCheckedChange={setIsPublished}
                                    id="publish-toggle"
                                    className="border-2 border-border [&>span]:bg-background [&>span]:shadow-md"
                                />
                                <span className="text-sm text-slate-400">
                                    {isPublished ? 'Post will be published immediately' : 'Post will be saved as draft'}
                                </span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !title.trim() || !content.trim()}
                                className="flex items-center"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isSubmitting ? 'Creating...' : 'Create Post'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>

            {/* Footer */}
            <footer className="max-w-5xl mx-auto p-6 border-t border-border text-center text-sm text-muted-foreground">
                © 2025 Blogger CMS / Blog API. jonorl@gmail.com.
            </footer>
        </div>
    );
};

export default NewPostPage;