import { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Flex, Grid, Heading, Input, Text, Badge, Textarea,
  Select, IconButton, Stack, Link, Checkbox
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/axiosConfig';
import DreamyBackground from '../components/DreamyBackground';
import { useAuth } from '../context/AuthContext';

const MotionBox = motion(Box);

const PRIORITY_COLORS = {
  high: 'red',
  medium: 'purple',
  low: 'cyan',
};

// Use environment variable for server URL
const SERVER_URL = import.meta.env.VITE_SOCKET_URL || `http://${window.location.hostname}:5000`;

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
    <DreamyBackground>
      {/* Navbar / Header */}
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
          <Button
            size="sm"
            variant="ghost"
            rounded="full"
            onClick={() => navigate('/')}
          >
            ← Back
          </Button>
          <Heading size="md" fontFamily="'Playfair Display', serif" color="purple.800">
            Our Dreams ✨
          </Heading>
        </Flex>
        <Button
          colorPalette="purple"
          rounded="full"
          shadow="md"
          _hover={{ transform: 'scale(1.05)' }}
          onClick={() => setIsModalOpen(true)}
        >
          + New Dream
        </Button>
      </Flex>

      <Box maxW="1200px" mx="auto" p={6}>
        {loading ? (
          <Flex justify="center" py={20}>
            <Text color="purple.500">Loading dreams...</Text>
          </Flex>
        ) : items.length === 0 ? (
          <Flex direction="column" align="center" justify="center" py={20} textAlign="center">
            <Text fontSize="6xl" mb={4}>☁️</Text>
            <Heading size="lg" color="gray.500" mb={2}>No dreams added yet</Heading>
            <Text color="gray.400">Start building your future together!</Text>
            <Button mt={6} colorPalette="purple" variant="outline" onClick={() => setIsModalOpen(true)}>
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
                  bg="white"
                  rounded="2xl"
                  shadow="lg"
                  overflow="hidden"
                  position="relative"
                  _hover={{ shadow: '2xl', transform: 'translateY(-4px)' }}
                  display="flex"
                  flexDirection="column"
                >
                  {/* Status Banner */}
                  {item.isCompleted && (
                    <Box bg="green.400" color="white" px={3} py={1} fontSize="xs" fontWeight="bold" textAlign="center">
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
                      <Badge colorPalette={PRIORITY_COLORS[item.priority]} variant="subtle" rounded="full" px={2}>
                        {item.priority}
                      </Badge>
                      <Text fontSize="xs" color="gray.400" textTransform="uppercase" fontWeight="bold">
                        {item.category}
                      </Text>
                    </Flex>

                    <Heading
                      size="md"
                      fontFamily="'Playfair Display', serif"
                      mb={2}
                      color={item.isCompleted ? 'green.600' : 'gray.800'}
                      textDecoration={item.isCompleted ? 'line-through' : 'none'}
                    >
                      {item.title}
                    </Heading>

                    <Text fontSize="sm" color="gray.600" mb={4} noOfLines={3}>
                      {item.description}
                    </Text>

                    {item.estimatedCost > 0 && (
                      <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={2}>
                        💰 Est. Cost: ${item.estimatedCost}
                      </Text>
                    )}

                    {item.link && (
                      <Link
                        href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                        isExternal
                        color="purple.500"
                        fontSize="sm"
                        fontWeight="medium"
                        display="block"
                        mb={4}
                      >
                        🔗 View Link
                      </Link>
                    )}
                  </Box>

                  {/* Actions */}
                  <Flex
                    p={4}
                    borderTop="1px solid"
                    borderColor="gray.100"
                    justify="space-between"
                    align="center"
                    bg="gray.50"
                  >
                    <Checkbox
                      isChecked={item.isCompleted}
                      onChange={() => toggleComplete(item._id, item.isCompleted)}
                      colorPalette="green"
                    >
                      <Text fontSize="sm" fontWeight="medium" color={item.isCompleted ? "green.600" : "gray.600"}>
                        {item.isCompleted ? 'Done!' : 'Mark Done'}
                      </Text>
                    </Checkbox>
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
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
          bg="blackAlpha.600" zIndex={100}
          display="flex" alignItems="center" justifyContent="center"
          p={4}
        >
          <Box
            bg="white" rounded="2xl" shadow="2xl"
            w="full" maxW="500px"
            maxH="90vh" overflowY="auto"
            position="relative"
          >
            <Box p={6}>
              <Heading size="lg" mb={6} fontFamily="'Playfair Display', serif" color="purple.600">
                Add a New Dream ✨
              </Heading>

              <Stack gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1}>Title</Text>
                  <Input
                    name="title"
                    placeholder="e.g. Trip to Paris"
                    value={formData.title}
                    onChange={handleInputChange}
                    focusBorderColor="purple.400"
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1}>Description</Text>
                  <Textarea
                    name="description"
                    placeholder="Why do we want this?"
                    value={formData.description}
                    onChange={handleInputChange}
                    focusBorderColor="purple.400"
                  />
                </Box>

                <Flex gap={4}>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>Priority</Text>
                    <Select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Select>
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>Category</Text>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="other">Other</option>
                      <option value="travel">Travel</option>
                      <option value="experience">Experience</option>
                      <option value="gift">Gift</option>
                    </Select>
                  </Box>
                </Flex>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1}>Est. Cost ($)</Text>
                  <Input
                    name="estimatedCost"
                    type="number"
                    placeholder="0.00"
                    value={formData.estimatedCost}
                    onChange={handleInputChange}
                    focusBorderColor="purple.400"
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1}>Link (Optional)</Text>
                  <Input
                    name="link"
                    placeholder="https://..."
                    value={formData.link}
                    onChange={handleInputChange}
                    _focus={{ borderColor: 'purple.400' }}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={1}>Image (Optional)</Text>
                  <Flex gap={2} align="center">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      loading={uploading}
                      size="sm"
                      width="full"
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
                    <Text fontSize="xs" color="green.500" mt={1}>Image uploaded!</Text>
                  )}
                </Box>

                <Flex mt={4} justify="flex-end" gap={3}>
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button colorPalette="purple" onClick={handleSubmit} loading={uploading}>
                    Save Dream
                  </Button>
                </Flex>
              </Stack>
            </Box>
          </Box>
        </Box>
      )}
    </DreamyBackground>
  );
};

export default WishlistPage;




