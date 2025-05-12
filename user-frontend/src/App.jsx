import React, { useEffect, useState } from 'react';

const Index = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/posts`);

        if (response.ok) {
          const data = await response.json();
          const posts = data.getPosts

          posts.forEach(async (post) => {
            const commentsRepsonse = await fetch(
              `http://localhost:3000/api/v1/posts/${post.post_id}/comments`
            );
            const commentsData = await commentsRepsonse.json();
            setPosts((prevPosts) => prevPosts.map((p) => p.post_id === post.post_id ? { ...p, commentsCount: commentsData.showPostComments.length } : 0))

          })
          setPosts(posts)
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4">
        {posts.map(post => (
          <div key={post.post_id} className="p-2 border-b">
            <h2 className="text-xl mb-1">{post.title}</h2>
            <h2 className="text-xl mb-1">{post.commentsCount || "should be there"}</h2>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Index;