import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
import { TaskItem } from '../components/TaskItem';

// --- Ultra Clean Minimal Theme ---
const COLORS = {
  // Background
  background: '#FFFFFF',
  card: '#FFFFFF',
  
  // Card backgrounds - subtle contrast
  cardDefault: '#FBFBFB',
  cardSecondary: '#F8FAFC',
  dateSection: '#FAFAFA',
  
  // Text hierarchy
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textWhite: '#FFFFFF',
  
  // Accent colors
  primary: '#007AFF',
  success: '#059669',
  
  // Date chip colors
  chipDefault: '#F1F5F9',
  chipSelected: '#4F46E5',
  chipToday: '#059669',
  
  // Subtle borders and dividers
  border: '#F3F4F6',
  borderActive: '#E5E7EB',
  separator: '#F1F5F9',
  
  // Shadows
  shadowLight: 'rgba(0, 0, 0, 0.04)',
  shadowMedium: 'rgba(0, 0, 0, 0.08)',
  shadowFab: 'rgba(79, 70, 229, 0.25)',
};

const SPACING = {
  xs: 6,
  s: 10,
  m: 16,
  l: 20,
  xl: 24,
  xxl: 32,
};

const TYPOGRAPHY = {
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.1,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  micro: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  },
};

// --- Enhanced Components ---
const FloatingActionButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const handlePress = () => {
    HapticFeedback.trigger('impactMedium');
    onPress();
  };

  return (
    <TouchableOpacity 
      style={styles.fab} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient 
        colors={[COLORS.primary, '#5AA3F0']} 
        style={styles.fabGradient}
      >
        <Text style={styles.fabIcon}>+</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const DateChip: React.FC<{ 
  date: Date; 
  isSelected: boolean; 
  onSelect: () => void 
}> = ({ date, isSelected, onSelect }) => {
  const todayDate = isToday(date);
  const tomorrowDate = isTomorrow(date);
  
  const getDateLabel = () => {
    if (todayDate) return 'Tod';
    if (tomorrowDate) return 'Tom';
    return format(date, 'EEE');
  };

  // Combine all styles into a single consistent base with conditional backgrounds
  const chipStyle = [
    styles.dateChip,
    isSelected && styles.dateChipSelected,
    todayDate && !isSelected && styles.dateChipToday,
  ];

  const textColor = (isSelected || todayDate) ? COLORS.textWhite : COLORS.textSecondary;
  const dateColor = (isSelected || todayDate) ? COLORS.textWhite : COLORS.textPrimary;

  return (
    <TouchableOpacity 
      style={chipStyle} 
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <Text style={[styles.dateChipDay, { color: textColor }]}>
        {getDateLabel()}
      </Text>
      <Text style={[styles.dateChipDate, { color: dateColor }]}>
        {format(date, 'd')}
      </Text>
    </TouchableOpacity>
  );
};

const TaskCounter: React.FC<{ count: number }> = ({ count }) => (
  <View style={styles.taskCounter}>
    <Text style={styles.taskCounterText}>
      {count} {count === 1 ? 'task' : 'tasks'}
    </Text>
  </View>
);

const EmptyState: React.FC<{ selectedDate: Date }> = ({ selectedDate }) => {
  const isSelectedToday = isToday(selectedDate);
  
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Text style={styles.emptyStateEmoji}>✨</Text>
      </View>
      <Text style={styles.emptyStateTitle}>
        {isSelectedToday ? 'All clear for today!' : 'No tasks planned'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {isSelectedToday 
          ? 'Enjoy your free time or add a new task'
          : `Add tasks for ${format(selectedDate, 'MMM d')}`
        }
      </Text>
    </View>
  );
};

// --- Main UpcomingScreen Component ---
const UpcomingScreen: React.FC = () => {
  const { tasks, addTask, toggleTask } = useTasks();
  const { areas } = useAreas();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateRange = useMemo(() => 
    Array.from({ length: 14 }, (_, i) => addDays(new Date(), i)), 
    []
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter(task =>
      task.scheduledDate &&
      isEqual(startOfDay(new Date(task.scheduledDate)), startOfDay(selectedDate))
    );
  }, [tasks, selectedDate]);

  const handleSaveTask = (taskData: Omit<Task, 'id'|'completed'|'createdAt'|'subtasks'|'tags'>) => {
    addTask(taskData);
  };

  const getDateDisplayText = () => {
    if (isToday(selectedDate)) return 'Today';
    if (isTomorrow(selectedDate)) return 'Tomorrow';
    return format(selectedDate, 'EEEE, MMMM d');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Upcoming" />

      {/* Date Selector Section */}
      <View style={styles.dateSelectorContainer}>
        <View style={styles.dateSelectorHeader}>
          <Text style={styles.monthTitle}>
            {format(selectedDate, 'MMMM yyyy')}
          </Text>
          {filteredTasks.length > 0 && (
            <TaskCounter count={filteredTasks.length} />
          )}
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.dateSelectorContent}
        >
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

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Selected Date Header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateTitle}>{getDateDisplayText()}</Text>
          {filteredTasks.length > 0 && (
            <View style={styles.completionIndicator}>
              <View style={[
                styles.completionDot,
                filteredTasks.every(task => task.completed) && styles.completionDotComplete
              ]} />
            </View>
          )}
        </View>

        {/* Tasks or Empty State */}
        {filteredTasks.length > 0 ? (
          <View style={styles.tasksContainer}>
            {filteredTasks.map((task, index) => (
              <View key={task.id} style={styles.taskItemWrapper}>
                <TaskItem
                  task={task}
                  onToggle={toggleTask}
                  onPress={() => toggleTask(task.id)}
                />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState selectedDate={selectedDate} />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingActionButton onPress={() => setModalVisible(true)} />

      <NewTaskModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTask}
        areas={areas}
      />
    </SafeAreaView>
  );
};

// --- Clean Minimal Styles ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  
  // Date Selector Styles
  dateSelectorContainer: {
    backgroundColor: COLORS.cardDefault,
    paddingTop: SPACING.m,
    paddingBottom: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  dateSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    marginBottom: SPACING.m,
  },
  monthTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textSecondary,
  },
  taskCounter: {
    backgroundColor: COLORS.chipDefault,
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskCounterText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  dateSelectorContent: {
    paddingHorizontal: SPACING.m,
    gap: SPACING.s,
  },
  
  // Date Chip Styles
  dateChip: {
    backgroundColor: COLORS.chipDefault,
    borderRadius: 16,
    alignItems: 'center',
    width: 60, // Fixed width instead of minWidth
    height: 60, // Fixed height to prevent shape changes
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateChipSelected: {
    backgroundColor: COLORS.chipSelected,
    borderColor: COLORS.chipSelected,
    // Removed shadows to keep it minimal
  },
  dateChipToday: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  dateChipDay: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    marginBottom: 2,
    textAlign: 'center',
  },
  dateChipDate: {
    ...TYPOGRAPHY.subtitle,
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  
  // Main Content Styles
  scrollView: { 
    flex: 1 
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.l,
  },
  dateTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    flex: 1,
  },
  completionIndicator: {
    marginLeft: SPACING.s,
  },
  completionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textTertiary,
  },
  completionDotComplete: {
    backgroundColor: COLORS.success,
  },
  
  // Tasks Container
  tasksContainer: {
    paddingHorizontal: SPACING.m,
    gap: SPACING.xs,
  },
  taskItemWrapper: {
    marginBottom: SPACING.xs,
  },
  
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl * 2,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.l,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyStateEmoji: {
    fontSize: 28,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // FAB Styles
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, y: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { fontSize: 24, color: COLORS.card },
});

export default UpcomingScreen;