import React, { useMemo, useState } from 'react';
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
import { useAreas } from '../hooks/useArea';
import { useTasks } from '../hooks/useTask';
import { Area, Project as ProjectModel, Task } from '../modals';
import { NewTaskModal } from '../components/NewTaskModal';
import { Header } from '../components/Header';

// --- Ultra Clean Minimal Theme ---
const COLORS = {
  // Background
  background: '#FFFFFF',
  card: '#FFFFFF',
  
  // Card backgrounds - subtle contrast
  cardDefault: '#FBFBFB',
  cardSecondary: '#F9FAFB',
  
  // Text hierarchy
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textCompleted: '#A1A1AA',
  
  // Accent colors
  primary: '#4F46E5',
  success: '#059669',
  primarybutton: '#007AFF',
  
  // Subtle borders and dividers
  border: '#F3F4F6',
  borderActive: '#E5E7EB',
  
  // Interactive elements
  chipBackground: '#F9FAFB',
  progressTrack: '#F1F5F9',
  
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
};

const TYPOGRAPHY = {
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 24,
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
    fontWeight: '500',
    letterSpacing: 0.2,
  },
};

// --- Reusable Components ---
const CleanIcon: React.FC<{ name: string; size: number; color?: string }> = ({ name, size, color = COLORS.textPrimary }) => {
  const getEmoji = (iconName: string) => ({
    'work': '💼', 'personal': '👤', 'health': '❤️', 'family': '🏡', 
    'add': '+', 'check': '✓', 'plus': '+',
  }[iconName] || '📂');
  
  return <Text style={{ fontSize: size, color, lineHeight: size + 2 }}>{getEmoji(name)}</Text>;
};

const FloatingActionButton: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const handlePress = () => {
    HapticFeedback.trigger('impactMedium');
    onPress?.();
  };
  
  return (
    <TouchableOpacity 
      style={styles.fab} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient 
        colors={[COLORS.primarybutton, '#5AA3F0']} 
        style={styles.fabGradient}
      >
        <Text style={styles.fabIcon}>+</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const ProgressBar: React.FC<{ progress: number; color: string }> = ({ progress, color }) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressFill, { width: `${Math.max(progress, 2)}%`, backgroundColor: color }]} />
  </View>
);

// --- Screen-Specific Components ---
interface ProjectWithProgress extends ProjectModel {
  completedTasks: number;
  totalTasks: number;
}

const ProjectRow: React.FC<{ project: ProjectWithProgress; color: string }> = ({ project, color }) => {
  const progress = project.totalTasks > 0 ? (project.completedTasks / project.totalTasks) * 100 : 0;
  
  return (
    <View style={styles.projectRow}>
      <View style={styles.projectInfo}>
        <Text style={styles.projectTitle}>{project.title}</Text>
        <View style={styles.taskCountChip}>
          <Text style={styles.taskCountText}>
            {project.completedTasks}/{project.totalTasks}
          </Text>
        </View>
      </View>
      <ProgressBar progress={progress} color={color} />
    </View>
  );
};

const TaskRow: React.FC<{ task: Task }> = ({ task }) => (
  <View style={styles.taskRow}>
    <View style={[styles.miniCheckbox, task.completed && styles.miniCheckboxCompleted]}>
      {task.completed && <CleanIcon name="check" size={10} color="#FFFFFF" />}
    </View>
    <Text style={[styles.taskRowTitle, task.completed && styles.completedText]}>
      {task.title}
    </Text>
  </View>
);

interface AreaWithProgress extends Area {
  totalTasks: number;
  projects: ProjectWithProgress[];
  singleTasks: Task[];
}

