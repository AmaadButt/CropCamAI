import React, { useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';

export type FocusRingProps = {
  x: number;
  y: number;
  visible: boolean;
  size?: number;
};

const FocusRing: React.FC<FocusRingProps> = ({ x, y, visible, size = 100 }) => {
  const scale = React.useRef(new Animated.Value(0.8)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [visible, opacity, scale]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          left: x - size / 2,
          top: y - size / 2,
          transform: [{ scale }],
          opacity
        }
      ]}
      pointerEvents="none"
    />
  );
};

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderRadius: 200,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'transparent'
  }
});

export default FocusRing;
