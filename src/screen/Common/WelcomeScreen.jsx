import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   // Start logo animation
  //   Animated.parallel([
  //     Animated.timing(logoFade, {
  //       toValue: 1,
  //       duration: 500,
  //       useNativeDriver: true,
  //     }),
  //     Animated.spring(logoScale, {
  //       toValue: 1,
  //       friction: 7,
  //       tension: 45,
  //       useNativeDriver: true,
  //     }),
  //   ]).start();

  //   // Start content fade in after logo appears
  //   setTimeout(() => {
  //     Animated.parallel([
  //       Animated.timing(fadeAnim, {
  //         toValue: 1,
  //         duration: 600,
  //         useNativeDriver: true,
  //       }),
  //       Animated.spring(scaleAnim, {
  //         toValue: 1,
  //         friction: 8,
  //         tension: 40,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(slideAnim, {
  //         toValue: 0,
  //         duration: 600,
  //         useNativeDriver: true,
  //       }),
  //     ]).start();
  //   }, 300);

  //   // Animate loading bar
  //   Animated.timing(progressAnim, {
  //     toValue: 1,
  //     duration: 2500,
  //     useNativeDriver: false,
  //   }).start();

  //   // Auto-dismiss after 3.2 seconds
  //   const timer = setTimeout(() => {
  //     if (onFinish) onFinish();
  //   }, 3200);

  //   return () => clearTimeout(timer);


  // }, [onFinish]);


  useEffect(() => {
    // Start logo animation
    Animated.parallel([
      Animated.timing(logoFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    // Start content fade in after logo appears
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);

    // Animate loading bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start(() => {
      // When progress animation completes, navigate to login
      setTimeout(() => {
        navigation.replace('LoginScreen');
      }, 300);
    });

    // Fallback timer if progress animation doesn't trigger
    const timer = setTimeout(() => {
      navigation.replace('LoginScreen');
    }, 3200);

    return () => clearTimeout(timer);
  }, [navigation]);

  // Loading bar width interpolation
  const loadingWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Decorative elements */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />
      <View style={styles.decorStrip} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoFade,
            },
          ]}
        >
          <View style={styles.logoOuterRing}>
            <View style={styles.logoInnerRing}>
              <View style={styles.logoIcon}>
                <Image
                  source={require('../../asset/genlogo.png')} // Update the path as needed
                  style={{
                    width: 48,
                    height: 48,
                    resizeMode: 'contain',

                  }}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Text Section */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.appName}>HomeHelp</Text>
          <Text style={styles.appSubName}>Partner</Text>

          <View style={styles.divider} />

          <Text style={styles.tagline}>Elevating Service Excellence</Text>

          <View style={styles.pillContainer}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>✦ Professional</Text>
            </View>
            <View style={[styles.pill, styles.pillOrange]}>
              <Text style={[styles.pillText, styles.pillTextOrange]}>
                ✓ Trusted
              </Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>★ Reliable</Text>
            </View>
          </View>
        </Animated.View>

        {/* Loading Section */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingFill,
                {
                  width: loadingWidth,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>v2.4.0</Text>
          <View style={styles.footerDot} />
          <Text style={styles.footerText}>© 2026</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    width: '100%',
  },
  // Decorative elements
  decorCircle1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#FFF2E6',
    top: -100,
    right: -80,
    borderWidth: 1,
    borderColor: '#FFE0CC',
  },
  decorCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFF5F0',
    bottom: -50,
    left: -70,
    borderWidth: 1,
    borderColor: '#FFE8DC',
  },
  decorCircle3: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF8F3',
    top: '35%',
    right: -30,
    borderWidth: 1,
    borderColor: '#FFEDE0',
  },
  decorStrip: {
    position: 'absolute',
    width: 6,
    height: '60%',
    backgroundColor: '#FFF0E6',
    right: 0,
    top: '20%',
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoIconText: {
    fontSize: 50,
  },
  logoBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -1.5,
    includeFontPadding: false,
  },
  appSubName: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FF8C00',
    letterSpacing: -1.5,
    marginTop: -4,
    includeFontPadding: false,
  },
  divider: {
    width: 48,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#FF8C00',
    marginTop: 14,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    color: '#888888',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  pillContainer: {
    flexDirection: 'row',
    marginTop: 22,
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  pillOrange: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555555',
    letterSpacing: 0.5,
  },
  pillTextOrange: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    marginTop: 44,
    width: width * 0.55,
    maxWidth: 200,
  },
  loadingBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  loadingFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#FF8C00',
  },
  footer: {
    position: 'absolute',
    bottom: -height * 0.35,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#BBBBBB',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D0D0D0',
  },
    logoOuterRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  logoInnerRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  logoIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
});

export default WelcomeScreen;