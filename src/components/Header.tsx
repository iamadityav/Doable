import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useStreak } from '../hooks/useStreak'; // Import the useStreak hook

// --- Theming ---
const COLORS = {
  card: '#FFFFFF',
  text: '#000000',
  border: '#E5E5EA',
  success: '#34C759',
  background: '#F2F2F7',
};

const SPACING = {
  s: 16,
};

// --- Reusable Components ---
const SimpleIcon: React.FC<{ name: string; size: number; color: string }> = ({ name, size, color }) => {
  const getEmoji = (iconName: string) => ({
    'local-fire-department': '⚡️',
  }[iconName] || '•');
  return <Text style={{ fontSize: size, color, textAlign: 'center' }}>{getEmoji(name)}</Text>;
};

const StreakWidget: React.FC<{ streak: number }> = ({ streak }) => (
  <View style={styles.streakWidget}>
    <SimpleIcon name="local-fire-department" size={16} color={COLORS.success} />
    <Text style={styles.streakText}>{streak}</Text>
  </View>
);

// --- Component Props Interface ---
interface HeaderProps {
  title: string;
  // streakCount prop is no longer needed
}

// --- Header Component ---
export const Header: React.FC<HeaderProps> = ({ title }) => {
  // Get streak data directly from the hook
  const { streak } = useStreak();

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Image
          source={require('../assets/icon.png')}
          style={styles.headerIcon}
        />
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {/* Use the streak count from the hook */}
      <StreakWidget streak={streak.currentStreak} />
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  header: {
    // backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.s,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Align items to sides
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  streakWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text, // Changed to black for better contrast
    marginLeft: 4,
  },
});
