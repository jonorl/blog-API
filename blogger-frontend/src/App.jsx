import React, { useEffect, useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";

const Index = () => {
  const [posts, setPosts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState('auto');
  const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode
  const postTextRef = useRef({});

  const currentUser = {
    user_id: "5b8872a0-dae5-4a21-8a00-5861f8d446b5"
  };
  const bearerToken = {
    authToken: "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNWI4ODcyYTAtZGFlNS00YTIxLThhMDAtNTg2MWY4ZDQ0NmI1IiwiZmlyc3RfbmFtZSI6IkpvbmFUcmVjZSIsImxhc3RfbmFtZSI6Ik9ybG9UcmVjZSIsImVtYWlsIjoiam9uMTNAb3Jsby5jb20iLCJwYXNzd29yZF9oYXNoIjoiJDJiJDEwJE9Pb3pKelVKQmk1cmxnZ2FoOFRTSU82RGVWMWQ2UG9EdGFETTRyOVhmWWNQZ0JaVFhvVFouIiwiY3JlYXRlZF9hdCI6IjIwMjUtMDUtMTNUMDY6MzY6NTkuODAxWiIsInVwZGF0ZWRfYXQiOiIyMDI1LTA1LTEzVDA2OjM2OjU5LjgwMVoiLCJyb2xlcyI6InVzZXIiLCJpYXQiOjE3NDcxNDg4NTIsImV4cCI6MTc0Nzc1MzY1Mn0.4V6v00Zvy8BdVCoGEEzpGx2SjWbt4nHgUAi-ezhSxnI"
  }

  // Toggle dark mode
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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/posts`);
        if (response.ok) {
          const data = await response.json();
          const initialPosts = data.getPosts;

          const postsWithDetails = await Promise.all(
            initialPosts.map(async (post) => {
              const commentsResponse = await fetch(
                `http://localhost:3000/api/v1/posts/${post.post_id}/comments`
              );
              const userResponse = await fetch(
                `http://localhost:3000/api/v1/users/${post.author_id}`
              );
              const commentsData = await commentsResponse.json();
              const userData = await userResponse.json();

              return {
                ...post,
                commentsCount: commentsData.showPostComments.length,
                authorFirstName: userData.user.first_name,
                authorLastName: userData.user.last_name,
              };
            })
          );

          setPosts(postsWithDetails);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };
    fetchPosts();
  }, []);

  const handleEdit = (post) => {
    setEditingPostId(post.post_id);
    setEditText(post.post_text);
    setIsEditing(true);
    const postTextElement = postTextRef.current[post.post_id];
    if (postTextElement) {
      const height = postTextElement.offsetHeight;
      setTextareaHeight(`${height}px`);
    }
  };

  const handleSaveEdit = async (postId) => {
    if (editText.trim() === '') return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': bearerToken
        },
        body: JSON.stringify({
          text: editText,
        }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.post_id === postId ? { ...post, post_text: updatedPost.post_text } : post
          )
        );
        setEditingPostId(null);
        setEditText('');
        setIsEditing(false);
        setTextareaHeight('auto');
      } else {
        console.error('Error updating post:', response.status);
      }
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditText('');
    setIsEditing(false);
    setTextareaHeight('auto');
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'authorization': localStorage.getItem("authtoken")
          },
        });

        if (response.ok) {
          setPosts((prevPosts) =>
            prevPosts.filter((post) => post.post_id !== postId)
          );
        } else {
          console.error('Error deleting post:', response.status);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  // Toggle theme and save to localStorage
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  if (!posts) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="max-w-5xl mx-auto p-6 flex justify-between items-center border-b border-border">
        <h1 className="text-3xl font-bold">Blogger Access</h1>
        <Button onClick={toggleTheme} variant="outline">
          {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
        </Button>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        {posts.map((post) => (
          <Card key={post.post_id} className="p-6 hover:shadow-lg transition-shadow rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
            {editingPostId === post.post_id ? (
              <div className="flex flex-col space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="resize-none bg-card border-border text-foreground placeholder:text-muted-foreground"
                  style={{ height: textareaHeight }}
                />
                <div className="flex justify-end space-x-2">
                  <Button size="sm" onClick={() => handleSaveEdit(post.post_id)} disabled={isSubmitting}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isSubmitting}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p
                className="mb-4 text-muted-foreground"
                ref={(el) => (postTextRef.current[post.post_id] = el)}
              >
                {post.post_text}
              </p>
            )}
            {post.author_id === currentUser.user_id && (
              <div className="flex flex-row items-center justify-start space-x-5">
                <button
                  onClick={() => handleEdit(post)}
                  className="text-muted-foreground hover:text-primary focus:outline-none"
                  aria-label="Edit post"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(post.post_id)}
                  className="text-muted-foreground hover:text-destructive focus:outline-none"
                  aria-label="Delete post"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
            <Separator className="my-4" />
            <div className="flex items-center space-x-4">
              <div>
                <p className="font-medium">{post.author_id}</p>
                <p className="text-sm text-muted-foreground">{post.message_created_at}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={post.is_published} id="airplane-mode" className="border-2 border-border [&>span]:bg-background [&>span]:shadow-md" />
              <Label htmlFor="airplane-mode">Publish?</Label>
            </div>
          </Card>
        ))}
      </main>

      <footer className="max-w-5xl mx-auto p-6 border-t border-border text-center text-sm text-muted-foreground">
        © 2025 Blogger CMS / Blog API. jonorl@gmail.com.
      </footer>
    </div>
  );
};

export default Index;