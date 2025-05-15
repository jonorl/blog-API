import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Calendar,
    Trash2,
    Pencil,
    LogIn,
    LogOut,
    NotebookPen,
    Info,
} from "lucide-react";
import { Editor } from '@tinymce/tinymce-react';
import sanitizeHtml from 'sanitize-html';

const PostDetailPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState('');
    const [editPostText, setEditPostText] = useState('');
    const [editingTitle, setEditingTitle] = useState(false);
    const [editTitleText, setEditTitleText] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [bearerToken, setBearerToken] = useState('');
    const editorRef = useRef(null);
    const postTextRef = useRef({});
    const [textareaHeight, setTextareaHeight] = useState('auto');
    const [editingPostId, setEditingPostId] = useState(null);

    const apiKeyTinyMCE = import.meta.env.VITE_TINYMCE_API_KEY;

    document.documentElement.classList.add('dark');

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-UK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("authtoken");
        setCurrentUser(null);
        navigate("/");
    };

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

    // Fetch post and comments
    useEffect(() => {
        const fetchPostAndUsers = async () => {
            try {
                const headers = { Authorization: bearerToken };
                const postResponse = await fetch(`http://localhost:3000/api/v1/posts/${id}`, { headers });
                const commentsResponse = await fetch(`http://localhost:3000/api/v1/posts/${id}/comments`, { headers });

                if (!postResponse.ok || !commentsResponse.ok) {
                    throw new Error('Failed to fetch post or comments');
                }

                const postData = await postResponse.json();
                const commentsData = await commentsResponse.json();

                const post = postData.post;
                const comments = commentsData.showPostComments;

                const userIds = [
                    post.author_id,
                    ...comments.map((comment) => comment.user_id),
                ].filter((id, index, self) => id && self.indexOf(id) === index);

                const userPromises = userIds.map((id) =>
                    fetch(`http://localhost:3000/api/v1/users/${id}`, { headers }).then((res) => {
                        if (!res.ok) {
                            console.warn(`Failed to fetch user ${id}: ${res.status}`);
                            return { user: { user_id: id, first_name: null } };
                        }
                        return res.json();
                    })
                );

                const users = await Promise.all(userPromises);
                const userMap = users.reduce((map, user) => {
                    map[user.user.user_id] = user.user.first_name;
                    return map;
                }, {});
                const userMapLastName = users.reduce((map, user) => {
                    map[user.user.user_id] = user.user.last_name;
                    return map;
                }, {});

                const updatedPost = {
                    ...post,
                    authorFirstName: userMap[post.author_id],
                    authorLastName: userMapLastName[post.author_id],
                };

                const updatedComments = comments.map((comment) => ({
                    ...comment,
                    authorFirstName: userMap[comment.user_id],
                    authorLastName: userMapLastName[comment.user_id],
                }));

                setPost(updatedPost);
                setComments(updatedComments);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (bearerToken) fetchPostAndUsers();
    }, [id, bearerToken]);

    // Handle make admin
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

    // Handle title edit
    const handleEditTitle = () => {
        setEditingTitle(true);
        setEditTitleText(post.title);
    };

    // Handle save title
    const handleSaveTitle = async () => {
        if (editTitleText.trim() === '') return;
        setIsSubmitting(true);
        try {
            const response = await fetch(`http://localhost:3000/api/v1/posts/${post.post_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': bearerToken
                },
                body: JSON.stringify({
                    title: editTitleText,
                    text: post.post_text
                }),
            });

            if (response.ok) {
                const updatedPost = await response.json();
                setPost((prevPost) => ({
                    ...prevPost,
                    title: updatedPost.update.title
                }));
                setEditingTitle(false);
            } else {
                console.error('Error updating title:', response.status);
            }
        } catch (error) {
            console.error('Error updating title:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle cancel title edit
    const handleCancelTitleEdit = () => {
        setEditingTitle(false);
        setEditTitleText('');
    };

    const handleEditPost = (post) => {
        setEditingPostId(post.post_id);
        setEditPostText(post.post_text);
        const postTextElement = postTextRef.current[post.post_id];
        if (postTextElement) {
            const height = postTextElement.offsetHeight;
            setTextareaHeight(`${height + 150}px`);
        }
    };

    const handleEdit = (comment) => {
        setEditingCommentId(comment.comment_id);
        setEditText(comment.comment_text);
    };

    const handleSavePostEdit = async (postId) => {
        if (!editorRef.current) return;
        const content = editorRef.current.getContent();
        if (content.trim() === '') return;
        setIsSubmitting(true);
        try {
            const response = await fetch(`http://localhost:3000/api/v1/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': bearerToken
                },
                body: JSON.stringify({
                    title: post.title,
                    text: content
                }),
            });

            if (response.ok) {
                const updatedPost = await response.json();
                setPost((prevPost) => ({
                    ...prevPost,
                    post_text: updatedPost.update.post_text
                }));
                setEditingPostId(null);
                setEditPostText('');
            } else {
                console.error('Error updating post:', response.status);
            }
        } catch (error) {
            console.error('Error updating post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveEdit = async (commentId) => {
        if (editText.trim() === '') return;
        setIsSubmitting(true);
        try {
            const response = await fetch(`http://localhost:3000/api/v1/comments/${commentId}`, {
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
                const updatedComment = await response.json();
                setComments((prevComments) =>
                    prevComments.map((comment) =>
                        comment.comment_id === commentId ? { ...comment, comment_text: updatedComment.updateComment.comment_text } : comment
                    )
                );
                setEditingCommentId(null);
                setEditText('');
            } else {
                console.error('Error updating comment:', response.status);
            }
        } catch (error) {
            console.error('Error updating comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditText('');
    };

    const handleCancelPostEdit = () => {
        setEditingPostId(null);
        setEditPostText('');
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/v1/posts/${postId}`, {
                    method: 'DELETE',
                    headers: {
                        'authorization': bearerToken
                    },
                });

                if (response.ok) {
                    navigate("/");
                } else {
                    console.error('Error deleting post:', response.status);
                }
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    const handleDelete = async (commentId) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/v1/comments/${commentId}`, {
                    method: 'DELETE',
                    headers: {
                        'authorization': bearerToken
                    },
                });

                if (response.ok) {
                    setComments((prevComments) =>
                        prevComments.filter((comment) => comment.comment_id !== commentId)
                    );
                } else {
                    console.error('Error deleting comment:', response.status);
                }
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }
    };

    if (!post && currentUser) return <p>Loading...</p>;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="max-w-5xl mx-auto p-6 flex justify-between items-center border-b border-border">
                <a href={`/`} className="text-3xl font-bold">Blogger Access</a>
                <nav className="hidden md:flex space-x-8">
                    {currentUser ? (
                        <>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={isAdmin}
                                    onCheckedChange={handleMakeAdmin}
                                    id={`admin-mode-${currentUser.user_id}`}
                                    className="border-2 border-border [&>span]:bg-background [&>span]:shadow-md"
                                />
                                <Label htmlFor={`admin-mode-${currentUser.user_id}`}>Make Admin?</Label>
                            </div>
                            <a href="/new" className="text-slate-300 hover:text-blue-400 flex items-center">
                                <span>New Post&nbsp; </span>
                                <NotebookPen className="h-4 w-4 mr-1" />
                            </a>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleLogout();
                                }}
                                className="text-slate-300 hover:text-blue-400 flex items-center"
                            >
                                <span>Logout&nbsp; </span>
                                <LogOut className="h-4 w-4 mr-1" />
                            </a>
                        </>
                    ) : (
                        <a href="/login" className="text-slate-300 hover:text-blue-400 flex items-center">
                            <span>Login&nbsp; </span>
                            <LogIn className="h-4 w-4 mr-1" />
                        </a>
                    )}
                </nav>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
                {!currentUser && (
                    <Card className="p-6 text-center mb-8">
                        <div className="flex items-center justify-center space-x-2">
                            <Info className="h-5 w-5" />
                            <p className="font-medium">You must be logged in to view and manage blog posts</p>
                        </div>
                        <div className="mt-4">
                            <a href="/login" className="bg-white text-black py-2 px-4 rounded-md transition-colors">
                                Log In Now
                            </a>
                        </div>
                    </Card>
                )}

                {currentUser && currentUser.roles !== "blogger" && (
                    <Card className="p-6 text-center mb-8">
                        <div className="flex items-center justify-center space-x-2">
                            <Info className="h-5 w-5" />
                            <p className="font-medium">Become a blogger to edit messages and add new posts</p>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
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

                {currentUser && (
                    <div className="flex flex-col">
                        <Card className="bg-card text-card-foreground flex flex-col gap-6 border shadow-sm p-6 hover:shadow-lg transition-shadow rounded-lg">
                            <CardHeader className="pb-0">
                                {editingTitle ? (
                                    <div className="flex flex-col space-y-2">
                                        <Input
                                            value={editTitleText}
                                            onChange={(e) => setEditTitleText(e.target.value)}
                                            className="text-2xl font-bold bg-slate-700 border-slate-600 text-white"
                                            placeholder="Enter post title"
                                        />
                                        <div className="flex justify-end space-x-2 mt-2">
                                            <Button size="sm" onClick={handleSaveTitle} disabled={isSubmitting || !editTitleText.trim()}>
                                                Save
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={handleCancelTitleEdit} disabled={isSubmitting}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <CardTitle className="text-3xl font-bold text-white text-center">
                                            {post.title}
                                        </CardTitle>
                                        {post.author_id === currentUser.user_id && currentUser.roles === "blogger" && (
                                            <button
                                                onClick={handleEditTitle}
                                                className="ml-2 text-muted-foreground hover:text-primary focus:outline-none"
                                                aria-label="Edit title"
                                            >
                                                <Pencil className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                )}
                                <CardDescription className="text-slate-400 flex items-center justify-center gap-4 mt-2 flex-wrap">
                                    <div className="flex items-center">
                                        <span>{post.authorFirstName + " " + post.authorLastName} </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        <span>{formatDate(post.message_created_at)}</span>
                                    </div>
                                </CardDescription>
                            </CardHeader>
                            {editingPostId === post.post_id ? (
                                <div className="flex flex-col space-y-2">
                                    <Editor
                                        apiKey={apiKeyTinyMCE}
                                        onInit={(evt, editor) => (editorRef.current = editor)}
                                        value={editPostText}
                                        onEditorChange={(newValue) => setEditPostText(newValue)}
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
                                                    border: 1px solid '#4b5563';
                                                    border-radius: 4px;
                                                    padding: 8px;
                                                }
                                            `,
                                            skin: 'oxide-dark',
                                            content_css: 'dark',
                                        }}
                                    />
                                    <div className="flex justify-end space-x-2 mt-2">
                                        <Button size="sm" onClick={() => handleSavePostEdit(post.post_id)} disabled={isSubmitting}>
                                            Save
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleCancelPostEdit} disabled={isSubmitting}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="mb-4 text-muted-foreground"
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.post_text) }}
                                    ref={(el) => (postTextRef.current[post.post_id] = el)}
                                />
                            )}
                            {post.author_id === currentUser.user_id && currentUser.roles === "blogger" && (
                                <div className="flex flex-row items-center justify-start space-x-5">
                                    <button
                                        onClick={() => handleEditPost(post)}
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
                        </Card>

                        <div className="mb-8 mt-6 w-full">
                            <h2 className="text-2xl font-bold mb-6 text-white text-center">Comments ({comments.length})</h2>
                            <div className="space-y-6 mb-8">
                                {comments.map((comment) => (
                                    <Card key={comment.comment_id} className="bg-card text-card-foreground flex flex-col gap-6 border shadow-sm p-6 hover:shadow-lg transition-shadow rounded-lg">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start space-x-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-semibold text-white">{comment.authorFirstName} said:</h4>
                                                        <span className="text-sm text-slate-400">{formatDate(comment.comment_created_at)}</span>
                                                    </div>
                                                    {editingCommentId === comment.comment_id ? (
                                                        <div className="flex flex-col space-y-2">
                                                            <Textarea
                                                                value={editText}
                                                                onChange={(e) => setEditText(e.target.value)}
                                                                className="resize-none min-h-20 bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400"
                                                            />
                                                            <div className="flex justify-end space-x-2">
                                                                <Button size="sm" onClick={() => handleSaveEdit(comment.comment_id)} disabled={isSubmitting}>
                                                                    Save
                                                                </Button>
                                                                <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isSubmitting}>
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-slate-300 leading-relaxed">{comment.comment_text}</p>
                                                    )}
                                                </div>
                                                {editingCommentId !== comment.comment_id && currentUser.roles === "blogger" && (
                                                    <div className="flex flex-col space-y-2">
                                                        <button
                                                            onClick={() => handleEdit(comment)}
                                                            className="text-slate-400 hover:text-blue-500 focus:outline-none"
                                                            aria-label="Edit comment"
                                                        >
                                                            <Pencil className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(comment.comment_id)}
                                                            className="text-slate-400 hover:text-red-500 focus:outline-none"
                                                            aria-label="Delete comment"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="max-w-5xl mx-auto p-6 border-t border-border text-center text-sm text-muted-foreground">
                © 2025 Blogger CMS / Blog API. 8hqczgwx8@mozmail.com.
            </footer>
        </div>
    );
};

export default PostDetailPage;