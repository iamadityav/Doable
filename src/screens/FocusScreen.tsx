import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';

// --- Theming ---
const COLORS = {
  background: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  primary: '#4F46E5',
  danger: '#DC2626',
  border: '#F3F4F6',
  cardDefault: '#FBFBFB',
  bird: '#4F46E5', // Primary blue like the icon
  birdWing: '#3B82F6', // Lighter blue for wings
  birdBeak: '#F59E0B', // Orange beak
  cloud: '#E5E7EB',
  cloudShadow: '#D1D5DB',
};

const SPACING = {
  m: 16,
  l: 20,
  xl: 24,
  xxl: 32,
};

const TYPOGRAPHY = {
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 16, fontWeight: '600' },
  button: { fontSize: 16, fontWeight: '600' },
  small: { fontSize: 14, fontWeight: '500' },
  timer: { fontSize: 18, fontWeight: '600', fontVariant: ['tabular-nums'] },
};

// --- Cloud Component ---
const Cloud = ({ style, size = 'medium' }) => {
  const cloudSizes = {
    small: { width: 60, height: 35 },
    medium: { width: 80, height: 45 },
    large: { width: 100, height: 55 },
  };

  const { width, height } = cloudSizes[size];

  return (
    <View style={[styles.cloud, { width, height }, style]}>
      <View style={[styles.cloudPart, { width: width * 0.4, height: height * 0.6, left: 0, top: height * 0.2 }]} />
      <View style={[styles.cloudPart, { width: width * 0.5, height: height * 0.8, left: width * 0.25, top: 0 }]} />
      <View style={[styles.cloudPart, { width: width * 0.4, height: height * 0.7, left: width * 0.6, top: height * 0.15 }]} />
    </View>
  );
};

// --- Flying Bird Component ---
const FlyingBird = ({ isActive, gameSize }) => {
  const [birdPosition] = useState(new Animated.ValueXY({ x: 50, y: gameSize / 2 }));
  const [wingFlap] = useState(new Animated.Value(0));
  const [clouds] = useState([
    { id: 1, x: new Animated.Value(gameSize + 50), y: 40, size: 'small' },
    { id: 2, x: new Animated.Value(gameSize + 150), y: 120, size: 'medium' },
    { id: 3, x: new Animated.Value(gameSize + 300), y: 200, size: 'large' },
    { id: 4, x: new Animated.Value(gameSize + 450), y: 60, size: 'medium' },
  ]);

  // Wing flapping animation
  useEffect(() => {
    if (isActive) {
      const flapAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(wingFlap, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(wingFlap, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
      flapAnimation.start();
      return () => flapAnimation.stop();
    }
  }, [isActive, wingFlap]);

  // Smooth bird movement (figure-8 pattern)
  useEffect(() => {
    if (isActive) {
      const smoothMovement = Animated.loop(
        Animated.parallel([
          // Horizontal movement
          Animated.sequence([
            Animated.timing(birdPosition.x, {
              toValue: gameSize - 100,
              duration: 6000,
              useNativeDriver: false,
            }),
            Animated.timing(birdPosition.x, {
              toValue: 50,
              duration: 6000,
              useNativeDriver: false,
            }),
          ]),
          // Vertical floating with sine-wave-like movement
          Animated.sequence([
            Animated.timing(birdPosition.y, {
              toValue: gameSize / 2 - 60,
              duration: 3000,
              useNativeDriver: false,
            }),
            Animated.timing(birdPosition.y, {
              toValue: gameSize / 2 + 60,
              duration: 6000,
              useNativeDriver: false,
            }),
            Animated.timing(birdPosition.y, {
              toValue: gameSize / 2,
              duration: 3000,
              useNativeDriver: false,
            }),
          ]),
        ])
      );
      smoothMovement.start();
      return () => smoothMovement.stop();
    }
  }, [isActive, birdPosition, gameSize]);

  // Cloud movement
  useEffect(() => {
    if (isActive) {
      const cloudAnimations = clouds.map(cloud => {
        const moveCloud = () => {
          cloud.x.setValue(gameSize + 100);
          return Animated.timing(cloud.x, {
            toValue: -100,
            duration: 8000 + Math.random() * 4000, // Vary speed
            useNativeDriver: false,
          });
        };

        const loopAnimation = Animated.loop(moveCloud());
        loopAnimation.start();
        return loopAnimation;
      });

      return () => {
        cloudAnimations.forEach(animation => animation.stop());
      };
    }
  }, [isActive, clouds, gameSize]);

  const wingRotation = wingFlap.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-15deg'],
  });

  return (
    <View style={[styles.gameBoard, { width: gameSize, height: gameSize }]}>
      {/* Clouds */}
      {clouds.map(cloud => (
        <Animated.View
          key={cloud.id}
          style={[
            styles.cloudContainer,
            {
              transform: [{ translateX: cloud.x }],
              top: cloud.y,
            },
          ]}
        >
          <Cloud size={cloud.size} />
        </Animated.View>
      ))}

      {/* Flying Bird */}
      <Animated.View
        style={[
          styles.birdContainer,
          {
            transform: [
              { translateX: birdPosition.x },
              { translateY: birdPosition.y },
            ],
          },
        ]}
      >
        {/* Bird Body */}
        <View style={styles.birdBody} />
        
        {/* Bird Head */}
        <View style={styles.birdHead} />
        
        {/* Bird Beak */}
        <View style={styles.birdBeak} />
        
        {/* Bird Wings */}
        <Animated.View
          style={[
            styles.birdWingLeft,
            { transform: [{ rotate: wingRotation }] },
          ]}
        />
        <Animated.View
          style={[
            styles.birdWingRight,
            { transform: [{ rotate: wingRotation }] },
          ]}
        />
        
        {/* Bird Tail */}
        <View style={styles.birdTail} />
      </Animated.View>
    </View>
  );
};

