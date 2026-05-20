// React import
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// ShadCN/UI components
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Editor } from '@tinymce/tinymce-react';

// Icons
import { Trash2, Pencil, LogIn, LogOut, NotebookPen, Info, } from "lucide-react";
import { FaGithub } from "react-icons/fa";

// Library to sanitize "dangerouslySetInnerHTML"
import sanitizeHtml from 'sanitize-html';

//Helper function to format time
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-UK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// .env references
const apiKeyTinyMCE = import.meta.env.VITE_TINYMCE_API_KEY;
const host = import.meta.env.VITE_HOST;

// Loading spinners

const Spinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="h-10 w-10 border-4 border-[#1f2937] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const InlineSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="h-4 w-4 border-2 border-[#1f2937] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Index = () => {

  // Hooks 
  const [posts, setPosts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingTitlePostId, setEditingTitlePostId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [textareaHeight, setTextareaHeight] = useState('auto');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bearerToken, setBearerToken] = useState('');
  const [postsLoading, setPostsLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const editorRef = useRef(null);
  const postTextRef = useRef({});
  const postTitleRef = useRef({});

  // Toggle dark mode
  document.documentElement.classList.add('dark');

  // to redirect
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("authtoken");
        if (!token) {
          console.warn("No auth token found");
          return;
        }
        setBearerToken(token);
        const response = await fetch(`${host}api/v1/usersverified/`, {
          method: 'GET',
          headers: { authorization: token },
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

  // Fetch Posts
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

  // Toggle user to admin
  useEffect(() => {
    if (currentUser) {
      setIsAdmin(currentUser.roles !== "user");
    }
  }, [currentUser]);

  const handleEdit = (post) => {
    setEditingPostId(post.post_id);
    setEditText(post.post_text);
    const postTextElement = postTextRef.current[post.post_id];
    if (postTextElement) {
      const height = postTextElement.offsetHeight;
      setTextareaHeight(`${height + 150}px`);
    }
  };

  const handleSaveEdit = async (postId) => {
    if (!editorRef.current) return;

    const content = editorRef.current.getContent();
    if (content.trim() === '') return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${host}api/v1/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': bearerToken
        },
        body: JSON.stringify({
          title: posts.find(post => post.post_id === postId).title,
          text: content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedPost = data.update;
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.post_id === postId ? { ...post, post_text: updatedPost.post_text } : post
          )
        );
        setEditingPostId(null);
        setEditText('');
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
  };

  const handleEditTitle = (post) => {
    setEditingTitlePostId(post.post_id);
    setEditTitle(post.title);
    const postTitleElement = postTitleRef.current[post.post_id];
    if (postTitleElement) {
      postTitleElement.focus();
    }
  };

  const handleSaveEditTitle = async (postId) => {
    if (editTitle.trim() === '') return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${host}api/v1/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': bearerToken
        },
        body: JSON.stringify({
          title: editTitle,
          text: posts.find(post => post.post_id === postId).post_text
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedPost = data.update;
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.post_id === postId ? { ...post, title: updatedPost.title } : post
          )
        );
        setEditingTitlePostId(null);
        setEditTitle('');
      } else {
        console.error('Error updating post title:', response.status);
      }
    } catch (error) {
      console.error('Error updating post title:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEditTitle = () => {
    setEditingTitlePostId(null);
    setEditTitle('');
  };

  const handleMakeAdmin = async () => {
    try {
      const newIsAdmin = !isAdmin;
      const newRole = newIsAdmin ? "blogger" : "user";

      const response = await fetch(`${host}api/v1/users/${currentUser.user_id}/`, {
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

  const handlePublish = async (post) => {
    const newPublishStatus = !post.is_published;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${host}api/v1/posts/${post.post_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': bearerToken
        },
        body: JSON.stringify({
          title: post.title,
          text: post.post_text,
          is_published: newPublishStatus
        })
      });

      if (response.ok) {
        const data = await response.json();
        const updatedPost = data.update;
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.post_id === post.post_id ? { ...p, is_published: updatedPost.is_published } : p
          )
        );
      } else {
        console.error('Error updating publish status:', response.status);
      }
    } catch (error) {
      console.error('Error updating publish status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authtoken");
    navigate("/");
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`${host}api/v1/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'authorization': bearerToken
          },
        });

        if (response.ok) {
          navigate("/");
          window.location.reload();
        } else {
          console.error('Error deleting comment:', response.status);
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="max-w-5xl mx-auto p-6 flex justify-between items-center border-b border-border">

        <Link to="/" className="ml-2 text-xl font-bold text-white hidden md:inline sm:hidden">Blogger Access</Link>
        <Link to="/" className="ml-2 text-xl font-bold text-white  lg:hidden md:hidden">BA</Link>

        <nav className="flex space-x-2 text-xs sm:text-sm md:space-x-8 md:text-base px-2 sm:px-4">
          {userLoading ? (
            <InlineSpinner />
          ) : currentUser ? (
            <>
              <div className="flex items-center sm:space-x-2">
                <Label className={"text-center text-sm sm:text-base "} htmlFor={`publish-mode-${currentUser.user_id}`}>Make Admin?</Label>
                <Switch
                  checked={isAdmin}
                  onCheckedChange={handleMakeAdmin}
                  id={`publish-mode-${currentUser.user_id}`}
                  className="mr-2 border-2 border-border [&>span]:bg-background [&>span]:shadow-md"
                />
              </div>
              <Link to="/new" className="text-slate-300 hover:text-blue-400 flex items-center">
                <span>New Post&nbsp; </span>
                <NotebookPen className="h-4 w-4 mr-1" />
              </Link>
              <Link to="/logout"
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
              <Link to="/login" className="flex items-center">
                <span>Login&nbsp;</span>
                <LogIn className="h-4 w-4 mr-1" />
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">

        {postsLoading ? (
          <Spinner />
        ) : !currentUser && (
          <Card className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Info className="h-5 w-5" />
              <p className="font-medium">You must be logged in to view and manage blog posts</p>
            </div>
            <div className="mt-4">
              <Link to="/login" className="bg-white text-black py-2 px-4 rounded-md transition-colors">
                Log In Now
              </Link>
            </div>
          </Card>
        )}

        {currentUser && currentUser.roles !== "blogger" && (
          <Card className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Info className="h-5 w-5" />
              <p className="font-medium">Become a blogger to edit messages and add new posts</p>
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

        {currentUser && currentUser.roles === "blogger" ? (
          posts.map((post) => (
            <Card key={post.post_id} className="p-6 hover:shadow-lg transition-shadow rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {editingTitlePostId === post.post_id ? (
                  <div className="flex w-full items-center space-x-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="bg-card border-border text-foreground placeholder:text-muted-foreground text-2xl font-semibold"
                      ref={(el) => (postTitleRef.current[post.post_id] = el)}
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEditTitle(post.post_id)}
                        disabled={isSubmitting}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEditTitle}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link 
                      to={`/posts/${post.post_id}`}
                      className="text-2xl font-semibold hover:underline"
                      ref={(el) => (postTitleRef.current[post.post_id] = el)}
                    >
                      {post.title}
                    </Link>

                    {post.author_id === currentUser.user_id && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditTitle(post)}
                          className="text-muted-foreground hover:text-primary focus:outline-none"
                          aria-label="Edit title"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {editingPostId === post.post_id ? (
                <div className="flex flex-col space-y-2">
                  <Editor
                    apiKey={apiKeyTinyMCE}
                    onInit={(evt, editor) => (editorRef.current = editor)}
                    value={editText}
                    onEditorChange={(newValue) => setEditText(newValue)}
                    init={{
                      menubar: false,
                      height: textareaHeight,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'paste', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                      content_style: `
                        body {
                          background: '#1f2937'};
                          color: '#e5e7eb'};
                          font-family: Inter, sans-serif;
                          font-size: 14px;
                          border: 1px solid'#4b5563'};
                          border-radius: 4px;
                          padding: 8px;
                        }
                      `,
                      skin: 'oxide-dark',
                      content_css: 'dark',
                    }}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <Button size="sm" onClick={() => handleSaveEdit(post.post_id)} disabled={isSubmitting}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className=" text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.post_text) }}
                  ref={(el) => (postTextRef.current[post.post_id] = el)}
                />
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
                    onClick={() => handleDeletePost(post.post_id)}
                    className="text-muted-foreground hover:text-destructive focus:outline-none"
                    aria-label="Delete post"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
              <Separator className="my-1" />
              <div className="flex items-center text-slate-400">
                <span>{post.commentsCount || 0} Comments</span>
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-medium">{post.authorFirstName} {post.authorLastName}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(post.message_created_at)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">


                <Switch
                  checked={post.is_published}
                  onCheckedChange={() => handlePublish(post)}
                  id={`publish-mode-${post.post_id}`}
                  className="border-2 border-border [&>span]:bg-background [&>span]:shadow-md"
                />
                <Label htmlFor={`publish-mode-${post.post_id}`}>Publish?</Label>
              </div>
            </Card>
          ))
        ) : (postsLoading ? (
          <Spinner />
        ) :
          currentUser && currentUser.roles !== "blogger" ? null : (
            <Card className="p-6 text-center text-muted-foreground">
              <p>Blog posts will appear here after you log in</p>
            </Card>
          )
        )}
      </main>

      <footer
        className="text-center mt-8  mb-8 text-sm text-gray-600"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <span className="text-gray-400">
          © {new Date().getFullYear()}
        </span>
        <a
          href="https://jonathan-orlowski.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-yellow-400 transition-colors"
        >
          Jonathan Orlowski
        </a>
        <a
          href="https://github.com/jonorl/fugazzeta-frontend"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white/80"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <FaGithub aria-label="GitHub" />
        </a>
      </footer>
    </div>
  );
};

export default Index;