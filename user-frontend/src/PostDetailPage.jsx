import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const PostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    console.log("Post ID:", id);
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

    try {
      const response = await fetch(`http://localhost:3000/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const createdComment = await response.json();
        setComments((prev) => [...prev, createdComment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (!post) return <p>Loading...</p>;

  return (

    <div className="p-4">

      <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg">
        🌶️ If this box is red, Tailwind is working!
      </div>


      <h1 className="text-2xl mb-2">{post.title}</h1>
      <p className="text-gray-600 mb-4">{post.content}</p>

      <div className="mb-4">
        <h2 className="text-xl mb-2">Comments</h2>
        {comments.map((comment) => (
          <div key={comment.comment_id} className="p-2 border-b">
            <p>{comment.comment_text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleCommentSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="border p-2 flex-grow"
          placeholder="Add a comment..."
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
          Submit
        </button>
      </form>
    </div>
  );
};

export default PostDetailPage;