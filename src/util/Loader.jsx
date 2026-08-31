import { Image, StyleSheet, Text, View, Animated, Easing, useEffect, useRef, Modal } from "react-native";

export const Loader = ({ visible = true, message = 'Loading...' }) => {
  // Animation values
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const dotAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (visible) {
      // Spin animation
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Dot animations
      dotAnimations.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              delay: index * 150,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    } else {
      spinValue.stopAnimation();
      pulseValue.stopAnimation();
      dotAnimations.forEach(anim => anim.stopAnimation());
    }

    return () => {
      spinValue.stopAnimation();
      pulseValue.stopAnimation();
      dotAnimations.forEach(anim => anim.stopAnimation());
    };
  }, [visible]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulse = pulseValue.interpolate({
    inputRange: [0.9, 1, 1.1],
    outputRange: [0.9, 1, 1.1],
  });

  const getDotTranslateY = (index) => {
    return dotAnimations[index].interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, -12, 0],
    });
  };

  const getDotOpacity = (index) => {
    return dotAnimations[index].interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 1, 0.3],
    });
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.loaderOverlay}>
        <View style={styles.loaderContainer}>
          {/* Main Loader */}
          <View style={styles.loaderWrapper}>
            {/* Outer Ring - Spinning */}
            <Animated.View style={[styles.outerRing, { transform: [{ rotate: spin }] }]}>
              <View style={styles.outerRingGradient} />
            </Animated.View>

            {/* Inner Circle - Pulsing */}
            <Animated.View style={[styles.innerCircle, { transform: [{ scale: pulse }] }]}>
              <View style={styles.centerIcon}>
                <Image
                  source={require('../asset/loading.png')}
                  style={styles.loaderImage}
                />
              </View>
            </Animated.View>

            {/* Orbiting Dots */}
            {[...Array(8)].map((_, index) => {
              const angle = (index / 8) * 360;
              const radius = 45;
              const radian = (angle * Math.PI) / 180;
              const x = radius * Math.cos(radian);
              const y = radius * Math.sin(radian);

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.orbitDot,
                    {
                      transform: [
                        { translateX: x },
                        { translateY: y },
                        {
                          rotate: spin.interpolate({
                            inputRange: [0, 1],
                            outputRange: [`${angle}deg`, `${angle + 360}deg`],
                          })
                        }
                      ],
                      opacity: spin.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.3, 1, 0.3],
                      }),
                    }
                  ]}
                />
              );
            })}
          </View>

          {/* Loading Text */}
          <Text style={styles.loadingText}>{message}</Text>

          {/* Animated Dots */}
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    transform: [{ translateY: getDotTranslateY(index) }],
                    opacity: getDotOpacity(index),
                  }
                ]}
              />
            ))}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: spinValue.interpolate({
                    inputRange: [0, 0.25, 0.5, 0.75, 1],
                    outputRange: ['0%', '25%', '50%', '75%', '100%'],
                  }),
                }
              ]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  loaderOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loaderContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    width: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  loaderWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  outerRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#F0F0F0',
  },
  outerRingGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FF8C00',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  innerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF8F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFE0CC',
  },
  centerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loaderImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  orbitDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF8C00',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF8C00',
    marginHorizontal: 4,
  },
  progressContainer: {
    width: '100%',
    height: 3,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF8C00',
    borderRadius: 2,
  },
});

// Also export a simple version without animations (static)
export const StaticLoader = ({ visible = true }) => {
  if (!visible) return null;

  return (
    <View style={styles.loaderOverlay}>
      <View style={styles.loaderContainer}>
        <View style={styles.loaderWrapper}>
          <Image
            source={require('../asset/loading.png')}
            style={[styles.loaderImage, { width: 60, height: 60 }]}
          />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, { opacity: 1 }]} />
          <View style={[styles.dot, { opacity: 0.5 }]} />
          <View style={[styles.dot, { opacity: 0.2 }]} />
        </View>
      </View>
    </View>
  );
};

// Mini loader for small areas
export const MiniLoader = ({ visible = true, size = 30 }) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
    }
    return () => spinValue.stopAnimation();
  }, [visible]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 3,
          borderColor: '#FF8C00',
          borderTopColor: 'transparent',
        },
        { transform: [{ rotate: spin }] },
      ]}
    />
  );
};