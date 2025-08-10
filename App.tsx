import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import your screens
import TodayScreen from './src/screens/TodayScreen';
import UpcomingScreen from './src/screens/UpcomingScreen';
import AreasScreen from './src/screens/AreasScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { Image } from 'react-native';
import LogbookScreen from './src/screens/LogbookScreen';
import StreakTrackerScreen from './src/screens/StreakTracker';

// --- Helper Components ---

// Simple Icon component with emojis
const EmojiIcon: React.FC<{ name: string; size: number; color: string }> = ({ 
  name, 
  size, 
  color 
}) => {
  const getEmoji = (iconName: string) => {
    switch (iconName) {
      case 'today': return '📅';
      case 'upcoming': return '⏰';
      case 'areas': return '📊';
      case 'settings': return '⚙️';
      default: return '•';
    }
  };

  return (
    <Text style={{ fontSize: size, textAlign: 'center' }}>
      {getEmoji(name)}
    </Text>
  );
};

// Temporary placeholder screens
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{title}</Text>
    <Text style={styles.placeholderSubtext}>Coming Soon</Text>
  </View>
);

// --- App Colors ---
const COLORS = {
  primary: '#007AFF',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
};

// --- Updated 4-Tab Configuration ---
const tabs = [
  { id: 'today', name: 'Today', icon: 'today' },
  { id: 'upcoming', name: 'Upcoming', icon: 'upcoming' },
  { id: 'areas', name: 'Areas', icon: 'areas' },
  { id: 'settings', name: 'Settings', icon: 'settings' },
];

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('today');

    const navigateTo = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'today':
        return <TodayScreen />;
      case 'upcoming':
        return <UpcomingScreen />;
      case 'areas':
        // This will be your main screen for managing projects and areas
        return <AreasScreen />;
      case 'settings':
        // This screen will contain links to Logbook, Mood, etc.
        return <SettingsScreen navigateTo={navigateTo} />;
      case 'logbook':
        // This screen will contain links to Logbook, Mood, etc.
        return < LogbookScreen />;
      case 'Streaks':
        // This screen will contain links to Logbook, Mood, etc.
        return < StreakTrackerScreen />;
      default:
        return <TodayScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />
      <View style={styles.container}>
        {/* Main Content */}
        <View style={styles.content}>
          {renderScreen()}
        </View>

        {/* Custom Tab Bar */}
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.id)}
            >
              <EmojiIcon
                name={tab.icon}
                size={24}
                color={activeTab === tab.id ? COLORS.primary : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: activeTab === tab.id ? COLORS.primary : COLORS.textSecondary,
                  },
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaProvider>

    //     <SafeAreaProvider>
    //   <StatusBar
    //     barStyle="dark-content"
    //     backgroundColor={COLORS.background}
    //   />
    //   <View style={styles.container}>
    //     {/* Main Content */}
    //     <View style={styles.content}>
    //       {renderScreen()}
    //     </View>

    //     {/* Custom Tab Bar */}
    //     <View style={styles.tabBar}>
    //       {tabs.map((tab) => (
    //         <TouchableOpacity
    //           key={tab.id}
    //           style={styles.tabItem}
    //           onPress={() => setActiveTab(tab.id)}
    //         >
    //           {/* Use the new icon for the 'Today' tab */}
    //           {tab.id === 'today' ? (
    //             <Image
    //               source={require('./src/assets/icon.png')}
    //               style={[
    //                 styles.icon,
    //                 { tintColor: activeTab === tab.id ? COLORS.primary : COLORS.textSecondary },
    //               ]}
    //             />
    //           ) : (
    //             // Fallback to text for other icons for now
    //             <Text style={{color: activeTab === tab.id ? COLORS.primary : COLORS.textSecondary}}>{tab.icon.charAt(0).toUpperCase()}</Text>
    //           )}
    //           <Text
    //             style={[
    //               styles.tabLabel,
    //               {
    //                 color: activeTab === tab.id ? COLORS.primary : COLORS.textSecondary,
    //               },
    //             ]}
    //           >
    //             {tab.name}
    //           </Text>
    //         </TouchableOpacity>
    //       ))}
    //     </View>
    //   </View>
    // </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderTopColor: '#E5E5EA',
    borderTopWidth: 0.5,
    paddingBottom: 6,
    paddingTop: 6,
    height: 84, // Standard height for tab bar with labels
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  placeholderText: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 17,
    color: COLORS.textSecondary,
  },
    icon: {
    width: 28,
    height: 28,
    marginBottom: 2,
  },
});

export default App;
