import { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Flex, Grid, Heading, Input, Text, Stack, IconButton
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import DreamyBackground from '../components/DreamyBackground';

const MotionBox = motion(Box);

// Use environment variable for server URL
const SERVER_URL = import.meta.env.VITE_SOCKET_URL || `http://${window.location.hostname}:5000`;

const GalleryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [lightbox, setLightbox] = useState(null);
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
    <DreamyBackground>
      {/* Header */}
      <Flex
        px={6} py={4}
        align="center"
        justify="space-between"
        bg="rgba(255,255,255,0.7)"
        backdropFilter="blur(10px)"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Flex align="center" gap={3}>
          <Button size="sm" variant="ghost" onClick={() => navigate('/')} rounded="full">← Back</Button>
          <Text fontSize="2xl">🖼️</Text>
          <Heading size="md" color="pink.600" fontFamily="'Playfair Display', serif">Our Gallery</Heading>
        </Flex>
        <Text fontSize="sm" color="gray.500" fontWeight="medium">
          {items.length} Memories
        </Text>
      </Flex>

      <Box maxW="1200px" mx="auto" px={4} py={6}>

        {/* Upload Card */}
        <Box
          bg="white"
          rounded="3xl"
          p={8}
          shadow="xl"
          mb={10}
          border="1px solid"
          borderColor="pink.100"
          position="relative"
          overflow="hidden"
        >
          {/* Decorative background */}
          <Box position="absolute" top="-20px" right="-20px" w="100px" h="100px" bg="pink.50" rounded="full" filter="blur(30px)" />

          <Heading size="lg" color="gray.700" fontFamily="'Playfair Display', serif" mb={6}>📸 Add a New Memory</Heading>

          <Stack gap={6}>
            {!preview ? (
              <Box
                border="2px dashed"
                borderColor="pink.200"
                rounded="2xl"
                p={10}
                textAlign="center"
                cursor="pointer"
                bg="pink.50"
                onClick={() => fileRef.current?.click()}
                _hover={{ borderColor: 'pink.400', bg: 'pink.100', transform: 'scale(1.01)' }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                <Stack align="center" spacing={3}>
                  <Box bg="white" p={4} rounded="full" shadow="sm">
                    <Text fontSize="4xl">📷</Text>
                  </Box>
                  <Text color="gray.600" fontSize="lg" fontWeight="medium">Click to choose a photo or video</Text>
                  <Text color="gray.400" fontSize="sm">JPG, PNG, MP4 — Max 20MB</Text>
                </Stack>
              </Box>
            ) : (
              <Box
                rounded="2xl"
                overflow="hidden"
                shadow="md"
                bg="gray.50"
                p={2}
                position="relative"
              >
                <Box position="absolute" top={4} right={4} zIndex={5}>
                  <Button size="xs" colorPalette="red" onClick={(e) => { e.stopPropagation(); setPreview(null); }}>Change</Button>
                </Box>
                {preview.file.type.startsWith('video') ? (
                  <video src={preview.url} style={{ maxHeight: '400px', width: '100%', borderRadius: '12px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} controls />
                ) : (
                  <img src={preview.url} alt="preview" style={{ maxHeight: '400px', width: '100%', objectFit: 'contain', borderRadius: '12px', margin: '0 auto' }} />
                )}
                <Text textAlign="center" fontSize="sm" color="gray.500" mt={2}>{preview.file.name}</Text>
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
              <Input
                placeholder="Write a sweet caption... 💕"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                _focus={{ borderColor: 'pink.400' }}
                size="lg"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                rounded="xl"
                flex={1}
              />
              <Button
                size="lg"
                bgGradient="linear(to-r, pink.400, purple.500)"
                _hover={{ bgGradient: "linear(to-r, pink.500, purple.600)", transform: "translateY(-2px)", shadow: "lg" }}
                color="white"
                onClick={handleUpload}
                loading={uploading}
                loadingText="Uploading..."
                disabled={!preview}
                width={{ base: 'full', md: '200px' }}
                rounded="xl"
                fontWeight="bold"
                transition="all 0.2s"
              >
                Upload Memory 💾
              </Button>
            </Flex>
          </Stack>
        </Box>

        {/* Gallery Masonry-like Grid using CSS Columns */}
        {items.length === 0 ? (
          <Box textAlign="center" py={16} bg="whiteAlpha.600" rounded="3xl">
            <Text fontSize="6xl" mb={4}>🌸</Text>
            <Heading size="md" color="gray.500" mb={2}>No memories yet</Heading>
            <Text color="gray.400">Upload your first photo or video together!</Text>
          </Box>
        ) : (
          <Box
            sx={{
              columnCount: [1, 2, 3],
              columnGap: '20px',
            }}
          >
            {items.map((item, index) => (
              <MotionBox
                key={item._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                mb="20px"
                bg="white"
                rounded="2xl"
                overflow="hidden"
                shadow="md"
                cursor="pointer"
                _hover={{ shadow: '2xl', transform: 'scale(1.02)' }}
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
                      bg="blackAlpha.600" rounded="full" p={3}
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

                <Box p={4} bg="white">
                  {item.caption && (
                    <Text fontSize="md" color="gray.800" fontWeight="medium" mb={2}>{item.caption}</Text>
                  )}
                  <Flex justify="space-between" align="center">
                    <Text fontSize="xs" color="gray.400">
                      {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : ''}
                    </Text>
                    <Text fontSize="xs" color="pink.400" fontWeight="bold">{item.uploaderName}</Text>
                  </Flex>
                </Box>

                {/* Delete button */}
                <Button
                  position="absolute"
                  top={3}
                  right={3}
                  size="xs"
                  colorPalette="red"
                  rounded="full"
                  onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                  bg="red.500"
                  color="white"
                  _hover={{ opacity: 1 }}
                  shadow="lg"
                >
                  ✕
                </Button>
              </MotionBox>
            ))}
          </Box>
        )}
      </Box>

      {/* Lightbox */}
      {lightbox && (
        <Box
          position="fixed" inset={0} bg="blackAlpha.900" zIndex={1000}
          display="flex" alignItems="center" justifyContent="center"
          onClick={() => setLightbox(null)}
          p={4}
          backdropFilter="blur(5px)"
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
                style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
              />
            ) : (
              <img
                src={getMediaUrl(lightbox.filename)}
                alt={lightbox.caption}
                style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '16px', objectFit: 'contain', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
              />
            )}
            {lightbox.caption && (
              <Box bg="blackAlpha.800" color="white" px={6} py={3} rounded="full" mt={4} textAlign="center" position="absolute" bottom="-60px" left="50%" transform="translateX(-50%)">
                <Text fontSize="lg">{lightbox.caption}</Text>
              </Box>
            )}
            <IconButton
              aria-label="Close"
              position="absolute" top={-12} right={-12}
              rounded="full" size="lg" bg="whiteAlpha.200" color="white"
              onClick={() => setLightbox(null)}
              _hover={{ bg: 'whiteAlpha.400' }}
            >
              ✕
            </IconButton>
          </MotionBox>
        </Box>
      )}
    </DreamyBackground>
  );
};

export default GalleryPage;

