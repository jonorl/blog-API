import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogIn, LogOut, Rss, UserRoundPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

        const response = await fetch(`https://bold-corabella-jonorl-a167c351.koyeb.app/api/v1/usersverified/`, {
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
        const response = await fetch(`https://bold-corabella-jonorl-a167c351.koyeb.app/api/v1/posts`);

        if (response.ok) {
          const data = await response.json();
          const initialPosts = data.getPosts;

          const postsWithDetails = await Promise.all(
            initialPosts.map(async (post) => {
              const commentsResponse = await fetch(
                `https://bold-corabella-jonorl-a167c351.koyeb.app/api/v1/posts/${post.post_id}/comments`
              );
              const userResponse = await fetch(
                `https://bold-corabella-jonorl-a167c351.koyeb.app/api/v1/users/${post.author_id}`
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

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authtoken");
    setCurrentUser(null);
    navigate("/"); 
  };

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

                  <a href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }} className="text-slate-300 hover:text-blue-400 flex items-center">
                    <span>Logout&nbsp; </span>
                    <LogOut className="h-4 w-4 mr-1" />
                  </a>
                </>
              ) : (
                <>
                  <a href="/signup" className="text-slate-300 hover:text-blue-400 flex items-center">
                    <span>Sign up </span>
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
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-white text-center mb-8">All Posts</h1>
          <div className="space-y-6">
            {posts.filter((post) => post.is_published === true).map((post) => (
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
              © 2025 Blog API Project. 8hqczgwx8@mozmail.com
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;