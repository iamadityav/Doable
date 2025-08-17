import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import HapticFeedback from 'react-native-haptic-feedback';
import { format, addDays, isEqual, startOfDay, isToday, isTomorrow } from 'date-fns';
import { useTasks } from '../hooks/useTask';
import { useAreas } from '../hooks/useArea';
import { Task } from '../modals';
import { NewTaskModal } from '../components/NewTaskModal';
import { Header } from '../components/Header';

// --- Theming ---
const COLORS = {
  background: '#FFFFFF',
  cardDefault: '#FBFBFB',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  primary: '#007AFF',
  success: '#059669',
  chipDefault: '#F1F5F9',
  chipSelected: '#4F46E5',
  chipToday: '#059669',
  border: '#F3F4F6',
  timelineLine: '#E5E7EB',
  currentTime: '#DC2626',
};

const SPACING = {
  s: 10,
  m: 16,
  l: 20,
  xl: 24,
};

const TYPOGRAPHY = {
  subtitle: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '500' },
  caption: { fontSize: 12, fontWeight: '500' },
};

// --- Timeline Constants ---
const HOUR_HEIGHT = 80; // Increased height for better spacing
const START_HOUR = 0; // Timeline starts at 12 AM (midnight)
const END_HOUR = 23; // Timeline ends at 11 PM

// --- Helper Functions ---
const parseTimeString = (timeString: string): { hours: number; minutes: number } | null => {
    if (!timeString) return null;
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
};

// --- Reusable Components ---
const FloatingActionButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
    <LinearGradient colors={[COLORS.primary, '#5AA3F0']} style={styles.fabGradient}>
      <Text style={styles.fabIcon}>+</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const DateChip: React.FC<{ date: Date; isSelected: boolean; onSelect: () => void }> = ({ date, isSelected, onSelect }) => {
  return (
    <TouchableOpacity 
      style={[styles.dateChip, isSelected && styles.dateChipSelected, isToday(date) && !isSelected && styles.dateChipToday]} 
      onPress={onSelect}
    >
        <Text style={[styles.dateChipDay, (isSelected || isToday(date)) && {color: '#FFFFFF'}]}>{format(date, 'E')}</Text>
        <Text style={[styles.dateChipDate, (isSelected || isToday(date)) && {color: '#FFFFFF'}]}>{format(date, 'd')}</Text>
    </TouchableOpacity>
  );
};

// --- New Timeline Task Card ---
const TimelineTaskCard: React.FC<{ task: Task; areaColor: string; top: number; height: number }> = ({ task, areaColor, top, height }) => (
    <View style={[styles.taskCard, { top, height, backgroundColor: `${areaColor}1A`, borderColor: areaColor }]}>
        <Text style={[styles.taskCardTitle, { color: areaColor }]}>{task.title}</Text>
        <Text style={styles.taskCardTime}>{task.scheduledTime}</Text>
    </View>
);

// --- Current Time Indicator ---
const CurrentTimeIndicator: React.FC = () => {
    const [topPosition, setTopPosition] = useState(0);

    useEffect(() => {
        const updatePosition = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const position = (hours - START_HOUR + minutes / 60) * HOUR_HEIGHT;
            setTopPosition(position);
        };
        updatePosition();
        const interval = setInterval(updatePosition, 60000);
        return () => clearInterval(interval);
    }, []);

    if (topPosition < 0 || topPosition > (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT) return null;

    return (
        <View style={[styles.timeIndicator, { top: topPosition }]}>
            <View style={styles.timeIndicatorDot} />
            <View style={styles.timeIndicatorLine} />
        </View>
    );
};


// --- Main UpcomingScreen Component ---
const UpcomingScreen: React.FC = () => {
  const { tasks, addTask, toggleTask } = useTasks();
  const { areas } = useAreas();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateRange = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(new Date(), i)), []);
  const timelineHours = useMemo(() => Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i), []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task =>
      task.scheduledDate &&
      isEqual(startOfDay(new Date(task.scheduledDate)), startOfDay(selectedDate)) &&
      task.scheduledTime
    );
  }, [tasks, selectedDate]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Upcoming" />

      <View style={styles.dateSelectorContainer}>
        <Text style={styles.monthTitle}>{format(selectedDate, 'MMMM yyyy')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateSelectorContent}>
          {dateRange.map(date => (
            <DateChip
              key={date.toISOString()}
              date={date}
              isSelected={isEqual(startOfDay(date), startOfDay(selectedDate))}
              onSelect={() => setSelectedDate(date)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.timelineContainer}>
            {timelineHours.map(hour => (
                <View key={hour} style={[styles.hourRow, { height: HOUR_HEIGHT }]}>
                    <Text style={styles.hourText}>{format(new Date(0,0,0,hour), 'ha')}</Text>
                    <View style={styles.hourLine} />
                </View>
            ))}

            {filteredTasks.map(task => {
                const time = parseTimeString(task.scheduledTime!);
                if (!time) return null;

                const top = (time.hours - START_HOUR + time.minutes / 60) * HOUR_HEIGHT;
                const height = 1 * HOUR_HEIGHT - 4; 
                const area = areas.find(a => a.id === task.areaId);
                const areaColor = area ? area.color : COLORS.primary;

                return (
                    <TimelineTaskCard 
                        key={task.id} 
                        task={task} 
                        areaColor={areaColor}
                        top={top}
                        height={height}
                    />
                );
            })}

            {isToday(selectedDate) && <CurrentTimeIndicator />}
        </View>
      </ScrollView>

      <FloatingActionButton onPress={() => setModalVisible(true)} />

      <NewTaskModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={addTask}
        areas={areas}
      />
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  dateSelectorContainer: {
    backgroundColor: COLORS.cardDefault,
    paddingTop: SPACING.m,
    paddingBottom: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  monthTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.m,
    marginBottom: SPACING.m,
  },
  dateSelectorContent: {
    paddingHorizontal: SPACING.m,
    gap: SPACING.s,
  },
  dateChip: {
    backgroundColor: COLORS.chipDefault,
    borderRadius: 16,
    alignItems: 'center',
    width: 60,
    height: 60,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateChipSelected: { backgroundColor: COLORS.chipSelected, borderColor: COLORS.chipSelected },
  dateChipToday: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  dateChipDay: { ...TYPOGRAPHY.caption, fontSize: 11 },
  dateChipDate: { ...TYPOGRAPHY.subtitle, fontSize: 18 },
  scrollView: { flex: 1 },
  timelineContainer: {
      padding: SPACING.m,
      position: 'relative',
  },
  hourRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
  },
  hourText: {
      ...TYPOGRAPHY.caption,
      color: COLORS.textTertiary,
      width: 50,
      marginRight: SPACING.s,
  },
  hourLine: {
      flex: 1,
      height: 1,
      backgroundColor: COLORS.timelineLine,
      marginTop: 6,
  },
  taskCard: {
      position: 'absolute',
      left: 70,
      right: 0,
      borderRadius: 8,
      padding: SPACING.s,
      borderLeftWidth: 3,
  },
  taskCardTitle: {
      ...TYPOGRAPHY.body,
      fontWeight: '600',
  },
  taskCardTime: {
      ...TYPOGRAPHY.caption,
      color: COLORS.textSecondary,
      marginTop: 4,
  },
  timeIndicator: {
      position: 'absolute',
      left: 60,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
  },
  timeIndicatorDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: COLORS.currentTime,
  },
  timeIndicatorLine: {
      flex: 1,
      height: 1,
      backgroundColor: COLORS.currentTime,
      marginLeft: 4,
  },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { fontSize: 24, color: '#FFFFFF' },
});

export default UpcomingScreen;
