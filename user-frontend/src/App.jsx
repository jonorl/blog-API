import React, { useEffect, useState } from 'react';
import { BookOpen, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [posts, setPosts] = useState([]);

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-white text-center mb-8">All Posts</h1>
          <div className="space-y-6">
            {posts.map((post) => (
              <Card
                key={post.post_id}
                className="bg-slate-800 border-slate-700 text-slate-200 shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardHeader className="pb-0">
                  <CardTitle className="text-2xl font-semibold text-white">
                    <a
                      href={`/posts/${post.post_id}`}
                      className="hover:text-blue-400 transition-colors"
                    >
                      {post.title}
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center text-slate-400">
                    <span>Author: {post.authorFirstName} {post.authorLastName}</span>
                  </div>
                </CardContent>
                <CardContent className="pt-4">
                  <div className="flex items-center text-slate-400">
                    <span>{post.commentsCount || 0} Comments</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
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
              © 2025 Blog API Project. jonorl@gmail.com
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;