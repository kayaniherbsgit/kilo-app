import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import BottomNav from '../components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import postSound from '../assets/post.mp3';
import EmojiPicker from 'emoji-picker-react';

const socket = io('${import.meta.env.VITE_API_URL}');

const Community = () => {
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

    return () => {
      socket.off('newPost');
      socket.off('updatePost');
    };
  }, []);

  const fetchPosts = async () => {
    const res = await axios.get('${import.meta.env.VITE_API_URL}/api/community');
    setPosts(res.data);
  };

  const fetchLeaders = async () => {
    const res = await axios.get('${import.meta.env.VITE_API_URL}/api/users/leaderboard');
    setLeaders(res.data);
  };

  const submitPost = async () => {
    if (!text.trim() && !media) return;

    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('content', text);
    if (media) formData.append('media', media);

    await axios.post('${import.meta.env.VITE_API_URL}/api/community', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setText('');
    setMedia(null);
    setShowEmoji(false);
  };

  const react = async (id, emoji) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/community/${id}/reaction`, { emoji });
  };

  const comment = async (id, commentText) => {
    if (!commentText) return;
    await axios.post(`${import.meta.env.VITE_API_URL}/api/community/${id}/comment`, {
      username: user.username,
      avatar: user.avatar || '',
      text: commentText,
    });
  };

  const filtered = posts.filter((post) => {
    if (tab === 'media') return post.media;
    if (tab === 'mine') return post.username === user.username;
    return true;
  });

  const preview =
    media && media.type?.startsWith('image') ? (
      <img src={URL.createObjectURL(media)} style={{ width: '100%', borderRadius: '10px', marginTop: '1rem' }} />
    ) : media?.type?.startsWith('video') ? (
      <video controls style={{ width: '100%', borderRadius: '10px', marginTop: '1rem' }} src={URL.createObjectURL(media)} />
    ) : media?.type?.startsWith('audio') ? (
      <audio controls style={{ width: '100%', marginTop: '1rem' }} src={URL.createObjectURL(media)} />
    ) : null;

  return (
    <div style={{ padding: '1.5rem', paddingBottom: '6rem', background: 'var(--bg)', color: 'var(--text)' }}>
      <audio ref={postRef} src={postSound} />
      <h2 style={{ fontSize: '1.6rem', fontWeight: '600', marginBottom: '1rem' }}>🌍 Community</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        {['all', 'media', 'mine'].map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              background: tab === key ? 'var(--accent)' : '#222',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.4rem 1rem',
              fontWeight: 500,
            }}
          >
            {key === 'all' ? 'All' : key === 'media' ? 'Media' : 'My Posts'}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="card" style={{ background: '#151515', padding: '1rem', borderRadius: '10px', marginBottom: '1rem' }}>
        <h4>🏆 Top Streaks</h4>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {leaders.map((u, i) => (
            <li key={u.username} style={{ marginTop: '0.3rem' }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔹'} <strong>{u.username}</strong> — {u.streak}-day streak
            </li>
          ))}
        </ul>
      </div>

      {/* Post Input */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          style={{
            width: '100%',
            padding: '0.8rem',
            borderRadius: '10px',
            background: '#1f1f1f',
            border: '1px solid #333',
            color: 'var(--text)',
          }}
        />
        {preview}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button onClick={() => fileRef.current.click()} style={{ padding: '0.4rem 1rem' }}>
            📎 Media
          </button>
          <button onClick={() => setShowEmoji(!showEmoji)} style={{ padding: '0.4rem 1rem' }}>
            😊 Emoji
          </button>
          <input
            type="file"
            ref={fileRef}
            accept="image/*,video/*,audio/*"
            onChange={(e) => setMedia(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </div>
      {showEmoji && (
  <div style={{ marginTop: '0.5rem' }}>
    <EmojiPicker
      theme="dark"
      onEmojiClick={(emojiData) => setText((prev) => prev + emojiData.emoji)}
    />
  </div>
)}
        <button
          onClick={submitPost}
          style={{
            marginTop: '0.5rem',
            background: 'var(--accent)',
            color: '#fff',
            padding: '0.5rem 1rem',
            border: 'none',
          }}
        >
          Post
        </button>
      </div>

      {/* Feed */}
      <AnimatePresence>
        {filtered.map((post) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card"
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#1c1c1c',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <img
                src={`${import.meta.env.VITE_API_URL}/uploads/${post.avatar || 'default.png'}`}
                alt="avatar"
                style={{ width: 40, height: 40, borderRadius: '50%' }}
              />
              <div>
                <p style={{ fontWeight: 'bold', margin: 0 }}>{post.username}</p>
                <p style={{ fontSize: '0.75rem', color: '#aaa' }}>{new Date(post.timestamp).toLocaleString()}</p>
              </div>
            </div>

            <p style={{ marginTop: '0.8rem' }}>{post.content}</p>

            {post.media && post.mediaType === 'image' && (
              <img
                src={`${import.meta.env.VITE_API_URL}/uploads/${post.media}`}
                alt="media"
                style={{ width: '100%', borderRadius: '10px', marginTop: '1rem' }}
              />
            )}
            {post.media && post.mediaType === 'video' && (
              <video controls style={{ width: '100%', borderRadius: '10px', marginTop: '1rem' }}>
                <source src={`${import.meta.env.VITE_API_URL}/uploads/${post.media}`} />
              </video>
            )}
            {post.media && post.mediaType === 'audio' && (
              <audio controls style={{ width: '100%', marginTop: '1rem' }}>
                <source src={`${import.meta.env.VITE_API_URL}/uploads/${post.media}`} />
              </audio>
            )}

            {/* Reactions */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              {['like', 'fire', 'heart'].map((emoji) => (
                <motion.button
                  whileTap={{ scale: 1.2 }}
                  key={emoji}
                  onClick={() => react(post._id, emoji)}
                  style={{
                    background: '#2a2a2a',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '20px',
                    padding: '0.3rem 0.9rem',
                    fontSize: '1rem',
                  }}
                >
                  {emoji === 'like' ? '👍' : emoji === 'fire' ? '🔥' : '❤️'} {post.reactions[emoji]}
                </motion.button>
              ))}
            </div>

            {/* Comments */}
            <div style={{ marginTop: '1rem' }}>
              <strong>💬 Comments</strong>
              {post.comments.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                    <img
                      src={`${import.meta.env.VITE_API_URL}/uploads/${c.avatar || 'default.png'}`}
                      alt="avatar"
                      style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <p style={{ fontSize: '0.85rem', margin: 0 }}>
                      <strong>{c.username}</strong>: {c.text}
                    </p>
                  </div>
                </motion.div>
              ))}
              <input
                placeholder="Add comment..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    comment(post._id, e.target.value);
                    e.target.value = '';
                  }
                }}
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  background: '#1f1f1f',
                  color: '#fff',
                }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default Community;
