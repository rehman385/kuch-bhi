import { useState, useEffect } from 'react';
import {
  Box, Flex, Text, Heading, SimpleGrid, Badge, IconButton, Stack
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { differenceInDays } from 'date-fns';

const MotionBox = motion(Box);

const MENU_ITEMS = [
  { title: 'Our Chat', emoji: '💬', path: '/chat', desc: 'Message me', color: 'pink' },
  { title: 'Calendar', emoji: '📅', path: '/calendar', desc: 'Our dates', color: 'purple' },
  { title: 'Gallery', emoji: '📸', path: '/gallery', desc: 'Memories', color: 'teal' },
  { title: 'Dreams', emoji: '✨', path: '/wishlist', desc: 'Bucket list', color: 'yellow' },
];

// Floating particles configuration (same as Login)
const hearts = [
  { left: '5%',  bottom: '10%', size: '18px', duration: 4,   delay: 0,   char: '❤️' },
  { left: '25%', bottom: '5%',  size: '13px', duration: 5,   delay: 1,   char: '💕' },
  { left: '55%', bottom: '8%',  size: '20px', duration: 4.5, delay: 0.5, char: '❤️' },
  { left: '75%', bottom: '12%', size: '12px', duration: 6,   delay: 1.5, char: '💖' },
  { left: '90%', bottom: '6%',  size: '16px', duration: 3.5, delay: 0.8, char: '💕' },
  { left: '40%', bottom: '3%',  size: '10px', duration: 5.5, delay: 2,   char: '✨' },
];

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [timeTogether, setTimeTogether] = useState(0);
  const [greeting, setGreeting] = useState('');

  // Configurable Start Date
  const START_DATE = new Date('2026-03-09');

  useEffect(() => {
    const days = differenceInDays(new Date(), START_DATE);
    setTimeTogether(Math.max(0, days));

    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good Morning');
    else if (hours < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const handleLogout = () => {
    if (window.confirm('Leaving so soon? 🥺')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <Box minH="100vh" bg="#120822" position="relative" overflow="hidden" p={{ base: 4, md: 8 }} pb={20}>

      {/* ── Background Animation ────────────────────────────── */}
      <motion.div style={{ position:'absolute', inset:0, zIndex:0, background:'linear-gradient(135deg,#1a0533 0%,#2d1b69 40%,#0d3d56 100%)' }} />
      <motion.div style={{ position:'absolute', top:'-15%', left:'-15%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)', filter:'blur(60px)', zIndex:0 }} animate={{ x:[0,40,0], y:[0,30,0] }} transition={{ duration:12, repeat:Infinity, ease:'easeInOut' }} />
      <motion.div style={{ position:'absolute', bottom:'-10%', right:'-10%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', filter:'blur(80px)', zIndex:0 }} animate={{ x:[0,-30,0], y:[0,-40,0] }} transition={{ duration:15, repeat:Infinity, ease:'easeInOut' }} />

      {/* Floating Hearts */}
      <Box position="absolute" inset={0} zIndex={0} pointerEvents="none">
        {hearts.map((h, i) => (
          <motion.div
            key={i}
            style={{ position:'absolute', fontSize:h.size, opacity:0, left:h.left, bottom:h.bottom }}
            animate={{ y:[0,-150], opacity:[0,0.8,0], scale:[0.6,1.2,0.7] }}
            transition={{ duration:h.duration, repeat:Infinity, delay:h.delay, ease:'easeOut' }}
          >
            {h.char}
          </motion.div>
        ))}
      </Box>

      {/* ── Content Wrapper ───────────────────────────────── */}
      <Box position="relative" zIndex={1} maxW="1200px" mx="auto">

        {/* ── Header ──────────────────────────────────────────── */}
        <Flex
          justify="space-between"
          align="center"
          mb={8}
          bg="rgba(255,255,255,0.05)"
          backdropFilter="blur(16px)"
          p={4}
          rounded="2xl"
          border="1px solid rgba(255,255,255,0.1)"
        >
          <Box>
            <Text fontSize="xs" color="whiteAlpha.600" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">
              {greeting},
            </Text>
            <Heading size="md" fontFamily="'Playfair Display', serif" bgGradient="linear(to-r, #f472b6, #c084fc)" bgClip="text">
              {user?.name || 'Love'}
            </Heading>
          </Box>
          <IconButton
            onClick={handleLogout}
            aria-label="Logout"
            variant="ghost"
            rounded="full"
            color="whiteAlpha.700"
            _hover={{ bg: 'whiteAlpha.200', color: 'red.300' }}
            icon={<Text fontSize="xl">🚪</Text>}
          />
        </Flex>

        {/* ── Hero Card ───────────────────────────────────────── */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          bgGradient="linear(to-br, #f472b6 0%, #a855f7 50%, #6366f1 100%)"
          rounded="3xl"
          p={8}
          mb={8}
          shadow="0 20px 50px rgba(168, 85, 247, 0.3)"
          textAlign="center"
          position="relative"
          overflow="hidden"
          border="1px solid rgba(255,255,255,0.2)"
        >
          {/* Animated decorative circles inside card */}
          <motion.div
            style={{ position: 'absolute', top: '-30px', left: '-30px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', filter: 'blur(30px)' }}
            animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }}
            animate={{ scale: [1, 1.3, 1], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />

          <Text fontSize="sm" color="whiteAlpha.900" fontWeight="bold" mb={2} letterSpacing="widest" textTransform="uppercase">
            Together For
          </Text>
          <Heading
            fontSize={{ base: '6xl', md: '8xl' }}
            color="white"
            fontWeight="black"
            textShadow="0 10px 20px rgba(0,0,0,0.2)"
            lineHeight="1"
            mb={2}
          >
            {timeTogether}
          </Heading>
          <Text fontSize="2xl" color="whiteAlpha.900" mb={6} fontFamily="'Playfair Display', serif">Days of Love</Text>

          <Badge
            bg="rgba(0,0,0,0.2)"
            backdropFilter="blur(5px)"
            color="white"
            px={5} py={2}
            rounded="full"
            fontSize="xs"
            fontWeight="bold"
            border="1px solid rgba(255,255,255,0.2)"
          >
            Started March 9, 2026 ❤️
          </Badge>
        </MotionBox>

        {/* ── Grid Menu ───────────────────────────────────────── */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
          {MENU_ITEMS.map((item, index) => (
            <MotionBox
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              bg="rgba(255, 255, 255, 0.05)"
              backdropFilter="blur(20px)"
              p={5}
              rounded="2xl"
              border="1px solid rgba(255,255,255,0.08)"
              cursor="pointer"
              height="160px"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              position="relative"
              overflow="hidden"
              _hover={{ bg: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text
                fontSize="4xl"
                mb={3}
                style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}
                as={motion.p}
                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
              >
                {item.emoji}
              </Text>
              <Text fontWeight="bold" color="white" fontSize="md" mb={1}>{item.title}</Text>
              <Text fontSize="xs" color="whiteAlpha.500">{item.desc}</Text>
            </MotionBox>
          ))}
        </SimpleGrid>

        {/* ── Daily Mood ──────────────────────────────────────── */}
        <Box
          bg="rgba(255, 255, 255, 0.05)"
          backdropFilter="blur(20px)"
          rounded="2xl"
          p={6}
          border="1px solid rgba(255,255,255,0.08)"
          textAlign="center"
        >
          <Heading size="sm" mb={6} fontFamily="'Playfair Display', serif" color="whiteAlpha.900">
            How are you feeling today?
          </Heading>
          <Flex justify="space-between" px={2} maxW="400px" mx="auto">
            {['🥰', '😊', '😐', '😢', '😤'].map((emoji) => (
              <MotionBox
                key={emoji}
                whileHover={{ scale: 1.4, filter: 'grayscale(0%) drop-shadow(0 0 8px rgba(255,255,255,0.5))' }}
                whileTap={{ scale: 0.9 }}
                fontSize="3xl"
                cursor="pointer"
                filter="grayscale(100%) opacity(0.7)"
                transition="all 0.2s"
              >
                {emoji}
              </MotionBox>
            ))}
          </Flex>
        </Box>

      </Box>
    </Box>
  );
};

export default DashboardPage;

