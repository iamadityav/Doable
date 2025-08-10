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

// --- Theming ---
const COLORS = {
  primary: '#007AFF',
  background: '#FFFFFF', // Changed to white
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA', // Grey border color
  success: '#34C759',
};

const SPACING = {
  s: 16,
  m: 24,
};

// --- Reusable Components ---

const SimpleIcon: React.FC<{ name: string; size: number; color?: string }> = ({ name, size, color = COLORS.text }) => {
  const getEmoji = (iconName: string) => ({
    'work': '💼', 'personal': '👤', 'health': '❤️', 'family': '🏡', 'add': '+', 'check': '✓',
  }[iconName] || '📊');
  return <Text style={{ fontSize: size, color, textAlign: 'center' }}>{getEmoji(name)}</Text>;
};

const FloatingActionButton: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const handlePress = () => {
    HapticFeedback.trigger('impactMedium');
    onPress?.();
  };
  return (
    <TouchableOpacity style={styles.fab} onPress={handlePress}>
      <LinearGradient colors={[COLORS.primary, '#5AA3F0']} style={styles.fabGradient}>
        <SimpleIcon name="add" size={24} color={COLORS.card} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const ProgressBar: React.FC<{ progress: number; color: string }> = ({ progress, color }) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
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
        <Text style={styles.projectTaskCount}>{project.completedTasks}/{project.totalTasks}</Text>
      </View>
      <ProgressBar progress={progress} color={color} />
    </View>
  );
};

const TaskRow: React.FC<{ task: Task }> = ({ task }) => (
    <View style={styles.taskRow}>
        <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
          {task.completed && <SimpleIcon name="check" size={14} color={COLORS.card} />}
        </View>
        <Text style={[styles.taskTitle, task.completed && styles.completedText]}>{task.title}</Text>
    </View>
);


interface AreaWithProgress extends Area {
    totalTasks: number;
    projects: ProjectWithProgress[];
    singleTasks: Task[];
}

const AreaCard: React.FC<{ area: AreaWithProgress; onAddTask: () => void; }> = ({ area, onAddTask }) => (
  <View style={styles.areaCard}>
    <View style={[styles.colorBar, { backgroundColor: area.color }]} />
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <SimpleIcon name={area.icon} size={20} color={area.color} />
        <Text style={styles.areaTitle}>{area.name}</Text>
        <Text style={styles.areaTaskCount}>{area.totalTasks} tasks</Text>
        <TouchableOpacity onPress={onAddTask} style={styles.addProjectButton}>
            <SimpleIcon name="add" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.projectsContainer}>
        {area.projects.map(project => (
          <ProjectRow key={project.id} project={project} color={area.color} />
        ))}
        {area.singleTasks.map(task => (
            <TaskRow key={task.id} task={task} />
        ))}
        {area.projects.length === 0 && area.singleTasks.length === 0 && (
            <Text style={styles.noProjectsText}>No tasks or projects yet.</Text>
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  gridContainer: { padding: SPACING.s, gap: SPACING.s },
  areaCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: 12, 
    flexDirection: 'row', 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  colorBar: { width: 6 },
  cardContent: { flex: 1, padding: SPACING.s },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.s },
  areaTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginLeft: 8, flex: 1 },
  areaTaskCount: { fontSize: 14, color: COLORS.textSecondary },
  addProjectButton: { paddingLeft: SPACING.s },
  projectsContainer: { gap: SPACING.s },
  noProjectsText: { fontSize: 14, color: COLORS.textSecondary, fontStyle: 'italic', textAlign: 'center', paddingVertical: SPACING.s},
  projectRow: { gap: 6 },
  projectInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  projectTitle: { fontSize: 15, color: COLORS.text },
  projectTaskCount: { fontSize: 13, color: COLORS.textSecondary },
  taskRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  taskTitle: { fontSize: 15, color: COLORS.text },
  completedText: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#C7C7CC', marginRight: SPACING.s, alignItems: 'center', justifyContent: 'center' },
  checkboxCompleted: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  progressTrack: { height: 6, backgroundColor: COLORS.background, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, y: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});

export default AreasScreen;
