import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { format, addDays, isEqual, startOfDay } from 'date-fns';
import { Task, Period, Priority, Area } from '../modals';

// --- Ultra Clean Minimal Theme ---
const COLORS = {
  // Background
  background: '#FFFFFF',
  modalBackground: '#FAFAFA',
  
  // Card backgrounds - subtle contrast
  inputBackground: '#F8FAFC',
  chipDefault: '#F1F5F9',
  chipSelected: '#4F46E5',
  
  // Text hierarchy
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textPlaceholder: '#94A3B8',
  textWhite: '#FFFFFF',
  
  // Priority colors - muted but distinct
  priorityHigh: '#DC2626',
  priorityMedium: '#EA580C',
  priorityLow: '#16A34A',
  
  // Subtle borders and dividers
  border: '#E2E8F0',
  borderFocus: '#CBD5E1',
  
  // Interactive elements
  primary: '#4F46E5',
  success: '#059669',
  
  // Shadows
  shadowLight: 'rgba(0, 0, 0, 0.04)',
  shadowMedium: 'rgba(0, 0, 0, 0.08)',
  shadowModal: 'rgba(15, 23, 42, 0.15)',
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
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.1,
    lineHeight: 22,
  },
  chip: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
};

// --- Helper to generate dates ---
const getUpcomingDays = (count: number): Date[] => {
  return Array.from({ length: count }, (_, i) => addDays(new Date(), i));
};

// --- Enhanced Icon Component ---
const CleanIcon: React.FC<{ name: string; size: number; color: string }> = ({ name, size, color }) => {
  const getEmoji = (iconName: string) => ({
    'morning': '🌅',
    'evening': '🌙',
    'misc': '📝',
    'high': '🔴',
    'medium': '🟡',
    'low': '🟢',
  }[iconName] || '📋');
  
  return (
    <Text style={{ fontSize: size, color, lineHeight: size + 2 }}>
      {getEmoji(name)}
    </Text>
  );
};

// --- Component Props Interface ---
interface NewTaskModalProps {
  isVisible: boolean;
  areas: Area[];
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id'|'completed'|'createdAt'|'subtasks'|'tags'>) => void;
}

