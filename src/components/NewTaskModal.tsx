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

// --- Theming ---
const COLORS = {
  primary: '#007AFF',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  priorityHigh: '#FF3B30',
  priorityMedium: '#FF9500',
  priorityLow: '#34C759',
};

// --- Helper to generate dates ---
const getUpcomingDays = (count: number): Date[] => {
  return Array.from({ length: count }, (_, i) => addDays(new Date(), i));
};

// --- Component Props Interface ---
interface NewTaskModalProps {
  isVisible: boolean;
  areas: Area[];
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id'|'completed'|'createdAt'|'subtasks'|'tags'>) => void;
}

// --- New Task Modal Component ---
export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isVisible, areas, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState<Period>(Period.Morning);
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [areaId, setAreaId] = useState(areas.length > 0 ? areas[0].id : 'Personal');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);

  const upcomingDays = getUpcomingDays(30);

  const handleSave = () => {
    if (title.trim()) {
      onSave({ title, period, priority, areaId, scheduledDate });
      // Reset form
      setTitle('');
      setPeriod(Period.Morning);
      setPriority(Priority.Medium);
      setScheduledDate(undefined);
      setAreaId(areas.length > 0 ? areas[0].id : 'Personal');
      onClose();
    }
  };

  const handleClose = () => {
    // Reset form on close
    setTitle('');
    setPeriod(Period.Morning);
    setPriority(Priority.Medium);
    setScheduledDate(undefined);
    setAreaId(areas.length > 0 ? areas[0].id : 'Personal');
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      style={styles.modal}
      avoidKeyboard
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>New Task</Text>
        <TextInput
          style={styles.input}
          placeholder="What do you need to do?"
          value={title}
          onChangeText={setTitle}
          autoFocus
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>Schedule</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
          <TouchableOpacity
            style={[styles.chip, !scheduledDate && styles.chipSelected]}
            onPress={() => setScheduledDate(undefined)}
          >
            <Text style={[styles.chipText, !scheduledDate && styles.chipTextSelected]}>Today</Text>
          </TouchableOpacity>
          {upcomingDays.slice(1).map(day => (
            <TouchableOpacity
              key={day.toISOString()}
              style={[
                styles.chip,
                scheduledDate && isEqual(startOfDay(day), startOfDay(scheduledDate)) && styles.chipSelected
              ]}
              onPress={() => setScheduledDate(day)}
            >
              <Text style={[styles.chipText, scheduledDate && isEqual(startOfDay(day), startOfDay(scheduledDate)) && styles.chipTextSelected]}>
                {format(day, 'MMM d')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Period</Text>
        <View style={styles.chipContainer}>
          <TouchableOpacity style={[styles.chip, period === Period.Morning && styles.chipSelected]} onPress={() => setPeriod(Period.Morning)}>
            <Text style={[styles.chipText, period === Period.Morning && styles.chipTextSelected]}>☀️ Morning</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, period === Period.Evening && styles.chipSelected]} onPress={() => setPeriod(Period.Evening)}>
            <Text style={[styles.chipText, period === Period.Evening && styles.chipTextSelected]}>🌙 Evening</Text>
          </TouchableOpacity>
           <TouchableOpacity style={[styles.chip, period === Period.Miscellaneous && styles.chipSelected]} onPress={() => setPeriod(Period.Miscellaneous)}>
            <Text style={[styles.chipText, period === Period.Miscellaneous && styles.chipTextSelected]}>📋 Misc</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Priority</Text>
        <View style={styles.chipContainer}>
           <TouchableOpacity style={[styles.chip, priority === Priority.High && styles.chipSelectedHigh]} onPress={() => setPriority(Priority.High)}>
            <Text style={[styles.chipText, priority === Priority.High && styles.chipTextSelected]}>High</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, priority === Priority.Medium && styles.chipSelectedMedium]} onPress={() => setPriority(Priority.Medium)}>
            <Text style={[styles.chipText, priority === Priority.Medium && styles.chipTextSelected]}>Medium</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, priority === Priority.Low && styles.chipSelectedLow]} onPress={() => setPriority(Priority.Low)}>
            <Text style={[styles.chipText, priority === Priority.Low && styles.chipTextSelected]}>Low</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Area</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
          {areas.map(area => (
             <TouchableOpacity
                key={area.id}
                style={[styles.chip, areaId === area.id && { backgroundColor: area.color }]}
                onPress={() => setAreaId(area.id)}
             >
                <Text style={[styles.chipText, areaId === area.id && styles.chipTextSelected]}>{area.name}</Text>
             </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Task</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  modal: { justifyContent: 'flex-end', margin: 0 },
  modalContent: { backgroundColor: 'white', padding: 22, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: COLORS.background, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
  label: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8, textTransform: 'uppercase', fontWeight: '600' },
  chipContainer: { flexDirection: 'row', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  chip: { backgroundColor: COLORS.background, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  chipSelected: { backgroundColor: COLORS.primary },
  chipSelectedHigh: { backgroundColor: COLORS.priorityHigh },
  chipSelectedMedium: { backgroundColor: COLORS.priorityMedium },
  chipSelectedLow: { backgroundColor: COLORS.priorityLow },
  chipText: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  chipTextSelected: { color: COLORS.card },
  saveButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
