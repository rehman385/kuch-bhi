import { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Flex, Grid, Heading, Input, Text, Badge, Textarea,
  Select, IconButton, Stack, Link, Checkbox
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

const MotionBox = motion(Box);

const PRIORITY_COLORS = {
  high: 'red',
  medium: 'purple',
  low: 'cyan',
};

// Use environment variable for server URL
const SERVER_URL = import.meta.env.VITE_SOCKET_URL || `http://${window.location.hostname}:5000`;

// ── Floating Particles Config ──────────────────────────────────────────
const hearts = [
  { left: '10%', bottom: '15%', size: '14px', duration: 7,   delay: 0,   char: '✨' },
  { left: '25%', bottom: '5%',  size: '18px', duration: 6,   delay: 2,   char: '⭐' },
  { left: '60%', bottom: '10%', size: '12px', duration: 8,   delay: 1,   char: '💭' },
  { left: '85%', bottom: '20%', size: '16px', duration: 5,   delay: 0.5, char: '💕' },
  { left: '50%', bottom: '2%',  size: '10px', duration: 9,   delay: 3,   char: '💖' },
];

const WishlistPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'other',
    estimatedCost: '',
    link: '',
    image: ''
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setItems(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      // Reusing chat upload endpoint for generic image upload
      const { data } = await api.post('/chat/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData(prev => ({ ...prev, image: data.url }));
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) return;

    try {
      await api.post('/wishlist', formData);
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'other',
        estimatedCost: '',
        link: '',
        image: ''
      });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    try {
      await api.put(`/wishlist/${id}`, { isCompleted: !currentStatus });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (id) => {
    if(!window.confirm('Remove this dream?')) return;
    try {
      await api.delete(`/wishlist/${id}`);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${SERVER_URL}${path}`;
  };

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
        bg="rgba(255,255,255,0.05)"
        backdropFilter="blur(16px)"
        borderBottom="1px solid rgba(255,255,255,0.1)"
        px={6} py={4}
        align="center"
        justify="space-between"
        position="sticky"
        top={0}
        zIndex={50}
      >
        <Flex align="center" gap={3}>
          <Button
            size="sm"
            variant="ghost"
            rounded="full"
            color="whiteAlpha.800"
            _hover={{ bg: 'whiteAlpha.200', transform: 'translateX(-2px)' }}
            onClick={() => navigate('/')}
          >
            ← Back
          </Button>
          <Heading size="md" bgGradient="linear(to-r, #f472b6, #a855f7)" bgClip="text" fontFamily="'Playfair Display', serif">
            Our Dreams ✨
          </Heading>
        </Flex>
        <Button
          rounded="full"
          bgGradient="linear(to-r, #f472b6, #a855f7)"
          _hover={{ bgGradient: "linear(to-r, #ec4899, #9333ea)", transform: 'scale(1.05)' }}
          color="white"
          shadow="lg"
          onClick={() => setIsModalOpen(true)}
        >
          + New Dream
        </Button>
      </Flex>

      <Box maxW="1200px" mx="auto" p={6} position="relative" zIndex={1}>
        {loading ? (
          <Flex justify="center" py={20}>
            <Text color="whiteAlpha.600">Loading dreams...</Text>
          </Flex>
        ) : items.length === 0 ? (
          <Flex direction="column" align="center" justify="center" py={20} textAlign="center">
            <Text fontSize="6xl" mb={4}>☁️</Text>
            <Heading size="lg" color="whiteAlpha.700" mb={2}>No dreams added yet</Heading>
            <Text color="whiteAlpha.500">Start building your future together!</Text>
            <Button mt={6} variant="outline" color="white" _hover={{ bg: 'whiteAlpha.100' }} onClick={() => setIsModalOpen(true)}>
              Add First Wish
            </Button>
          </Flex>
        ) : (
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap={6}
          >
            <AnimatePresence>
              {items.map((item, index) => (
                <MotionBox
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  bg="rgba(255, 255, 255, 0.05)"
                  backdropFilter="blur(16px)"
                  rounded="2xl"
                  shadow="lg"
                  overflow="hidden"
                  position="relative"
                  border="1px solid rgba(255,255,255,0.1)"
                  _hover={{ shadow: '2xl', transform: 'translateY(-4px)', borderColor: 'rgba(255,255,255,0.25)' }}
                  display="flex"
                  flexDirection="column"
                >
                  {/* Status Banner */}
                  {item.isCompleted && (
                    <Box bg="green.500" color="white" px={3} py={1} fontSize="xs" fontWeight="bold" textAlign="center">
                      DREAM ACHIEVED 🎉
                    </Box>
                  )}

                  {/* Image */}
                  {getImageUrl(item.image) && (
                    <Box h="200px" overflow="hidden">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  )}

                  {/* Content */}
                  <Box p={5} flex={1}>
                    <Flex justify="space-between" align="start" mb={2}>
                      <Badge colorPalette={PRIORITY_COLORS[item.priority]} variant="solid" rounded="full" px={2}>
                        {item.priority}
                      </Badge>
                      <Text fontSize="xs" color="whiteAlpha.500" textTransform="uppercase" fontWeight="bold">
                        {item.category}
                      </Text>
                    </Flex>

                    <Heading
                      size="md"
                      fontFamily="'Playfair Display', serif"
                      mb={2}
                      color={item.isCompleted ? 'green.300' : 'whiteAlpha.900'}
                      textDecoration={item.isCompleted ? 'line-through' : 'none'}
                    >
                      {item.title}
                    </Heading>

                    <Text fontSize="sm" color="whiteAlpha.700" mb={4} noOfLines={3}>
                      {item.description}
                    </Text>

                    {item.estimatedCost > 0 && (
                      <Text fontSize="sm" fontWeight="bold" color="whiteAlpha.600" mb={2}>
                        💰 Est. Cost: ${item.estimatedCost}
                      </Text>
                    )}

                    {item.link && (
                      <Link
                        href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                        isExternal
                        color="purple.300"
                        fontSize="sm"
                        fontWeight="medium"
                        display="block"
                        mb={4}
                        _hover={{ textDecoration: 'underline', color: 'purple.200' }}
                      >
                        🔗 View Link
                      </Link>
                    )}
                  </Box>

                  {/* Actions */}
                  <Flex
                    p={4}
                    borderTop="1px solid"
                    borderColor="whiteAlpha.100"
                    justify="space-between"
                    align="center"
                    bg="rgba(0,0,0,0.2)"
                  >
                    <Checkbox
                      isChecked={item.isCompleted}
                      onChange={() => toggleComplete(item._id, item.isCompleted)}
                      colorPalette="green"
                      color="whiteAlpha.800"
                    >
                      <Text fontSize="sm" fontWeight="medium" color={item.isCompleted ? "green.300" : "whiteAlpha.700"}>
                        {item.isCompleted ? 'Done!' : 'Mark Done'}
                      </Text>
                    </Checkbox>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      color="red.300"
                      _hover={{ bg: 'whiteAlpha.100', color: 'red.200' }}
                      onClick={() => deleteItem(item._id)}
                    >
                      Delete
                    </Button>
                  </Flex>
                </MotionBox>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </Box>

      {/* Add Item Modal */}
      {isModalOpen && (
        <Box
          position="fixed" top={0} left={0} w="100%" h="100%"
          bg="rgba(0,0,0,0.8)" zIndex={100}
          display="flex" alignItems="center" justifyContent="center"
          p={4}
          backdropFilter="blur(5px)"
        >
          <Box
            bg="#1a0533" // Dark modal background
            rounded="2xl" shadow="2xl"
            w="full" maxW="500px"
            maxH="90vh" overflowY="auto"
            position="relative"
            border="1px solid rgba(255,255,255,0.2)"
          >
            <Box p={6}>
              <Heading size="lg" mb={6} fontFamily="'Playfair Display', serif" color="whiteAlpha.900">
                Add a New Dream ✨
              </Heading>

              <Stack gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1} color="whiteAlpha.700">Title</Text>
                  <Input
                    name="title"
                    placeholder="e.g. Trip to Paris"
                    value={formData.title}
                    onChange={handleInputChange}
                    bg="rgba(255,255,255,0.05)"
                    border="none"
                    color="white"
                    _focus={{ boxShadow: '0 0 0 2px #a855f7' }}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1} color="whiteAlpha.700">Description</Text>
                  <Textarea
                    name="description"
                    placeholder="Why do we want this?"
                    value={formData.description}
                    onChange={handleInputChange}
                    bg="rgba(255,255,255,0.05)"
                    border="none"
                    color="white"
                    _focus={{ boxShadow: '0 0 0 2px #a855f7' }}
                  />
                </Box>

                <Flex gap={4}>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="bold" mb={1} color="whiteAlpha.700">Priority</Text>
                    <Select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      bg="rgba(255,255,255,0.05)"
                      border="none"
                      color="white"
                    >
                      <option style={{ color: 'black' }} value="low">Low</option>
                      <option style={{ color: 'black' }} value="medium">Medium</option>
                      <option style={{ color: 'black' }} value="high">High</option>
                    </Select>
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="bold" mb={1} color="whiteAlpha.700">Category</Text>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      bg="rgba(255,255,255,0.05)"
                      border="none"
                      color="white"
                    >
                      <option style={{ color: 'black' }} value="other">Other</option>
                      <option style={{ color: 'black' }} value="travel">Travel</option>
                      <option style={{ color: 'black' }} value="experience">Experience</option>
                      <option style={{ color: 'black' }} value="gift">Gift</option>
                    </Select>
                  </Box>
                </Flex>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1} color="whiteAlpha.700">Est. Cost ($)</Text>
                  <Input
                    name="estimatedCost"
                    type="number"
                    placeholder="0.00"
                    value={formData.estimatedCost}
                    onChange={handleInputChange}
                    bg="rgba(255,255,255,0.05)"
                    border="none"
                    color="white"
                    _focus={{ boxShadow: '0 0 0 2px #a855f7' }}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1} color="whiteAlpha.700">Link (Optional)</Text>
                  <Input
                    name="link"
                    placeholder="https://..."
                    value={formData.link}
                    onChange={handleInputChange}
                    bg="rgba(255,255,255,0.05)"
                    border="none"
                    color="white"
                    _focus={{ boxShadow: '0 0 0 2px #a855f7' }}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1} color="whiteAlpha.700">Image (Optional)</Text>
                  <Flex gap={2} align="center">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      loading={uploading}
                      size="sm"
                      width="full"
                      bg="whiteAlpha.200"
                      color="white"
                      _hover={{ bg: 'whiteAlpha.300' }}
                    >
                      {formData.image ? 'Change Image' : 'Upload Image'}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Flex>
                  {formData.image && (
                    <Text fontSize="xs" color="green.300" mt={1}>Image uploaded!</Text>
                  )}
                </Box>

                <Flex mt={4} justify="flex-end" gap={3}>
                  <Button variant="ghost" color="whiteAlpha.700" onClick={() => setIsModalOpen(false)} _hover={{ bg: 'whiteAlpha.100' }}>Cancel</Button>
                  <Button
                    bgGradient="linear(to-r, #f472b6, #a855f7)"
                    color="white"
                    _hover={{ opacity: 0.9 }}
                    onClick={handleSubmit}
                    loading={uploading}
                  >
                    Save Dream
                  </Button>
                </Flex>
              </Stack>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default WishlistPage;

