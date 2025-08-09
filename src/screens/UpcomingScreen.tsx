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
import { format, isTomorrow, isToday, addDays } from 'date-fns';
import { useTasks } from '../hooks/useTask';
import { useAreas } from '../hooks/useArea';
import { Task, Priority } from '../modals';
import { NewTaskModal } from '../components/NewTaskModal';

// --- Theming ---
const COLORS = {
  primary: '#007AFF',
  background: '#F2F2F7',
  card: '#FFFFFF',
  success: '#34C759',
  text: '#000000',
  textSecondary: '#8E8E93',
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
        <TouchableOpacity style={[styles.checkbox, completed && styles.checkboxCompleted]} onPress={() => onToggle(id)}>
          {completed && <SimpleIcon name="check" size={14} color={COLORS.card} />}
        </TouchableOpacity>
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

// --- Main UpcomingScreen Component ---

const UpcomingScreen: React.FC = () => {
  const { tasks, toggleTask, addTask } = useTasks();
  const { areas } = useAreas();
  const [isModalVisible, setModalVisible] = useState(false);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(task => task.scheduledDate && !isToday(new Date(task.scheduledDate)))
      .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime());
  }, [tasks]);

  const groupedTasks = useMemo(() => {
    const groups: { [key: string]: Task[] } = {};
    upcomingTasks.forEach(task => {
      const dateKey = format(new Date(task.scheduledDate!), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(task);
    });
    return Object.entries(groups).map(([date, tasks]) => ({
      title: date,
      data: tasks,
    }));
  }, [upcomingTasks]);

  const getSectionTitle = (dateString: string) => {
    const date = new Date(dateString);
    const adjustedDate = addDays(date, 1);
    if (isTomorrow(adjustedDate)) {
      return 'Tomorrow';
    }
    return format(adjustedDate, 'EEEE, MMMM d');
  };

  const handleFabPress = () => {
    HapticFeedback.trigger('impactMedium');
    setModalVisible(true);
  };
  
  const handleSaveTask = (taskData: Omit<Task, 'id'|'completed'|'createdAt'|'subtasks'|'tags'>) => {
    addTask(taskData);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>⏰</Text>
        <Text style={styles.headerTitle}>Upcoming</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {groupedTasks.length > 0 ? (
          groupedTasks.map(group => (
            <View key={group.title} style={styles.daySection}>
              <Text style={styles.dayTitle}>{getSectionTitle(group.title)}</Text>
              <View style={styles.tasksContainer}>
                {group.data.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No upcoming tasks.</Text>
            <Text style={styles.emptyStateSubtext}>Add a new task with a future date.</Text>
          </View>
        )}
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
  header: { backgroundColor: COLORS.card, paddingHorizontal: SPACING.s, paddingTop: SPACING.s, paddingBottom: SPACING.m, flexDirection: 'row', alignItems: 'center' },
  headerIcon: { fontSize: 28, marginRight: 8 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  scrollView: { flex: 1 },
  daySection: { marginTop: SPACING.m },
  dayTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.s, paddingHorizontal: SPACING.s },
  tasksContainer: { gap: 1 },
  taskItem: { backgroundColor: COLORS.card, marginHorizontal: SPACING.s, borderRadius: 10, flexDirection: 'row', overflow: 'hidden' },
  priorityIndicator: { width: 5 },
  taskContent: { flexDirection: 'row', alignItems: 'flex-start', padding: SPACING.s, flex: 1 },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#C7C7CC', marginRight: SPACING.s, marginTop: 2, alignItems: 'center', justifyContent: 'center' },
  checkboxCompleted: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, color: COLORS.text, lineHeight: 20, marginBottom: 4 },
  completedText: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  taskMeta: { flexDirection: 'row', alignItems: 'center' },
  taskCategory: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 4 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, y: 2 }, shadowOpacity: 0.25, shadowRadius: 8 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyStateText: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary },
  emptyStateSubtext: { fontSize: 14, color: '#C7C7CC', marginTop: 8 },
});

export default UpcomingScreen;
