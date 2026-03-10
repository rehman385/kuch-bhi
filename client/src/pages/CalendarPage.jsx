import { useState, useEffect } from 'react';
import {
  Box, Button, Flex, Grid, Heading, Input, Stack, Text, Badge, IconButton
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, differenceInDays, isSameDay, parseISO } from 'date-fns';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

// ── Floating Particles Config ──────────────────────────────────────────
const hearts = [
  { left: '10%', bottom: '15%', size: '14px', duration: 7,   delay: 0,   char: '❤️' },
  { left: '25%', bottom: '5%',  size: '18px', duration: 6,   delay: 2,   char: '📅' },
  { left: '60%', bottom: '10%', size: '12px', duration: 8,   delay: 1,   char: '✨' },
  { left: '85%', bottom: '20%', size: '16px', duration: 5,   delay: 0.5, char: '💕' },
  { left: '50%', bottom: '2%',  size: '10px', duration: 9,   delay: 3,   char: '💖' },
];

// ── Hardcoded special dates ────────────────────────────────────────────
const FIXED_EVENTS = [
  { title: "Daniella's Birthday 🎂", date: '2026-07-17', emoji: '🎂', type: 'birthday' },
  { title: "Shafique's Birthday 🎂", date: '2027-01-04', emoji: '🎂', type: 'birthday' },
  { title: "Our Anniversary 💑", date: '2026-03-09', emoji: '💑', type: 'anniversary' },
];

const TYPE_COLORS = {
  anniversary: 'red',
  birthday: 'purple',
  special: 'pink',
  date: 'orange',
  other: 'gray',
};

