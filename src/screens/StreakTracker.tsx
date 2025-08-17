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
import { Header } from '../components/Header';
import { format, subDays, isSameDay } from 'date-fns';

// --- Theming ---
const COLORS = {
  background: '#FFFFFF',
  cardDefault: '#FBFBFB',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  primary: '#4F46E5',
  success: '#059669',
  warning: '#EA580C',
  streak: '#F59E0B',
  border: '#F3F4F6',
  streakGlow: '#FEF3C7',
  primaryGlow: '#EEF2FF',
  successGlow: '#ECFDF5',
};

const SPACING = {
  s: 10,
  m: 16,
  l: 20,
  xl: 24,
};

const TYPOGRAPHY = {
  hero: { fontSize: 28, fontWeight: '800' },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '500' },
  caption: { fontSize: 12, fontWeight: '500' },
  statNumber: { fontSize: 24, fontWeight: '700' },
};

// --- Reusable Components ---
const CleanIcon: React.FC<{ name: string; size: number; color?: string }> = ({ name, size, color = COLORS.textPrimary }) => {
  const getEmoji = (iconName: string) => ({
    'fire': '🔥', 
    'trophy': '🏆', 
    'target': '🎯',
  }[iconName] || '•');
  
  return <Text style={{ fontSize: size, color, lineHeight: size + 2 }}>{getEmoji(name)}</Text>;
};

// --- Screen-Specific Components ---
const StatCard: React.FC<{ 
  icon: string; 
  value: string | number; 
  label: string; 
  color: string;
  accent: string;
}> = ({ icon, value, label, color, accent }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: accent }]}>
      <CleanIcon name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const StreakCalendar: React.FC<{ streak: number, lastCompletionDate?: Date }> = ({ streak, lastCompletionDate }) => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    
    return (
        <View style={styles.calendarContainer}>
            {days.map((day, index) => {
                const isLit = streak > 0 && lastCompletionDate && (index >= 7 - streak || isSameDay(day, lastCompletionDate));
                return (
                    <View key={index} style={styles.dayCell}>
                        <Text style={styles.dayLabel}>{format(day, 'E')}</Text>
                        <View style={[styles.dayDot, isLit && styles.dayDotLit]}>
                            {isLit && <CleanIcon name="fire" size={12} />}
                        </View>
                    </View>
                );
            })}
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
      <Header title="Streak Tracker" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Week's Progress</Text>
            <StreakCalendar streak={streak.currentStreak} lastCompletionDate={streak.lastCompletionDate} />
        </View>
        
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.metricsGrid}>
              <StatCard 
                icon="fire" 
                value={streak.currentStreak} 
                label="Current Streak" 
                color={COLORS.streak}
                accent={COLORS.streakGlow}
              />
              <StatCard 
                icon="trophy" 
                value={streak.longestStreak} 
                label="Best Streak" 
                color={COLORS.primary}
                accent={COLORS.primaryGlow}
              />
            </View>
            <View style={styles.singleMetricContainer}>
              <StatCard 
                icon="target" 
                value={totalTasksCompleted} 
                label="Total Tasks Done" 
                color={COLORS.success}
                accent={COLORS.successGlow}
              />
            </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Clean Minimal Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
  },
  section: {
      marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    marginBottom: SPACING.m,
  },
  
  // Calendar Styles
  calendarContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: COLORS.cardDefault,
      padding: SPACING.m,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
  },
  dayCell: {
      alignItems: 'center',
  },
  dayLabel: {
      ...TYPOGRAPHY.caption,
      color: COLORS.textSecondary,
      marginBottom: SPACING.s,
  },
  dayDot: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: COLORS.border,
      alignItems: 'center',
      justifyContent: 'center',
  },
  dayDotLit: {
      backgroundColor: COLORS.streakGlow,
  },

  // Metrics Section
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.s,
    marginBottom: SPACING.s,
  },
  singleMetricContainer: {
    alignItems: 'stretch',
  },
  
  // Stat Card
  statCard: {
    backgroundColor: COLORS.cardDefault,
    borderRadius: 12,
    padding: SPACING.m,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.s,
  },
  statValue: {
    ...TYPOGRAPHY.statNumber,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default StreakTrackerScreen;
