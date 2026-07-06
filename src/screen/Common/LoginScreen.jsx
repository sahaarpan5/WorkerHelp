import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Animated,
    Dimensions,
    ActivityIndicator,
    StatusBar,
    Image,
    ImageBackground,
    SafeAreaView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({navigation}) => {
    // Screen states: 'phone' | 'otp' | 'pin'
    const [screen, setScreen] = useState('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [pin, setPin] = useState(['', '', '', '']);
    const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const cardFadeAnim = useRef(new Animated.Value(0)).current;
    const cardSlideAnim = useRef(new Animated.Value(60)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const imageFadeAnim = useRef(new Animated.Value(1)).current;

    // Refs for OTP and PIN inputs
    const otpRefs = useRef([]);
    const pinRefs = useRef([]);
    const confirmPinRefs = useRef([]);

    // Service images for carousel - only images, no text
    const serviceImages = [
        {
            uri: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=500&fit=crop',
        },
        {
            uri: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=500&fit=crop',
        },
        {
            uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=500&fit=crop',
        },
        {
            uri: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=500&fit=crop',
        },
        {
            uri: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&h=500&fit=crop',
        },
    ];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(cardFadeAnim, {
                toValue: 1,
                duration: 900,
                useNativeDriver: true,
            }),
            Animated.timing(cardSlideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Rotate service images every 4 seconds
        const interval = setInterval(() => {
            Animated.sequence([
                Animated.timing(imageFadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(imageFadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();

            setTimeout(() => {
                setCurrentServiceIndex((prev) => (prev + 1) % serviceImages.length);
            }, 500);
        }, 4500);

        return () => clearInterval(interval);
    }, []);

    const handlePhoneSubmit = () => {
        if (phoneNumber.length < 10) {
            Alert.alert('Invalid Number', 'Please enter a valid mobile number');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setScreen('otp');
            setOtp(['1', '2', '3', '4']);
        }, 1500);
    };

    const handleOtpSubmit = () => {
        const otpValue = otp.join('');
        if (otpValue.length < 4) {
            Alert.alert('Invalid OTP', 'Please enter the complete OTP');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setScreen('pin');
        }, 1500);
    };

    const handlePinSubmit = () => {
        const pinValue = pin.join('');
        const confirmValue = confirmPin.join('');

        if (pinValue.length < 4) {
            Alert.alert('Invalid PIN', 'Please set a 4-digit PIN');
            return;
        }

        if (pinValue !== confirmValue) {
            Alert.alert('PIN Mismatch', 'PIN and Confirm PIN do not match');
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);

            Alert.alert(
                'Success',
                'Account setup complete! Welcome to HomeHelp Partner.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'DashboardScreen' }],
                            });
                            // or navigation.navigate('DashboardScreen');
                        },
                    },
                ],
                { cancelable: false }
            );
        }, 1500);
    };

    const handleSignup = () => {
        navigation.navigate('OnboardingScreen');
    };

    const renderPhoneInput = () => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View style={styles.phoneInputWrapper}>
                <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter your mobile number"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    editable={!isLoading}
                />
            </View>
            <Text style={styles.inputHint}>We'll send you a verification code</Text>
        </View>
    );

    const renderOtpInput = () => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Enter Verification Code</Text>
            <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => (otpRefs.current[index] = ref)}
                        style={[styles.otpInput, digit && styles.otpInputFilled]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => {
                            const newOtp = [...otp];
                            newOtp[index] = text;
                            setOtp(newOtp);
                            if (text && index < 3) {
                                otpRefs.current[index + 1]?.focus();
                            }
                            if (!text && index > 0) {
                                otpRefs.current[index - 1]?.focus();
                            }
                        }}
                        editable={!isLoading}
                    />
                ))}
            </View>
            <TouchableOpacity style={styles.resendButton}>
                <Text style={styles.resendText}>Didn't receive code? <Text style={styles.resendHighlight}>Resend</Text></Text>
            </TouchableOpacity>
        </View>
    );

    const renderPinInput = () => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Create Security PIN</Text>
            <Text style={styles.inputHint}>Choose a 4-digit PIN for secure access</Text>
            <View style={styles.pinContainer}>
                {pin.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => (pinRefs.current[index] = ref)}
                        style={[styles.pinInput, digit && styles.pinInputFilled]}
                        keyboardType="number-pad"
                        maxLength={1}
                        secureTextEntry
                        value={digit}
                        onChangeText={(text) => {
                            const newPin = [...pin];
                            newPin[index] = text;
                            setPin(newPin);
                            if (text && index < 3) {
                                pinRefs.current[index + 1]?.focus();
                            }
                            if (!text && index > 0) {
                                pinRefs.current[index - 1]?.focus();
                            }
                        }}
                        editable={!isLoading}
                    />
                ))}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>Confirm PIN</Text>
            <View style={styles.pinContainer}>
                {confirmPin.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => (confirmPinRefs.current[index] = ref)}
                        style={[styles.pinInput, digit && styles.pinInputFilled]}
                        keyboardType="number-pad"
                        maxLength={1}
                        secureTextEntry
                        value={digit}
                        onChangeText={(text) => {
                            const newPin = [...confirmPin];
                            newPin[index] = text;
                            setConfirmPin(newPin);
                            if (text && index < 3) {
                                confirmPinRefs.current[index + 1]?.focus();
                            }
                            if (!text && index > 0) {
                                confirmPinRefs.current[index - 1]?.focus();
                            }
                        }}
                        editable={!isLoading}
                    />
                ))}
            </View>
        </View>
    );

    const getScreenContent = () => {
        switch (screen) {
            case 'phone':
                return {
                    title: 'Welcome Back!',
                    subtitle: 'Sign in to continue your journey with HomeHelp Partner',
                    input: renderPhoneInput(),
                    buttonText: 'Continue',
                    onPress: handlePhoneSubmit,
                    showSignup: true,
                };
            case 'otp':
                return {
                    title: 'Verify Your Identity',
                    subtitle: `Enter the 4-digit code sent to +91 ${phoneNumber}`,
                    input: renderOtpInput(),
                    buttonText: 'Verify & Continue',
                    onPress: handleOtpSubmit,
                    showSignup: false,
                };
            case 'pin':
                return {
                    title: 'Secure Your Account',
                    subtitle: 'Set up a PIN to keep your account safe',
                    input: renderPinInput(),
                    buttonText: 'Complete Setup',
                    onPress: handlePinSubmit,
                    showSignup: false,
                };
            default:
                return null;
        }
    };

    const content = getScreenContent();
    if (!content) return null;

    const currentService = serviceImages[currentServiceIndex];

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <StatusBar barStyle="light-content" backgroundColor="#FF8C00" />
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Section with Rotating Service Images */}
                    <View style={styles.heroSection}>
                        <Animated.View style={{ flex: 1, opacity: imageFadeAnim }}>
                            <ImageBackground
                                source={{ uri: currentService.uri }}
                                style={styles.heroImage}
                                imageStyle={styles.heroImageStyle}
                            >
                                <View style={styles.heroOverlay}>
                                    <View style={styles.heroContent}>
                                        <View style={styles.brandContainer}>
                                            <View style={styles.brandIcon}>
                                                <Text style={styles.brandEmoji}>🏠</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.brandName}>HomeHelp</Text>
                                                <Text style={styles.brandSubName}>Partner</Text>
                                            </View>
                                        </View>

                                        {/* Service Dot Indicators */}
                                        <View style={styles.serviceDotsContainer}>
                                            {serviceImages.map((_, index) => (
                                                <View
                                                    key={index}
                                                    style={[
                                                        styles.serviceDot,
                                                        index === currentServiceIndex && styles.serviceDotActive,
                                                    ]}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            </ImageBackground>
                        </Animated.View>
                    </View>

                    {/* Content Section */}
                    <Animated.View
                        style={[
                            styles.contentWrapper,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: slideAnim },
                                    { scale: scaleAnim },
                                ],
                            },
                        ]}
                    >
                        {/* Header Text */}
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.title}>{content.title}</Text>
                            <Text style={styles.subtitle}>{content.subtitle}</Text>
                        </View>

                        {/* Card with Input Section */}
                        <Animated.View
                            style={[
                                styles.card,
                                {
                                    opacity: cardFadeAnim,
                                    transform: [{ translateY: cardSlideAnim }],
                                },
                            ]}
                        >
                            {content.input}

                            {/* Action Button with Gradient Effect */}
                            <TouchableOpacity
                                style={[styles.buttonWrapper, isLoading && styles.buttonDisabled]}
                                onPress={content.onPress}
                                disabled={isLoading}
                            >
                                <View style={styles.buttonGradient}>
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.buttonText}>{content.buttonText}</Text>
                                    )}
                                </View>
                            </TouchableOpacity>

                            {/* Sign Up Section */}
                            {content.showSignup && (
                                <View style={styles.signupContainer}>
                                    <View style={styles.dividerContainer}>
                                        <View style={styles.dividerLine} />
                                        <Text style={styles.dividerText}>or</Text>
                                        <View style={styles.dividerLine} />
                                    </View>

                                    <View style={styles.signupCard}>
                                        <View style={styles.signupHeader}>
                                            <Text style={styles.signupIcon}>🚀</Text>
                                            <Text style={styles.signupTitle}>Start Your Journey Today</Text>
                                        </View>

                                        <Text style={styles.signupDescription}>
                                            Join HomeHelp Partner and connect with thousands of customers looking for your services
                                        </Text>

                                        <View style={styles.signupBenefits}>
                                            <View style={styles.signupBenefit}>
                                                <View style={styles.signupBenefitIcon}>
                                                    <Text style={styles.signupBenefitIconText}>✓</Text>
                                                </View>
                                                <Text style={styles.signupBenefitText}>Earn competitive rates</Text>
                                            </View>
                                            <View style={styles.signupBenefit}>
                                                <View style={styles.signupBenefitIcon}>
                                                    <Text style={styles.signupBenefitIconText}>✓</Text>
                                                </View>
                                                <Text style={styles.signupBenefitText}>Flexible working hours</Text>
                                            </View>
                                            <View style={styles.signupBenefit}>
                                                <View style={styles.signupBenefitIcon}>
                                                    <Text style={styles.signupBenefitIconText}>✓</Text>
                                                </View>
                                                <Text style={styles.signupBenefitText}>Instant payments daily</Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
                                            <Text style={styles.signupButtonText}>Create Your Account Now →</Text>
                                        </TouchableOpacity>

                                        <Text style={styles.signupFooter}>Already have an account? Sign in above</Text>
                                    </View>
                                </View>
                            )}
                        </Animated.View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <View style={styles.footerDivider} />
                            <View style={styles.footerContent}>
                                <Text style={styles.footerText}>🔒 Secure & Encrypted</Text>
                                <View style={styles.footerDot} />
                                <Text style={styles.footerText}>24/7 Support</Text>
                                <View style={styles.footerDot} />
                                <Text style={styles.footerText}>v2.4.0</Text>
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    heroSection: {
        height: height * 0.4,
        width: '100%',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroImageStyle: {
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    heroOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 24,
        paddingTop: 40,
        justifyContent: 'space-between',
        paddingBottom: 30,
    },
    heroContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        alignSelf: 'flex-start',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    brandIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FF8C00',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    brandEmoji: {
        fontSize: 22,
    },
    brandName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A1A1A',
        letterSpacing: -0.5,
    },
    brandSubName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FF8C00',
        letterSpacing: -0.5,
        marginTop: -2,
    },
    serviceDotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'center',
    },
    serviceDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    serviceDotActive: {
        backgroundColor: '#FF8C00',
        width: 24,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    headerTextContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#888888',
        lineHeight: 20,
    },
    card: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 4,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },
    inputHint: {
        fontSize: 12,
        color: '#999999',
        marginTop: 8,
    },
    phoneInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        overflow: 'hidden',
    },
    countryCode: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#F0F0F0',
        borderRightWidth: 1.5,
        borderRightColor: '#E8E8E8',
    },
    countryCodeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    phoneInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1A1A1A',
        backgroundColor: 'transparent',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    otpInput: {
        flex: 1,
        height: 60,
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    otpInputFilled: {
        borderColor: '#FF8C00',
        backgroundColor: '#FFF8F3',
    },
    resendButton: {
        alignSelf: 'center',
        marginTop: 16,
    },
    resendText: {
        fontSize: 14,
        color: '#888888',
    },
    resendHighlight: {
        color: '#FF8C00',
        fontWeight: '600',
    },
    pinContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    pinInput: {
        flex: 1,
        height: 60,
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    pinInputFilled: {
        borderColor: '#FF8C00',
        backgroundColor: '#FFF8F3',
    },
    buttonWrapper: {
        width: '100%',
        borderRadius: 14,
        marginTop: 20,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        overflow: 'hidden',
    },
    buttonGradient: {
        backgroundColor: '#FF8C00',
        paddingVertical: 17,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E67A00',
        borderRadius: 14,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    signupContainer: {
        marginTop: 20,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E8E8E8',
    },
    dividerText: {
        fontSize: 12,
        color: '#999999',
        paddingHorizontal: 16,
        fontWeight: '500',
    },
    signupCard: {
        backgroundColor: '#FFF9F5',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FFE8DC',
    },
    signupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    signupIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    signupTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    signupDescription: {
        fontSize: 13,
        color: '#666666',
        lineHeight: 18,
        marginBottom: 12,
    },
    signupBenefits: {
        marginBottom: 14,
    },
    signupBenefit: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    signupBenefitIcon: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#FF8C00',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    signupBenefitIconText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    signupBenefitText: {
        fontSize: 13,
        color: '#444444',
        fontWeight: '500',
    },
    signupButton: {
        backgroundColor: '#FF8C00',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    signupButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    signupFooter: {
        fontSize: 11,
        color: '#999999',
        textAlign: 'center',
        marginTop: 10,
    },
    footer: {
        marginTop: 24,
        alignItems: 'center',
    },
    footerDivider: {
        width: '100%',
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 16,
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    footerText: {
        fontSize: 12,
        color: '#BBBBBB',
        fontWeight: '400',
        letterSpacing: 0.3,
    },
    footerDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#D0D0D0',
    },
});

export default LoginScreen;