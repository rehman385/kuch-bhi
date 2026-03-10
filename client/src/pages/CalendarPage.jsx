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

// ── Clock component ──────────────────��─────────────────────────────────
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
    <Box minH="100vh" bg="pink.50">
      {/* Header */}
      <Flex bg="white" px={6} py={4} shadow="sm" align="center" gap={3}>
        <Button size="sm" variant="ghost" onClick={() => navigate('/')}>← Back</Button>
        <Text fontSize="2xl">📅</Text>
        <Heading size="md" color="pink.500">Love Calendar</Heading>
      </Flex>

      <Box maxW="1100px" mx="auto" px={4} py={6}>

        {/* Days Together Banner */}
        <Box bg="linear-gradient(135deg, #ff6b9d, #ff8e53)" rounded="2xl" p={6} mb={6} color="white" textAlign="center" shadow="lg">
          <Text fontSize="4xl" fontWeight="black">{daysTogether}</Text>
          <Text fontSize="lg" fontWeight="semibold">Days Together 💑</Text>
          <Text fontSize="sm" opacity={0.85} mt={1}>Since March 9, 2026 💕</Text>
        </Box>

        {/* Clocks */}
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} mb={6} data-aos="fade-up">
          <LiveClock timezone="Asia/Manila" label="Daniella — Philippines 🇵🇭" flag="🇵🇭" color="blue" />
          <LiveClock timezone="Asia/Karachi" label="Shafique — Pakistan 🇵🇰" flag="🇵🇰" color="green" />
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
          {/* Calendar */}
          <Box data-aos="fade-right" data-aos-delay="200">
            <Box bg="white" rounded="2xl" p={4} shadow="md" mb={4}>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                tileClassName={tileClassName}
              />
            </Box>

            {/* Events on selected date */}
            <Box bg="white" rounded="2xl" p={4} shadow="md">
              <Flex justify="space-between" align="center" mb={3}>
                <Heading size="sm" color="gray.700">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </Heading>
                <Button size="xs" colorPalette="pink" onClick={() => setShowForm(!showForm)}>
                  + Add Event
                </Button>
              </Flex>

              {showForm && (
                <Box bg="pink.50" rounded="xl" p={3} mb={3}>
                  <Stack gap={2}>
                    <Input
                      placeholder="Event title (e.g. Our First Date 💕)"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      size="sm"
                      _focus={{ borderColor: 'pink.400' }}
                    />
                    <Flex gap={2}>
                      <Input
                        placeholder="Emoji"
                        value={newEvent.emoji}
                        onChange={(e) => setNewEvent({ ...newEvent, emoji: e.target.value })}
                        size="sm"
                        w="80px"
                        _focus={{ borderColor: 'pink.400' }}
                      />
                      <select
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                        style={{ flex: 1, borderRadius: '8px', border: '1px solid #e2e8f0', padding: '4px 8px', fontSize: '14px' }}
                      >
                        <option value="special">Special</option>
                        <option value="anniversary">Anniversary</option>
                        <option value="birthday">Birthday</option>
                        <option value="date">Date</option>
                        <option value="other">Other</option>
                      </select>
                    </Flex>
                    <Flex gap={2}>
                      <Button size="sm" colorPalette="pink" onClick={handleAddEvent} loading={loading} flex={1}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowForm(false)} flex={1}>
                        Cancel
                      </Button>
                    </Flex>
                  </Stack>
                </Box>
              )}

              {selectedEvents.length === 0 ? (
                <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>
                  No events on this day. Add one! 🌸
                </Text>
              ) : (
                <Stack gap={2}>
                  {selectedEvents.map((e, i) => (
                    <Flex key={e._id || i} align="center" justify="space-between" bg="pink.50" rounded="lg" px={3} py={2}>
                      <Flex align="center" gap={2}>
                        <Text fontSize="xl">{e.emoji}</Text>
                        <Box>
                          <Text fontSize="sm" fontWeight="semibold" color="gray.700">{e.title}</Text>
                          <Badge colorPalette={TYPE_COLORS[e.type] || 'pink'} size="sm">{e.type}</Badge>
                        </Box>
                      </Flex>
                      {e._id && (
                        <Button size="xs" variant="ghost" colorPalette="red" onClick={() => handleDelete(e._id)}>✕</Button>
                      )}
                    </Flex>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>

          {/* Upcoming Events */}
          <Box data-aos="fade-left" data-aos-delay="400">
            <Box bg="white" rounded="2xl" p={4} shadow="md">
              <Heading size="sm" color="gray.700" mb={4}>⏳ Upcoming Events</Heading>
              {upcoming.length === 0 ? (
                <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>No upcoming events</Text>
              ) : (
                <Stack gap={3}>
                  {upcoming.map((e, i) => {
                    const daysLeft = differenceInDays(e.parsedDate, today);
                    return (
                      <Flex key={e._id || i} align="center" gap={3} bg="pink.50" rounded="xl" p={3}>
                        <Text fontSize="2xl">{e.emoji}</Text>
                        <Box flex={1}>
                          <Text fontWeight="semibold" fontSize="sm" color="gray.700">{e.title}</Text>
                          <Text fontSize="xs" color="gray.400">{format(e.parsedDate, 'MMMM d, yyyy')}</Text>
                        </Box>
                        <Badge colorPalette={daysLeft === 0 ? 'red' : daysLeft <= 7 ? 'orange' : 'pink'} rounded="full" px={2}>
                          {daysLeft === 0 ? 'Today! 🎉' : `${daysLeft}d`}
                        </Badge>
                      </Flex>
                    );
                  })}
                </Stack>
              )}

              {/* Birthdays countdown */}
              <Box mt={6}>
                <Heading size="sm" color="gray.700" mb={3}>🎂 Birthday Countdowns</Heading>
                {[
                  { name: "Daniella", date: new Date(today.getFullYear(), 6, 17), flag: '🇵🇭' },
                  { name: "Shafique", date: new Date(today.getFullYear(), 0, 4), flag: '🇵🇰' },
                ].map((b) => {
                  let bDate = b.date;
                  if (bDate < today) bDate = new Date(today.getFullYear() + 1, bDate.getMonth(), bDate.getDate());
                  const days = differenceInDays(bDate, today);
                  return (
                    <Flex key={b.name} align="center" justify="space-between" bg="purple.50" rounded="xl" p={3} mb={2}>
                      <Flex align="center" gap={2}>
                        <Text>{b.flag}</Text>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.700">{b.name}'s Birthday 🎂</Text>
                      </Flex>
                      <Badge colorPalette="purple" rounded="full" px={2}>
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
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 16px;
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
    </Box>
  );
};

export default CalendarPage;


