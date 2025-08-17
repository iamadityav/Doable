import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { format } from 'date-fns';
import { Task, Priority, Period } from '../modals';

// --- Theming ---
const COLORS = {
  cardBackground: '#FFFBF5',
  textPrimary: '#4B443C',
  textSecondary: '#A9A39D',
  success: '#27AE60',
  border: '#F2EAE1',
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
    'check': '✓', 
    'calendar': '📅', 
    'area': '📊', 
    'time': '⏰',
    'morning': '☀️',
    'evening': '🌙',
    'misc': '📋',
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
  const { id, title, areaId, completed, priority, scheduledDate, scheduledTime, period, notes } = task;

  const getPeriodIconName = () => {
      switch(period) {
          case Period.Morning: return 'morning';
          case Period.Evening: return 'evening';
          case Period.Miscellaneous: return 'misc';
          default: return 'calendar';
      }
  }

  const getPriorityAccentColor = () => {
    switch (priority) {
      case Priority.High: return COLORS.priorityHigh;
      case Priority.Medium: return COLORS.priorityMedium;
      case Priority.Low: return COLORS.priorityLow;
      default: return COLORS.textSecondary;
    }
  };

  const getPriorityBackgroundColor = () => {
    switch (priority) {
      case Priority.High: return '#FFEBEA';
      case Priority.Medium: return '#FFF4E5';
      case Priority.Low: return '#EAF7EE';
      default: return COLORS.cardBackground;
    }
  };

  return (
    <TouchableOpacity 
        style={[
            styles.taskItem, 
            { 
                borderLeftColor: getPriorityAccentColor(),
                // backgroundColor: getPriorityBackgroundColor(),
            }
        ]} 
        onPress={onPress}
    >
      <View style={styles.taskContent}>
        <Pressable 
          style={[styles.checkbox, completed && styles.checkboxCompleted]} 
          onPress={(e) => {
            e.stopPropagation();
            onToggle(id);
          }}
        >
          {completed && <SimpleIcon name="check" size={14} color={'#FFFFFF'} />}
        </Pressable>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, completed && styles.completedText]}>{title}</Text>
          
          {/* Notes Preview */}
          {notes && (
              <Text style={styles.notesPreview} numberOfLines={1}>
                  {notes}
              </Text>
          )}

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
            <View style={styles.metaItem}>
              <SimpleIcon name={getPeriodIconName()} size={12} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{period}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  taskItem: { 
    borderRadius: 14, 
    flexDirection: 'row', 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 5,
  },
  taskContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: SPACING.s, 
    flex: 1 
  },
  checkbox: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: COLORS.border, 
    marginRight: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  checkboxCompleted: { 
    backgroundColor: COLORS.success, 
    borderColor: COLORS.success 
  },
  taskInfo: { 
    flex: 1 
  },
  taskTitle: { 
    fontSize: 16, 
    color: COLORS.textPrimary, 
    fontWeight: '600',
  },
  notesPreview: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  completedText: { 
    textDecorationLine: 'line-through', 
    color: COLORS.textSecondary 
  },
  metaContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12,
    marginTop: 4,
  },
  metaItem: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  metaText: { 
    fontSize: 12, 
    color: COLORS.textSecondary, 
    marginLeft: 4, 
    textTransform: 'capitalize' 
  },
});