// --- Enhanced New Task Modal Component ---
export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isVisible, areas, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState<Period>(Period.Morning);
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [areaId, setAreaId] = useState(areas.length > 0 ? areas[0].id : 'Personal');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState('');

  const upcomingDays = getUpcomingDays(7); // Show only 7 days for cleaner UI

  const handleSave = () => {
    if (title.trim()) {
      onSave({ title, period, priority, areaId, scheduledDate, scheduledTime });
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setTitle('');
    setPeriod(Period.Morning);
    setPriority(Priority.Medium);
    setScheduledDate(undefined);
    setScheduledTime('');
    setAreaId(areas.length > 0 ? areas[0].id : 'Personal');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getPriorityColor = (priorityType: Priority) => {
    switch (priorityType) {
      case Priority.High: return COLORS.priorityHigh;
      case Priority.Medium: return COLORS.priorityMedium;
      case Priority.Low: return COLORS.priorityLow;
      default: return COLORS.chipSelected;
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      style={styles.modal}
      avoidKeyboard
      backdropOpacity={0.4}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
    >
      <View style={styles.modalContent}>
        {/* Modal Handle */}
        <View style={styles.modalHandle} />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.modalTitle}>New Task</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Task Title */}
          <View style={styles.section}>
            <TextInput
              style={styles.titleInput}
              placeholder="What do you need to do?"
              value={title}
              onChangeText={setTitle}
              autoFocus
              placeholderTextColor={COLORS.textPlaceholder}
              multiline
            />
          </View>

          {/* Schedule Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Schedule</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.chipScrollContainer}
            >
              <TouchableOpacity 
                style={[
                  styles.dateChip, 
                  !scheduledDate && styles.dateChipSelected
                ]} 
                onPress={() => setScheduledDate(undefined)}
              >
                <Text style={[
                  styles.dateChipText, 
                  !scheduledDate && styles.chipTextSelected
                ]}>
                  Today
                </Text>
              </TouchableOpacity>
              
              {upcomingDays.slice(1).map(day => (
                <TouchableOpacity 
                  key={day.toISOString()}
                  style={[
                    styles.dateChip, 
                    scheduledDate && isEqual(startOfDay(day), startOfDay(scheduledDate)) && styles.dateChipSelected
                  ]} 
                  onPress={() => setScheduledDate(day)}
                >
                  <Text style={[
                    styles.dateChipText, 
                    scheduledDate && isEqual(startOfDay(day), startOfDay(scheduledDate)) && styles.chipTextSelected
                  ]}>
                    {format(day, 'MMM d')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Time Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Time</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 10:00 AM"
              value={scheduledTime}
              onChangeText={setScheduledTime}
              placeholderTextColor={COLORS.textPlaceholder}
            />
          </View>
          
          {/* Period Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Period</Text>
            <View style={styles.chipGrid}>
              <TouchableOpacity 
                style={[
                  styles.periodChip, 
                  period === Period.Morning && styles.chipSelected
                ]} 
                onPress={() => setPeriod(Period.Morning)}
              >
                <CleanIcon name="morning" size={14} color={
                  period === Period.Morning ? COLORS.textWhite : COLORS.textSecondary
                } />
                <Text style={[
                  styles.chipText, 
                  period === Period.Morning && styles.chipTextSelected
                ]}>
                  Morning
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.periodChip, 
                  period === Period.Evening && styles.chipSelected
                ]} 
                onPress={() => setPeriod(Period.Evening)}
              >
                <CleanIcon name="evening" size={14} color={
                  period === Period.Evening ? COLORS.textWhite : COLORS.textSecondary
                } />
                <Text style={[
                  styles.chipText, 
                  period === Period.Evening && styles.chipTextSelected
                ]}>
                  Evening
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.periodChip, 
                  period === Period.Miscellaneous && styles.chipSelected
                ]} 
                onPress={() => setPeriod(Period.Miscellaneous)}
              >
                <CleanIcon name="misc" size={14} color={
                  period === Period.Miscellaneous ? COLORS.textWhite : COLORS.textSecondary
                } />
                <Text style={[
                  styles.chipText, 
                  period === Period.Miscellaneous && styles.chipTextSelected
                ]}>
                  Anytime
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Priority Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Priority</Text>
            <View style={styles.chipGrid}>
              <TouchableOpacity 
                style={[
                  styles.priorityChip, 
                  priority === Priority.High && { backgroundColor: COLORS.priorityHigh }
                ]} 
                onPress={() => setPriority(Priority.High)}
              >
                <Text style={[
                  styles.chipText, 
                  priority === Priority.High && styles.chipTextSelected
                ]}>
                  High
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.priorityChip, 
                  priority === Priority.Medium && { backgroundColor: COLORS.priorityMedium }
                ]} 
                onPress={() => setPriority(Priority.Medium)}
              >
                <Text style={[
                  styles.chipText, 
                  priority === Priority.Medium && styles.chipTextSelected
                ]}>
                  Medium
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.priorityChip, 
                  priority === Priority.Low && { backgroundColor: COLORS.priorityLow }
                ]} 
                onPress={() => setPriority(Priority.Low)}
              >
                <Text style={[
                  styles.chipText, 
                  priority === Priority.Low && styles.chipTextSelected
                ]}>
                  Low
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Area Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Area</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.chipScrollContainer}
            >
              {areas.map(area => (
                <TouchableOpacity 
                  key={area.id}
                  style={[
                    styles.areaChip, 
                    areaId === area.id && { 
                      backgroundColor: area.color,
                      borderColor: area.color,
                    }
                  ]} 
                  onPress={() => setAreaId(area.id)}
                >
                  <Text style={[
                    styles.chipText, 
                    areaId === area.id && styles.chipTextSelected
                  ]}>
                    {area.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Action Button */}
        <TouchableOpacity 
          style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={!title.trim()}
        >
          <Text style={styles.saveButtonText}>Create Task</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

// --- Clean Minimal Styles ---
const styles = StyleSheet.create({
  modal: { 
    justifyContent: 'flex-end', 
    margin: 0 
  },
  modalContent: { 
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20,
    paddingTop: SPACING.s,
    paddingBottom: SPACING.xxl + 10,
    maxHeight: '90%',
    shadowColor: COLORS.shadowModal,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.m,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.l,
  },
  modalTitle: { 
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.chipDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
  },
  
  // Section Styles
  section: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: { 
    ...TYPOGRAPHY.label,
    color: COLORS.textTertiary,
    marginBottom: SPACING.s,
  },
  
  // Input Styles
  titleInput: { 
    ...TYPOGRAPHY.input,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: SPACING.m,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  input: { 
    ...TYPOGRAPHY.input,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: SPACING.m,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  // Chip Containers
  chipScrollContainer: { 
    flexDirection: 'row',
    gap: SPACING.s,
    paddingRight: SPACING.xl, // Extra padding for scroll
  },
  chipGrid: { 
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
  },
  
  // Date Chips
  dateChip: { 
    backgroundColor: COLORS.chipDefault,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateChipSelected: { 
    backgroundColor: COLORS.chipSelected,
    borderColor: COLORS.chipSelected,
  },
  dateChipText: { 
    ...TYPOGRAPHY.chip,
    color: COLORS.textSecondary,
  },
  
  // Period Chips
  periodChip: { 
    backgroundColor: COLORS.chipDefault,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    minWidth: 100,
    justifyContent: 'center',
  },
  
  // Priority Chips
  priorityChip: { 
    backgroundColor: COLORS.chipDefault,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 80,
    alignItems: 'center',
  },
  
  // Area Chips
  areaChip: { 
    backgroundColor: COLORS.chipDefault,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  // Chip States
  chipSelected: { 
    backgroundColor: COLORS.chipSelected,
    borderColor: COLORS.chipSelected,
  },
  chipText: { 
    ...TYPOGRAPHY.chip,
    color: COLORS.textSecondary,
  },
  chipTextSelected: { 
    color: COLORS.textWhite,
  },
  
  // Save Button
  saveButton: { 
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.l,
    padding: SPACING.m,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: { 
    ...TYPOGRAPHY.button,
    color: COLORS.textWhite,
  },
});