import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import HapticFeedback from 'react-native-haptic-feedback';
import { useTasks } from '../hooks/useTask';
import { useStreak } from '../hooks/useStreak';
import { useAreas } from '../hooks/useArea';
import { Task, Priority, Period } from '../modals';
import { NewTaskModal } from '../components/NewTaskModal';
import { Header } from '../components/Header';

// --- Theming ---
const COLORS = {
  primary: '#007AFF',
  background: '#FFFFFF', // White background
  card: '#FFFFFF',
  success: '#34C759',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA', // Grey border
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
    'check': '✓', 'calendar': '📅', 'local-fire-department': '🔥', 'add': '+',
  }[iconName] || '•');
  return <Text style={{ fontSize: size, color, textAlign: 'center' }}>{getEmoji(name)}</Text>;
};

const TaskItem: React.FC<{ task: Task; onToggle: (id: string) => void; }> = ({ task, onToggle }) => {
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
        <Pressable 
          style={[styles.checkbox, completed && styles.checkboxCompleted]} 
          onPress={(e) => {
            e.stopPropagation();
            onToggle(id);
          }}
        >
          {completed && <SimpleIcon name="check" size={14} color={COLORS.card} />}
        </Pressable>
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

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <View style={styles.progressContainer}>
    <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
    <Text style={styles.progressText}>{Math.round(progress)}%</Text>
  </View>
);

const StreakWidget: React.FC<{ streak: number }> = ({ streak }) => (
  <View style={styles.streakWidget}>
    <SimpleIcon name="local-fire-department" size={16} color={COLORS.success} />
    <Text style={styles.streakText}>{streak}-day streak</Text>
  </View>
);

const FloatingActionButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress}>
    <LinearGradient colors={[COLORS.primary, '#5AA3F0']} style={styles.fabGradient}><SimpleIcon name="add" size={24} color={COLORS.card} /></LinearGradient>
  </TouchableOpacity>
);


// --- Main TodayScreen Component ---
const TodayScreen: React.FC = () => {
  const { tasks, toggleTask, addTask } = useTasks();
  const { streak } = useStreak();
  const { areas } = useAreas();
  const [isNewTaskModalVisible, setNewTaskModalVisible] = useState(false);

  const todayTasks = useMemo(() => tasks.filter(task => !task.scheduledDate || new Date(task.scheduledDate).toDateString() === new Date().toDateString()), [tasks]);
  const morningTasks = useMemo(() => todayTasks.filter(t => t.period === Period.Morning), [todayTasks]);
  const eveningTasks = useMemo(() => todayTasks.filter(t => t.period === Period.Evening), [todayTasks]);
  const miscTasks = useMemo(() => todayTasks.filter(t => t.period === Period.Miscellaneous), [todayTasks]);

  const completedCount = todayTasks.filter(task => task.completed).length;
  const totalTasks = todayTasks.length;
  const currentProgress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  const handleFabPress = () => {
    HapticFeedback.trigger('impactMedium');
    setNewTaskModalVisible(true);
  };
  
  const handleSaveTask = (taskData: Omit<Task, 'id'|'completed'|'createdAt'|'subtasks'|'tags'>) => {
      addTask(taskData);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Doable" />
      
      {/* <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Today's Progress</Text>
            <StreakWidget streak={streak.currentStreak} />
        </View>
        <ProgressBar progress={currentProgress} />
        <Text style={styles.progressSubtext}>{completedCount} of {totalTasks} tasks completed</Text>
      </View> */}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.daySection}>
          <Text style={styles.dayTitle}>☀️ Morning</Text>
          <View style={styles.tasksContainer}>{morningTasks.map(task => <TaskItem key={task.id} task={task} onToggle={toggleTask} />)}</View>
        </View>
        <View style={styles.daySection}>
          <Text style={styles.dayTitle}>🌙 Evening</Text>
          <View style={styles.tasksContainer}>{eveningTasks.map(task => <TaskItem key={task.id} task={task} onToggle={toggleTask} />)}</View>
        </View>
        <View style={styles.daySection}>
          <Text style={styles.dayTitle}>📋 Miscellaneous</Text>
          <View style={styles.tasksContainer}>{miscTasks.map(task => <TaskItem key={task.id} task={task} onToggle={toggleTask} />)}</View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingActionButton onPress={handleFabPress} />
      
      <NewTaskModal 
        isVisible={isNewTaskModalVisible}
        onClose={() => setNewTaskModalVisible(false)}
        onSave={handleSaveTask}
        areas={areas}
      />
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  summaryContainer: { 
    backgroundColor: COLORS.card, 
    paddingHorizontal: SPACING.s, 
    paddingVertical: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.s,
  },
  summaryTitle: {
      fontSize: 22,
      fontWeight: 'bold',
  },
  streakWidget: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  streakText: { fontSize: 14, fontWeight: '600', color: COLORS.success, marginLeft: 4 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  progressTrack: { flex: 1, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.success, borderRadius: 3 },
  progressText: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginLeft: 12, minWidth: 40 },
  progressSubtext: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
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
});

export default TodayScreen;
