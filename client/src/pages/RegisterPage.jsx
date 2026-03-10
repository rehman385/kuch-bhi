import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Button, Field, Heading, Input, Link, Stack, Text, Alert
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import DreamyBackground from '../components/DreamyBackground';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', registrationSecret: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <DreamyBackground>
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" px={4}>
        <Box bg="whiteAlpha.900" rounded="2xl" shadow="2xl" p={10} w="full" maxW="420px" backdropFilter="blur(10px)">
          <Stack gap={6}>
            <Stack gap={1} textAlign="center">
              <Heading size="2xl">💌 Create Account</Heading>
              <Text color="gray.500">Join your private space</Text>
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
                  <Field.Label>Name</Field.Label>
                  <Input
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  _focus={{ borderColor: 'pink.400' }}
                />
                </Field.Root>

                <Field.Root required>
                  <Field.Label>Email</Field.Label>
                  <Input
                    type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  _focus={{ borderColor: 'pink.400' }}
                />
                </Field.Root>

                <Field.Root required>
                  <Field.Label>Password</Field.Label>
                  <Input
                    type="password"
                  name="password"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  _focus={{ borderColor: 'pink.400' }}
                />
                </Field.Root>

                <Field.Root required>
                  <Field.Label>Secret Key</Field.Label>
                  <Input
                    type="password"
                  name="registrationSecret"
                  placeholder="Enter the secret key"
                  value={formData.registrationSecret}
                  onChange={handleChange}
                  _focus={{ borderColor: 'pink.400' }}
                />
                  <Field.HelperText>Only two people can register</Field.HelperText>
                </Field.Root>

                <Button
                  type="submit"
                  colorPalette="pink"
                  loading={loading}
                  loadingText="Creating account..."
                  w="full"
                  size="lg"
                  mt={2}
                >
                  Create Account
                </Button>
              </Stack>
            </form>

            <Text textAlign="center" fontSize="sm" color="gray.500">
              Already have an account?{' '}
              <Link asChild color="pink.500" fontWeight="semibold">
                <RouterLink to="/login">Sign In</RouterLink>
              </Link>
            </Text>
          </Stack>
        </Box>
      </Box>
    </DreamyBackground>
  );
};

export default RegisterPage;

