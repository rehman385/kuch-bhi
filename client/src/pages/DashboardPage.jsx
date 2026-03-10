import { useState, useEffect } from 'react';
import {
  Box, Flex, Text, Heading, SimpleGrid, Stat, Badge, IconButton, Stack
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { differenceInDays } from 'date-fns';
import DreamyBackground from '../components/DreamyBackground';

// Icons need to be text or images if I don't have an icon library installed,
// using emoji for now as per previous design pattern
// But let's check package.json for icons? No icons listed in dependencies.
// Sticking to Emojis/Text for robusteness.

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const MENU_ITEMS = [
  { title: 'Our Chat', emoji: '💬', path: '/chat', desc: 'Private conversations', color: 'pink' },
  { title: 'Calendar', emoji: '📅', path: '/calendar', desc: 'Special dates', color: 'purple' },
  { title: 'Gallery', emoji: '📸', path: '/gallery', desc: 'Our memories', color: 'teal' },
  { title: 'Dreams', emoji: '✨', path: '/wishlist', desc: 'Future goals', color: 'yellow' },
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
    <DreamyBackground>
      <Box minH="100vh" p={{ base: 4, md: 8 }} pb={20}>
        {/* ── Header ──────────────────────────────────────────── */}
        <Flex justify="space-between" align="center" mb={10} bg="rgba(255,255,255,0.7)" backdropFilter="blur(10px)" p={4} rounded="2xl" shadow="sm">
          <Box>
            <Text fontSize="sm" color="gray.500" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
              {greeting},
            </Text>
            <Heading size="lg" fontFamily="'Playfair Display', serif" bgGradient="linear(to-r, pink.500, purple.500)" bgClip="text">
              {user?.name || 'Love'}
            </Heading>
          </Box>
          <IconButton
            onClick={handleLogout}
            aria-label="Logout"
            variant="ghost"
            rounded="full"
            color="red.400"
            _hover={{ bg: 'red.50', color: 'red.600' }}
            fontSize="xl"
          >
            🚪
          </IconButton>
        </Flex>

        {/* ── Hero Card ───────────────────────────────────────── */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          bgGradient="linear(to-br, #fbc2eb 0%, #a6c1ee 100%)"
          rounded="3xl"
          p={8}
          mb={10}
          shadow="xl"
          textAlign="center"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM36 0V4h-2V0h-4v2h4v4h2V2h4V0h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.4
          }}
        >
          {/* Animated decorative circles */}
          <motion.div
            style={{ position: 'absolute', top: '-30px', left: '-30px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', filter: 'blur(30px)' }}
            animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', filter: 'blur(40px)' }}
            animate={{ scale: [1, 1.3, 1], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            style={{ position: 'absolute', top: '40%', left: '50%', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(20px)' }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          <Text fontSize="lg" color="white" fontWeight="bold" mb={2} letterSpacing="wider" textTransform="uppercase" textShadow="0 2px 4px rgba(0,0,0,0.1)">
            Together For
          </Text>
          <Heading
            fontSize={{ base: '6xl', md: '8xl' }}
            color="white"
            fontWeight="black"
            textShadow="0 8px 20px rgba(0,0,0,0.15)"
            lineHeight="1"
            mb={2}
          >
            {timeTogether}
          </Heading>
          <Text fontSize="2xl" color="white" mb={6} fontFamily="'Playfair Display', serif" fontWeight="medium">Days of Love</Text>

          <Badge
            bg="rgba(255,255,255,0.25)"
            backdropFilter="blur(5px)"
            color="white"
            px={6} py={2}
            rounded="full"
            fontSize="sm"
            border="1px solid rgba(255,255,255,0.4)"
            boxShadow="0 4px 10px rgba(0,0,0,0.05)"
          >
            Since March 9, 2026 ❤️
          </Badge>
        </MotionBox>

        {/* ── Grid Menu ───────────────────────────────────────── */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={5} mb={10}>
          {MENU_ITEMS.map((item, index) => (
            <MotionBox
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              bg="rgba(255, 255, 255, 0.6)"
              backdropFilter="blur(20px)"
              p={6}
              rounded="3xl"
              shadow="lg"
              cursor="pointer"
              textAlign="center"
              border="1px solid"
              borderColor="white"
              height="180px"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(135deg, ${item.color === 'pink' ? '#fbcfe8' : item.color === 'purple' ? '#e9d5ff' : item.color === 'teal' ? '#99f6e4' : '#fef08a'} 0%, transparent 100%)`,
                opacity: 0.1,
                zIndex: 0
              }}
            >
              <Box position="relative" zIndex={1}>
                <Text
                  fontSize="5xl"
                  mb={3}
                  style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
                  as={motion.p}
                  whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {item.emoji}
                </Text>
                <Text fontWeight="bold" color="gray.700" fontSize="lg" mb={1}>{item.title}</Text>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">{item.desc}</Text>
              </Box>
            </MotionBox>
          ))}
        </SimpleGrid>

        {/* ── Daily Mood (Mockup) ─────────────────────────────── */}
        <Box
          bg="rgba(255, 255, 255, 0.6)"
          backdropFilter="blur(20px)"
          rounded="3xl"
          p={8}
          shadow="lg"
          border="1px solid"
          borderColor="white"
          textAlign="center"
        >
          <Heading size="md" mb={4} fontFamily="'Playfair Display', serif" color="gray.700">
            How are you feeling today?
          </Heading>
          <Flex justify="space-around">
            {['🥰', '😊', '😐', '😢', '😤'].map((emoji) => (
              <MotionBox
                key={emoji}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                fontSize="3xl"
                cursor="pointer"
                filter="grayscale(100%)"
                transition="all 0.2s"
                _hover={{ filter: 'grayscale(0%)' }}
              >
                {emoji}
              </MotionBox>
            ))}
          </Flex>
        </Box>

      </Box>
    </DreamyBackground>
  );
};

export default DashboardPage;

