import React from 'react';
import BottomNav from '../components/BottomNav';
import "../styles/admin/Community.css"

const Community = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center bg-[#0e0e0e] text-white px-4"
      style={{ paddingBottom: '6rem' }}
    >
      <h1 className="text-4xl font-bold mb-4">👥 Community</h1>
      <p className="text-lg text-gray-400 mb-2">We're cooking up something powerful... 🔥</p>
      <p className="text-md text-gray-500">Stay tuned — the Community feature is coming soon.</p>
      <BottomNav />
    </div>
  );

  /* 
  🔒 FULL COMMUNITY UI (TEMPORARILY DISABLED)

  import React, { useEffect, useState, useRef } from 'react';
  import axios from 'axios';
  import io from 'socket.io-client';
  import BottomNav from '../components/BottomNav';
  import { motion, AnimatePresence } from 'framer-motion';
  import postSound from '../assets/post.mp3';
  import { toast } from 'react-toastify';
  import EmojiPicker from 'emoji-picker-react';

  const socket = io('https://kilo-app-backend.onrender.com');

  const [posts, setPosts] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);
  const [tab, setTab] = useState('all');
  const [showEmoji, setShowEmoji] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const fileRef = useRef();
  const postRef = useRef();

  useEffect(() => {
    fetchPosts();
    fetchLeaders();

    socket.on('newPost', (newPost) => {
      postRef.current?.play();
      setPosts((prev) => [newPost, ...prev]);
    });

    socket.on('updatePost', (updated) => {
      setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    });

    socket.on('deletePost', (postId) => {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    });

    return () => {
      socket.off('newPost');
      socket.off('updatePost');
      socket.off('deletePost');
    };
  }, []);

  const fetchPosts = async () => {
    const res = await axios.get('https://kilo-app-backend.onrender.com/api/community');
    setPosts(res.data);
  };

  const fetchLeaders = async () => {
    const res = await axios.get('https://kilo-app-backend.onrender.com/api/community/leaderboard');
    setLeaders(res.data);
  };

  const submitPost = async () => {
    if (!text.trim() && !media) return;

    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('content', text);
    if (media) formData.append('media', media);

    await axios.post('https://kilo-app-backend.onrender.com/api/community', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setText('');
    setMedia(null);
    setShowEmoji(false);
  };

  const react = async (id, emoji) => {
    await axios.post(\`https://kilo-app-backend.onrender.com/api/community/\${id}/reaction\`, { emoji });
  };

  const comment = async (id, commentText) => {
    if (!commentText) return;
    await axios.post(\`https://kilo-app-backend.onrender.com/api/community/\${id}/comment\`, {
      username: user.username,
      avatar: user.avatar || '',
      text: commentText,
    });
  };

  const deletePost = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
      await axios.delete(\`https://kilo-app-backend.onrender.com/api/community/\${id}\`, {
        headers: {
          Authorization: \`Bearer \${localStorage.getItem("token")}\`,
        },
      });
      setPosts(posts.filter((p) => p._id !== id));
      toast.success("Post deleted!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const filtered = posts.filter((post) => {
    if (tab === 'media') return post.media;
    if (tab === 'mine') return post.username === user.username;
    return true;
  });

  // ... original return block with JSX UI omitted for brevity
  */
};

export default Community;