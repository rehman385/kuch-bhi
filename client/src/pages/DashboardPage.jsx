import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Button, Flex, Grid, Heading, Input, Text, Badge, Icon
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { format, differenceInDays } from 'date-fns';
import FloatingHearts from '../components/FloatingHearts';
import DreamyBackground from '../components/DreamyBackground';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);

// Mood emojis
const MOODS = ['😊', '🥰', '😴', '😤', '🤒', '😭', '🤪', '🥳'];

const DashboardCard = ({ to, emoji, title, description, color, delay }) => {
  return (
    <Box
      as={RouterLink}
      to={to}
      position="relative"
      display="block"
      height="100%"
      textDecoration="none"
      _hover={{ textDecoration: 'none' }}
    >
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: [0.43, 0.13, 0.23, 0.96] }}
        whileHover={{ y: -10, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        h="100%"
        bg="rgba(255, 255, 255, 0.65)"
        backdropFilter="blur(20px)"
        border="1px solid rgba(255, 255, 255, 0.8)"
        rounded="3xl"
        p={8}
        shadow="xl"
        overflow="hidden"
        _hover={{ shadow: '2xl', borderColor: 'white' }}
        display="flex"
        flexDirection="column"
      >
        {/* Background Gradient Blob */}
        <Box
          position="absolute"
          top="-60px"
          right="-60px"
          w="180px"
          h="180px"
          bg={`radial-gradient(circle, ${color} 0%, transparent 70%)`}
          opacity={0.4}
          filter="blur(40px)"
        />
        
        <Text fontSize="5xl" mb={4}>{emoji}</Text>
        <Heading size="lg" fontFamily="'Playfair Display', serif" color="gray.800" mb={3}>
          {title}
        </Heading>
        <Text fontSize="md" color="gray.600" lineHeight="tall" fontFamily="'Outfit', sans-serif" mb={6}>
          {description}
        </Text>
        
        <Flex mt="auto" align="center" color="gray.400" fontSize="sm" fontWeight="bold">
          OPEN <Box as="span" ml={2}>→</Box>
        </Flex>
      </MotionBox>
    </Box>
  );
};

