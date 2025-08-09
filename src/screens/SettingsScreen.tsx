import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

// Colors from blueprint
const COLORS = {
  primary: '#007AFF',
  background: '#F2F2F7',
  card: '#FFFFFF',
  success: '#34C759',
  purple: '#AF52DE',
  warning: '#FF9500',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
};

// Spacing from blueprint
const SPACING = {
  xs: 8,
  s: 16,
  m: 24,
};

// --- Reusable Components ---

// Simple Icon component with emoji
const SimpleIcon: React.FC<{ name: string; size: number; color?: string; style?: object }> = ({ 
  name, 
  size, 
  color = COLORS.text,
  style 
}) => {
  const getEmoji = (iconName: string) => {
    switch (iconName) {
      case 'logbook': return '📖';
      case 'mood': return '😊';
      case 'star': return '🌟';
      case 'notifications': return '🔔';
      case 'appearance': return '🎨';
      case 'shortcuts': return '🔗';
      case 'help': return '❓';
      case 'rate': return '❤️';
      case 'chevron': return '›';
      default: return '•';
    }
  };

  return (
    <Text style={[{ fontSize: size, color, textAlign: 'center' }, style]}>
      {getEmoji(name)}
    </Text>
  );
};

interface SettingsRowProps {
  icon: string;
  iconColor: string;
  title: string;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ icon, iconColor, title, onPress, isFirst, isLast }) => {
  const rowStyle = [
    styles.settingsRow,
    isFirst && styles.firstRow,
    isLast && styles.lastRow,
    !isLast && styles.rowSeparator,
  ];

  return (
    <TouchableOpacity style={rowStyle} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <SimpleIcon name={icon} size={16} color={COLORS.card} />
      </View>
      <Text style={styles.rowTitle}>{title}</Text>
      <SimpleIcon name="chevron" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
};

const ProRow: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <LinearGradient
      colors={['#6EB5FF', '#AF52DE']}
      style={[styles.settingsRow, styles.proRow]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.iconContainer}>
         <SimpleIcon name="star" size={16} color={COLORS.warning} />
      </View>
      <Text style={[styles.rowTitle, styles.proText]}>Upgrade to Pro</Text>
    </LinearGradient>
  </TouchableOpacity>
);


// --- Main Screen Component ---

const SettingsScreen: React.FC = () => {
  const appVersion = '1.0.0 (Build 1)'; // Example version

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>⚙️</Text>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Section 1: Analytics */}
          <View style={styles.section}>
            <SettingsRow 
              icon="logbook" 
              iconColor={COLORS.primary} 
              title="Logbook" 
              onPress={() => console.log('Navigate to Logbook')} 
              isFirst 
            />
            <SettingsRow 
              icon="mood" 
              iconColor={COLORS.success} 
              title="Mood Tracker" 
              onPress={() => console.log('Navigate to Mood')} 
              isLast 
            />
          </View>
          
          {/* Section 2: Pro */}
          <View style={styles.section}>
            <ProRow onPress={() => console.log('Show Pro modal')} />
          </View>

          {/* Section 3: General */}
          <View style={styles.section}>
            <SettingsRow 
              icon="notifications" 
              iconColor={COLORS.warning} 
              title="Notifications" 
              onPress={() => console.log('Navigate to Notifications')}
              isFirst
            />
            <SettingsRow 
              icon="appearance" 
              iconColor={COLORS.purple} 
              title="Appearance" 
              onPress={() => console.log('Navigate to Appearance')}
            />
            <SettingsRow 
              icon="shortcuts" 
              iconColor={COLORS.textSecondary} 
              title="Siri & Shortcuts" 
              onPress={() => console.log('Navigate to Shortcuts')}
              isLast
            />
          </View>

          {/* Section 4: Support */}
           <View style={styles.section}>
            <SettingsRow 
              icon="help" 
              iconColor={COLORS.primary} 
              title="Help & Feedback" 
              onPress={() => console.log('Open Help')}
              isFirst
            />
            <SettingsRow 
              icon="rate" 
              iconColor={COLORS.deadline} 
              title="Rate Routine Buddy" 
              onPress={() => console.log('Open App Store')}
              isLast
            />
          </View>

          <Text style={styles.footerText}>Routine Buddy v{appVersion}</Text>
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
    marginRight: SPACING.xs,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.s,
    gap: SPACING.m,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.s,
    minHeight: 48,
    backgroundColor: COLORS.card,
  },
  rowSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginLeft: 54, // Aligns separator with text
  },
  firstRow: {},
  lastRow: {},
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.s,
  },
  rowTitle: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  proRow: {
    borderRadius: 12,
  },
  proText: {
    color: COLORS.card,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.m,
  },
});

export default SettingsScreen;
