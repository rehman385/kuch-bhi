import { useState, useEffect, useRef } from 'react';
import { Box, Flex, Input, Button, Text, Heading, Stack, Spinner, IconButton } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const REACTIONS = ['❤️', '😂', '😮', '😢', '🔥', '👏'];

// Use environment variable for socket/server URL
const SERVER_URL = import.meta.env.VITE_SOCKET_URL || `http://${window.location.hostname}:5000`;

// ── Floating Particles Config ──────────────────────────────────────────
const hearts = [
  { left: '10%', bottom: '15%', size: '14px', duration: 7,   delay: 0,   char: '💬' },
  { left: '25%', bottom: '5%',  size: '18px', duration: 6,   delay: 2,   char: '💕' },
  { left: '60%', bottom: '10%', size: '12px', duration: 8,   delay: 1,   char: '✉️' },
  { left: '85%', bottom: '20%', size: '16px', duration: 5,   delay: 0.5, char: '😍' },
  { left: '50%', bottom: '2%',  size: '10px', duration: 9,   delay: 3,   char: '✨' },
];

let socket;

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [reactionPickerFor, setReactionPickerFor] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [focused, setFocused] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load history
    api.get('/chat/messages').then((res) => setMessages(res.data.data));

    // Connect socket
    socket = io(SERVER_URL, { withCredentials: true });

    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('reactionUpdated', (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? updated : m))
      );
    });

    socket.on('partnerTyping', () => setPartnerTyping(true));
    socket.on('partnerStopTyping', () => setPartnerTyping(false));

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  const handleSend = (imageUrl = null) => {
    if (!text.trim() && !imageUrl) return;

    socket.emit('sendMessage', {
      senderId: user._id,
      senderName: user.name,
      text: text.trim(),
      image: imageUrl,
    });

    socket.emit('stopTyping');
    if (!imageUrl) setText('');
    else if (text.trim()) setText('');
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    socket.emit('typing', { name: user.name });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit('stopTyping'), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReaction = (messageId, reaction) => {
    socket.emit('addReaction', { messageId, reaction });
    setReactionPickerFor(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      handleSend(data.url);
    } catch (err) {
      console.error('Image upload failed', err);
    } finally {
      setIsUploading(false);
      fileInputRef.current.value = '';
    }
  };

  const isMe = (msg) => msg.senderName === user?.name;

  return (
    <Box minH="100vh" bg="#120822" display="flex" flexDirection="column" position="relative" overflow="hidden">

      {/* ── Background Animation ────────────────────────────── */}
      <motion.div style={{ position:'absolute', inset:0, zIndex:0, background:'linear-gradient(135deg,#1a0533 0%,#2d1b69 40%,#0d3d56 100%)' }} />
      <motion.div style={{ position:'absolute', top:'-10%', left:'-10%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)', filter:'blur(60px)', zIndex:0 }} animate={{ x:[0,40,0], y:[0,30,0] }} transition={{ duration:12, repeat:Infinity, ease:'easeInOut' }} />
      <motion.div style={{ position:'absolute', bottom:'-10%', right:'-10%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', filter:'blur(80px)', zIndex:0 }} animate={{ x:[0,-30,0], y:[0,-40,0] }} transition={{ duration:15, repeat:Infinity, ease:'easeInOut' }} />

      {/* Floating Particles */}
      <Box position="absolute" inset={0} zIndex={0} pointerEvents="none">
        {hearts.map((h, i) => (
          <motion.div
            key={i}
            style={{ position:'absolute', fontSize:h.size, opacity:0, left:h.left, bottom:h.bottom }}
            animate={{ y:[0,-150], opacity:[0,0.6,0], scale:[0.6,1.2,0.7] }}
            transition={{ duration:h.duration, repeat:Infinity, delay:h.delay, ease:'easeOut' }}
          >
            {h.char}
          </motion.div>
        ))}
      </Box>

      {/* ── Header ──────────────────────────────────────────── */}
      <Flex
        bg="rgba(255,255,255,0.05)"
        backdropFilter="blur(16px)"
        borderBottom="1px solid rgba(255,255,255,0.1)"
        px={6} py={4}
        align="center"
        gap={3}
        zIndex={50}
      >
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate('/')}
          rounded="full"
          color="whiteAlpha.800"
          _hover={{ bg: 'whiteAlpha.200', transform: 'translateX(-2px)' }}
        >
          ← Back
        </Button>
        <Text fontSize="2xl">💬</Text>
        <Heading size="md" bgGradient="linear(to-r, #f472b6, #a855f7)" bgClip="text" fontFamily="'Playfair Display', serif">
          Our Chat 💕
        </Heading>
      </Flex>

      {/* ── Chat Messages ───────────────────────────────────── */}
      <Box flex="1" overflowY="auto" px={4} py={6} position="relative" zIndex={1}>
        <Stack gap={6} maxW="800px" mx="auto">
          {messages.map((msg) => (
            <Flex
              key={msg._id}
              justify={isMe(msg) ? 'flex-end' : 'flex-start'}
              align="flex-end"
              gap={3}
              position="relative"
            >
              {/* Partner Avatar */}
              {!isMe(msg) && (
                <Box
                  w="36px" h="36px" rounded="full"
                  bg="rgba(255,255,255,0.1)"
                  display="flex" alignItems="center" justifyContent="center"
                  fontSize="sm" fontWeight="bold" color="white" flexShrink={0}
                  border="1px solid rgba(255,255,255,0.2)"
                  shadow="sm"
                >
                  {msg.senderName?.[0]?.toUpperCase()}
                </Box>
              )}

              <Box maxW="75%">
                {!isMe(msg) && (
                  <Text fontSize="xs" color="whiteAlpha.500" mb={1} ml={2}>
                    {msg.senderName}
                  </Text>
                )}

                <MotionBox
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  bg={isMe(msg) ? 'linear-gradient(135deg, #f472b6 0%, #a855f7 100%)' : 'rgba(255,255,255,0.1)'}
                  color="white"
                  px={msg.image ? 2 : 5} py={msg.image ? 2 : 3}
                  rounded={isMe(msg) ? '20px 20px 4px 20px' : '20px 20px 20px 4px'}
                  shadow="lg"
                  cursor="pointer"
                  onDoubleClick={() => setReactionPickerFor(reactionPickerFor === msg._id ? null : msg._id)}
                  position="relative"
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor={isMe(msg) ? 'transparent' : 'rgba(255,255,255,0.15)'}
                >
                  {msg.image && (
                    <Box mb={msg.text ? 2 : 0} rounded="lg" overflow="hidden">
                      <img
                        src={`${SERVER_URL}${msg.image}`}
                        alt="shared"
                        style={{ maxWidth: '100%', maxHeight: '300px', display: 'block', borderRadius: '12px' }}
                      />
                    </Box>
                  )}

                  {msg.text && (
                    <Text fontSize="md" lineHeight="tall" fontWeight="medium" px={msg.image ? 2 : 0}>
                      {msg.text}
                    </Text>
                  )}

                  <Text
                    fontSize="xs"
                    color={isMe(msg) ? 'whiteAlpha.700' : 'whiteAlpha.500'}
                    mt={1}
                    textAlign="right"
                    px={msg.image ? 2 : 0}
                  >
                    {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : ''}
                  </Text>

                  {/* Message Reaction Badge */}
                  {msg.reaction && (
                    <Box
                      position="absolute"
                      bottom="-12px"
                      right={isMe(msg) ? '10px' : undefined}
                      left={!isMe(msg) ? '10px' : undefined}
                      bg="#1a0533" // Match slightly darker bg
                      rounded="full"
                      px={2} py={0.5}
                      shadow="md"
                      fontSize="sm"
                      border="1px solid rgba(255,255,255,0.2)"
                    >
                      {msg.reaction}
                    </Box>
                  )}
                </MotionBox>

                {/* Reaction Picker Popup */}
                {reactionPickerFor === msg._id && (
                  <Flex
                    bg="rgba(255,255,255,0.15)"
                    backdropFilter="blur(16px)"
                    border="1px solid rgba(255,255,255,0.2)"
                    shadow="xl"
                    rounded="full"
                    px={3} py={2}
                    gap={2}
                    mt={2}
                    justify="center"
                    position="relative"
                    zIndex={10}
                  >
                    {REACTIONS.map((r) => (
                      <Text
                        key={r}
                        cursor="pointer"
                        fontSize="xl"
                        _hover={{ transform: 'scale(1.2)' }}
                        transition="all 0.1s"
                        onClick={() => handleReaction(msg._id, r)}
                      >
                        {r}
                      </Text>
                    ))}
                  </Flex>
                )}
              </Box>

              {/* My Avatar */}
              {isMe(msg) && (
                <Box
                  w="36px" h="36px" rounded="full"
                  bgGradient="linear(to-r, #f472b6, #a855f7)"
                  display="flex" alignItems="center" justifyContent="center"
                  fontSize="sm" fontWeight="bold" color="white" flexShrink={0}
                  shadow="sm"
                >
                  {msg.senderName?.[0]?.toUpperCase()}
                </Box>
              )}
            </Flex>
          ))}

          {partnerTyping && (
            <Flex justify="flex-start" align="center" gap={2} ml={10}>
              <Box bg="rgba(255,255,255,0.1)" px={4} py={3} rounded="20px 20px 20px 4px">
                <Flex gap={1} align="center">
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      w="6px" h="6px" rounded="full" bg="#f472b6"
                      as={motion.div}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </Flex>
              </Box>
            </Flex>
          )}

          <div ref={bottomRef} />
        </Stack>
      </Box>

      {/* ── Input Area ──────────────────────────────────────── */}
      <Box
        bg="rgba(255,255,255,0.05)"
        backdropFilter="blur(16px)"
        px={4} py={4}
        shadow="0 -4px 20px rgba(0,0,0,0.2)"
        borderTop="1px solid rgba(255,255,255,0.1)"
        zIndex={50}
      >
        <Flex gap={3} align="center" maxW="800px" mx="auto">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          <IconButton
            rounded="full"
            variant="ghost"
            color="whiteAlpha.700"
            _hover={{ bg: 'whiteAlpha.200', color: '#f472b6' }}
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading}
            aria-label="Upload Image"
          >
            {isUploading ? <Spinner size="sm" /> : <Text fontSize="xl">📷</Text>}
          </IconButton>

          <Input
            value={text}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Type something sweet... 💕"
            rounded="full"
            bg="rgba(0,0,0,0.3)"
            border="none"
            color="white"
            _placeholder={{ color: 'whiteAlpha.400' }}
            _focus={{ boxShadow: '0 0 0 2px #f472b6' }}
            size="lg"
            flex={1}
          />
          <Button
            onClick={() => handleSend()}
            bgGradient="linear(to-r, #f472b6, #a855f7)"
            _hover={{ bgGradient: "linear(to-r, #ec4899, #9333ea)", shadow: 'md', transform: 'translateY(-2px)' }}
            _active={{ transform: 'translateY(0)' }}
            color="white"
            rounded="full"
            px={8}
            py={6}
            disabled={!text.trim() && !isUploading}
            shadow="lg"
            transition="all 0.2s"
            fontWeight="bold"
          >
            Send 💌
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default ChatPage;

