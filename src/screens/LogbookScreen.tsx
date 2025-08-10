import React, { useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, isToday, isYesterday } from 'date-fns';
import { useTasks } from '../hooks/useTask';
import { Task, Priority, Period } from '../modals';
import { Header } from '../components/Header';

// --- Ultra Clean Minimal Theme ---
const COLORS = {
  // Background
  background: '#FFFFFF',
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
  
  // Priority colors - muted but distinct
  priorityHigh: '#DC2626',
  priorityMedium: '#EA580C',
  priorityLow: '#16A34A',
  
  // Subtle borders and dividers
  border: '#F3F4F6',
  borderActive: '#E5E7EB',
  
  // Interactive elements
  chipBackground: '#F9FAFB',
  
  // Shadows
  shadowLight: 'rgba(0, 0, 0, 0.04)',
  shadowMedium: 'rgba(0, 0, 0, 0.08)',
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
    textTransform: 'uppercase' as const,
  },
};

// --- Reusable Components ---
const CleanIcon: React.FC<{ name: string; size: number; color?: string }> = ({ name, size, color = COLORS.textPrimary }) => {
  const getEmoji = (iconName: string) => ({
    'check': '✓', 
    'calendar': '📅', 
    'morning': '🌅', 
    'evening': '🌙', 
    'misc': '📝',
    'book': '📖',
    'empty': '📝',
  }[iconName] || '•');
  
  return <Text style={{ fontSize: size, color, lineHeight: size + 2 }}>{getEmoji(name)}</Text>;
};

// --- Screen-Specific Components ---
const CompletedTaskItem: React.FC<{ task: Task }> = ({ task }) => {
  const { title, areaId, completedAt, priority, period } = task;

  const getPriorityColor = () => {
    switch (priority) {
      case Priority.High: return COLORS.priorityHigh;
      case Priority.Medium: return COLORS.priorityMedium;
      case Priority.Low: return COLORS.priorityLow;
      default: return COLORS.border;
    }
  };

  const getPeriodIcon = () => {
    switch (period) {
      case Period.Morning: return 'morning';
      case Period.Evening: return 'evening';
      default: return 'misc';
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case Period.Morning: return 'Morning';
      case Period.Evening: return 'Evening';
      case Period.Miscellaneous: return 'Anytime';
      default: return 'Anytime';
    }
  };

  return (
    <View style={styles.taskItem}>
      {/* Priority accent line */}
      <View style={[styles.priorityAccent, { backgroundColor: getPriorityColor() }]} />
      
      <View style={styles.taskContent}>
        {/* Checkbox */}
        <View style={styles.checkbox}>
          <CleanIcon name="check" size={12} color="#FFFFFF" />
        </View>
        
        {/* Task Info */}
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{title}</Text>
          <View style={styles.taskMeta}>
            <View style={styles.areaChip}>
              <Text style={styles.areaText}>{areaId}</Text>
            </View>
            <View style={styles.periodChip}>
              <CleanIcon name={getPeriodIcon()} size={10} color={COLORS.textTertiary} />
              <Text style={styles.periodText}>{getPeriodLabel()}</Text>
            </View>
          </View>
        </View>
        
        {/* Completion Time */}
        <Text style={styles.completionTime}>
          {completedAt ? format(new Date(completedAt), 'h:mm a') : ''}
        </Text>
      </View>
    </View>
  );
};

const DaySection: React.FC<{ title: string; tasks: Task[] }> = ({ title, tasks }) => (
  <View style={styles.daySection}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.taskCountBadge}>
        <Text style={styles.taskCountText}>{tasks.length}</Text>
      </View>
    </View>
    <View style={styles.tasksContainer}>
      {tasks.map(task => (
        <CompletedTaskItem key={task.id} task={task} />
      ))}
    </View>
  </View>
);

const EmptyState: React.FC = () => (
  <View style={styles.emptyStateContainer}>
    <View style={styles.emptyIconContainer}>
      <CleanIcon name="empty" size={48} color={COLORS.textTertiary} />
    </View>
    <Text style={styles.emptyStateTitle}>No completed tasks yet</Text>
    <Text style={styles.emptyStateSubtext}>
      Complete your first task to see it appear in your logbook
    </Text>
  </View>
);

// --- Main LogbookScreen Component ---
const LogbookScreen: React.FC = () => {
  const { tasks } = useTasks();

  const completedTasks = useMemo(() => {
    return tasks
      .filter(task => task.completed && task.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
  }, [tasks]);

  const groupedTasks = useMemo(() => {
    const groups: { [key: string]: Task[] } = {};
    completedTasks.forEach(task => {
      const dateKey = format(new Date(task.completedAt!), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(task);
    });
    return Object.entries(groups).map(([date, tasks]) => ({
      title: date,
      data: tasks,
    }));
  }, [completedTasks]);

  const getSectionTitle = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMM d');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Logbook" />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {groupedTasks.length > 0 ? (
          <>
            {/* Summary Stats */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{completedTasks.length}</Text>
                <Text style={styles.summaryLabel}>Tasks Completed</Text>
              </View>
            </View>
            
            {/* Task Groups */}
            {groupedTasks.map(group => (
              <DaySection 
                key={group.title}
                title={getSectionTitle(group.title)}
                tasks={group.data}
              />
            ))}
          </>
        ) : (
          <EmptyState />
        )}
        
        <View style={{ height: 60 }} />
      </ScrollView>
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
  
  // Summary Section
  summaryContainer: {
    padding: COLORS.xl,
    paddingBottom: SPACING.l,
  },
  summaryCard: {
    backgroundColor: COLORS.cardDefault,
    borderRadius: 12,
    padding: SPACING.l,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  
  // Day Section
  daySection: { 
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.m,
  },
  sectionTitle: { 
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textTertiary,
  },
  taskCountBadge: {
    backgroundColor: COLORS.chipBackground,
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskCountText: {
    ...TYPOGRAPHY.micro,
    color: COLORS.textSecondary,
  },
  tasksContainer: { 
    gap: SPACING.s,
  },
  
  // Task Item
  taskItem: { 
    backgroundColor: COLORS.cardDefault, 
    borderRadius: 12, 
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  priorityAccent: {
    width: 3,
  },
  taskContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: SPACING.m, 
    flex: 1,
  },
  
  // Checkbox
  checkbox: { 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    backgroundColor: COLORS.success,
    marginRight: SPACING.m, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  
  // Task Info
  taskInfo: { 
    flex: 1,
  },
  taskTitle: { 
    ...TYPOGRAPHY.body,
    color: COLORS.textCompleted, 
    textDecorationLine: 'line-through',
    marginBottom: SPACING.xs,
  },
  taskMeta: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: SPACING.xs,
  },
  areaChip: {
    backgroundColor: COLORS.chipBackground,
    paddingHorizontal: SPACING.s,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  areaText: { 
    ...TYPOGRAPHY.micro,
    color: COLORS.textSecondary,
  },
  periodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.chipBackground,
    paddingHorizontal: SPACING.s,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  periodText: { 
    ...TYPOGRAPHY.micro,
    color: COLORS.textTertiary,
  },
  
  // Completion Time
  completionTime: { 
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontVariant: ['tabular-nums'],
  },
  
  // Empty State
  emptyStateContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingTop: 120,
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.cardDefault,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.l,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyStateTitle: { 
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textSecondary,
    marginBottom: SPACING.s,
    textAlign: 'center',
  },
  emptyStateSubtext: { 
    ...TYPOGRAPHY.body,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default LogbookScreen;