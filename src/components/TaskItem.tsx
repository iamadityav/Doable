import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { format } from 'date-fns';
import { Task, Priority, Period } from '../modals';

// --- Ultra Clean Minimal Theme ---
const COLORS = {
  // Card backgrounds - subtle contrast against white
  cardDefault: '#FBFBFB',
  cardCompleted: '#F7F9FA',
  
  // Text hierarchy
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textCompleted: '#A1A1AA',
  
  // Accent colors - carefully chosen for readability
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
  checkboxEmpty: '#FFFFFF',
  checkboxBorder: '#D1D5DB',
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
};

const TYPOGRAPHY = {
  title: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
};

// --- Refined Icon Component ---
const CleanIcon: React.FC<{ name: string; size: number; color: string }> = ({ name, size, color }) => {
  const getEmoji = (iconName: string) => ({
    'check': '✓', 
    'calendar': '📅', 
    'area': '📂', 
    'time': '🕐',
    'morning': '🌅',
    'evening': '🌙',
    'misc': '📋',
  }[iconName] || '•');
  
  return (
    <Text style={{ fontSize: size, color, lineHeight: size + 2 }}>
      {getEmoji(name)}
    </Text>
  );
};

// --- Component Props Interface ---
interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onPress: () => void;
}

// --- Minimal TaskItem Component ---
export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onPress }) => {
  const { id, title, areaId, completed, priority, scheduledDate, scheduledTime, period } = task;

  const getPeriodIconName = () => {
    switch(period) {
      case Period.Morning: return 'morning';
      case Period.Evening: return 'evening';
      case Period.Miscellaneous: return 'misc';
      default: return 'calendar';
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case Priority.High: return COLORS.priorityHigh;
      case Priority.Medium: return COLORS.priorityMedium;
      case Priority.Low: return COLORS.priorityLow;
      default: return COLORS.textTertiary;
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.taskItem, 
        completed && styles.taskItemCompleted
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Priority accent line */}
      <View style={[styles.priorityAccent, { backgroundColor: getPriorityColor() }]} />
      
      <View style={styles.taskContent}>
        {/* Custom Checkbox */}
        <Pressable 
          style={[styles.checkbox, completed && styles.checkboxCompleted]} 
          onPress={(e) => {
            e.stopPropagation();
            onToggle(id);
          }}
        >
          {completed && (
            <CleanIcon name="check" size={14} color="#FFFFFF" />
          )}
        </Pressable>

        {/* Task Information */}
        <View style={styles.taskInfo}>
          {/* Task Title */}
          <Text style={[styles.taskTitle, completed && styles.completedText]}>
            {title}
          </Text>

          {/* Meta Information */}
          {(areaId || scheduledDate || scheduledTime || period) && (
            <View style={styles.metaContainer}>
              {/* Area */}
              {areaId && (
                <View style={styles.metaItem}>
                  <CleanIcon name="area" size={11} color={COLORS.textTertiary} />
                  <Text style={styles.metaText}>{areaId}</Text>
                </View>
              )}
              
              {/* Period */}
              {period && (
                <View style={styles.metaItem}>
                  <CleanIcon name={getPeriodIconName()} size={11} color={COLORS.textTertiary} />
                  <Text style={styles.metaText}>{period}</Text>
                </View>
              )}

              {/* Date */}
              {scheduledDate && (
                <View style={styles.metaItem}>
                  <CleanIcon name="calendar" size={11} color={COLORS.textTertiary} />
                  <Text style={styles.metaText}>
                    {format(new Date(scheduledDate), 'MMM d')}
                  </Text>
                </View>
              )}

              {/* Time */}
              {scheduledTime && (
                <View style={styles.metaItem}>
                  <CleanIcon name="time" size={11} color={COLORS.textTertiary} />
                  <Text style={styles.metaText}>{scheduledTime}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- Clean Minimal Styles ---
const styles = StyleSheet.create({
  taskItem: { 
    backgroundColor: COLORS.cardDefault,
    borderRadius: 12,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    // Very subtle shadow for depth
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  taskItemCompleted: {
    backgroundColor: COLORS.cardCompleted,
    borderColor: COLORS.borderActive,
  },
  priorityAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  taskContent: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    padding: SPACING.m,
    paddingLeft: SPACING.m + 6, // Account for priority accent
  },
  checkbox: { 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: COLORS.checkboxBorder,
    backgroundColor: COLORS.checkboxEmpty,
    marginRight: SPACING.s,
    marginTop: 1,
    alignItems: 'center', 
    justifyContent: 'center',
    // Subtle inner shadow effect
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
    elevation: 1,
  },
  checkboxCompleted: { 
    backgroundColor: COLORS.success, 
    borderColor: COLORS.success,
    shadowOpacity: 0,
  },
  taskInfo: { 
    flex: 1,
  },
  taskTitle: { 
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  completedText: { 
    textDecorationLine: 'line-through', 
    color: COLORS.textCompleted,
    opacity: 0.9,
  },
  metaContainer: { 
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.chipBackground,
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaText: { 
    ...TYPOGRAPHY.meta,
    color: COLORS.textSecondary,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
});