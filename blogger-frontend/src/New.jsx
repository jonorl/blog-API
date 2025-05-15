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
    Info,
} from "lucide-react";
import { Editor } from '@tinymce/tinymce-react';

const NewPostPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPublished, setIsPublished] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [bearerToken, setBearerToken] = useState('');
    const editorRef = useRef(null);

    const apiKeyTinyMCE = import.meta.env.VITE_TINYMCE_API_KEY;

    // Fetch current user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem("authtoken");
                if (!token) {
                    console.warn("No auth token found");
                    return;
                }
                setBearerToken(token);
                const response = await fetch(`http://localhost:3000/api/v1/usersverified/`, {
                    method: 'GET',
                    headers: { authorization: token },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch current user");
                }

                const userData = await response.json();
                setCurrentUser(userData.user);
                setIsAdmin(userData.user.roles !== "user");
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };

        fetchCurrentUser();
    }, []);

    // Handle dark mode toggle
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Initialize theme
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
        } else if (savedTheme === 'light') {
            setIsDarkMode(false);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
        }
    }, []);

    const handleMakeAdmin = async () => {
        try {
            const newIsAdmin = !isAdmin;
            const newRole = newIsAdmin ? "blogger" : "user";

            const response = await fetch(`http://localhost:3000/api/v1/users/${currentUser.user_id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': bearerToken
                },
                body: JSON.stringify({
                    roles: newRole
                })
            });

            if (response.ok) {
                setCurrentUser(prevUser => ({
                    ...prevUser,
                    roles: newRole
                }));
                setIsAdmin(newIsAdmin);
            } else {
                console.error('Error updating user role:', response.status);
            }
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

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
                    'Authorization': bearerToken,
                    'user': currentUser?.user_id
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
                    {currentUser && (
                        <>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={isAdmin}
                                    onCheckedChange={handleMakeAdmin}
                                    id={`publish-mode-${currentUser.user_id}`}
                                    className="border-2 border-border [&>span]:bg-background [&>span]:shadow-md"
                                />
                                <Label htmlFor={`publish-mode-${currentUser.user_id}`}>Make Admin?</Label>
                            </div>
                            <a href="/new" className="text-slate-300 hover:text-blue-400 flex items-center">
                                <span>New Post </span>
                                <NotebookPen className="h-4 w-4 mr-1" />
                            </a>
                            <a href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleLogout();
                                }} className="text-slate-300 hover:text-blue-400 flex items-center">
                                <span>Logout </span>
                                <LogOut className="h-4 w-4 mr-1" />
                            </a>
                        </>
                    )}
                </nav>
            </header>

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

                {currentUser && currentUser.roles !== "blogger" && (
                    <Card className="p-6 text-center mb-6">
                        <div className="flex items-center justify-center space-x-2">
                            <Info className="h-5 w-5" />
                            <p className="font-medium">Become a blogger to create and edit posts</p>
                        </div>
                        <div className="mt-4 flex items-center justify-center space-x-2">
                            <Switch
                                checked={isAdmin}
                                onCheckedChange={handleMakeAdmin}
                                id={`become-blogger-${currentUser.user_id}`}
                                className="border-2 border-border [&>span]:bg-background [&>span]:shadow-md"
                            />
                            <Label htmlFor={`become-blogger-${currentUser.user_id}`}>Become a Blogger?</Label>
                        </div>
                    </Card>
                )}

                {currentUser && currentUser.roles === "blogger" && (
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
                )}
            </main>

            <footer className="max-w-5xl mx-auto p-6 border-t border-border text-center text-sm text-muted-foreground">
                © 2025 Blogger CMS / Blog API. jonorl@gmail.com.
            </footer>
        </div>
    );
};

export default NewPostPage;