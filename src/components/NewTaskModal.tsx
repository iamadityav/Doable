import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { format, addDays, isEqual, startOfDay, setHours, setMinutes } from 'date-fns';
import { Task, Period, Priority, Area, SubTask } from '../modals';
import uuid from 'react-native-uuid';
import { AIService } from '../services/AIService';

// --- Theming & Constants ---
const COLORS = {
  background: '#FFFFFF',
  inputBackground: '#F8FAFC',
  chipDefault: '#F1F5F9',
  chipSelected: '#4F46E5',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textPlaceholder: '#94A3B8',
  textWhite: '#FFFFFF',
  priorityHigh: '#DC2626',
  priorityMedium: '#EA580C',
  priorityLow: '#16A34A',
  border: '#E2E8F0',
  primary: '#4F46E5',
  success: '#059669',
  danger: '#DC2626',
};

const SPACING = {
  s: 10,
  m: 16,
  l: 20,
  xl: 24,
};

const TYPOGRAPHY = {
  title: { fontSize: 22, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase' as const },
  input: { fontSize: 16, fontWeight: '500' },
  chip: { fontSize: 14, fontWeight: '500' },
  button: { fontSize: 16, fontWeight: '600' },
  timeDisplay: { fontSize: 28, fontWeight: '800' },
  timeButton: { fontSize: 18, fontWeight: '600' },
  subtask: { fontSize: 15, fontWeight: '500' },
};

// --- Helper & Sub-Components ---
const getUpcomingDays = (count: number): Date[] => Array.from({ length: count }, (_, i) => addDays(new Date(), i));

const CleanIcon: React.FC<{ name: string; size: number; color: string }> = ({ name, size, color }) => {
  const getEmoji = (iconName: string) => ({ 'morning': '🌅', 'evening': '🌙', 'misc': '📝', 'clock': '🕐', 'ai': '✨' }[iconName] || '📋');
  return <Text style={{ fontSize: size, color, lineHeight: size + 2 }}>{getEmoji(name)}</Text>;
};

const WheelPicker: React.FC<{ data: (string | number)[]; selectedIndex: number; onSelect: (index: number) => void; height?: number; itemHeight?: number }> = ({ data, selectedIndex, onSelect, height = 180, itemHeight = 36 }) => {
  const scrollViewRef = React.useRef<ScrollView>(null);
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: selectedIndex * itemHeight, animated: false });
  }, [selectedIndex, itemHeight]);
  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
    if (index !== selectedIndex) onSelect(index);
  };
  return (
    <View style={[styles.wheelContainer, { height }]}>
      <View style={[styles.selectionIndicator, { top: (height - itemHeight) / 2, height: itemHeight }]} />
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} snapToInterval={itemHeight} decelerationRate="fast" onMomentumScrollEnd={handleScroll} contentContainerStyle={{ paddingTop: (height - itemHeight) / 2, paddingBottom: (height - itemHeight) / 2 }}>
        {data.map((item, index) => (
          <TouchableOpacity key={index} style={[styles.wheelItem, { height: itemHeight }]} onPress={() => onSelect(index)}>
            <Text style={[styles.wheelItemText, selectedIndex === index && styles.wheelItemTextSelected]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const TimePicker: React.FC<{ isVisible: boolean; selectedTime: Date | null; onTimeSelect: (time: Date) => void; onClose: () => void }> = ({ isVisible, selectedTime, onTimeSelect, onClose }) => {
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const periods = ['AM', 'PM'];
  const [selectedHour, setSelectedHour] = useState(() => selectedTime ? (selectedTime.getHours() % 12 || 12) - 1 : 8);
  const [selectedMinute, setSelectedMinute] = useState(() => selectedTime ? selectedTime.getMinutes() : 0);
  const [selectedPeriod, setSelectedPeriod] = useState(() => selectedTime ? (selectedTime.getHours() < 12 ? 0 : 1) : 0);
  const handleConfirm = () => {
    const displayHour = parseInt(hours[selectedHour]);
    const hour24 = selectedPeriod === 0 ? (displayHour === 12 ? 0 : displayHour) : (displayHour === 12 ? 12 : displayHour + 12);
    onTimeSelect(setMinutes(setHours(new Date(), hour24), selectedMinute));
    onClose();
  };
  const getCurrentTime = () => {
    const displayHour = parseInt(hours[selectedHour]);
    const hour24 = selectedPeriod === 0 ? (displayHour === 12 ? 0 : displayHour) : (displayHour === 12 ? 12 : displayHour + 12);
    return format(setMinutes(setHours(new Date(), hour24), selectedMinute), 'h:mm a');
  };
  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} style={styles.timePickerModal} backdropOpacity={0.3} useNativeDriver>
      <View style={styles.timePickerContent}>
        <View style={styles.timePickerHeader}>
          <Text style={styles.timePickerTitle}>Select Time</Text>
          <Text style={styles.currentTimeText}>{getCurrentTime()}</Text>
        </View>
        <View style={styles.wheelPickersContainer}>
          <View style={styles.wheelPickerWrapper}><Text style={styles.wheelLabel}>Hour</Text><WheelPicker data={hours} selectedIndex={selectedHour} onSelect={setSelectedHour} /></View>
          <View style={styles.wheelPickerWrapper}><Text style={styles.wheelLabel}>Minute</Text><WheelPicker data={minutes} selectedIndex={selectedMinute} onSelect={setSelectedMinute} /></View>
          <View style={styles.wheelPickerWrapper}><Text style={styles.wheelLabel}>Period</Text><WheelPicker data={periods} selectedIndex={selectedPeriod} onSelect={setSelectedPeriod} /></View>
        </View>
        <View style={styles.timePickerActions}>
          <TouchableOpacity style={styles.timePickerCancelButton} onPress={onClose}><Text style={styles.timePickerCancelText}>Cancel</Text></TouchableOpacity>
          <TouchableOpacity style={styles.timePickerConfirmButton} onPress={handleConfirm}><Text style={styles.timePickerConfirmText}>Confirm</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const SubtaskItem: React.FC<{ subtask: SubTask; onToggle: () => void; onRemove: () => void; }> = ({ subtask, onToggle, onRemove }) => (
    <View style={styles.subtaskItem}>
        <TouchableOpacity style={[styles.subtaskCheckbox, subtask.completed && styles.subtaskCheckboxCompleted]} onPress={onToggle}>
            {subtask.completed && <Text style={styles.subtaskCheck}>✓</Text>}
        </TouchableOpacity>
        <Text style={[styles.subtaskTitle, subtask.completed && styles.subtaskTitleCompleted]}>{subtask.title}</Text>
        <TouchableOpacity onPress={onRemove}>
            <Text style={styles.subtaskRemove}>×</Text>
        </TouchableOpacity>
    </View>
);

// --- Component Props Interface ---
interface NewTaskModalProps {
  isVisible: boolean;
  taskToEdit?: Task | null;
  areas: Area[];
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id'|'createdAt'|'tags'|'completed'> | Task) => void;
  onDelete?: (taskId: string) => void;
}

// --- Unified New/Edit Task Modal Component ---
export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isVisible, taskToEdit, areas, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [period, setPeriod] = useState<Period>(Period.Morning);
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [areaId, setAreaId] = useState(areas.length > 0 ? areas[0].id : 'Personal');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const isEditMode = !!taskToEdit;
  const upcomingDays = getUpcomingDays(7);

  useEffect(() => {
    if (isVisible) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setNotes(taskToEdit.notes || '');
        setSubtasks(taskToEdit.subtasks || []);
        setPeriod(taskToEdit.period);
        setPriority(taskToEdit.priority);
        setAreaId(taskToEdit.areaId);
        setScheduledDate(taskToEdit.scheduledDate);
        if (taskToEdit.scheduledTime) {
            const [time, modifier] = taskToEdit.scheduledTime.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (hours === 12) hours = 0;
            if (modifier === 'PM') hours += 12;
            setScheduledTime(setMinutes(setHours(new Date(), hours), minutes));
        } else {
            setScheduledTime(null);
        }
      } else {
        resetForm();
      }
    }
  }, [taskToEdit, isVisible]);

  const handleAIAssist = async () => {
    if (!title.trim()) return;
    setIsGenerating(true);
    try {
      const generatedSubtasks = await AIService.breakdownTask(title);
      setSubtasks(prev => [...prev, ...generatedSubtasks]);
    } catch (error: any) {
      if (error.message === 'RATE_LIMIT_EXCEEDED') {
        Alert.alert("AI Limit Reached", "Upgrade to Pro for unlimited access!", [{ text: "Later" }, { text: "Upgrade", onPress: () => console.log("Navigate to upgrade") }]);
      } else {
        Alert.alert("Error", "Could not generate subtasks.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (title.trim()) {
      const timeString = scheduledTime ? format(scheduledTime, 'h:mm a') : '';
      const taskData = { title, notes, subtasks, period, priority, areaId, scheduledDate, scheduledTime: timeString };
      if (isEditMode && taskToEdit) {
        onSave({ ...taskToEdit, ...taskData });
      } else {
        onSave({ ...taskData, completed: false });
      }
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete && taskToEdit) {
        Alert.alert("Delete Task", "Are you sure?", [{ text: "Cancel" }, { text: "Delete", style: "destructive", onPress: () => { onDelete(taskToEdit.id); onClose(); }}]);
    }
  };

  const resetForm = () => {
    setTitle('');
    setNotes('');
    setSubtasks([]);
    setPeriod(Period.Morning);
    setPriority(Priority.Medium);
    setAreaId(areas.length > 0 ? areas[0].id : 'Personal');
    setScheduledDate(undefined);
    setScheduledTime(null);
  };

  return (
    <>
      <Modal isVisible={isVisible} onBackdropPress={() => { resetForm(); onClose(); }} style={styles.modal} avoidKeyboard backdropOpacity={0.4} animationIn="slideInUp" animationOut="slideOutDown" useNativeDriver>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <View style={styles.header}>
            <Text style={styles.modalTitle}>{isEditMode ? 'Edit Task' : 'New Task'}</Text>
            <TouchableOpacity onPress={() => { resetForm(); onClose(); }} style={styles.closeButton}><Text style={styles.closeButtonText}>×</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.section}>
              <TextInput style={styles.titleInput} placeholder="What do you need to do?" value={title} onChangeText={setTitle} autoFocus={!isEditMode} placeholderTextColor={COLORS.textPlaceholder} multiline />
              {title.trim().length > 0 && (
                <TouchableOpacity style={styles.aiButton} onPress={handleAIAssist} disabled={isGenerating}>
                  {isGenerating ? <ActivityIndicator size="small" color={COLORS.primary} /> : (
                    <>
                      <CleanIcon name="ai" size={14} color={COLORS.primary} />
                      <Text style={styles.aiButtonText}>Generate Subtasks with AI</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
            {subtasks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Subtasks</Text>
                {subtasks.map((sub, index) => (
                  <SubtaskItem key={sub.id} subtask={sub} onToggle={() => { const newSubs = [...subtasks]; newSubs[index].completed = !newSubs[index].completed; setSubtasks(newSubs); }} onRemove={() => setSubtasks(subtasks.filter(s => s.id !== sub.id))} />
                ))}
              </View>
            )}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Notes</Text>
              <TextInput style={styles.notesInput} placeholder="Add details..." value={notes} onChangeText={setNotes} placeholderTextColor={COLORS.textPlaceholder} multiline />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Schedule</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScrollContainer}>
                <TouchableOpacity style={[styles.dateChip, !scheduledDate && styles.dateChipSelected]} onPress={() => setScheduledDate(undefined)}><Text style={[styles.dateChipText, !scheduledDate && styles.chipTextSelected]}>Today</Text></TouchableOpacity>
                {upcomingDays.slice(1).map(day => (<TouchableOpacity key={day.toISOString()} style={[styles.dateChip, scheduledDate && isEqual(startOfDay(day), startOfDay(scheduledDate)) && styles.dateChipSelected]} onPress={() => setScheduledDate(day)}><Text style={[styles.dateChipText, scheduledDate && isEqual(startOfDay(day), startOfDay(scheduledDate)) && styles.chipTextSelected]}>{format(day, 'MMM d')}</Text></TouchableOpacity>))}
              </ScrollView>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Time</Text>
              <TouchableOpacity style={styles.timePickerTrigger} onPress={() => setShowTimePicker(true)}>
                <CleanIcon name="clock" size={18} color={scheduledTime ? COLORS.primary : COLORS.textTertiary} />
                <Text style={[styles.timePickerText, scheduledTime ? { color: COLORS.textPrimary } : { color: COLORS.textPlaceholder }]}>{scheduledTime ? format(scheduledTime, 'h:mm a') : 'Select time'}</Text>
                {scheduledTime && (<TouchableOpacity style={styles.timeClearButton} onPress={() => setScheduledTime(null)}><Text style={styles.timeClearText}>×</Text></TouchableOpacity>)}
              </TouchableOpacity>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Period</Text>
              <View style={styles.chipGrid}><TouchableOpacity style={[styles.periodChip, period === Period.Morning && styles.chipSelected]} onPress={() => setPeriod(Period.Morning)}><CleanIcon name="morning" size={14} color={period === Period.Morning ? COLORS.textWhite : COLORS.textSecondary} /><Text style={[styles.chipText, period === Period.Morning && styles.chipTextSelected]}>Morning</Text></TouchableOpacity><TouchableOpacity style={[styles.periodChip, period === Period.Evening && styles.chipSelected]} onPress={() => setPeriod(Period.Evening)}><CleanIcon name="evening" size={14} color={period === Period.Evening ? COLORS.textWhite : COLORS.textSecondary} /><Text style={[styles.chipText, period === Period.Evening && styles.chipTextSelected]}>Evening</Text></TouchableOpacity><TouchableOpacity style={[styles.periodChip, period === Period.Miscellaneous && styles.chipSelected]} onPress={() => setPeriod(Period.Miscellaneous)}><CleanIcon name="misc" size={14} color={period === Period.Miscellaneous ? COLORS.textWhite : COLORS.textSecondary} /><Text style={[styles.chipText, period === Period.Miscellaneous && styles.chipTextSelected]}>Anytime</Text></TouchableOpacity></View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Priority</Text>
              <View style={styles.chipGrid}><TouchableOpacity style={[styles.priorityChip, priority === Priority.High && { backgroundColor: COLORS.priorityHigh }]} onPress={() => setPriority(Priority.High)}><Text style={[styles.chipText, priority === Priority.High && styles.chipTextSelected]}>High</Text></TouchableOpacity><TouchableOpacity style={[styles.priorityChip, priority === Priority.Medium && { backgroundColor: COLORS.priorityMedium }]} onPress={() => setPriority(Priority.Medium)}><Text style={[styles.chipText, priority === Priority.Medium && styles.chipTextSelected]}>Medium</Text></TouchableOpacity><TouchableOpacity style={[styles.priorityChip, priority === Priority.Low && { backgroundColor: COLORS.priorityLow }]} onPress={() => setPriority(Priority.Low)}><Text style={[styles.chipText, priority === Priority.Low && styles.chipTextSelected]}>Low</Text></TouchableOpacity></View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Area</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScrollContainer}>
                {areas.map(area => (<TouchableOpacity key={area.id} style={[styles.areaChip, areaId === area.id && { backgroundColor: area.color, borderColor: area.color }]} onPress={() => setAreaId(area.id)}><Text style={[styles.chipText, areaId === area.id && styles.chipTextSelected]}>{area.name}</Text></TouchableOpacity>))}
              </ScrollView>
            </View>
          </ScrollView>
          <View style={styles.buttonContainer}>
            {isEditMode && (<TouchableOpacity style={styles.deleteButton} onPress={handleDelete}><Text style={styles.deleteButtonText}>Delete</Text></TouchableOpacity>)}
            <TouchableOpacity style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]} onPress={handleSave} disabled={!title.trim()}><Text style={styles.saveButtonText}>{isEditMode ? 'Save Changes' : 'Create Task'}</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TimePicker isVisible={showTimePicker} selectedTime={scheduledTime} onTimeSelect={setScheduledTime} onClose={() => setShowTimePicker(false)} />
    </>
  );
};

// --- Clean Minimal Styles ---
const styles = StyleSheet.create({
  modal: { justifyContent: 'flex-end', margin: 0 },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: SPACING.s, paddingBottom: SPACING.xxl + 10, maxHeight: '90%' },
  modalHandle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.m },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, marginBottom: SPACING.l },
  modalTitle: { ...TYPOGRAPHY.title, color: COLORS.textPrimary, flex: 1 },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.chipDefault, alignItems: 'center', justifyContent: 'center' },
  closeButtonText: { fontSize: 20, fontWeight: '300', color: COLORS.textSecondary, lineHeight: 24 },
  scrollContent: { paddingHorizontal: SPACING.xl },
  section: { marginBottom: SPACING.xl },
  sectionLabel: { ...TYPOGRAPHY.label, color: COLORS.textTertiary, marginBottom: SPACING.s },
  titleInput: { ...TYPOGRAPHY.input, backgroundColor: COLORS.inputBackground, borderRadius: 12, padding: SPACING.m, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, minHeight: 60, textAlignVertical: 'top' },
  aiButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.s, backgroundColor: COLORS.chipDefault, paddingVertical: SPACING.s, borderRadius: 8, marginTop: SPACING.m },
  aiButtonText: { ...TYPOGRAPHY.chip, color: COLORS.primary },
  subtaskItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.s, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  subtaskCheckbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, marginRight: SPACING.m },
  subtaskCheckboxCompleted: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  subtaskCheck: { color: '#FFFFFF', fontWeight: 'bold' },
  subtaskTitle: { ...TYPOGRAPHY.subtask, color: COLORS.textPrimary, flex: 1 },
  subtaskTitleCompleted: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  subtaskRemove: { color: COLORS.textTertiary, fontSize: 18 },
  notesInput: { ...TYPOGRAPHY.input, backgroundColor: COLORS.inputBackground, borderRadius: 12, padding: SPACING.m, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, minHeight: 100, textAlignVertical: 'top' },
  timePickerTrigger: { backgroundColor: COLORS.inputBackground, borderRadius: 12, padding: SPACING.m, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: SPACING.s },
  timePickerText: { ...TYPOGRAPHY.input, flex: 1 },
  timeClearButton: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.textTertiary, alignItems: 'center', justifyContent: 'center' },
  timeClearText: { color: COLORS.textWhite, fontSize: 16, fontWeight: '600', lineHeight: 18 },
  timePickerModal: { justifyContent: 'center', alignItems: 'center' },
  timePickerContent: { backgroundColor: COLORS.background, borderRadius: 20, padding: SPACING.xl, width: '90%', maxWidth: 420 },
  timePickerHeader: { alignItems: 'center', marginBottom: SPACING.xl },
  timePickerTitle: { ...TYPOGRAPHY.title, color: COLORS.textPrimary, textAlign: 'center', marginBottom: SPACING.s },
  currentTimeText: { ...TYPOGRAPHY.timeDisplay, color: COLORS.primary },
  wheelPickersContainer: { flexDirection: 'row', gap: SPACING.m, marginBottom: SPACING.xl },
  wheelPickerWrapper: { flex: 1, alignItems: 'center' },
  wheelLabel: { ...TYPOGRAPHY.label, color: COLORS.textTertiary, marginBottom: SPACING.s, textAlign: 'center' },
  wheelContainer: { backgroundColor: COLORS.inputBackground, borderRadius: 12, position: 'relative', overflow: 'hidden' },
  wheelItem: { justifyContent: 'center', alignItems: 'center' },
  wheelItemText: { ...TYPOGRAPHY.timeButton, color: COLORS.textSecondary },
  wheelItemTextSelected: { color: COLORS.textPrimary, fontWeight: '700' },
  selectionIndicator: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border },
  timePickerActions: { flexDirection: 'row', gap: SPACING.m, marginTop: SPACING.l },
  timePickerCancelButton: { flex: 1, backgroundColor: COLORS.chipDefault, paddingVertical: SPACING.m, borderRadius: 12, alignItems: 'center' },
  timePickerCancelText: { ...TYPOGRAPHY.button, color: COLORS.textSecondary },
  timePickerConfirmButton: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: SPACING.m, borderRadius: 12, alignItems: 'center' },
  timePickerConfirmText: { ...TYPOGRAPHY.button, color: COLORS.textWhite },
  chipScrollContainer: { flexDirection: 'row', gap: SPACING.s, paddingRight: SPACING.xl },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.s },
  dateChip: { backgroundColor: COLORS.chipDefault, paddingHorizontal: SPACING.m, paddingVertical: SPACING.s, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  dateChipSelected: { backgroundColor: COLORS.chipSelected, borderColor: COLORS.chipSelected },
  dateChipText: { ...TYPOGRAPHY.chip, color: COLORS.textSecondary },
  periodChip: { backgroundColor: COLORS.chipDefault, paddingHorizontal: SPACING.m, paddingVertical: SPACING.s, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, minWidth: 100, justifyContent: 'center' },
  priorityChip: { backgroundColor: COLORS.chipDefault, paddingHorizontal: SPACING.m, paddingVertical: SPACING.s, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, minWidth: 80, alignItems: 'center' },
  areaChip: { backgroundColor: COLORS.chipDefault, paddingHorizontal: SPACING.m, paddingVertical: SPACING.s, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  chipSelected: { backgroundColor: COLORS.chipSelected, borderColor: COLORS.chipSelected },
  chipText: { ...TYPOGRAPHY.chip, color: COLORS.textSecondary },
  chipTextSelected: { color: COLORS.textWhite },
  buttonContainer: { flexDirection: 'row', gap: SPACING.s, marginTop: SPACING.xl },
  deleteButton: { backgroundColor: COLORS.chipDefault, padding: SPACING.m, borderRadius: 12, alignItems: 'center', flex: 1 },
  deleteButtonText: { ...TYPOGRAPHY.button, color: COLORS.danger },
  saveButton: { backgroundColor: COLORS.primary, padding: SPACING.m, borderRadius: 12, alignItems: 'center', flex: 2 },
  saveButtonDisabled: { backgroundColor: COLORS.border },
  saveButtonText: { ...TYPOGRAPHY.button, color: COLORS.textWhite },
});
