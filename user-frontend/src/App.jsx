// React import
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// ShadCN/UI components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Icons
import { BookOpen, LogIn, LogOut, Rss, UserRoundPlus } from 'lucide-react';
import { FaGithub } from "react-icons/fa";

// .env references
const host = import.meta.env.VITE_HOST;
const bloggersHost = import.meta.env.VITE_BLOGGERS_HOST

// Loading spinners
const Spinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const InlineSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Index = () => {

  // Hooks 
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  // to redirect
  const navigate = useNavigate();

  // Fetch user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("authtoken");
        if (!token) {
          console.warn("No auth token found");
          return;
        }

        const response = await fetch(`${host}api/v1/usersverified/`, {
          headers: { Authorization: token },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch current user");
        }

        const userData = await response.json();
        setCurrentUser(userData.user);
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        setUserLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${host}api/v1/posts`);

        if (response.ok) {
          const data = await response.json();
          const initialPosts = data.getPosts;

          const postsWithDetails = await Promise.all(
            initialPosts.map(async (post) => {
              const commentsResponse = await fetch(
                `${host}api/v1/posts/${post.post_id}/comments`
              );
              const userResponse = await fetch(
                `${host}api/v1/users/${post.author_id}`
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
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
  }, []);

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
              <Link to="/" className="text-slate-300 hover:text-blue-400 flex items-center">
                <BookOpen className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-xl font-bold text-white hidden md:inline">
                  Blog API Project
                </span>
              </Link>

            </div>
            <nav className="flex space-x-2 text-xs sm:text-sm md:space-x-8 md:text-base px-2 sm:px-4">
              {userLoading ? (
                <InlineSpinner />
              ) : currentUser ? (
                <>
                  <span>Hello {currentUser.first_name}&nbsp; </span>

                  <Link to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }} className="text-slate-300 hover:text-blue-400 flex items-center">
                    <span>Logout&nbsp; </span>
                    <LogOut className="h-4 w-4 mr-1" />
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" className="text-slate-300 hover:text-blue-400 flex items-center">
                    <span>Sign up </span>
                    <UserRoundPlus className="h-4 w-4 mr-1" />
                  </Link>
                  <Link to="/login" className="text-slate-300 hover:text-blue-400 flex items-center">
                    <span>Login&nbsp; </span>
                    <LogIn className="h-4 w-4 mr-1" />
                  </Link>
                </>
              )}

              <Link to={`${bloggersHost}`} className="text-slate-300 hover:text-blue-400 flex items-center">
                <span>Blogger CMS access&nbsp;</span>
                <Rss className="h-4 w-4 mr-1" />
              </Link>
            </nav>

          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-white text-center mb-8">All Posts</h1>

          {postsLoading ? (
            <Spinner />
          ) : (
            <div className="space-y-6">
              {posts.filter((post) => post.is_published === true).map((post) => (
                <Card
                  key={post.post_id}
                  className="bg-slate-800 border-slate-700 text-slate-200 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardHeader className="pb-0">
                    <CardTitle className="text-2xl font-semibold text-white">
                      <Link
                        to={`/posts/${post.post_id}`}
                        className="hover:text-blue-400 transition-colors"
                      >
                        {post.title}
                      </Link>
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
          )}
        </div>
      </main>


      {/* Footer */}
      <footer
        className="text-center mt-8 text-sm text-gray-600 mb-8"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <span className="text-gray-400">
          © {new Date().getFullYear()}
        </span>
        <Link
          to="https://jonathan-orlowski.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-yellow-400 transition-colors"
        >
          Jonathan Orlowski
        </Link>
        <Link
          to="https://github.com/jonorl/fugazzeta-frontend"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white/80"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <FaGithub aria-label="GitHub" />
        </Link>
      </footer>
    </div>
  );
};

export default Index;