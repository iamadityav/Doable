import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import Modal from 'react-native-modal';

// --- Theming ---
const COLORS = {
  primary: '#007AFF',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
};

// --- Component Props Interface ---
interface NewProjectModalProps {
  isVisible: boolean;
  areaName: string; // The name of the area to display in the title
  onClose: () => void;
  onSave: (data: { title: string }) => void;
}

// --- New Project Modal Component ---
export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isVisible,
  areaName,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');

  const handleSave = () => {
    if (title.trim()) {
      onSave({ title });
      setTitle(''); // Reset form
      onClose();
    }
  };

  const handleClose = () => {
    setTitle(''); // Reset form on close
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      style={styles.modal}
      avoidKeyboard
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
    >
      <View style={styles.modalContent}>
        {/* The title is now dynamic */}
        <Text style={styles.modalTitle}>{`New ${areaName} Project`}</Text>
        <TextInput
          style={styles.input}
          placeholder="Project Title (e.g., '2025 Marathon')"
          value={title}
          onChangeText={setTitle}
          autoFocus
          placeholderTextColor={COLORS.textSecondary}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Project</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