const AreaCard: React.FC<{ area: AreaWithProgress; onAddTask: () => void; }> = ({ area, onAddTask }) => (
  <View style={styles.areaCard}>
    {/* Priority accent line */}
    <View style={[styles.areaAccent, { backgroundColor: area.color }]} />
    
    <View style={styles.cardContent}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${area.color}15` }]}>
            <CleanIcon name={area.icon} size={16} color={area.color} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.areaTitle}>{area.name}</Text>
            <Text style={styles.areaTaskCount}>
              {area.totalTasks} {area.totalTasks === 1 ? 'task' : 'tasks'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={onAddTask} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Projects and Tasks Container */}
      <View style={styles.contentContainer}>
        {area.projects.map(project => (
          <ProjectRow key={project.id} project={project} color={area.color} />
        ))}
        
        {area.singleTasks.map(task => (
          <TaskRow key={task.id} task={task} />
        ))}
        
        {area.projects.length === 0 && area.singleTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tasks yet</Text>
            <Text style={styles.emptyStateSubtext}>Tap + to add your first task</Text>
          </View>
        )}
      </View>
    </View>
  </View>
);

// --- Main Screen Component ---
const AreasScreen: React.FC = () => {
  const { areas } = useAreas();
  const { tasks, addTask } = useTasks();
  
  const [isTaskModalVisible, setTaskModalVisible] = useState(false);

  const areasWithProgress = useMemo<AreaWithProgress[]>(() => {
    return areas.map(area => {
      const tasksInArea = tasks.filter(task => task.areaId === area.id);
      const singleTasks = tasksInArea.filter(task => !task.projectId);
      const projectsWithProgress = area.projects.map(project => {
        const tasksInProject = tasksInArea.filter(task => task.projectId === project.id);
        const completedTasks = tasksInProject.filter(task => task.completed).length;
        return {
          ...project,
          totalTasks: tasksInProject.length,
          completedTasks: completedTasks,
        };
      });
      return {
        ...area,
        totalTasks: tasksInArea.length,
        projects: projectsWithProgress,
        singleTasks: singleTasks,
      };
    });
  }, [areas, tasks]);

  const handleSaveTask = (taskData: Omit<Task, 'id'|'completed'|'createdAt'|'subtasks'|'tags'>) => {
    addTask(taskData);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Areas" />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.gridContainer}>
          {areasWithProgress.map(area => (
            <AreaCard 
              key={area.id} 
              area={area} 
              onAddTask={() => setTaskModalVisible(true)}
            />
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingActionButton onPress={() => setTaskModalVisible(true)} />

      <NewTaskModal 
        isVisible={isTaskModalVisible}
        onClose={() => setTaskModalVisible(false)}
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
  scrollView: { 
    flex: 1 
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  gridContainer: { 
    padding: SPACING.m, 
    gap: SPACING.s 
  },
  
  // Area Card Styles
  areaCard: { 
    backgroundColor: COLORS.cardDefault, 
    borderRadius: 12, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  areaAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  cardContent: { 
    flex: 1, 
    padding: SPACING.m,
    paddingLeft: SPACING.m + 6, // Account for accent line
  },
  
  // Header Styles
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: SPACING.s,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.s,
  },
  headerText: {
    flex: 1,
  },
  areaTitle: { 
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  areaTaskCount: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.chipBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
    lineHeight: 18,
  },
  
  // Content Container
  contentContainer: { 
    gap: SPACING.s 
  },
  
  // Project Row Styles
  projectRow: { 
    gap: SPACING.xs,
    paddingVertical: 2,
  },
  projectInfo: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 4,
  },
  projectTitle: { 
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  taskCountChip: {
    backgroundColor: COLORS.chipBackground,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskCountText: {
    ...TYPOGRAPHY.micro,
    color: COLORS.textSecondary,
  },
  
  // Task Row Styles
  taskRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingVertical: 4,
  },
  miniCheckbox: { 
    width: 16, 
    height: 16, 
    borderRadius: 8, 
    borderWidth: 1.5, 
    borderColor: COLORS.border,
    marginRight: SPACING.s,
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  miniCheckboxCompleted: { 
    backgroundColor: COLORS.success, 
    borderColor: COLORS.success,
  },
  taskRowTitle: { 
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  completedText: { 
    textDecorationLine: 'line-through', 
    color: COLORS.textCompleted,
    opacity: 0.9,
  },
  
  // Progress Bar Styles
  progressTrack: { 
    height: 4, 
    backgroundColor: COLORS.progressTrack, 
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { 
    height: '100%', 
    borderRadius: 2,
    minWidth: 4,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.l,
  },
  emptyStateText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
  
  // FAB Styles
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, y: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { fontSize: 24, color: COLORS.card },
});

export default AreasScreen;