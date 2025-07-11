import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import BottomNav from '../components/BottomNav';
import { FiImage, FiSmile, FiSend, FiSearch, FiUser } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';
import { io } from 'socket.io-client';
import '../styles/Community.css';

const BASE_URL = import.meta.env.VITE_API_URL;

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fileRef = useRef();
  const loaderRef = useRef();
  const socket = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchMore = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/community?page=${page}&limit=10`);
      if (res.data.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => [...prev, ...res.data]);
        setPage(prev => prev + 1);
      }
    } catch {
      toast.error('Failed to load more posts');
    }
  };

  useEffect(() => {
    socket.current = io(BASE_URL);

    socket.current.on('newPost', newPost => {
      setPosts(prev => [newPost, ...prev]);
    });

    socket.current.on('reactionUpdate', updatedPost => {
      setPosts(prev =>
        prev.map(p => (p._id === updatedPost._id ? updatedPost : p))
      );
    });

    socket.current.on('newComment', ({ postId, comment }) => {
      setPosts(prev =>
        prev.map(p => {
          if (p._id === postId) {
            return { ...p, comments: [...p.comments, comment] };
          }
          return p;
        })
      );
    });

    return () => socket.current.disconnect();
  }, []);

  useEffect(() => {
    fetchMore();
  }, []);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) fetchMore();
    });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  const handleSubmit = async () => {
    if (!text && !media) return;
    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('avatar', user.avatar || '');
    formData.append('content', text);
    if (media) formData.append('media', media);

    try {
      await axios.post(`${BASE_URL}/api/community`, formData);
      setText('');
      setMedia(null);
      setShowEmoji(false);
      toast.success('Posted!');
    } catch (err) {
      toast.error('Post failed!');
    }
  };

  const handleReaction = async (id, emoji) => {
    try {
      await axios.post(`${BASE_URL}/api/community/${id}/reaction`, { emoji });
    } catch {
      toast.error('Failed to react');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesQuery = post.content.toLowerCase().includes(query.toLowerCase());
    if (tab === 'mine') return post.username === user.username && matchesQuery;
    return matchesQuery;
  });

  return (
    <div className="community-container">
      <h2 className="gradient-title">👥 Community</h2>

      <div className="tab-bar">
        <button onClick={() => setTab('all')} className={tab === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => setTab('mine')} className={tab === 'mine' ? 'active' : ''}><FiUser /> My Posts</button>
      </div>

      <input
        type="text"
        placeholder="Search posts..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="search-input"
      />

      <div className="post-input-box">
        <textarea
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {media && (
          <div className="preview-media">
            <img src={URL.createObjectURL(media)} alt="preview" />
          </div>
        )}
        <div className="actions-row">
          <FiImage onClick={() => fileRef.current.click()} />
          <FiSmile onClick={() => setShowEmoji(!showEmoji)} />
          <button className="neon-btn" onClick={handleSubmit}>
            <FiSend /> Post
          </button>
        </div>
        {showEmoji && (
          <EmojiPicker
            onEmojiClick={(e) => setText(prev => prev + e.emoji)}
            theme="dark"
          />
        )}
        <input
          type="file"
          hidden
          ref={fileRef}
          accept="image/*,video/*,audio/*"
          onChange={(e) => setMedia(e.target.files[0])}
        />
      </div>

      <div className="feed">
        {filteredPosts.map(post => (
          <div className="post-card" key={post._id}>
            <div className="post-header">
              <img
                src={
                  post.avatar?.startsWith('http')
                    ? post.avatar
                    : `${BASE_URL}${post.avatar || '/uploads/default.png'}`
                }
                onError={(e) => {
                  e.target.src = `${BASE_URL}/uploads/default.png`;
                }}
                alt="avatar"
                style={{ width: 32, height: 32, borderRadius: '50%' }}
              />
              <span>{post.username}</span>
            </div>
            <p className="post-content">{post.content}</p>
            {post.media && (
              <div className="media-preview">
                {post.mediaType === 'video' ? (
                  <video controls src={`${BASE_URL}${post.media}`} />
                ) : post.mediaType === 'audio' ? (
                  <audio controls src={`${BASE_URL}${post.media}`} />
                ) : (
                  <img src={`${BASE_URL}${post.media}`} alt="media" />
                )}
              </div>
            )}
            <div className="post-reactions">
              <button onClick={() => handleReaction(post._id, 'like')}>👍 {post.reactions?.like || 0}</button>
              <button onClick={() => handleReaction(post._id, 'fire')}>🔥 {post.reactions?.fire || 0}</button>
              <button onClick={() => handleReaction(post._id, 'heart')}>❤️ {post.reactions?.heart || 0}</button>
            </div>
          </div>
        ))}
        {hasMore && <div ref={loaderRef} style={{ height: 60 }} />}
      </div>

      <BottomNav />
    </div>
  );
};

export default Community;