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
    'check': '✓', 'calendar': '📅', 'morning': '☀️', 'evening': '🌙', 'misc': '📋',
  }[iconName] || '•');
  return <Text style={{ fontSize: size, color, textAlign: 'center' }}>{getEmoji(name)}</Text>;
};

// --- Screen-Specific Components ---

const CompletedTaskItem: React.FC<{ task: Task }> = ({ task }) => {
  const { title, areaId, completedAt, priority, period } = task;

  const getPriorityColor = () => {
    switch (priority) {
      case Priority.High: return COLORS.priorityHigh;
      case Priority.Medium: return COLORS.priorityMedium;
      case Priority.Low: return COLORS.priorityLow;
      default: return 'transparent';
    }
  };

  const getPeriodIcon = () => {
      switch (period) {
          case Period.Morning: return 'morning';
          case Period.Evening: return 'evening';
          default: return 'misc';
      }
  }

  return (
    <View style={styles.taskItem}>
      <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor() }]} />
      <View style={styles.taskContent}>
        <View style={[styles.checkbox, styles.checkboxCompleted]}>
          <SimpleIcon name="check" size={14} color={COLORS.card} />
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{title}</Text>
          <View style={styles.taskMeta}>
            <Text style={styles.taskCategory}>{areaId}</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <SimpleIcon name={getPeriodIcon()} size={12} color={COLORS.textSecondary} />
            <Text style={styles.taskPeriod}>{period}</Text>
          </View>
        </View>
        <Text style={styles.completionTime}>
          {completedAt ? format(new Date(completedAt), 'p') : ''}
        </Text>
      </View>
    </View>
  );
};

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
    return format(date, 'EEEE, MMMM d');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📖</Text>
        <Text style={styles.headerTitle}>Logbook</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {groupedTasks.length > 0 ? (
          groupedTasks.map(group => (
            <View key={group.title} style={styles.daySection}>
              <Text style={styles.dayTitle}>{getSectionTitle(group.title)}</Text>
              <View style={styles.tasksContainer}>
                {group.data.map(task => (
                  <CompletedTaskItem key={task.id} task={task} />
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No completed tasks yet.</Text>
            <Text style={styles.emptyStateSubtext}>Complete a task to see it here.</Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
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
  taskContent: { flexDirection: 'row', alignItems: 'center', padding: SPACING.s, flex: 1 },
  checkbox: { width: 20, height: 20, borderRadius: 10, marginRight: SPACING.s, alignItems: 'center', justifyContent: 'center' },
  checkboxCompleted: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  taskCategory: { fontSize: 12, color: COLORS.textSecondary },
  dotSeparator: { marginHorizontal: 6, color: COLORS.textSecondary },
  taskPeriod: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 4, textTransform: 'capitalize' },
  completionTime: { fontSize: 14, color: COLORS.textSecondary },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyStateText: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary },
  emptyStateSubtext: { fontSize: 14, color: '#C7C7CC', marginTop: 8 },
});

export default LogbookScreen;
