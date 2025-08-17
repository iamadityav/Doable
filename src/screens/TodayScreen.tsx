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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import HapticFeedback from 'react-native-haptic-feedback';
import { format } from 'date-fns';
import { useTasks } from '../hooks/useTask';
import { useAreas } from '../hooks/useArea';
import { Task, Period } from '../modals';
import { NewTaskModal } from '../components/NewTaskModal';
import { Header } from '../components/Header';
import { TaskItem } from '../components/TaskItem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  progressColors: {
    morning: '#FF9500',
    evening: '#AF52DE',
    misc: '#007AFF',
    completed: '#34C759',
    background: '#F2F2F7',
  },
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

// --- Circular Progress and Banner Components ---
const SimpleCircularProgress: React.FC<{
  size: number;
  progress: number;
  strokeWidth: number;
  centerContent: React.ReactNode;
}> = ({ size, progress, strokeWidth, centerContent }) => {
  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <View
        style={[
          styles.backgroundRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: COLORS.progressColors.background,
          },
        ]}
      />
      {progress > 0 && (
        <View
          style={[
            styles.progressSegment,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: 'transparent',
              borderTopColor: COLORS.progressColors.completed,
              borderRightColor: progress > 25 ? COLORS.progressColors.completed : 'transparent',
              borderBottomColor: progress > 50 ? COLORS.progressColors.completed : 'transparent',
              borderLeftColor: progress > 75 ? COLORS.progressColors.completed : 'transparent',
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
      )}
      <View style={styles.centerContent}>
        {centerContent}
      </View>
    </View>
  );
};

const NextTaskProgressBanner: React.FC<{ 
  task: Task; 
  todayTasks: Task[];
  completedTasks: Task[];
}> = ({ task, todayTasks, completedTasks }) => {
  const progressPercentage = todayTasks.length > 0 
    ? Math.round((completedTasks.length / todayTasks.length) * 100) 
    : 0;

  const morningTasks = todayTasks.filter(t => t.period === Period.Morning);
  const eveningTasks = todayTasks.filter(t => t.period === Period.Evening);
  const miscTasks = todayTasks.filter(t => t.period === Period.Miscellaneous);

  const centerContent = (
    <View style={styles.progressCenter}>
      <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
      <Text style={styles.progressLabel}>Complete</Text>
    </View>
  );

  return (
    <View style={styles.enhancedBannerContainer}>
      <View style={styles.progressSection}>
        <SimpleCircularProgress
          size={110}
          progress={progressPercentage}
          strokeWidth={8}
          centerContent={centerContent}
        />
        <View style={styles.periodIndicators}>
          {morningTasks.length > 0 && <View style={[styles.dot, { backgroundColor: COLORS.progressColors.morning }]} />}
          {eveningTasks.length > 0 && <View style={[styles.dot, { backgroundColor: COLORS.progressColors.evening }]} />}
          {miscTasks.length > 0 && <View style={[styles.dot, { backgroundColor: COLORS.progressColors.misc }]} />}
        </View>
      </View>
      
      <View style={styles.taskInfoSection}>
        <Text style={styles.taskHeaderTitle}>Next Up</Text>
        <Text style={styles.nextTaskTitle}>{task.title}</Text>
        <View style={styles.taskMeta}>
          <Text style={styles.taskTime}>
            {task.scheduledDate ? format(new Date(task.scheduledDate), 'MMM d') : 'Today'}
            {task.scheduledTime ? ` at ${task.scheduledTime}` : ''}
          </Text>
          <Text style={styles.bannerArrow}>›</Text>
        </View>
      </View>
    </View>
  );
};


// --- Main TodayScreen Component ---
const TodayScreen: React.FC = () => {
  const { tasks, toggleTask, addTask, updateTask, deleteTask } = useTasks();
  const { areas } = useAreas();
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayTasks = useMemo(() => tasks.filter(task => !task.scheduledDate || new Date(task.scheduledDate).toDateString() === new Date().toDateString()), [tasks]);
  const pendingTasks = useMemo(() => todayTasks.filter(task => !task.completed), [todayTasks]);
  const completedTasks = useMemo(() => todayTasks.filter(task => task.completed), [todayTasks]);

  const nextTodayTask = useMemo(() => {
    return pendingTasks.find(task => !!task.scheduledTime);
  }, [pendingTasks]);

  const handleToggleTask = (taskId: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      toggleTask(taskId);
  }

  const handleOpenModal = (task?: Task) => {
    HapticFeedback.trigger('impactLight');
    setEditingTask(task || null);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setModalVisible(false);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'|'createdAt'|'subtasks'|'tags'|'completed'> | Task) => {
    if ('id' in taskData) {
      updateTask(taskData as Task);
    } else {
      addTask(taskData);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Doable" />
      
      {nextTodayTask && <NextTaskProgressBanner task={nextTodayTask} todayTasks={todayTasks} completedTasks={completedTasks} />}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.daySection}>
            <Text style={styles.sectionTitle}>To Do</Text>
            <View style={styles.tasksContainer}>
                {pendingTasks.map(task => 
                    <TaskItem 
                        key={task.id} 
                        task={task} 
                        onToggle={handleToggleTask} 
                        onPress={() => handleOpenModal(task)} 
                    />
                )}
            </View>
        </View>

        {completedTasks.length > 0 && (
            <View style={styles.daySection}>
                <Text style={styles.sectionTitle}>Done</Text>
                <View style={styles.tasksContainer}>
                    {completedTasks.map(task => 
                        <TaskItem 
                            key={task.id} 
                            task={task} 
                            onToggle={handleToggleTask} 
                            onPress={() => handleOpenModal(task)} 
                        />
                    )}
                </View>
            </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <FloatingActionButton onPress={() => handleOpenModal()} />
      
      <NewTaskModal 
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        onDelete={deleteTask}
        areas={areas}
        taskToEdit={editingTask}
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
  enhancedBannerContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginHorizontal: SPACING.s,
    marginTop: SPACING.s,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressSection: {
    alignItems: 'center',
    marginRight: 20,
  },
  taskInfoSection: {
    flex: 1,
  },
  taskHeaderTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  nextTaskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  bannerArrow: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundRing: {
    position: 'absolute',
  },
  progressSegment: {
    position: 'absolute',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCenter: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  periodIndicators: {
    flexDirection: 'row',
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
});

export default TodayScreen;
