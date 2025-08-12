import React, { useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import HapticFeedback from 'react-native-haptic-feedback';
import { format } from 'date-fns';
import { useTasks } from '../hooks/useTask';
import { useAreas } from '../hooks/useArea';
import { Task } from '../modals';
import { NewTaskModal } from '../components/NewTaskModal';
import { Header } from '../components/Header';
import { TaskItem } from '../components/TaskItem';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Theming ---
const COLORS = {
  primary: '#007AFF',
  background: '#FFFFFF',
  card: '#FFFFFF',
  success: '#34C759',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
  // New banner colors for a softer look
  bannerBackground: 'rgba(0, 122, 255, 0.08)', // Light, translucent blue
  bannerBorder: 'rgba(0, 122, 255, 0.2)',
};

const SPACING = {
  s: 16,
  m: 24,
};

// --- Reusable Components ---
const FloatingActionButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress}>
    <LinearGradient colors={[COLORS.primary, '#5AA3F0']} style={styles.fabGradient}>
        <Text style={styles.fabIcon}>+</Text>
    </LinearGradient>
  </TouchableOpacity>
);

// --- Renamed to NextTaskBanner for clarity ---
const NextTaskBanner: React.FC<{ task: Task }> = ({ task }) => (
    <View style={styles.bannerContainer}>
        <Text style={styles.bannerTitle}>{task.title}</Text>
        <View style={styles.bannerDetails}>
            <Text style={styles.bannerDate}>
                {task.scheduledDate ? format(new Date(task.scheduledDate), 'MMM d') : 'Today'}
                {task.scheduledTime ? ` at ${task.scheduledTime}` : ''}
            </Text>
            <Text style={styles.bannerArrow}>›</Text>
        </View>
    </View>
);


// --- Main TodayScreen Component ---
const TodayScreen: React.FC = () => {
  const { tasks, toggleTask, addTask } = useTasks();
  const { areas } = useAreas();
  const [isNewTaskModalVisible, setNewTaskModalVisible] = useState(false);

  const todayTasks = useMemo(() => tasks.filter(task => !task.scheduledDate || new Date(task.scheduledDate).toDateString() === new Date().toDateString()), [tasks]);
  
  const pendingTasks = useMemo(() => todayTasks.filter(task => !task.completed), [todayTasks]);
  const completedTasks = useMemo(() => todayTasks.filter(task => task.completed), [todayTasks]);

  // Find the next pending task for today with a scheduled time
  const nextTodayTask = useMemo(() => {
      return pendingTasks.find(task => !!task.scheduledTime);
  }, [pendingTasks]);

  const handleToggleTask = (taskId: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      toggleTask(taskId);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Doable" />
      
      {/* Conditionally render the banner with the next task for TODAY */}
      {nextTodayTask && <NextTaskBanner task={nextTodayTask} />}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* To Do Section */}
        <View style={styles.daySection}>
            <Text style={styles.sectionTitle}>To Do</Text>
            <View style={styles.tasksContainer}>
                {pendingTasks.map(task => <TaskItem key={task.id} task={task} onToggle={handleToggleTask} onPress={() => {}} />)}
            </View>
        </View>

        {/* Done Section */}
        {completedTasks.length > 0 && (
            <View style={styles.daySection}>
                <Text style={styles.sectionTitle}>Done</Text>
                <View style={styles.tasksContainer}>
                    {completedTasks.map(task => <TaskItem key={task.id} task={task} onToggle={handleToggleTask} onPress={() => {}} />)}
                </View>
            </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <FloatingActionButton onPress={() => setNewTaskModalVisible(true)} />
      
      <NewTaskModal 
        isVisible={isNewTaskModalVisible}
        onClose={() => setNewTaskModalVisible(false)}
        onSave={addTask}
        areas={areas}
      />
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  tasksContainer: { gap: SPACING.s, paddingHorizontal: SPACING.s },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, y: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { fontSize: 24, color: COLORS.card },
  daySection: { 
      marginTop: SPACING.m 
  },
  sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: SPACING.s,
      paddingHorizontal: SPACING.s,
  },
  // Upcoming Task Banner Styles
  bannerContainer: {
      backgroundColor: COLORS.bannerBackground,
      borderRadius: 14,
      marginHorizontal: SPACING.s,
      marginTop: SPACING.s,
      paddingHorizontal: SPACING.m,
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: COLORS.bannerBorder,
  },
  bannerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.primary,
  },
  bannerDetails: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  bannerDate: {
      fontSize: 14,
      color: COLORS.textSecondary,
  },
  bannerArrow: {
      fontSize: 16,
      color: COLORS.textSecondary,
      marginLeft: 8,
  },
});

export default TodayScreen;