const DashboardPage = () => {
  const { user, logout, updateMood } = useAuth();
  const [currentMood, setCurrentMood] = useState(user?.mood || '😊');
  const [moodNote, setMoodNote] = useState(user?.moodNote || '');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [daysTogether, setDaysTogether] = useState(0);

  // Calculate days together
  useEffect(() => {
    // START DATE: March 9, 2026 (as per user request)
    const start = new Date('2026-03-09');
    const now = new Date();
    const diff = differenceInDays(now, start);
    setDaysTogether(diff > 0 ? diff : 0); 
  }, []);

  const handleMoodSelect = (mood) => {
    setCurrentMood(mood);
    updateMood(mood, moodNote);
  };

  const saveNote = () => {
    updateMood(currentMood, moodNote);
    setIsEditingNote(false);
  };

  return (
    <DreamyBackground>
      {/* Floating Particles */}
      <FloatingHearts />
      
      {/* Navbar */}
      <Flex
        as="nav"
        position="sticky"
        top={0}
        zIndex={50}
        px={{ base: 4, md: 8 }}
        py={4}
        justify="space-between"
        align="center"
        bg="rgba(255,255,255,0.0)"
      >
        <Heading 
          size="md" 
          fontFamily="'Playfair Display', serif"
          bgGradient="linear(to-r, pink.500, purple.600)" 
          bgClip="text"
        >
          Our Space
        </Heading>
        <Button 
          onClick={logout} 
          variant="ghost" 
          size="sm" 
          color="gray.600"
          _hover={{ bg: 'whiteAlpha.500' }}
        >
          Logout
        </Button>
      </Flex>

      <Box maxW="1200px" mx="auto" px={{ base: 6, md: 10 }} pb={20} pt={4} position="relative" zIndex={1}>
        
        {/* Hero Section */}
        <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between" mb={12} gap={8}>
          <Box flex={1} textAlign={{ base: 'center', md: 'left' }}>
            <MotionText
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              color="gray.500"
              fontSize="lg"
              fontWeight="medium"
              mb={2}
            >
              Have a beautiful day,
            </MotionText>
            <MotionBox
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Heading 
                size="4xl" 
                fontFamily="'Playfair Display', serif" 
                color="gray.800"
                lineHeight="1.2"
                mb={4}
              >
                {user?.name || 'My Love'}
              </Heading>
            </MotionBox>
            
            {/* Days Counter Badge */}
            <MotionBox
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.5, delay: 0.5 }}
               display="inline-flex"
               alignItems="center"
               bg="white"
               px={5}
               py={2}
               rounded="full"
               shadow="md"
               color="pink.500"
               fontWeight="bold"
               fontSize="sm"
            >
               💑 Together for {daysTogether} days
            </MotionBox>
          </Box>

          {/* Mood Tracker Card */}
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            bg="rgba(255, 255, 255, 0.7)"
            backdropFilter="blur(20px)"
            p={6}
            rounded="3xl"
            shadow="lg"
            maxW="400px"
            w="full"
            border="1px solid white"
          >
            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="widest" mb={4} textAlign="center">
              Daily Mood Check-in
            </Text>
            
            <Grid templateColumns="repeat(4, 1fr)" gap={2} mb={4}>
              {MOODS.map((m) => (
                 <MotionBox
                  key={m}
                  as="button"
                  fontSize="2xl"
                  onClick={() => handleMoodSelect(m)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  p={2}
                  rounded="xl"
                  bg={currentMood === m ? 'pink.100' : 'transparent'}
                  transition="all 0.2s"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  {m}
                 </MotionBox>
              ))}
            </Grid>

            <Box borderTop="1px solid" borderColor="blackAlpha.100" pt={3}>
               {isEditingNote ? (
                 <Flex gap={2}>
                   <Input 
                     value={moodNote}
                     onChange={(e) => setMoodNote(e.target.value)}
                     placeholder="How do you feel?"
                     size="sm"
                     variant="filled"
                     bg="whiteAlpha.500"
                     autoFocus
                   />
                   <Button size="xs" colorPalette="pink" onClick={saveNote}>Save</Button>
                 </Flex>
               ) : (
                <Text 
                  fontSize="sm" 
                  color={moodNote ? "gray.700" : "gray.400"} 
                  fontStyle="italic"
                  cursor="pointer"
                  onClick={() => setIsEditingNote(true)}
                  textAlign="center"
                  _hover={{ color: "pink.500" }}
                >
                  {moodNote ? `"${moodNote}"` : "Tap to add a note..."}
                </Text>
               )}
            </Box>
          </MotionBox>
        </Flex>

        {/* Features Grid */}
        <Grid 
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} 
          gap={6}
          mb={16}
        >
          <DashboardCard 
            to="/chat"
            emoji="💌"
            title="Chat"
            description="Our private messages"
            color="rgba(255, 107, 157, 1)"
            delay={0.4}
          />
          <DashboardCard 
            to="/calendar"
            emoji="📅"
            title="Calendar"
            description="Special dates & plans"
            color="rgba(167, 139, 250, 1)"
            delay={0.5}
          />
          <DashboardCard 
            to="/gallery"
            emoji="📸"
            title="Gallery"
            description="Our favorite memories"
            color="rgba(132, 250, 176, 1)"
            delay={0.6}
          />
          <DashboardCard 
            to="/wishlist"
            emoji="✨"
            title="Wishlist"
            description="Dreams we share"
            color="rgba(251, 191, 36, 1)"
            delay={0.7}
          />
        </Grid>

        {/* Quote */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          textAlign="center"
          maxW="600px"
          mx="auto"
          px={4}
        >
           <Text fontFamily="'Playfair Display', serif" fontSize="xl" fontStyle="italic" color="gray.500">
             "I look at you and see the rest of my life in front of my eyes."
           </Text>
        </MotionBox>

      </Box>
    </DreamyBackground>
  );
};

export default DashboardPage;

