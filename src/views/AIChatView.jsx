import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, Mic, MicOff, Camera, CameraOff, X, Bot, User,
  Loader2, Image as ImageIcon, File, Volume2, StopCircle, Sparkles,
  ChevronDown, AlertCircle, VideoOff, MessageSquare, Plus, Search,
  MoreVertical, Trash2, Edit2, Menu
} from 'lucide-react';


// API KEY
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY; // New OpenRouter key

const SYSTEM_PROMPT = `You are a compassionate and knowledgeable AI health assistant built into a telehealth platform. 
You help users with health questions, symptom analysis, medication information, wellness tips, and connecting them with the right specialists.
Always be empathetic, clear, and remind users that your advice is informational and they should consult a doctor for medical decisions.
Keep responses concise and well-structured. Use bullet points when listing items.`;

// ── Helpers ────────────────────────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Sub Components ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-purple-400"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function AttachmentPreview({ attachment, onRemove }) {
  const isImage = attachment.type?.startsWith('image/');
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative flex-shrink-0 group"
    >
      {isImage ? (
        <img
          src={attachment.preview}
          alt="attachment"
          className="w-16 h-16 rounded-xl object-cover border border-purple-500/30"
        />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-purple-500/10 border border-purple-500/30 flex flex-col items-center justify-center gap-1">
          <File size={20} className="text-purple-400" />
          <span className="text-[9px] text-purple-300 font-bold truncate w-12 text-center">{attachment.name}</span>
        </div>
      )}
      <button
        onClick={() => onRemove(attachment.id)}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 border border-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={10} className="text-white" />
      </button>
    </motion.div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${isUser
        ? 'bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30'
        : 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30'
        }`}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-cyan-400" />}
      </div>

      {/* Content */}
      <div className={`max-w-[72%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Attachments in message */}
        {msg.attachments?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {msg.attachments.map(a => a.type?.startsWith('image/') ? (
              <img key={a.id} src={a.preview} alt="img" className="h-40 rounded-2xl object-cover border border-white/10 shadow-md" />
            ) : (
              <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-xs text-slate-300">
                <File size={14} className="text-purple-400" />
                {a.name}
              </div>
            ))}
          </div>
        )}

        {/* Text bubble */}
        {msg.content && (
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser
            ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-sm shadow-lg shadow-purple-500/20'
            : 'bg-white/8 dark:bg-white/8 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-bl-sm'
            }`}>
            {msg.content}
          </div>
        )}

        {/* Voice note indicator */}
        {msg.isVoice && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium mt-1 ${isUser ? 'bg-purple-500/20 text-purple-300' : 'bg-cyan-500/10 text-cyan-400'}`}>
            <Volume2 size={12} />
            Voice message transcribed
          </div>
        )}

        <span className="text-[10px] text-slate-400 px-1">{formatTime(new Date(msg.timestamp))}</span>
      </div>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function AIChatView() {
  const defaultMessage = {
    id: 1,
    role: 'assistant',
    content: "Hi! I'm your AI Health Assistant 👋\n\nI can help you with:\n• Symptom analysis & health questions\n• Medication information\n• Wellness & lifestyle tips\n• Finding the right specialist\n\nYou can also share images, documents, or use voice — just use the buttons below!",
    timestamp: Date.now(),
  };

  // Chats state (with localStorage persistence)
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem('serene_chat_history');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
    return [{ id: 'chat-1', title: 'New Conversation', messages: [defaultMessage], updatedAt: Date.now() }];
  });

  useEffect(() => {
    try {
      localStorage.setItem('serene_chat_history', JSON.stringify(chats));
    } catch (err) {
      console.error('Failed to save chat history:', err);
    }
  }, [chats]);
  const [activeChatId, setActiveChatId] = useState('chat-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Options menu state for chats
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Derive current messages from active chat
  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const messages = activeChat?.messages || [];

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  // Camera
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // UI refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // ── Chat Management ───────────────────────────────────────────────────────
  const createNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newChat = { id: newId, title: 'New Conversation', messages: [{ ...defaultMessage, id: Date.now() }], updatedAt: Date.now() };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newId);
    setOpenMenuId(null);
  };

  const deleteChat = (e, id) => {
    e.stopPropagation();
    setChats(prev => {
      const updated = prev.filter(c => c.id !== id);
      if (updated.length === 0) {
        const newId = `chat-${Date.now()}`;
        setActiveChatId(newId);
        return [{ id: newId, title: 'New Conversation', messages: [{ ...defaultMessage, id: Date.now() }], updatedAt: Date.now() }];
      }
      if (id === activeChatId) setActiveChatId(updated[0].id);
      return updated;
    });
    setOpenMenuId(null);
  };

  const startEditing = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
    setOpenMenuId(null);
  };

  const saveEdit = (id) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, title: editTitle.trim() || 'Untitled' } : c));
    setEditingChatId(null);
  };

  const updateActiveChatMessages = (newMessages) => {
    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        const isFirstUserMessage = c.messages.length === 1 && newMessages.length > c.messages.length && newMessages[newMessages.length - 1].role === 'user';
        return {
          ...c,
          messages: newMessages,
          updatedAt: Date.now(),
          // Auto-rename chat based on first user message if it's still 'New Conversation'
          title: (isFirstUserMessage && c.title === 'New Conversation') ? newMessages[newMessages.length - 1].content.slice(0, 30) + '...' : c.title
        };
      }
      return c;
    }));
  };

  // ── Camera ──────────────────────────────────────────────────────────────
  const openCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setCameraStream(stream);
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => { });
        }
      }, 100);
    } catch {
      setCameraError('Camera permission denied. Please allow camera access.');
    }
  };

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setCameraOpen(false);
  }, [cameraStream]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const preview = URL.createObjectURL(blob);
      setAttachments(prev => [...prev, { id: Date.now(), file, type: file.type, name: file.name, preview }]);
      stopCamera();
    }, 'image/jpeg', 0.92);
  };

  // ── Voice ───────────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        processAudioRecording();
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch {
      updateActiveChatMessages([...messages, {
        id: Date.now(), role: 'assistant',
        content: '⚠️ Microphone access denied. Please allow microphone permissions.',
        timestamp: Date.now()
      }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);
    }
  };

  const processAudioRecording = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

    // Transcribe with Whisper
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');

    try {
      setIsLoading(true);
      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}` },
        body: formData,
      });
      const data = await res.json();
      const transcript = data.text?.trim();
      if (transcript) {
        // Add as user voice message and get AI response
        const userMsg = { id: Date.now(), role: 'user', content: transcript, isVoice: true, timestamp: Date.now() };
        updateActiveChatMessages([...messages, userMsg]);
        await getAIResponse(transcript, [], [...messages, userMsg]);
      } else {
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
      updateActiveChatMessages([...messages, {
        id: Date.now(), role: 'assistant',
        content: '⚠️ Failed to transcribe audio. Please try again.',
        timestamp: Date.now()
      }]);
    }
  };

  // ── File Upload ─────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
      setAttachments(prev => [...prev, { id: Date.now() + Math.random(), file, type: file.type, name: file.name, preview }]);
    });
    e.target.value = '';
  };

  const removeAttachment = (id) => {
    setAttachments(prev => {
      const att = prev.find(a => a.id === id);
      if (att?.preview) URL.revokeObjectURL(att.preview);
      return prev.filter(a => a.id !== id);
    });
  };

  // ── AI Call ─────────────────────────────────────────────────────────────
  const getAIResponse = async (text, atts, historyOverride) => {
    const history = historyOverride || messages;

    // Build message content (handle images)
    const userContent = [];
    if (text) userContent.push({ type: 'text', text });

    for (const att of (atts || [])) {
      if (att.type?.startsWith('image/')) {
        const b64 = await fileToBase64(att.file);
        userContent.push({ type: 'image_url', image_url: { url: `data:${att.type};base64,${b64}`, detail: 'auto' } });
      } else {
        // For non-image files, just mention them in text
        userContent.push({ type: 'text', text: `[Attached file: ${att.name}]` });
      }
    }

    try {
      const openaiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history
          .filter(m => !m.isError)
          .map(m => ({ role: m.role, content: m.content })),
      ];

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Telehealth App',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o',
          messages: openaiMessages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'API Error');
      }

      const data = await res.json();
      const reply = data.choices[0]?.message?.content || 'I could not generate a response.';
      updateActiveChatMessages([...history, { id: Date.now(), role: 'assistant', content: reply, timestamp: Date.now() }]);
    } catch (err) {
      updateActiveChatMessages([...history, {
        id: Date.now(), role: 'assistant', isError: true,
        content: `⚠️ ${err.message || 'Something went wrong. Please try again.'}`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Send ────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text && attachments.length === 0) return;
    if (isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      attachments: [...attachments],
      timestamp: Date.now(),
    };

    const attsToSend = [...attachments];
    updateActiveChatMessages([...messages, userMsg]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    await getAIResponse(text, attsToSend, [...messages, userMsg]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter chats by search
  const filteredChats = chats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => b.updatedAt - a.updatedAt);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] max-w-6xl mx-auto gap-4 md:gap-6 text-slate-900 dark:text-slate-200">
      {/* ── Sidebar: Chat History ── */}
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden flex justify-start"
            onClick={() => setShowMobileSidebar(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-72 h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-200 dark:border-white/10 space-y-4 pt-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white">Chat History</h3>
                  <button onClick={() => setShowMobileSidebar(false)} className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-700 dark:hover:text-white">
                    <X size={16} />
                  </button>
                </div>
                <button
                  onClick={() => { createNewChat(); setShowMobileSidebar(false); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors shadow-md shadow-purple-500/20"
                >
                  <Plus size={16} /> New Chat
                </button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredChats.length === 0 ? (
                  <div className="text-center p-4 text-xs text-slate-400 font-medium">No chats found.</div>
                ) : (
                  filteredChats.map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => { setActiveChatId(chat.id); setOpenMenuId(null); setShowMobileSidebar(false); }}
                      className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${activeChatId === chat.id
                          ? 'bg-purple-500/10 border border-purple-500/20'
                          : 'hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                        }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeChatId === chat.id ? 'text-purple-500' : 'text-slate-400'}`} />
                        <span className={`text-sm font-medium truncate ${activeChatId === chat.id ? 'text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-slate-300'}`}>
                          {chat.title}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-72 flex-shrink-0 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-200 dark:border-white/10 space-y-4">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors shadow-md shadow-purple-500/20"
          >
            <Plus size={16} /> New Chat
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredChats.length === 0 ? (
            <div className="text-center p-4 text-xs text-slate-400 font-medium">No chats found.</div>
          ) : (
            filteredChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => { setActiveChatId(chat.id); setOpenMenuId(null); }}
                className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${activeChatId === chat.id
                    ? 'bg-purple-500/10 border border-purple-500/20'
                    : 'hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                  }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeChatId === chat.id ? 'text-purple-500' : 'text-slate-400'}`} />
                  {editingChatId === chat.id ? (
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onBlur={() => saveEdit(chat.id)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(chat.id); }}
                      className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white font-medium min-w-0"
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span className={`text-sm font-medium truncate ${activeChatId === chat.id ? 'text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-slate-300'}`}>
                      {chat.title}
                    </span>
                  )}
                </div>

                {/* Options Menu Toggle */}
                {editingChatId !== chat.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                    }}
                    className={`p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${openMenuId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <MoreVertical className="w-4 h-4 text-slate-500" />
                  </button>
                )}

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {openMenuId === chat.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-2 top-10 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <button
                        onClick={(e) => startEditing(e, chat)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Rename
                      </button>
                      <button
                        onClick={(e) => deleteChat(e, chat.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-3xl p-4 sm:p-6 shadow-lg relative h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-slate-200 dark:border-white/10"
        >
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="md:hidden p-2 -ml-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 focus:outline-none"
          >
            <Menu size={20} />
          </button>
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center">
              <Sparkles className="text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 border-2 border-slate-50 dark:border-charcoal" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">AI Health Assistant</h1>
            <p className="text-xs text-emerald-500 font-semibold">● Online · Powered by GPT-4o</p>
          </div>
        </motion.div>

        {/* Camera Error */}
        <AnimatePresence>
          {cameraError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-3"
            >
              <AlertCircle size={14} /> {cameraError}
              <button onClick={() => setCameraError('')} className="ml-auto"><X size={12} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera Modal */}
        <AnimatePresence>
          {cameraOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-4 relative rounded-2xl overflow-hidden border border-purple-500/30 bg-slate-900 shadow-2xl"
            >
              <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-56 object-cover scale-x-[-1]" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <button
                  onClick={capturePhoto}
                  className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-sm shadow-xl hover:bg-slate-100 transition-colors flex items-center gap-2"
                >
                  <Camera size={16} /> Capture
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-xl bg-red-500/80 text-white font-bold text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <X size={16} /> Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-2.5"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-cyan-400" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <TypingDots />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg overflow-hidden flex-shrink-0">
          {/* Attachment Previews */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 px-4 pt-3 pb-2 flex-wrap"
              >
                {attachments.map(att => (
                  <AttachmentPreview key={att.id} attachment={att} onRemove={removeAttachment} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recording Status */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 px-4 py-2.5 bg-red-500/5 border-b border-red-500/10"
              >
                <motion.div
                  className="w-2.5 h-2.5 rounded-full bg-red-500"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-xs font-bold text-red-500">Recording…</span>
                <span className="text-xs text-slate-400 font-mono">
                  {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:{String(recordingTime % 60).padStart(2, '0')}
                </span>
                <button
                  onClick={stopRecording}
                  className="ml-auto text-xs font-bold text-red-500 flex items-center gap-1 hover:text-red-600"
                >
                  <StopCircle size={14} /> Stop
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isRecording}
            rows={1}
            placeholder="Ask me anything about your health…"
            style={{ resize: 'none', height: 'auto', minHeight: '52px', maxHeight: '140px' }}
            className="w-full bg-transparent px-4 py-3.5 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none leading-relaxed disabled:opacity-50"
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
            }}
          />

          {/* Toolbar */}
          <div className="flex items-center gap-1.5 px-3 py-2.5 border-t border-slate-100 dark:border-white/5">
            {/* File Upload */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={handleFileSelect}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-purple-500 hover:bg-purple-500/10 transition-colors"
            >
              <Paperclip size={18} />
            </motion.button>

            {/* Voice */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? 'Stop recording' : 'Record voice message'}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isRecording
                ? 'bg-red-500/20 text-red-500'
                : 'text-slate-400 hover:text-purple-500 hover:bg-purple-500/10'
                }`}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </motion.button>

            {/* Camera */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={cameraOpen ? stopCamera : openCamera}
              title={cameraOpen ? 'Close camera' : 'Take a photo'}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${cameraOpen
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-slate-400 hover:text-purple-500 hover:bg-purple-500/10'
                }`}
            >
              {cameraOpen ? <CameraOff size={18} /> : <Camera size={18} />}
            </motion.button>

            <div className="flex-1" />

            {/* Send */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleSend}
              disabled={isLoading || isRecording || (!input.trim() && attachments.length === 0)}
              title="Send message"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm shadow-md shadow-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-purple-500/40 hover:shadow-lg"
            >
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {!isLoading && <span className="hidden sm:inline">Send</span>}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
