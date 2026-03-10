import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Heading, Input, Link, Stack, Text, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const MotionBox = motion(Box);

const hearts = [
  { left: '8%',  bottom: '8%',  size: '18px', duration: 4,   delay: 0,   char: '❤️' },
  { left: '22%', bottom: '5%',  size: '13px', duration: 5,   delay: 1,   char: '💕' },
  { left: '48%', bottom: '6%',  size: '20px', duration: 4.5, delay: 0.5, char: '❤️' },
  { left: '68%', bottom: '10%', size: '12px', duration: 6,   delay: 1.5, char: '💖' },
  { left: '84%', bottom: '5%',  size: '16px', duration: 3.5, delay: 0.8, char: '💕' },
  { left: '38%', bottom: '2%',  size: '10px', duration: 5.5, delay: 2,   char: '✨' },
  { left: '15%', bottom: '15%', size: '11px', duration: 4.8, delay: 2.5, char: '🌸' },
  { left: '60%', bottom: '3%',  size: '14px', duration: 5.2, delay: 1.2, char: '💗' },
  { left: '75%', bottom: '18%', size: '9px',  duration: 6.5, delay: 3,   char: '⭐' },
  { left: '92%', bottom: '12%', size: '12px', duration: 4.2, delay: 0.3, char: '💫' },
];

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', registrationSecret: ''
  });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.registrationSecret);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      w="100%"
      position="relative"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="#120822"
    >
      {/* ── Background blobs ──────────────────────────────── */}
      <motion.div style={{ position:'absolute', inset:0, zIndex:0, background:'linear-gradient(135deg,#1a0533 0%,#2d1b69 40%,#0d3d56 100%)' }} />
      <motion.div style={{ position:'absolute', top:'-15%', left:'-15%', width:'480px', height:'480px', borderRadius:'50%', background:'radial-gradient(circle, rgba(236,72,153,0.35) 0%, transparent 70%)', filter:'blur(60px)', zIndex:0 }} animate={{ x:[0,40,0], y:[0,30,0] }} transition={{ duration:12, repeat:Infinity, ease:'easeInOut' }} />
      <motion.div style={{ position:'absolute', bottom:'-10%', right:'-10%', width:'560px', height:'560px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', filter:'blur(80px)', zIndex:0 }} animate={{ x:[0,-30,0], y:[0,-40,0] }} transition={{ duration:15, repeat:Infinity, ease:'easeInOut' }} />
      <motion.div style={{ position:'absolute', top:'40%', left:'40%', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)', filter:'blur(50px)', zIndex:0 }} animate={{ x:[0,25,-25,0], y:[0,-20,20,0] }} transition={{ duration:18, repeat:Infinity, ease:'easeInOut' }} />

      {/* ── Floating hearts ───────────────────────────────── */}
      <Box position="absolute" inset={0} zIndex={1} pointerEvents="none" overflow="hidden">
        {hearts.map((h, i) => (
          <motion.div
            key={i}
            style={{ position:'absolute', fontSize:h.size, opacity:0, left:h.left, bottom:h.bottom }}
            animate={{ y:[0,-130], opacity:[0,0.9,0], scale:[0.6,1.2,0.7] }}
            transition={{ duration:h.duration, repeat:Infinity, delay:h.delay, ease:'easeOut' }}
          >
            {h.char}
          </motion.div>
        ))}
      </Box>

      {/* ── Card ──────────────────────────────────────────── */}
      <MotionBox
        initial={{ opacity:0, y:50, scale:0.93 }}
        animate={{ opacity:1, y:0, scale:1 }}
        transition={{ duration:0.7, ease:[0.25,0.46,0.45,0.94] }}
        position="relative"
        zIndex={2}
        w="full"
        maxW={{ base:'calc(100% - 32px)', sm:'420px' }}
        mx="auto"
        bg="rgba(255,255,255,0.07)"
        backdropFilter="blur(30px)"
        border="1px solid rgba(255,255,255,0.13)"
        rounded="3xl"
        shadow="0 30px 60px rgba(0,0,0,0.6)"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          padding: '1px',
          background: 'linear-gradient(135deg, rgba(244,114,182,0.4), rgba(168,85,247,0.2), rgba(56,189,248,0.2))',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        {/* Rainbow top bar */}
        <Box h="3px" bgGradient="linear(to-r, #f472b6, #a855f7, #38bdf8)" />

        <Box p={{ base:7, sm:8 }}>

          {/* Logo */}
          <Flex direction="column" align="center" mb={5}>
            <motion.div
              animate={{ scale:[1,1.12,1], rotate:[0,6,-6,0] }}
              transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
              style={{ fontSize:'48px', lineHeight:1, marginBottom:'10px' }}
            >
              💍
            </motion.div>
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
              <Heading
                fontSize={{ base:'2xl', sm:'3xl' }}
                fontFamily="'Playfair Display', serif"
                color="white"
                textAlign="center"
                mb={1}
              >
                Join Us
              </Heading>
              <Text 
                bgGradient="linear(to-r, pink.300, purple.300)" 
                bgClip="text" 
                fontSize="xs" 
                fontWeight="bold" 
                letterSpacing="widest" 
                textTransform="uppercase" 
                textAlign="center"
                mb={1}
              >
                Shafique & Daniella
              </Text>
              <Text color="whiteAlpha.500" fontSize="sm" textAlign="center">Create your private account 🔐</Text>
            </motion.div>
          </Flex>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}>
              <Box bg="rgba(239,68,68,0.15)" border="1px solid rgba(239,68,68,0.4)" rounded="xl" px={4} py={3} mb={5} display="flex" alignItems="center" gap={2}>
                <Text fontSize="sm">⚠️</Text>
                <Text fontSize="sm" color="red.300">{error}</Text>
              </Box>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Stack gap={3}>

              {/* Name */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="whiteAlpha.600" mb={1} letterSpacing="widest" textTransform="uppercase">Name</Text>
                <Box rounded="xl" transition="box-shadow 0.3s" boxShadow={focused === 'name' ? '0 0 0 2px #f472b6' : 'none'}>
                  <Input
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused('')}
                    size="md"
                    bg="rgba(255,255,255,0.07)"
                    border="1px solid rgba(255,255,255,0.1)"
                    color="white"
                    rounded="xl"
                    height="45px"
                    _placeholder={{ color:'whiteAlpha.300' }}
                    _focus={{ outline:'none', borderColor:'transparent', bg:'rgba(255,255,255,0.11)', boxShadow:'none' }}
                    _hover={{ bg:'rgba(255,255,255,0.1)' }}
                  />
                </Box>
              </Box>

              {/* Email */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="whiteAlpha.600" mb={1} letterSpacing="widest" textTransform="uppercase">Email</Text>
                <Box rounded="xl" transition="box-shadow 0.3s" boxShadow={focused === 'email' ? '0 0 0 2px #a855f7' : 'none'}>
                  <Input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    size="md"
                    bg="rgba(255,255,255,0.07)"
                    border="1px solid rgba(255,255,255,0.1)"
                    color="white"
                    rounded="xl"
                    height="45px"
                    _placeholder={{ color:'whiteAlpha.300' }}
                    _focus={{ outline:'none', borderColor:'transparent', bg:'rgba(255,255,255,0.11)', boxShadow:'none' }}
                    _hover={{ bg:'rgba(255,255,255,0.1)' }}
                  />
                </Box>
              </Box>

              {/* Password */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="whiteAlpha.600" mb={1} letterSpacing="widest" textTransform="uppercase">Password</Text>
                <Box rounded="xl" transition="box-shadow 0.3s" boxShadow={focused === 'password' ? '0 0 0 2px #38bdf8' : 'none'}>
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                    size="md"
                    bg="rgba(255,255,255,0.07)"
                    border="1px solid rgba(255,255,255,0.1)"
                    color="white"
                    rounded="xl"
                    height="45px"
                    _placeholder={{ color:'whiteAlpha.300' }}
                    _focus={{ outline:'none', borderColor:'transparent', bg:'rgba(255,255,255,0.11)', boxShadow:'none' }}
                    _hover={{ bg:'rgba(255,255,255,0.1)' }}
                  />
                </Box>
              </Box>

              {/* Secret Key */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="whiteAlpha.600" mb={1} letterSpacing="widest" textTransform="uppercase">One Time Secret</Text>
                <Box rounded="xl" transition="box-shadow 0.3s" boxShadow={focused === 'secret' ? '0 0 0 2px #ec4899' : 'none'}>
                  <Input
                    type="password"
                    name="registrationSecret"
                    placeholder="Partner Key"
                    value={formData.registrationSecret}
                    onChange={handleChange}
                    onFocus={() => setFocused('secret')}
                    onBlur={() => setFocused('')}
                    size="md"
                    bg="rgba(255,255,255,0.07)"
                    border="1px solid rgba(255,255,255,0.1)"
                    color="white"
                    rounded="xl"
                    height="45px"
                    _placeholder={{ color:'whiteAlpha.300' }}
                    _focus={{ outline:'none', borderColor:'transparent', bg:'rgba(255,255,255,0.11)', boxShadow:'none' }}
                    _hover={{ bg:'rgba(255,255,255,0.1)' }}
                  />
                </Box>
                <Text fontSize="xs" color="whiteAlpha.400" mt={1}>Ask Shafique for the key 🔑</Text>
              </Box>

              {/* Submit */}
              <motion.div whileTap={{ scale:0.97 }} style={{ marginTop:'12px' }}>
                <Button
                  type="submit"
                  w="full"
                  h="50px"
                  rounded="xl"
                  bg="linear-gradient(135deg, #f472b6 0%, #a855f7 100%)"
                  color="white"
                  fontWeight="bold"
                  fontSize="md"
                  loading={loading}
                  loadingText="Creating account..."
                  border="none"
                  _hover={{ bg:'linear-gradient(135deg,#ec4899 0%,#9333ea 100%)', transform:'translateY(-2px)', boxShadow:'0 12px 30px rgba(168,85,247,0.45)' }}
                  _active={{ transform:'translateY(0)' }}
                  transition="all 0.2s"
                  position="relative"
                  overflow="hidden"
                  _after={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    animation: 'shimmer 3s infinite',
                  }}
                >
                  Join Our Space 💌
                </Button>
                <style>{`
                  @keyframes shimmer {
                    0% { left: -100%; }
                    20% { left: 100%; }
                    100% { left: 100%; }
                  }
                `}</style>
              </motion.div>
            </Stack>
          </form>

          {/* Login Link */}
          <Flex justify="center" mt={6} gap={2} align="center">
            <Text fontSize="sm" color="whiteAlpha.400">Already joined?</Text>
            <Link asChild fontSize="sm" fontWeight="bold" color="pink.300" _hover={{ color:'pink.200', textDecoration:'none' }}>
              <RouterLink to="/login">Login here</RouterLink>
            </Link>
          </Flex>

        </Box>
      </MotionBox>
    </Box>
  );
};

export default RegisterPage;