// ── Clock component ───────────────────────────────────────────────────
const LiveClock = ({ timezone, label, flag, color }) => {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-US', { timeZone: timezone, weekday: 'short', month: 'short', day: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  return (
    <Box
      bg="rgba(255,255,255,0.05)"
      backdropFilter="blur(16px)"
      rounded="2xl"
      p={6}
      shadow="lg"
      textAlign="center"
      borderTop="4px solid"
      borderColor={`${color}.400`}
      borderX="1px solid rgba(255,255,255,0.1)"
      borderBottom="1px solid rgba(255,255,255,0.1)"
    >
      <Text fontSize="3xl" mb={1}>{flag}</Text>
      <Text fontWeight="bold" color="whiteAlpha.700" fontSize="sm" mb={2}>{label}</Text>
      <Text fontSize="3xl" fontWeight="bold" color={`${color}.300`} fontFamily="mono">{time}</Text>
      <Text fontSize="sm" color="whiteAlpha.500" mt={1}>{date}</Text>
    </Box>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────
const CalendarPage = () => {
  const navigate = useNavigate();
  const { } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', emoji: '💕', type: 'special' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Anniversary countdown (set your actual start date here)
  const anniversaryDate = new Date('2026-03-09');
  const today = new Date();
  const daysTogether = differenceInDays(today, anniversaryDate);

  const fetchEvents = async () => {
    const res = await api.get('/calendar');
    setEvents(res.data.data);
  };

  useEffect(() => { fetchEvents(); }, []);

  const allEvents = [
    ...FIXED_EVENTS,
    ...events,
  ];

  const eventsOnDate = (date) =>
    allEvents.filter((e) => {
      const evDate = parseISO(e.date);
      return isSameDay(evDate, date);
    });

  const tileContent = ({ date }) => {
    const dayEvents = eventsOnDate(date);
    if (!dayEvents.length) return null;
    return (
      <Flex justify="center" gap="1px" mt="2px" flexWrap="wrap">
        {dayEvents.slice(0, 3).map((e, i) => (
          <Text key={i} fontSize="10px" lineHeight={1}>{e.emoji}</Text>
        ))}
      </Flex>
    );
  };

  const tileClassName = ({ date }) => {
    const dayEvents = eventsOnDate(date);
    if (dayEvents.length) return 'has-event';
    return null;
  };

  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) return;
    setLoading(true);
    try {
      await api.post('/calendar', {
        ...newEvent,
        date: format(selectedDate, 'yyyy-MM-dd'),
      });
      await fetchEvents();
      setNewEvent({ title: '', emoji: '💕', type: 'special' });
      setShowForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/calendar/${id}`);
    fetchEvents();
  };

  const selectedEvents = eventsOnDate(selectedDate);

  // Upcoming events
  const upcoming = allEvents
    .map((e) => ({ ...e, parsedDate: parseISO(e.date) }))
    .filter((e) => e.parsedDate >= today)
    .sort((a, b) => a.parsedDate - b.parsedDate)
    .slice(0, 5);

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
        shadow="sm"
        align="center"
        gap={3}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate('/')}
          rounded="full"
          color="whiteAlpha.800"
          _hover={{ bg: 'whiteAlpha.200', transform: 'translateX(-2px)' }}
        >
          ← Back
        </Button>
        <Text fontSize="2xl">📅</Text>
        <Heading size="md" bgGradient="linear(to-r, #f472b6, #a855f7)" bgClip="text" fontFamily="'Playfair Display', serif">
          Love Calendar
        </Heading>
      </Flex>

      <Box maxW="1100px" mx="auto" px={4} py={6} position="relative" zIndex={1}>

        {/* Days Together Banner */}
        <Box
          bgGradient="linear(to-br, #f472b6 0%, #a855f7 50%, #6366f1 100%)"
          rounded="3xl"
          p={8}
          mb={8}
          color="white"
          textAlign="center"
          shadow="0 20px 50px rgba(168, 85, 247, 0.3)"
          position="relative"
          overflow="hidden"
          border="1px solid rgba(255,255,255,0.2)"
        >
          <Box position="absolute" top={-10} right={-10} w={40} h={40} bg="whiteAlpha.200" rounded="full" />
          <Box position="absolute" bottom={-10} left={-10} w={32} h={32} bg="whiteAlpha.200" rounded="full" />

          <Text fontSize="5xl" fontWeight="black" mb={2} textShadow="0 10px 20px rgba(0,0,0,0.2)">
            {Math.max(0, daysTogether)}
          </Text>
          <Text fontSize="xl" fontWeight="semibold" letterSpacing="wide">Days Together 💑</Text>
          <Text fontSize="sm" opacity={0.9} mt={2}>Since March 9, 2026 💕</Text>
        </Box>

        {/* Clocks */}
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6} mb={8} data-aos="fade-up">
          <LiveClock timezone="Asia/Manila" label="Daniella — Philippines 🇵🇭" flag="🇵🇭" color="blue" />
          <LiveClock timezone="Asia/Karachi" label="Shafique — Pakistan 🇵🇰" flag="🇵🇰" color="green" />
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
          {/* Calendar */}
          <Box data-aos="fade-right" data-aos-delay="200">
            <Box
              bg="rgba(255,255,255,0.05)"
              backdropFilter="blur(16px)"
              rounded="3xl"
              p={6}
              shadow="lg"
              mb={6}
              border="1px solid rgba(255,255,255,0.1)"
            >
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                tileClassName={tileClassName}
              />
            </Box>

            {/* Events on selected date */}
            <Box
              bg="rgba(255,255,255,0.05)"
              backdropFilter="blur(16px)"
              rounded="3xl"
              p={6}
              shadow="lg"
              border="1px solid rgba(255,255,255,0.1)"
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="sm" color="whiteAlpha.900" fontFamily="'Playfair Display', serif">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </Heading>
                <Button size="xs" colorPalette="pink" rounded="full" onClick={() => setShowForm(!showForm)}>
                  + Add Event
                </Button>
              </Flex>

              {showForm && (
                <Box bg="rgba(255,255,255,0.1)" rounded="2xl" p={4} mb={4}>
                  <Stack gap={3}>
                    <Input
                      placeholder="Event title (e.g. Our First Date 💕)"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      size="sm"
                      bg="rgba(0,0,0,0.3)"
                      border="None"
                      color="white"
                      _focus={{ boxShadow: '0 0 0 2px #f472b6' }}
                    />
                    <Flex gap={2}>
                      <Input
                        placeholder="Emoji"
                        value={newEvent.emoji}
                        onChange={(e) => setNewEvent({ ...newEvent, emoji: e.target.value })}
                        size="sm"
                        w="80px"
                        bg="rgba(0,0,0,0.3)"
                        border="None"
                        color="white"
                        _focus={{ boxShadow: '0 0 0 2px #f472b6' }}
                      />
                      <select
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                        style={{ flex: 1, borderRadius: '8px', border: 'none', padding: '4px 8px', fontSize: '14px', background: 'rgba(0,0,0,0.3)', color: 'white' }}
                      >
                        <option value="special" style={{color: 'black'}}>Special</option>
                        <option value="anniversary" style={{color: 'black'}}>Anniversary</option>
                        <option value="birthday" style={{color: 'black'}}>Birthday</option>
                        <option value="date" style={{color: 'black'}}>Date</option>
                        <option value="other" style={{color: 'black'}}>Other</option>
                      </select>
                    </Flex>
                    <Flex gap={2}>
                      <Button size="sm" bgGradient="linear(to-r, #f472b6, #a855f7)" color="white" onClick={handleAddEvent} loading={loading} flex={1} rounded="full" _hover={{ opacity: 0.9 }}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" color="whiteAlpha.700" onClick={() => setShowForm(false)} flex={1} rounded="full" _hover={{ bg: 'whiteAlpha.200' }}>
                        Cancel
                      </Button>
                    </Flex>
                  </Stack>
                </Box>
              )}

              {selectedEvents.length === 0 ? (
                <Text fontSize="sm" color="whiteAlpha.500" textAlign="center" py={6}>
                  No events on this day. Add one! 🌸
                </Text>
              ) : (
                <Stack gap={3}>
                  {selectedEvents.map((e, i) => (
                    <Flex key={e._id || i} align="center" justify="space-between" bg="rgba(255,255,255,0.05)" rounded="xl" px={4} py={3}>
                      <Flex align="center" gap={3}>
                        <Text fontSize="2xl">{e.emoji}</Text>
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="whiteAlpha.900">{e.title}</Text>
                          <Badge colorPalette={TYPE_COLORS[e.type] || 'pink'} size="xs" variant="subtle" rounded="full" px={2}>{e.type}</Badge>
                        </Box>
                      </Flex>
                      {e._id && (
                        <Button size="xs" variant="ghost" colorPalette="red" rounded="full" onClick={() => handleDelete(e._id)}>✕</Button>
                      )}
                    </Flex>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>

          {/* Upcoming Events */}
          <Box data-aos="fade-left" data-aos-delay="400">
            <Box
              bg="rgba(255,255,255,0.05)"
              backdropFilter="blur(16px)"
              rounded="3xl"
              p={6}
              shadow="lg"
              border="1px solid rgba(255,255,255,0.1)"
            >
              <Heading size="md" color="whiteAlpha.900" mb={6} fontFamily="'Playfair Display', serif">⏳ Upcoming Events</Heading>
              {upcoming.length === 0 ? (
                <Text fontSize="sm" color="whiteAlpha.500" textAlign="center" py={6}>No upcoming events</Text>
              ) : (
                <Stack gap={3}>
                  {upcoming.map((e, i) => {
                    const daysLeft = differenceInDays(e.parsedDate, today);
                    return (
                      <Flex key={e._id || i} align="center" gap={3} bg="rgba(255,255,255,0.05)" rounded="2xl" p={4} transition="transform 0.2s" _hover={{ transform: 'translateX(5px)', bg: 'rgba(255,255,255,0.1)' }}>
                        <Text fontSize="2xl">{e.emoji}</Text>
                        <Box flex={1}>
                          <Text fontWeight="bold" fontSize="sm" color="whiteAlpha.900">{e.title}</Text>
                          <Text fontSize="xs" color="whiteAlpha.500">{format(e.parsedDate, 'MMMM d, yyyy')}</Text>
                        </Box>
                        <Badge colorPalette={daysLeft === 0 ? 'red' : daysLeft <= 7 ? 'orange' : 'purple'} rounded="full" px={3} py={1}>
                          {daysLeft === 0 ? 'Today! 🎉' : `${daysLeft}d`}
                        </Badge>
                      </Flex>
                    );
                  })}
                </Stack>
              )}

              {/* Birthdays countdown */}
              <Box mt={8} pt={6} borderTop="1px dashed" borderColor="whiteAlpha.200">
                <Heading size="sm" color="whiteAlpha.900" mb={4}>🎂 Birthday Countdowns</Heading>
                {[
                  { name: "Daniella", date: new Date(today.getFullYear(), 6, 17), flag: '🇵🇭' },
                  { name: "Shafique", date: new Date(today.getFullYear(), 0, 4), flag: '🇵🇰' },
                ].map((b) => {
                  let bDate = b.date;
                  if (bDate < today) bDate = new Date(today.getFullYear() + 1, bDate.getMonth(), bDate.getDate());
                  const days = differenceInDays(bDate, today);
                  return (
                    <Flex key={b.name} align="center" justify="space-between" bg="rgba(255,255,255,0.05)" border="1px solid rgba(255,255,255,0.1)" rounded="2xl" p={3} mb={3} shadow="sm">
                      <Flex align="center" gap={3}>
                        <Text fontSize="xl">{b.flag}</Text>
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="whiteAlpha.900">{b.name}</Text>
                          <Text fontSize="xs" color="whiteAlpha.500">{format(bDate, 'MMM do')}</Text>
                        </Box>
                      </Flex>
                      <Badge colorPalette="pink" rounded="full" px={3} py={1} fontSize="xs">
                        {days === 0 ? 'Today! 🎉🎂' : `${days} days`}
                      </Badge>
                    </Flex>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Box>

      <style>{`
        .react-calendar { 
          width: 100%; 
          border: none; 
          font-family: 'Outfit', sans-serif;
          background: transparent !important;
          color: white !important;
        }
        .react-calendar__navigation button {
          color: white !important;
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          font-weight: bold;
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: rgba(255,255,255,0.1) !important;
          border-radius: 8px;
        }
        .react-calendar__month-view__weekdays__weekday {
          color: #f472b6;
          text-decoration: none !important;
        } 
        .react-calendar__month-view__days__day {
          color: white;
        }
        .react-calendar__month-view__days__day--weekend {
          color: #a855f7 !important;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          color: rgba(255,255,255,0.3) !important;
        }
        .react-calendar__tile { 
          border-radius: 12px; 
          padding: 8px 4px; 
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          transition: all 0.2s;
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: rgba(255,255,255,0.1) !important;
          transform: scale(1.05);
        }
        .react-calendar__tile--active { 
          background: linear-gradient(135deg, #f472b6 0%, #a855f7 100%) !important; 
          color: white !important; 
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
        }
        .react-calendar__tile--now { 
          background: rgba(255,255,255,0.05) !important; 
          border: 1px solid #f472b6;
        }
        .react-calendar__tile.has-event { 
          background-color: rgba(244, 114, 182, 0.15);
          font-weight: bold; 
        }
      `}</style>
    </Box>
  );
};

export default CalendarPage;

