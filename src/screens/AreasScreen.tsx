import React, { useMemo, useState } from 'react';
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
import { useAreas } from '../hooks/useArea';
import { useTasks } from '../hooks/useTask';
import { Area, Project as ProjectModel, Task } from '../modals';
import { NewTaskModal } from '../components/NewTaskModal';
import { Header } from '../components/Header';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Ultra Clean Minimal Theme ---
const COLORS = {
  background: '#FFFFFF',
  cardDefault: '#FBFBFB',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textCompleted: '#A1A1AA',
  primary: '#4F46E5',
  primaryButton: '#007AFF',
  success: '#059669',
  border: '#F3F4F6',
  chipBackground: '#F9FAFB',
  progressTrack: '#F1F5F9',
};

const SPACING = {
  xs: 6,
  s: 10,
  m: 16,
  l: 20,
  xl: 24,
};

const TYPOGRAPHY = {
  subtitle: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '500' },
  caption: { fontSize: 12, fontWeight: '500' },
  micro: { fontSize: 11, fontWeight: '500' },
};

// --- Reusable Components ---
const CleanIcon: React.FC<{ name: string; size: number; color?: string }> = ({ name, size, color = COLORS.textPrimary }) => {
  const getEmoji = (iconName: string) => ({
    'work': '💼', 'personal': '👤', 'health': '❤️', 'family': '🏡', 
    'check': '✓', 'plus': '+', 'arrow-down': '▼', 'arrow-up': '▲',
  }[iconName] || '📂');
  
  return <Text style={{ fontSize: size, color, lineHeight: size + 2 }}>{getEmoji(name)}</Text>;
};

// const FloatingActionButton: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
//   const handlePress = () => {
//     HapticFeedback.trigger('impactMedium');
//     onPress?.();
//   };
  
//   return (
//     <TouchableOpacity 
//       style={styles.fab} 
//       onPress={handlePress}
//       activeOpacity={0.8}
//     >
//       <LinearGradient 
//         colors={[COLORS.primaryButton, '#5AA3F0']} 
//         style={styles.fabGradient}
//       >
//         <Text style={styles.fabIcon}>+</Text>
//       </LinearGradient>
//     </TouchableOpacity>
//   );
// };

const FloatingActionButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress}>
    <LinearGradient colors={[COLORS.primaryButton, '#5AA3F0']} style={styles.fabGradient}>
        <Text style={styles.fabIcon}>+</Text>
    </LinearGradient>
  </TouchableOpacity>
);

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

const AreaCard: React.FC<{ 
    area: AreaWithProgress; 
    isExpanded: boolean;
    onToggle: () => void;
}> = ({ area, isExpanded, onToggle }) => (
  <TouchableOpacity 
    style={styles.areaCard} 
    onPress={onToggle}
    activeOpacity={0.9}
  >
    <View style={[styles.areaAccent, { backgroundColor: area.color }]} />
    
    <View style={styles.cardContent}>
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
        
        <CleanIcon name={isExpanded ? 'arrow-up' : 'arrow-down'} size={10} color={COLORS.textTertiary} />
      </View>

      {isExpanded && (
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
              <Text style={styles.emptyStateSubtext}>Use the + button to add a task</Text>
            </View>
          )}
        </View>
      )}
    </View>
  </TouchableOpacity>
);

// --- Main Screen Component ---
const AreasScreen: React.FC = () => {
  const { areas } = useAreas();
  const { tasks, addTask } = useTasks();
  const [isTaskModalVisible, setTaskModalVisible] = useState(false);
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);

  const areasWithProgress = useMemo<AreaWithProgress[]>(() => {
    return areas.map(area => {
      const tasksInArea = tasks.filter(task => task.areaId === area.id);
      const singleTasks = tasksInArea.filter(task => !task.projectId);
      const projectsWithProgress = area.projects.map(project => {
        const tasksInProject = tasksInArea.filter(task => task.projectId === project.id);
        const completedTasks = tasksInProject.filter(task => task.completed).length;
        return { ...project, totalTasks: tasksInProject.length, completedTasks };
      });
      return { ...area, totalTasks: tasksInArea.length, projects: projectsWithProgress, singleTasks };
    });
  }, [areas, tasks]);

  const handleToggleArea = (areaId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedAreaId(currentId => (currentId === areaId ? null : areaId));
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
              isExpanded={expandedAreaId === area.id}
              onToggle={() => handleToggleArea(area.id)}
            />
          ))}
        </View>
      </ScrollView>

      <FloatingActionButton onPress={() => setTaskModalVisible(true)} />

      <NewTaskModal 
        isVisible={isTaskModalVisible}
        onClose={() => setTaskModalVisible(false)}
        onSave={addTask}
        areas={areas}
      />
    </SafeAreaView>
  );
};

// --- Clean Minimal Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xl, paddingTop: SPACING.m },
  gridContainer: { paddingHorizontal: SPACING.m, gap: SPACING.s },
  areaCard: { 
    backgroundColor: COLORS.cardDefault, 
    borderRadius: 12, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  areaAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  cardContent: { flex: 1, padding: SPACING.m, paddingLeft: SPACING.m + 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.s },
  headerText: { flex: 1 },
  areaTitle: { ...TYPOGRAPHY.subtitle, color: COLORS.textPrimary, marginBottom: 2 },
  areaTaskCount: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  contentContainer: { gap: SPACING.s, marginTop: SPACING.m, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.m },
  projectRow: { gap: SPACING.xs, paddingVertical: 2 },
  projectInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  projectTitle: { ...TYPOGRAPHY.body, color: COLORS.textPrimary, flex: 1 },
  taskCountChip: { backgroundColor: COLORS.chipBackground, paddingHorizontal: SPACING.xs, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  taskCountText: { ...TYPOGRAPHY.micro, color: COLORS.textSecondary },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  miniCheckbox: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: COLORS.border, marginRight: SPACING.s, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  miniCheckboxCompleted: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  taskRowTitle: { ...TYPOGRAPHY.body, color: COLORS.textPrimary, flex: 1 },
  completedText: { textDecorationLine: 'line-through', color: COLORS.textCompleted, opacity: 0.9 },
  progressTrack: { height: 4, backgroundColor: COLORS.progressTrack, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, minWidth: 4 },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.l },
  emptyStateText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: 4 },
  emptyStateSubtext: { ...TYPOGRAPHY.caption, color: COLORS.textTertiary },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, y: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  fabIcon: { fontSize: 24, color: "#FFFFFF" },
});

export default AreasScreen;
