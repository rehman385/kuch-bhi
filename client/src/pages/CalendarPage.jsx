import { useState, useEffect } from 'react';
import {
  Box, Button, Flex, Grid, Heading, Input, Stack, Text, Badge
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, differenceInDays, isSameDay, parseISO } from 'date-fns';
import api from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import DreamyBackground from '../components/DreamyBackground';

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
    <Box bg="white" rounded="2xl" p={6} shadow="md" textAlign="center" borderTop="4px solid" borderColor={`${color}.400`}>
      <Text fontSize="3xl" mb={1}>{flag}</Text>
      <Text fontWeight="bold" color="gray.600" fontSize="sm" mb={2}>{label}</Text>
      <Text fontSize="3xl" fontWeight="bold" color={`${color}.500`} fontFamily="mono">{time}</Text>
      <Text fontSize="sm" color="gray.400" mt={1}>{date}</Text>
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
    <DreamyBackground>
      {/* Header */}
      <Flex
        bg="rgba(255,255,255,0.7)"
        backdropFilter="blur(10px)"
        px={6} py={4}
        shadow="sm"
        align="center"
        gap={3}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Button size="sm" variant="ghost" onClick={() => navigate('/')} rounded="full">← Back</Button>
        <Text fontSize="2xl">📅</Text>
        <Heading size="md" color="pink.600" fontFamily="'Playfair Display', serif">Love Calendar</Heading>
      </Flex>

      <Box maxW="1100px" mx="auto" px={4} py={6}>

        {/* Days Together Banner */}
        <Box
          bg="linear-gradient(135deg, #ff6b9d, #ff8e53)"
          rounded="3xl"
          p={8}
          mb={8}
          color="white"
          textAlign="center"
          shadow="lg"
          position="relative"
          overflow="hidden"
        >
          <Box position="absolute" top={-10} right={-10} w={40} h={40} bg="whiteAlpha.200" rounded="full" />
          <Box position="absolute" bottom={-10} left={-10} w={32} h={32} bg="whiteAlpha.200" rounded="full" />

          <Text fontSize="5xl" fontWeight="black" mb={2}>{daysTogether > 0 ? daysTogether : 0}</Text>
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
            <Box bg="white" rounded="3xl" p={6} shadow="lg" mb={6}>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                tileClassName={tileClassName}
              />
            </Box>

            {/* Events on selected date */}
            <Box bg="white" rounded="3xl" p={6} shadow="lg">
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="sm" color="gray.700" fontFamily="'Playfair Display', serif">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </Heading>
                <Button size="xs" colorPalette="pink" rounded="full" onClick={() => setShowForm(!showForm)}>
                  + Add Event
                </Button>
              </Flex>

              {showForm && (
                <Box bg="pink.50" rounded="2xl" p={4} mb={4}>
                  <Stack gap={3}>
                    <Input
                      placeholder="Event title (e.g. Our First Date 💕)"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      size="sm"
                      bg="white"
                      _focus={{ borderColor: 'pink.400' }}
                    />
                    <Flex gap={2}>
                      <Input
                        placeholder="Emoji"
                        value={newEvent.emoji}
                        onChange={(e) => setNewEvent({ ...newEvent, emoji: e.target.value })}
                        size="sm"
                        w="80px"
                        bg="white"
                        _focus={{ borderColor: 'pink.400' }}
                      />
                      <select
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                        style={{ flex: 1, borderRadius: '8px', border: '1px solid #e2e8f0', padding: '4px 8px', fontSize: '14px', background: 'white' }}
                      >
                        <option value="special">Special</option>
                        <option value="anniversary">Anniversary</option>
                        <option value="birthday">Birthday</option>
                        <option value="date">Date</option>
                        <option value="other">Other</option>
                      </select>
                    </Flex>
                    <Flex gap={2}>
                      <Button size="sm" colorPalette="pink" onClick={handleAddEvent} loading={loading} flex={1} rounded="full">
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} flex={1} rounded="full">
                        Cancel
                      </Button>
                    </Flex>
                  </Stack>
                </Box>
              )}

              {selectedEvents.length === 0 ? (
                <Text fontSize="sm" color="gray.400" textAlign="center" py={6}>
                  No events on this day. Add one! 🌸
                </Text>
              ) : (
                <Stack gap={3}>
                  {selectedEvents.map((e, i) => (
                    <Flex key={e._id || i} align="center" justify="space-between" bg="pink.50" rounded="xl" px={4} py={3}>
                      <Flex align="center" gap={3}>
                        <Text fontSize="2xl">{e.emoji}</Text>
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="gray.700">{e.title}</Text>
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
            <Box bg="white" rounded="3xl" p={6} shadow="lg">
              <Heading size="md" color="gray.700" mb={6} fontFamily="'Playfair Display', serif">⏳ Upcoming Events</Heading>
              {upcoming.length === 0 ? (
                <Text fontSize="sm" color="gray.400" textAlign="center" py={6}>No upcoming events</Text>
              ) : (
                <Stack gap={3}>
                  {upcoming.map((e, i) => {
                    const daysLeft = differenceInDays(e.parsedDate, today);
                    return (
                      <Flex key={e._id || i} align="center" gap={3} bg="purple.50" rounded="2xl" p={4} transition="transform 0.2s" _hover={{ transform: 'translateX(5px)' }}>
                        <Text fontSize="2xl">{e.emoji}</Text>
                        <Box flex={1}>
                          <Text fontWeight="bold" fontSize="sm" color="gray.800">{e.title}</Text>
                          <Text fontSize="xs" color="gray.500">{format(e.parsedDate, 'MMMM d, yyyy')}</Text>
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
              <Box mt={8} pt={6} borderTop="1px dashed" borderColor="gray.200">
                <Heading size="sm" color="gray.700" mb={4}>🎂 Birthday Countdowns</Heading>
                {[
                  { name: "Daniella", date: new Date(today.getFullYear(), 6, 17), flag: '🇵🇭' },
                  { name: "Shafique", date: new Date(today.getFullYear(), 0, 4), flag: '🇵🇰' },
                ].map((b) => {
                  let bDate = b.date;
                  if (bDate < today) bDate = new Date(today.getFullYear() + 1, bDate.getMonth(), bDate.getDate());
                  const days = differenceInDays(bDate, today);
                  return (
                    <Flex key={b.name} align="center" justify="space-between" bg="white" border="1px solid" borderColor="gray.100" rounded="2xl" p={3} mb={3} shadow="sm">
                      <Flex align="center" gap={3}>
                        <Text fontSize="xl">{b.flag}</Text>
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="gray.700">{b.name}</Text>
                          <Text fontSize="xs" color="gray.400">{format(bDate, 'MMM do')}</Text>
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
          background: white;
          border-radius: 16px;
          /* box-shadow removed as parent has it */
          padding: 8px;
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
          background-color: #fce7f3;
          transform: scale(1.05);
        }
        .react-calendar__tile--active { 
          background: linear-gradient(135deg, #ff6b9d 0%, #ff8e53 100%) !important; 
          color: white !important; 
          box-shadow: 0 4px 12px rgba(255, 107, 157, 0.4);
        }
        .react-calendar__tile--now { 
          background: #fff0f5 !important; 
          border: 1px solid #fbcfe8;
        }
        .react-calendar__month-view__days__day--weekend {
          color: #db2777;
        }
        .react-calendar__tile.has-event { 
          background-color: #fdf2f8;
          font-weight: bold; 
        }
        .react-calendar__navigation button { 
          border-radius: 8px; 
          font-weight: bold; 
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
        }
      `}</style>
    </DreamyBackground>
  );
};

export default CalendarPage;

