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
import { format, addDays, isEqual, startOfDay } from 'date-fns';
import { useTasks } from '../hooks/useTask';
import { useAreas } from '../hooks/useArea';
import { Task, Priority } from '../modals';
import { NewTaskModal } from '../components/NewTaskModal';
import { Header } from '../components/Header';

// --- Theming ---
const COLORS = {
  primary: '#007AFF',
  background: '#FFFFFF', // Changed to white
  card: '#FFFFFF',
  success: '#34C759',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA', // Grey border color
  priorityHigh: '#FF3B30',
  priorityMedium: '#FF9500',
  priorityLow: '#34C759',
};

const SPACING = {
  s: 16,
  m: 24,
};

// --- Reusable Components ---

const SimpleIcon: React.FC<{ name: string; size: number; color: string }> = ({ name, size, color }) => {
  const getEmoji = (iconName: string) => ({
    'check': '✓', 'calendar': '📅', 'add': '+',
  }[iconName] || '•');
  return <Text style={{ fontSize: size, color, textAlign: 'center' }}>{getEmoji(name)}</Text>;
};

const TaskItem: React.FC<{ task: Task; onToggle: (id: string) => void }> = ({ task, onToggle }) => {
  const { id, title, areaId, completed, priority } = task;

  const getPriorityColor = () => {
    switch (priority) {
      case Priority.High: return COLORS.priorityHigh;
      case Priority.Medium: return COLORS.priorityMedium;
      case Priority.Low: return COLORS.priorityLow;
      default: return 'transparent';
    }
  };

  return (
    <TouchableOpacity style={styles.taskItem} onPress={() => onToggle(id)}>
      <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor() }]} />
      <View style={styles.taskContent}>
        <View style={[styles.checkbox, completed && styles.checkboxCompleted]}>
          {completed && <SimpleIcon name="check" size={14} color={COLORS.card} />}
        </View>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, completed && styles.completedText]}>{title}</Text>
          <View style={styles.taskMeta}>
            <SimpleIcon name="calendar" size={12} color={COLORS.textSecondary} />
            <Text style={styles.taskCategory}>{areaId}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FloatingActionButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress}>
    <LinearGradient colors={[COLORS.primary, '#5AA3F0']} style={styles.fabGradient}><SimpleIcon name="add" size={24} color={COLORS.card} /></LinearGradient>
  </TouchableOpacity>
);

// --- New Date Selector Component ---
const DateChip: React.FC<{ date: Date; isSelected: boolean; onSelect: () => void }> = ({ date, isSelected, onSelect }) => (
    <TouchableOpacity style={[styles.dateChip, isSelected && styles.dateChipSelected]} onPress={onSelect}>
        <Text style={[styles.dateChipDay, isSelected && styles.dateChipTextSelected]}>{format(date, 'E')}</Text>
        <Text style={[styles.dateChipDate, isSelected && styles.dateChipTextSelected]}>{format(date, 'd')}</Text>
    </TouchableOpacity>
);


// --- Main UpcomingScreen Component ---

const UpcomingScreen: React.FC = () => {
  const { tasks, addTask, toggleTask } = useTasks();
  const { areas } = useAreas();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateRange = useMemo(() => Array.from({ length: 30 }, (_, i) => addDays(new Date(), i)), []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
        task.scheduledDate && 
        isEqual(startOfDay(new Date(task.scheduledDate)), startOfDay(selectedDate))
    );
  }, [tasks, selectedDate]);

  const handleFabPress = () => {
    HapticFeedback.trigger('impactMedium');
    setModalVisible(true);
  };
  
  const handleSaveTask = (taskData: Omit<Task, 'id'|'completed'|'createdAt'|'subtasks'|'tags'>) => {
    addTask(taskData);
  };

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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.daySection}>
            <Text style={styles.dayTitle}>{format(selectedDate, 'MMMM d, EEEE')}</Text>
            {filteredTasks.length > 0 ? (
                <View style={styles.tasksContainer}>
                    {filteredTasks.map(task => (
                    <TaskItem key={task.id} task={task} onToggle={toggleTask} />
                    ))}
                </View>
            ) : (
                <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>No tasks for this day.</Text>
                </View>
            )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingActionButton onPress={handleFabPress} />
      
      <NewTaskModal 
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTask}
        areas={areas}
      />
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  dateSelectorContainer: {
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.s,
    marginBottom: SPACING.s,
  },
  dateSelectorContent: {
    paddingHorizontal: SPACING.s,
    gap: 12,
  },
  dateChip: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    minWidth: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateChipDay: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dateChipDate: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: 4,
  },
  dateChipTextSelected: {
    color: COLORS.card,
  },
  scrollView: { flex: 1 },
  daySection: { marginTop: SPACING.m },
  dayTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.s, paddingHorizontal: SPACING.s },
  tasksContainer: { gap: SPACING.s, paddingHorizontal: SPACING.s },
  taskItem: { 
    backgroundColor: COLORS.card, 
    borderRadius: 10, 
    flexDirection: 'row', 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
   },
  priorityIndicator: { width: 5 },
  taskContent: { flexDirection: 'row', alignItems: 'center', padding: SPACING.s, flex: 1 },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#C7C7CC', marginRight: SPACING.s, alignItems: 'center', justifyContent: 'center' },
  checkboxCompleted: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, color: COLORS.text, lineHeight: 20 },
  completedText: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  taskMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  taskCategory: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 4 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, y: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.l },
  emptyStateText: { fontSize: 16, fontWeight: '500', color: COLORS.textSecondary },
});

export default UpcomingScreen;
