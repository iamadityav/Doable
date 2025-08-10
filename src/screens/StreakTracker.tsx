import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStreak } from '../hooks/useStreak';
import { useTasks } from '../hooks/useTask';

// --- Theming ---
const COLORS = {
  primary: '#007AFF',
  background: '#F2F2F7',
  card: '#FFFFFF',
  success: '#34C759',
  warning: '#FF9500',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
};

const SPACING = {
  s: 16,
  m: 24,
  l: 32,
};

// --- Reusable Components ---
const SimpleIcon: React.FC<{ name: string; size: number; color?: string }> = ({ name, size, color = COLORS.text }) => {
  const getEmoji = (iconName: string) => ({
    'fire': '🔥', 'trophy': '🏆', 'check': '✅',
  }[iconName] || '•');
  return <Text style={{ fontSize: size, color, textAlign: 'center' }}>{getEmoji(name)}</Text>;
};

// --- Screen-Specific Components ---
const StatCard: React.FC<{ icon: string; value: string | number; label: string; color: string }> = ({ icon, value, label, color }) => (
    <View style={styles.statCard}>
        <SimpleIcon name={icon} size={24} color={color} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const CircularProgress: React.FC<{ streak: number }> = ({ streak }) => {
    // Basic circular view for now. A library like react-native-svg could make this a proper progress circle.
    return (
        <View style={styles.progressCircle}>
            <SimpleIcon name="fire" size={40} color={COLORS.warning} />
            <Text style={styles.progressText}>{streak}</Text>
            <Text style={styles.progressLabel}>Day Streak</Text>
        </View>
    );
};

// --- Main Screen Component ---
const StreakTrackerScreen: React.FC = () => {
  const { streak } = useStreak();
  const { tasks } = useTasks();

  const totalTasksCompleted = tasks.filter(t => t.completed).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🔥</Text>
        <Text style={styles.headerTitle}>Streak Tracker</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.mainTitle}>Keep the Fire Going!</Text>
        
        <CircularProgress streak={streak.currentStreak} />

        <View style={styles.statsContainer}>
            <StatCard icon="trophy" value={streak.longestStreak} label="Longest Streak" color={COLORS.primary} />
            <StatCard icon="check" value={totalTasksCompleted} label="Tasks Completed" color={COLORS.success} />
        </View>

        {/* A motivational quote or tip could go here */}
        <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>"The secret of getting ahead is getting started."</Text>
            <Text style={styles.quoteAuthor}>- Mark Twain</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.s,
    paddingTop: SPACING.s,
    paddingBottom: SPACING.m,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerIcon: {
    fontSize: 28,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollViewContent: {
      alignItems: 'center',
      padding: SPACING.m,
  },
  mainTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: COLORS.textSecondary,
      marginBottom: SPACING.l,
  },
  progressCircle: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: COLORS.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.l,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
  },
  progressText: {
      fontSize: 64,
      fontWeight: 'bold',
      color: COLORS.text,
  },
  progressLabel: {
      fontSize: 16,
      color: COLORS.textSecondary,
      marginTop: -8,
  },
  statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: SPACING.l,
  },
  statCard: {
      backgroundColor: COLORS.card,
      borderRadius: 12,
      padding: SPACING.s,
      alignItems: 'center',
      width: '45%',
  },
  statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.text,
      marginVertical: 4,
  },
  statLabel: {
      fontSize: 14,
      color: COLORS.textSecondary,
  },
  quoteCard: {
      backgroundColor: COLORS.card,
      borderRadius: 12,
      padding: SPACING.m,
      width: '100%',
      alignItems: 'center',
  },
  quoteText: {
      fontSize: 16,
      fontStyle: 'italic',
      color: COLORS.text,
      textAlign: 'center',
  },
  quoteAuthor: {
      fontSize: 14,
      color: COLORS.textSecondary,
      marginTop: 8,
  }
});

export default StreakTrackerScreen;
