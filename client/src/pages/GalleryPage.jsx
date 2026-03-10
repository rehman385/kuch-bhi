import { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Flex, Grid, Heading, Input, Text, Stack, IconButton, Badge
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const MotionBox = motion(Box);

// Use environment variable for server URL
const SERVER_URL = import.meta.env.VITE_SOCKET_URL || `http://${window.location.hostname}:5000`;

// ── Floating Hearts Config ─────────────────────────────────────────────
const hearts = [
  { left: '10%', bottom: '15%', size: '14px', duration: 7,   delay: 0,   char: '❤️' },
  { left: '30%', bottom: '5%',  size: '18px', duration: 6,   delay: 2,   char: '📸' },
  { left: '60%', bottom: '10%', size: '12px', duration: 8,   delay: 1,   char: '✨' },
  { left: '85%', bottom: '20%', size: '16px', duration: 5,   delay: 0.5, char: '💕' },
  { left: '50%', bottom: '2%',  size: '10px', duration: 9,   delay: 3,   char: '💖' },
];

const GalleryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [focused, setFocused] = useState('');
  const fileRef = useRef();

  const fetchGallery = async () => {
    const res = await api.get('/gallery');
    setItems(res.data.data);
  };

  useEffect(() => { fetchGallery(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview({ file, url: URL.createObjectURL(file) });
  };

  const handleUpload = async () => {
    if (!preview?.file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('media', preview.file);
      formData.append('caption', caption);
      await api.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreview(null);
      setCaption('');
      fileRef.current.value = '';
      fetchGallery();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this memory? 💔')) return;
    await api.delete(`/gallery/${id}`);
    fetchGallery();
  };

  const getMediaUrl = (filename) => `${SERVER_URL}/uploads/${filename}`;

  return (
    <Box minH="100vh" bg="#120822" position="relative" overflow="hidden">

      {/* ── Background Animation ────────────────────────────── */}
      <motion.div style={{ position:'absolute', inset:0, zIndex:0, background:'linear-gradient(135deg,#1a0533 0%,#2d1b69 40%,#0d3d56 100%)' }} />
      <motion.div style={{ position:'absolute', top:'-10%', right:'-10%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)', filter:'blur(80px)', zIndex:0 }} animate={{ x:[0,-40,0], y:[0,30,0] }} transition={{ duration:15, repeat:Infinity, ease:'easeInOut' }} />
      <motion.div style={{ position:'absolute', bottom:'-10%', left:'-10%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)', filter:'blur(60px)', zIndex:0 }} animate={{ x:[0,30,0], y:[0,-20,0] }} transition={{ duration:12, repeat:Infinity, ease:'easeInOut' }} />

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
        px={6} py={4}
        align="center"
        justify="space-between"
        bg="rgba(255,255,255,0.05)"
        backdropFilter="blur(16px)"
        borderBottom="1px solid rgba(255,255,255,0.1)"
        position="sticky"
        top={0}
        zIndex={50}
      >
        <Flex align="center" gap={3}>
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
          <Text fontSize="2xl">📸</Text>
          <Heading size="md" bgGradient="linear(to-r, #f472b6, #a855f7)" bgClip="text" fontFamily="'Playfair Display', serif">
            Our Gallery
          </Heading>
        </Flex>
        <Badge
          bg="rgba(255,255,255,0.1)"
          color="whiteAlpha.900"
          rounded="full"
          px={3} py={1}
          fontSize="xs"
          border="1px solid rgba(255,255,255,0.2)"
        >
          {items.length} Memories
        </Badge>
      </Flex>

      <Box maxW="1200px" mx="auto" px={4} py={8} position="relative" zIndex={1}>

        {/* ── Upload Card ─────────────────────────────────────── */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          bg="rgba(255, 255, 255, 0.05)"
          backdropFilter="blur(20px)"
          rounded="3xl"
          p={8}
          mb={10}
          border="1px solid rgba(255,255,255,0.1)"
          position="relative"
          overflow="hidden"
          shadow="0 20px 40px rgba(0,0,0,0.2)"
        >
          {/* Subtle gradient overlay */}
          <Box position="absolute" inset={0} bg="linear-gradient(135deg, rgba(244,114,182,0.05), rgba(168,85,247,0.05))" pointerEvents="none" />

          <Heading size="lg" color="white" fontFamily="'Playfair Display', serif" mb={6} textAlign="center">
            Upload New Memory
          </Heading>

          <Stack gap={6}>
            {!preview ? (
              <Box
                border="2px dashed"
                borderColor="whiteAlpha.300"
                rounded="2xl"
                p={10}
                textAlign="center"
                cursor="pointer"
                bg="rgba(0,0,0,0.2)"
                onClick={() => fileRef.current?.click()}
                _hover={{ borderColor: '#f472b6', bg: 'rgba(255,255,255,0.05)', transform: 'scale(1.01)' }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                <Stack align="center" spacing={3}>
                  <Box bg="whiteAlpha.200" p={4} rounded="full" shadow="lg" border="1px solid rgba(255,255,255,0.1)">
                    <Text fontSize="4xl">📂</Text>
                  </Box>
                  <Text color="whiteAlpha.900" fontSize="lg" fontWeight="bold">Click to choose a photo or video</Text>
                  <Text color="whiteAlpha.500" fontSize="sm">JPG, PNG, MP4 — Max 20MB</Text>
                </Stack>
              </Box>
            ) : (
              <Box
                rounded="2xl"
                overflow="hidden"
                shadow="2xl"
                bg="black"
                p={2}
                position="relative"
                border="1px solid rgba(255,255,255,0.2)"
              >
                <Box position="absolute" top={4} right={4} zIndex={5}>
                  <Button
                    size="xs"
                    bg="red.500"
                    color="white"
                    _hover={{ bg: 'red.600' }}
                    onClick={(e) => { e.stopPropagation(); setPreview(null); }}
                  >
                    Change
                  </Button>
                </Box>
                {preview.file.type.startsWith('video') ? (
                  <video src={preview.url} style={{ maxHeight: '400px', width: '100%', borderRadius: '12px', margin: '0 auto' }} controls />
                ) : (
                  <img src={preview.url} alt="preview" style={{ maxHeight: '400px', width: '100%', objectFit: 'contain', borderRadius: '12px', margin: '0 auto' }} />
                )}
                <Text textAlign="center" fontSize="sm" color="whiteAlpha.600" mt={2}>{preview.file.name}</Text>
              </Box>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/mp4"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <Flex gap={3} direction={{ base: 'column', md: 'row' }}>
              <Box flex={1} position="relative">
                <Input
                  placeholder="Write a sweet caption... 💕"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  onFocus={() => setFocused('caption')}
                  onBlur={() => setFocused('')}
                  size="lg"
                  bg="rgba(0,0,0,0.3)"
                  border="1px solid"
                  borderColor={focused === 'caption' ? '#f472b6' : 'whiteAlpha.200'}
                  color="white"
                  rounded="xl"
                  _placeholder={{ color: 'whiteAlpha.400' }}
                  _focus={{ outline: 'none', boxShadow: '0 0 0 2px rgba(244,114,182,0.3)' }}
                  transition="all 0.2s"
                />
              </Box>

              <Button
                size="lg"
                bgGradient="linear(to-r, #f472b6, #a855f7)"
                _hover={{ bgGradient: "linear(to-r, #ec4899, #9333ea)", transform: "translateY(-2px)", shadow: "lg" }}
                _active={{ transform: "translateY(0)" }}
                color="white"
                onClick={handleUpload}
                loading={uploading}
                loadingText="Uploading..."
                disabled={!preview}
                width={{ base: 'full', md: '200px' }}
                rounded="xl"
                fontWeight="bold"
                transition="all 0.2s"
                border="none"
              >
                Upload 💾
              </Button>
            </Flex>
          </Stack>
        </MotionBox>

        {/* ── Gallery Masonry Grid ────────────────────────────── */}
        {items.length === 0 ? (
          <Box textAlign="center" py={16} bg="rgba(255,255,255,0.03)" rounded="3xl" border="1px solid rgba(255,255,255,0.1)">
            <Text fontSize="6xl" mb={4}>🌸</Text>
            <Heading size="md" color="whiteAlpha.800" mb={2}>No memories yet</Heading>
            <Text color="whiteAlpha.500">Upload your first photo or video together!</Text>
          </Box>
        ) : (
          <Box
            sx={{
              columnCount: [1, 2, 3],
              columnGap: '24px',
            }}
          >
            <AnimatePresence>
              {items.map((item, index) => (
                <MotionBox
                  key={item._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  mb="24px"
                  bg="rgba(255,255,255,0.08)"
                  backdropFilter="blur(10px)"
                  rounded="2xl"
                  overflow="hidden"
                  shadow="lg"
                  border="1px solid rgba(255,255,255,0.1)"
                  cursor="pointer"
                  _hover={{ transform: 'scale(1.02)', shadow: '2xl', borderColor: 'rgba(255,255,255,0.3)' }}
                  onClick={() => setLightbox(item)}
                  position="relative"
                  breakInside="avoid"
                >
                  {item.mimetype?.startsWith('video') ? (
                    <Box position="relative">
                      <video
                        src={getMediaUrl(item.filename)}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                      <Box
                        position="absolute" top="50%" left="50%"
                        transform="translate(-50%, -50%)"
                        bg="rgba(0,0,0,0.6)" rounded="full" p={3}
                        backdropFilter="blur(4px)"
                      >
                        <Text fontSize="2xl" color="white">▶️</Text>
                      </Box>
                    </Box>
                  ) : (
                    <img
                      src={getMediaUrl(item.filename)}
                      alt={item.caption || 'memory'}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                      loading="lazy"
                    />
                  )}

                  <Box p={4}>
                    {item.caption && (
                      <Text fontSize="md" color="white" fontWeight="medium" mb={2} lineHeight="short">{item.caption}</Text>
                    )}
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" color="whiteAlpha.500">
                        {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : ''}
                      </Text>
                      <Text fontSize="xs" color="#f472b6" fontWeight="bold" letterSpacing="wide">{item.uploaderName}</Text>
                    </Flex>
                  </Box>

                  {/* Delete button (Appear on hover) */}
                  <Button
                    position="absolute"
                    top={3}
                    right={3}
                    size="xs"
                    rounded="full"
                    onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    bg="red.500"
                    color="white"
                    _hover={{ bg: 'red.600', transform: 'scale(1.1)' }}
                    shadow="lg"
                    zIndex={10}
                  >
                    ✕
                  </Button>
                </MotionBox>
              ))}
            </AnimatePresence>
          </Box>
        )}
      </Box>

      {/* ── Lightbox ────────────────────────────────────────── */}
      {lightbox && (
        <Box
          position="fixed" inset={0} bg="rgba(0,0,0,0.9)" zIndex={1000}
          display="flex" alignItems="center" justifyContent="center"
          onClick={() => setLightbox(null)}
          p={4}
          backdropFilter="blur(10px)"
        >
          <MotionBox
            onClick={(e) => e.stopPropagation()}
            maxW="95vw" maxH="95vh"
            position="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {lightbox.mimetype?.startsWith('video') ? (
              <video
                src={getMediaUrl(lightbox.filename)}
                controls autoPlay
                style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}
              />
            ) : (
              <img
                src={getMediaUrl(lightbox.filename)}
                alt={lightbox.caption}
                style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '16px', objectFit: 'contain', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}
              />
            )}
            {lightbox.caption && (
              <Box
                bg="rgba(0,0,0,0.8)"
                color="white"
                px={6} py={3}
                rounded="full"
                mt={4}
                textAlign="center"
                position="absolute"
                bottom="-60px"
                left="50%"
                transform="translateX(-50%)"
                border="1px solid rgba(255,255,255,0.2)"
                backdropFilter="blur(10px)"
                width="max-content"
              >
                <Text fontSize="lg">{lightbox.caption}</Text>
              </Box>
            )}
            <IconButton
              aria-label="Close"
              position="absolute" top={{ base: -10, md: -6 }} right={{ base: 0, md: -12 }}
              rounded="full" size="lg"
              bg="whiteAlpha.200"
              color="white"
              onClick={() => setLightbox(null)}
              _hover={{ bg: 'whiteAlpha.400', transform: 'rotate(90deg)' }}
              transition="all 0.2s"
            >
              ✕
            </IconButton>
          </MotionBox>
        </Box>
      )}
    </Box>
  );
};

export default GalleryPage;

