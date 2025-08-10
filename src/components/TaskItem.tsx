import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { format } from 'date-fns';
import { Task, Priority } from '../modals';

// --- Theming ---
const COLORS = {
  primary: '#007AFF',
  card: '#FFFFFF',
  success: '#34C759',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
  priorityHigh: '#FF3B30',
  priorityMedium: '#FF9500',
  priorityLow: '#34C759',
};

const SPACING = {
  s: 16,
};

// --- Reusable Components ---
const SimpleIcon: React.FC<{ name: string; size: number; color: string }> = ({ name, size, color }) => {
  const getEmoji = (iconName: string) => ({
    'check': '✓', 'calendar': '📅', 'area': '📊', 'time': '⏰',
  }[iconName] || '•');
  return <Text style={{ fontSize: size, color, textAlign: 'center' }}>{getEmoji(name)}</Text>;
};

// --- Component Props Interface ---
interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onPress: () => void;
}

// --- TaskItem Component ---
export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onPress }) => {
  const { id, title, areaId, completed, priority, scheduledDate, scheduledTime } = task;

  const getPriorityColor = () => {
    switch (priority) {
      case Priority.High: return COLORS.priorityHigh;
      case Priority.Medium: return COLORS.priorityMedium;
      case Priority.Low: return COLORS.priorityLow;
      default: return 'transparent';
    }
  };

  return (
    <TouchableOpacity style={styles.taskItem} onPress={onPress}>
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
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <SimpleIcon name="area" size={12} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{areaId}</Text>
            </View>
            {scheduledDate && (
              <View style={styles.metaItem}>
                <SimpleIcon name="calendar" size={12} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{format(new Date(scheduledDate), 'MMM d')}</Text>
              </View>
            )}
            {scheduledTime && (
              <View style={styles.metaItem}>
                <SimpleIcon name="time" size={12} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{scheduledTime}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
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
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#C7C7CC', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxCompleted: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 16, color: COLORS.text, fontWeight: '500', marginBottom: 8 },
  completedText: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  metaContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 4 },
});
