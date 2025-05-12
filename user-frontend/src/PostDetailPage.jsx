import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// shadcn/ui components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Home,
  User,
  MessageSquare,
  Calendar,
} from "lucide-react";

const PostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const posts = await fetch(`http://localhost:3000/api/v1/posts/${id}`);
        const comments = await fetch(`http://localhost:3000/api/v1/posts/${id}/comments`)
        if (posts.ok) {
          const postsData = await posts.json();
          const commentsData = await comments.json();
          setPost(postsData.post);
          setComments(commentsData.showPostComments);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:3000/api/v1/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include user
          'user': '103ab63f-1506-4a3b-9a2a-635b16b1d828',
          // include authorization as well
          'authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTAzYWI2M2YtMTUwNi00YTNiLTlhMmEtNjM1YjE2YjFkODI4IiwiZmlyc3RfbmFtZSI6IkpvbmFDdWF0cm8iLCJsYXN0X25hbWUiOiJPcmxvQ3VhdHJvIiwiZW1haWwiOiJqb240QG9ybG8uY29tIiwicGFzc3dvcmRfaGFzaCI6InBhc3N3b3JkNCEiLCJjcmVhdGVkX2F0IjoiMjAyNS0wNS0wOVQwODo0Mzo1NS44NzJaIiwidXBkYXRlZF9hdCI6IjIwMjUtMDUtMDlUMDg6NDM6NTUuODcyWiIsInJvbGVzIjoidXNlciIsImlhdCI6MTc0Njc4MDIzNSwiZXhwIjoxNzQ3Mzg1MDM1fQ.HUoBhzxrVHPC2vTdEoFaTkMsTl6lbSCcqwWSCDM0dLw'
        },
        body: JSON.stringify({
          text: newComment,
        })
      });

      if (response.ok) {
        const createdComment = await response.json();
        const constcreateCommentData = createdComment.createComment
        setComments((prev) => [...prev, constcreateCommentData]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  if (!post) return <p>Loading...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-200">
      {/* Navigation Header */}
      <header className="sticky top-0 z-10 bg-slate-800 shadow-sm">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <span className="ml-2 text-xl font-bold text-white">Blog API Project</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-slate-300 hover:text-blue-400 flex items-center">
                <Home className="h-4 w-4 mr-1" />
                <span>Home</span>
              </a>
              <a href="#" className="text-slate-300 hover:text-blue-400 flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>About</span>
              </a>
              <a href="#" className="text-slate-300 hover:text-blue-400 flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>Contact</span>
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-300 hover:text-blue-400"
                aria-label="Toggle Mobile Menu"
              >
                {isMenuOpen ? (
                  // Replace with an X icon if you have one, or keep it like this for now
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>

                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 shadow-md">
          <div className="container mx-auto px-4 py-2 max-w-4xl">
            <nav className="flex flex-col space-y-3">
              <a href="#" className="text-slate-300 hover:text-blue-400 py-2 flex items-center">
                <Home className="h-4 w-4 mr-2" />
                <span>Home</span>
              </a>
              <a href="#" className="text-slate-300 hover:text-blue-400 py-2 flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>About</span>
              </a>
              <a href="#" className="text-slate-300 hover:text-blue-400 py-2 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span>Contact</span>
              </a>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col ">
          {/* Blog Post */}
          <Card className="mb-8 w-full bg-slate-800 border-slate-700 text-slate-200 shadow-lg">
            <CardHeader className="pb-0">
              <CardTitle className="text-3xl font-bold text-white text-center">
                {post.title}
              </CardTitle>
              <CardDescription className="text-slate-400 flex items-center justify-center gap-4 mt-2 flex-wrap">
                <div className="flex items-center">
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{post.message_created_at}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">

              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed text-lg">
                  {post.post_text}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <div className="mb-8 w-full ">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Comments ({comments.length})</h2> {/* Increased mb-4 to mb-6 */}
            <div className="space-y-6 mb-8"> {/* Increased space-y-4 to space-y-6 and mb-6 to mb-8 */}
              {comments.map((comment) => (
                <Card key={comment.comment_id} className="bg-slate-800 border-slate-700 text-slate-200 shadow-md"> {/* Added shadow-md */}
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-6"> {/* Increased space-x-4 to space-x-6 */}
                      {/* You can add a user avatar here
                      <div className="w-10 h-10 rounded-full bg-gray-500"></div>
                      */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2"> {/* Increased mb-1 to mb-2 */}
                          <h4 className="font-semibold text-white">{comment.author}</h4>
                          <span className="text-sm text-slate-400">{comment.date}</span> {/* Decreased text size */}
                        </div>
                        <p className="text-slate-300 leading-relaxed">{comment.comment_text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comment Form */}
            <Card className="bg-slate-800 border-slate-700 text-slate-200 shadow-lg"> {/* Added shadow-lg */}
              <CardHeader>
                <CardTitle className="text-xl text-center text-white">Leave a Comment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="resize-none min-h-36 bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 shadow-inner mt-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center mb-4">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <span className="ml-2 text-xl font-bold text-white">Blog API project</span>
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
export default PostDetailPage;
