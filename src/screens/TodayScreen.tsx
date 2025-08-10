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
import { useTasks } from '../hooks/useTask';
import { useStreak } from '../hooks/useStreak';
import { useAreas } from '../hooks/useArea';
import { Task, Period } from '../modals';
import { NewTaskModal } from '../components/NewTaskModal';
import { Header } from '../components/Header';
import { TaskItem } from '../components/TaskItem'; // Import the new common component

// --- Theming ---
const COLORS = {
  primary: '#007AFF',
  background: '#FFFFFF',
  card: '#FFFFFF',
  success: '#34C759',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
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
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.daySection}>
          {/* <Text style={styles.dayTitle}>☀️ Morning</Text> */}
          <View style={styles.tasksContainer}>
            {morningTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={toggleTask} 
                onPress={() => toggleTask(task.id)} // Simplified: press toggles task
              />
            ))}
          </View>
        </View>
        <View style={styles.daySection}>
          {/* <Text style={styles.dayTitle}>🌙 Evening</Text> */}
          <View style={styles.tasksContainer}>
            {eveningTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={toggleTask} 
                onPress={() => toggleTask(task.id)} // Simplified: press toggles task
              />
            ))}
          </View>
        </View>
        <View style={styles.daySection}>
          {/* <Text style={styles.dayTitle}>📋 Miscellaneous</Text> */}
          <View style={styles.tasksContainer}>
            {miscTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={toggleTask} 
                onPress={() => toggleTask(task.id)} // Simplified: press toggles task
              />
            ))}
          </View>
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
  scrollView: { flex: 1 },
  daySection: { marginTop: SPACING.m },
  dayTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.s, paddingHorizontal: SPACING.s },
  tasksContainer: { gap: SPACING.s, paddingHorizontal: SPACING.s },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, y: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { fontSize: 24, color: COLORS.card },
});

export default TodayScreen;
