import { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Flex, Grid, Heading, Input, Text, Stack
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

// Use environment variable for server URL
const SERVER_URL = import.meta.env.VITE_SOCKET_URL || `http://${window.location.hostname}:5000`;

const GalleryPage = () => {
  const navigate = useNavigate();
  const { } = useAuth();
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
    <Box minH="100vh" bg="pink.50">
      {/* Header */}
      <Flex bg="white" px={6} py={4} shadow="sm" align="center" gap={3}>
        <Button size="sm" variant="ghost" onClick={() => navigate('/')}>← Back</Button>
        <Text fontSize="2xl">🖼️</Text>
        <Heading size="md" color="pink.500">Our Gallery</Heading>
      </Flex>

      <Box maxW="1100px" mx="auto" px={4} py={6}>

        {/* Upload Card */}
        <Box
          bg="white"
          rounded="3xl"
          p={8}
          shadow="lg"
          mb={8}
          border="1px solid"
          borderColor="pink.100"
          position="relative"
          overflow="hidden"
        >
          {/* Decorative background */}
          <Box position="absolute" top="-20px" right="-20px" w="100px" h="100px" bg="pink.50" rounded="full" filter="blur(30px)" />

          <Heading size="lg" color="gray.700" fontFamily="'Playfair Display', serif" mb={6}>📸 Add a New Memory</Heading>

          <Stack gap={6}>
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
              {preview ? (
                <Box>
                  {preview.file.type.startsWith('video') ? (
                    <video src={preview.url} style={{ maxHeight: '300px', maxWidth: '100%', borderRadius: '16px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} controls />
                  ) : (
                    <img src={preview.url} alt="preview" style={{ maxHeight: '300px', maxWidth: '100%', borderRadius: '16px', margin: '0 auto', objectFit: 'contain', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  )}
                  <Flex justify="center" align="center" mt={3} gap={2}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">{preview.file.name}</Text>
                    <Button size="xs" variant="ghost" colorPalette="red" onClick={(e) => { e.stopPropagation(); setPreview(null); }}>Change</Button>
                  </Flex>
                </Box>
              ) : (
                <Stack align="center" spacing={3}>
                  <Box bg="white" p={4} rounded="full" shadow="sm">
                    <Text fontSize="4xl">📷</Text>
                  </Box>
                  <Text color="gray.600" fontSize="lg" fontWeight="medium">Click to choose a photo or video</Text>
                  <Text color="gray.400" fontSize="sm">JPG, PNG, MP4 — Max 20MB</Text>
                </Stack>
              )}
            </Box>

            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/mp4"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <Stack direction={{ base: 'column', sm: 'row' }} gap={3}>
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
                flex={2}
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
                flex={1}
                rounded="xl"
                fontWeight="bold"
                transition="all 0.2s"
              >
                Upload Memory 💾
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Gallery Grid */}
        {items.length === 0 ? (
          <Box textAlign="center" py={16}>
            <Text fontSize="5xl" mb={4}>🌸</Text>
            <Heading size="md" color="gray.400">No memories yet</Heading>
            <Text color="gray.400" mt={2}>Upload your first photo or video together!</Text>
          </Box>
        ) : (
          <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }} gap={3}>
            {items.map((item, index) => (
              <Box
                key={item._id}
                data-aos="fade-up"
                data-aos-delay={index * 50}
                rounded="xl"
                overflow="hidden"
                shadow="md"
                bg="white"
                position="relative"
                cursor="pointer"
                _hover={{ shadow: 'xl', transform: 'scale(1.02)' }}
                transition="all 0.2s"
                onClick={() => setLightbox(item)}
              >
                {item.mimetype?.startsWith('video') ? (
                  <Box position="relative">
                    <video
                      src={getMediaUrl(item.filename)}
                      style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                    />
                    <Box
                      position="absolute" top="50%" left="50%"
                      transform="translate(-50%, -50%)"
                      bg="blackAlpha.600" rounded="full" p={2}
                    >
                      <Text fontSize="xl">▶️</Text>
                    </Box>
                  </Box>
                ) : (
                  <img
                    src={getMediaUrl(item.filename)}
                    alt={item.caption || 'memory'}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  />
                )}
                <Box p={2}>
                  {item.caption && (
                    <Text fontSize="xs" color="gray.600" noOfLines={1}>{item.caption}</Text>
                  )}
                  <Flex justify="space-between" align="center" mt={1}>
                    <Text fontSize="xs" color="gray.400">
                      {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : ''}
                    </Text>
                    <Text fontSize="xs" color="pink.400">{item.uploaderName}</Text>
                  </Flex>
                </Box>

                {/* Delete button */}
                <Button
                  position="absolute"
                  top={2}
                  right={2}
                  size="xs"
                  colorPalette="red"
                  rounded="full"
                  onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                  bg="red.500"
                  color="white"
                  _hover={{ opacity: 1 }}
                >
                  ✕
                </Button>
              </Box>
            ))}
          </Grid>
        )}
      </Box>

      {/* Lightbox */}
      {lightbox && (
        <Box
          position="fixed" inset={0} bg="blackAlpha.900" zIndex={1000}
          display="flex" alignItems="center" justifyContent="center"
          onClick={() => setLightbox(null)}
          p={4}
        >
          <Box onClick={(e) => e.stopPropagation()} maxW="90vw" maxH="90vh" position="relative">
            {lightbox.mimetype?.startsWith('video') ? (
              <video
                src={getMediaUrl(lightbox.filename)}
                controls autoPlay
                style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '12px' }}
              />
            ) : (
              <img
                src={getMediaUrl(lightbox.filename)}
                alt={lightbox.caption}
                style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '12px', objectFit: 'contain' }}
              />
            )}
            {lightbox.caption && (
              <Box bg="blackAlpha.700" color="white" px={4} py={2} rounded="lg" mt={2} textAlign="center">
                <Text fontSize="sm">{lightbox.caption}</Text>
              </Box>
            )}
            <Button
              position="absolute" top={-4} right={-4}
              rounded="full" size="sm" bg="white" color="gray.700"
              onClick={() => setLightbox(null)}
            >
              ✕
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GalleryPage;