// --- Main Screen Component ---
const FocusScreen = () => {
  const [duration, setDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  const { width } = Dimensions.get('window');
  const gameSize = width - SPACING.xl * 2;

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Focus Mode" />

      <View style={styles.content}>
        <View style={styles.timerDisplay}>
          <Text style={styles.timerLabel}>Time Left</Text>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>

        <FlyingBird
          isActive={isActive}
          gameSize={gameSize}
        />

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={() => { 
              setIsActive(false); 
              setTimeLeft(duration); 
            }}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainButton, isActive && styles.pauseButton]}
            onPress={() => setIsActive(!isActive)}
          >
            <Text style={styles.mainButtonText}>{isActive ? 'Pause' : 'Start'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.xl,
  },
  timerDisplay: {
    alignItems: 'center',
  },
  timerLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },
  timerText: {
    ...TYPOGRAPHY.timer,
    color: COLORS.textPrimary,
  },
  scoreLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },
  scoreText: {
    ...TYPOGRAPHY.timer,
    color: COLORS.textPrimary,
  },
  
  // Game Board (transparent background)
  gameBoard: {
    position: 'relative',
    // No background or border for transparency
  },

  // Bird Components (Original simple design with new colors)
  birdContainer: {
    position: 'absolute',
    width: 40,
    height: 30,
  },
  birdBody: {
    position: 'absolute',
    width: 20,
    height: 12,
    backgroundColor: COLORS.bird,
    borderRadius: 6,
    left: 10,
    top: 9,
  },
  birdHead: {
    position: 'absolute',
    width: 12,
    height: 10,
    backgroundColor: COLORS.bird,
    borderRadius: 5,
    left: 28,
    top: 8,
  },
  birdBeak: {
    position: 'absolute',
    width: 6,
    height: 3,
    backgroundColor: COLORS.birdBeak,
    borderRadius: 1,
    left: 38,
    top: 11,
  },
  birdWingLeft: {
    position: 'absolute',
    width: 15,
    height: 8,
    backgroundColor: COLORS.birdWing,
    borderRadius: 4,
    left: 8,
    top: 6,
    transformOrigin: 'center',
  },
  birdWingRight: {
    position: 'absolute',
    width: 15,
    height: 8,
    backgroundColor: COLORS.birdWing,
    borderRadius: 4,
    left: 8,
    top: 16,
    transformOrigin: 'center',
  },
  birdTail: {
    position: 'absolute',
    width: 8,
    height: 6,
    backgroundColor: COLORS.birdWing,
    borderRadius: 3,
    left: 2,
    top: 12,
  },

  // Cloud Components
  cloudContainer: {
    position: 'absolute',
  },
  cloud: {
    position: 'relative',
  },
  cloudPart: {
    position: 'absolute',
    backgroundColor: COLORS.cloud,
    borderRadius: 50,
  },

  // Controls
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.m,
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: COLORS.danger,
  },
  mainButtonText: {
    ...TYPOGRAPHY.button,
    color: '#FFFFFF',
  },
  resetButton: {
    backgroundColor: COLORS.cardDefault,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resetButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textSecondary,
  },
});

export default FocusScreen;