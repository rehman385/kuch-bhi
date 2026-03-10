import { useState, useRef, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Button, Field, Heading, Input, Link, Stack, Text, Alert
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import DreamyBackground from '../components/DreamyBackground';

const LoginPage = () => {
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DreamyBackground>
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" px={4}>
        <Box bg="whiteAlpha.900" rounded="2xl" shadow="2xl" p={10} w="full" maxW="420px" backdropFilter="blur(10px)">
          <Stack gap={6}>
            <Stack gap={1} textAlign="center">
              <Heading size="2xl">💑 Welcome Back</Heading>
              <Text color="gray.500">Your private memory space awaits</Text>
            </Stack>

            {error && (
              <Alert.Root status="error" rounded="lg">
                <Alert.Indicator />
                <Alert.Description>{error}</Alert.Description>
              </Alert.Root>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <Field.Root required>
                  <Field.Label>Email</Field.Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  _focus={{ borderColor: 'pink.400' }}
                />
                </Field.Root>

                <Field.Root required>
                  <Field.Label>Password</Field.Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  _focus={{ borderColor: 'pink.400' }}
                />
                </Field.Root>

                <Button
                  type="submit"
                  colorPalette="pink"
                  loading={loading}
                  loadingText="Signing in..."
                  w="full"
                  size="lg"
                  mt={2}
                >
                  Sign In
                </Button>
              </Stack>
            </form>

            <Text textAlign="center" fontSize="sm" color="gray.500">
              New here?{' '}
              <Link asChild color="pink.500" fontWeight="semibold">
                <RouterLink to="/register">Create Account</RouterLink>
              </Link>
            </Text>
          </Stack>
        </Box>
      </Box>
    </DreamyBackground>
  );
};

export default LoginPage;
