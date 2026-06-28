import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '../../api/services';
import { useSocket } from '../../hooks/useSocket';
import useAuthStore from '../../store/authStore';

export default function ChatPage() {
  const { user } = useAuthStore();
  const { socket, joinConversation, leaveConversation, sendSocketMessage, emitTyping, onlineUsers } = useSocket() || {};
  const [activeConv, setActiveConv] = useState(null);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const qc = useQueryClient();

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatAPI.getConversations().then(r => r.data),
    refetchInterval: 10000,
  });

  const { data: fetchedMessages } = useQuery({
    queryKey: ['messages', activeConv?._id],
    queryFn: () => chatAPI.getMessages(activeConv._id).then(r => r.data),
    enabled: !!activeConv,
  });

  useEffect(() => {
    if (fetchedMessages) setMessages(fetchedMessages);
  }, [fetchedMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket || !activeConv) return;
    joinConversation(activeConv._id);

    const onMessage = (msg) => setMessages(prev => [...prev, msg]);
    const onTypingStart = ({ name }) => setTyping(name);
    const onTypingStop = () => setTyping(null);

    socket.on('message:receive', onMessage);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);

    return () => {
      leaveConversation(activeConv._id);
      socket.off('message:receive', onMessage);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
    };
  }, [socket, activeConv]);

  const sendMutation = useMutation({
    mutationFn: () => chatAPI.sendMessage(activeConv._id, text),
    onSuccess: ({ data: msg }) => {
      sendSocketMessage(activeConv._id, msg);
      setMessages(prev => [...prev, msg]);
      setText('');
      qc.invalidateQueries(['conversations']);
    },
  });

  const handleTyping = (val) => {
    setText(val);
    emitTyping?.(activeConv?._id, true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTyping?.(activeConv?._id, false), 1500);
  };

  const otherUser = (conv) => conv.participants?.find(p => p._id !== user?._id);

  const isOnline = (conv) => onlineUsers?.has(otherUser(conv)?._id);

  return (
    <div className="page" style={{ padding: '1rem 0' }}>
      <div className="container">
        <div style={styles.layout}>
          {/* Conversations list */}
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <h3>Messages</h3>
            </div>
            {!conversations?.length ? (
              <p style={{ padding: '1rem', color: '#9ca3af', fontSize: 14 }}>No conversations yet.</p>
            ) : (
              conversations.map(conv => {
                const other = otherUser(conv);
                const online = isOnline(conv);
                return (
                  <div
                    key={conv._id}
                    style={styles.convItem(activeConv?._id === conv._id)}
                    onClick={() => setActiveConv(conv)}
                  >
                    <div style={styles.avatarWrap}>
                      <div style={styles.convAvatar}>{other?.name?.[0] || '?'}</div>
                      {online && <div style={styles.onlineDot} />}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 500, fontSize: 14 }}>{other?.name}</span>
                      </div>
                      {conv.product && (
                        <p style={{ fontSize: 12, color: '#9ca3af' }} className="truncate">
                          re: {conv.product.name}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat window */}
          {activeConv ? (
            <div style={styles.chatWindow}>
              <div style={styles.chatHeader}>
                <div style={styles.convAvatar}>{otherUser(activeConv)?.name?.[0] || '?'}</div>
                <div>
                  <p style={{ fontWeight: 600 }}>{otherUser(activeConv)?.name}</p>
                  <p style={{ fontSize: 12, color: isOnline(activeConv) ? '#22c55e' : '#9ca3af' }}>
                    {isOnline(activeConv) ? '● Online' : '○ Offline'}
                  </p>
                </div>
                {activeConv.product && (
                  <div style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>
                    📦 {activeConv.product.name}
                  </div>
                )}
              </div>

              <div style={styles.messages}>
                {messages.map((msg, i) => {
                  const mine = msg.sender?._id === user?._id || msg.sender === user?._id;
                  return (
                    <div key={msg._id || i} style={styles.msgRow(mine)}>
                      {!mine && (
                        <div style={{ ...styles.convAvatar, width: 28, height: 28, fontSize: 11, flexShrink: 0 }}>
                          {msg.sender?.name?.[0] || '?'}
                        </div>
                      )}
                      <div style={styles.bubble(mine)}>
                        <p style={{ fontSize: 14 }}>{msg.text}</p>
                        <p style={{ fontSize: 11, opacity: 0.7, marginTop: 3, textAlign: mine ? 'right' : 'left' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {typing && (
                  <div style={styles.msgRow(false)}>
                    <div style={styles.typingIndicator}>
                      <span>{typing} is typing</span>
                      <span style={styles.dots}>...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={styles.inputRow}>
                <input
                  className="form-control"
                  placeholder="Type a message..."
                  value={text}
                  onChange={e => handleTyping(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && text.trim()) { e.preventDefault(); sendMutation.mutate(); } }}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => text.trim() && sendMutation.mutate()}
                  disabled={!text.trim() || sendMutation.isPending}
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div style={{ ...styles.chatWindow, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#9ca3af', gap: 12 }}>
              <span style={{ fontSize: 48 }}>💬</span>
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: { display: 'grid', gridTemplateColumns: '300px 1fr', height: 'calc(100vh - 100px)', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff' },
  sidebar: { borderRight: '1px solid #e5e7eb', overflowY: 'auto' },
  sidebarHeader: { padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb' },
  convItem: (active) => ({
    display: 'flex', gap: 10, padding: '0.85rem 1.25rem', cursor: 'pointer',
    background: active ? '#f3f0ff' : 'transparent', borderLeft: `3px solid ${active ? '#6c47ff' : 'transparent'}`,
    alignItems: 'center',
  }),
  avatarWrap: { position: 'relative', flexShrink: 0 },
  convAvatar: { width: 36, height: 36, borderRadius: '50%', background: '#6c47ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff' },
  chatWindow: { display: 'flex', flexDirection: 'column', height: '100%' },
  chatHeader: { padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 },
  messages: { flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10 },
  msgRow: (mine) => ({ display: 'flex', gap: 8, justifyContent: mine ? 'flex-end' : 'flex-start', alignItems: 'flex-end' }),
  bubble: (mine) => ({
    maxWidth: '65%', padding: '10px 14px', borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    background: mine ? '#6c47ff' : '#f3f4f6', color: mine ? '#fff' : '#1a1a2e',
  }),
  typingIndicator: { display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', background: '#f3f4f6', borderRadius: 18, fontSize: 13, color: '#6b7280' },
  dots: { letterSpacing: 2, animation: 'pulse 1.2s infinite' },
  inputRow: { padding: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10 },
};
