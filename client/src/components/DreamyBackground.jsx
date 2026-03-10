import { Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const DreamyBackground = ({ children }) => {
  return (
    <Box
      minH="100vh"
      w="100%"
      position="relative"
      overflowX="hidden"
      bg="linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)" // Fallback
      className="dreamy-bg"
    >
      {/* Animated Gradient Background */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)"
        opacity="0.3"
        zIndex="0"
      />

      {/* Floating Blobs for elegance */}
      <MotionBox
        position="absolute"
        top="-10%"
        left="-10%"
        w="400px"
        h="400px"
        bg="radial-gradient(circle, rgba(238,174,202,0.4) 0%, rgba(148,187,233,0) 70%)"
        filter="blur(60px)"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        zIndex="0"
      />

      <MotionBox
        position="absolute"
        bottom="-10%"
        right="-10%"
        w="500px"
        h="500px"
        bg="radial-gradient(circle, rgba(168,144,254,0.3) 0%, rgba(148,187,233,0) 70%)"
        filter="blur(80px)"
        animate={{
          x: [0, -30, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        zIndex="0"
      />

      <Box position="relative" zIndex="1" w="100%" h="full">
        {children}
      </Box>
    </Box>
  );
};

export default DreamyBackground;



