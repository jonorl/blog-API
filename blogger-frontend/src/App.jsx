import React, { useEffect, useState } from 'react';

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";


const Index = () => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("authtoken");
        if (!token) {
          console.warn("No auth token found");
          return;
        }

        const response = await fetch(`http://localhost:3000/api/v1/users/verified/${localStorage.getItem("authtoken")}`, {
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

  // const navigate = useNavigate();

  // const handleLogout = () => {
  //   localStorage.removeItem("authtoken");
  //   setCurrentUser(null);
  //   navigate("/");
  // };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="max-w-5xl mx-auto p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold">Blogger Access</h1>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto p-6 space-y-8">
        {posts.map((post) => (
          <Card key={post.post_id} className="p-6 hover:shadow-lg transition-shadow rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">{post.post_text}</p>
            <Separator className="my-4" />
            <div className="flex items-center space-x-4">
              <div>
                <p className="font-medium">{post.author_id}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{post.message_created_at}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={post.is_published} id="airplane-mode" className="border-2 border-gray-300 dark:border-gray-600 [&>span]:bg-white [&>span]:shadow-md" />
              <Label htmlFor="airplane-mode">Publish?</Label>
            </div>
          </Card>
        ))}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto p-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; 2025 My Tailwind Blog. All rights reserved.
      </footer>
    </div>
  );
}

export default Index;