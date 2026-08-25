import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Dimensions,
    Animated,
    Image,
} from 'react-native';


const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation, route }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
     const [phoneNumber, setPhoneNumber] = useState('');
    const [token, setToken] = useState('');
    const [mobileVerified, setMobileVerified] = useState(false);


    useEffect(() => {
        const mobileNo = route.params?.mobileNo;
        const verified = route.params?.mobileVerified;
        const token = route.params?.token


        console.log('Mobile No:', mobileNo);
        console.log('Mobile Verified:', verified);
        console.log('token:', token);

        if (mobileNo) {
            setPhoneNumber(mobileNo);
        }
        if (token) {
            setToken(token);
        }


        setMobileVerified(verified);
        

    }, [route.params]);

    const onboardingData = [
        {
            id: 1,
            title: 'A Smarter Way to\nWork, Grow & Earn',
            description: "Join India's fastest growing service platform. Set your own schedule, choose your services, and watch your earnings grow.",
            icon: '🚀',
            illustration: require('../../asset/earn.jpg'),
        },
        {
            id: 2,
            title: 'Work on Your\nTerms, Always',
            description: 'Be your own boss. Choose your working hours, accept services that match your skills, and take breaks whenever you need.',
            icon: '💪',
            illustration: require('../../asset/gig-boss.jpg'),
        },
        {
            id: 3,
            title: 'Payouts You Can\nTrust & Rely On',
            description: 'Get paid on time, every time. Transparent earnings, instant settlements, and secure payments directly to your account.',
            icon: '💰',
            illustration: require('../../asset/payout.jpg'),
        },
    ];

    const currentData = onboardingData[currentStep];
    const isLastStep = currentStep === onboardingData.length - 1;
    const isFirstStep = currentStep === 0;

    useEffect(() => {
        // Animate content change
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 20,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    }, [currentStep]);

    const handleNext = () => {
        if (!isLastStep) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (!isFirstStep) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleGetStarted = () => {
        

         navigation.replace('SignupScreen', {
                        mobileNo: phoneNumber,
                        mobileVerified: mobileVerified,
                        token: token,

                    });
    };

    const renderDots = () => {
        return (
            <View style={styles.dotsContainer}>
                {onboardingData.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index === currentStep && styles.dotActive,
                        ]}
                    />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View style={styles.container}>
                {/* Header with Logo and Step Count */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoIcon}>
                            <Text style={styles.logoEmoji}>🏠</Text>
                        </View>
                        <View>
                            <Text style={styles.logoName}>HomeHelp</Text>
                            <Text style={styles.logoSubName}>Partner</Text>
                        </View>
                    </View>
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepText}>
                            {currentStep + 1}/{onboardingData.length}
                        </Text>
                    </View>
                </View>

                {/* Image Section */}
                <View style={styles.imageContainer}>
                    <Animated.View style={[styles.imageWrapper, { opacity: fadeAnim }]}>
                        <Image
                            source={currentData.illustration}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        <View style={styles.imageOverlay}>
                            <View style={styles.imageIconContainer}>
                                <Text style={styles.imageIcon}>{currentData.icon}</Text>
                            </View>
                        </View>
                    </Animated.View>
                </View>

                {/* Content Section */}
                <Animated.View
                    style={[
                        styles.contentContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Text style={styles.title}>{currentData.title}</Text>
                    <Text style={styles.description}>{currentData.description}</Text>

                    {/* Dots */}
                    {renderDots()}

                    {/* Navigation Buttons - Oval Shape */}
                    <View style={styles.buttonContainer}>
                        {!isFirstStep ? (
                            <TouchableOpacity
                                style={[styles.navButton, styles.prevButton]}
                                onPress={handlePrev}
                            >

                                <Image
                                    source={require('../../asset/arrow-back.png')}
                                    style={{
                                        width: 22,
                                        height: 22,
                                        tintColor: "#FF8C00",

                                    }}
                                />
                                <Text style={styles.navButtonText}>Back</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.emptySpace} />
                        )}

                        {!isLastStep ? (
                            <TouchableOpacity
                                style={[styles.navButton, styles.nextButton]}
                                onPress={handleNext}
                            >
                                <Text style={[styles.navButtonText, styles.nextButtonText]}>Next</Text>

                                <Image
                                    source={require('../../asset/right-arrow.png')}
                                    style={{
                                        width: 22,
                                        height: 22,
                                        tintColor: "#FFFFFF",

                                    }}
                                />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.emptySpace} />
                        )}
                    </View>

                    {/* Stats Section */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <View style={styles.statIconContainer}>

                                <Image
                                    source={require('../../asset/star-fill.png')}
                                    style={{
                                        width: 16,
                                        height: 16,
                                        tintColor: "#FFD700",

                                    }}
                                />
                            </View>
                            <View>
                                <Text style={styles.statValue}>4.9</Text>
                                <Text style={styles.statLabel}>App Rating</Text>
                            </View>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <View style={styles.statIconContainer}>

                                <Image
                                    source={require('../../asset/people.png')}
                                    style={{
                                        width: 16,
                                        height: 16,
                                        tintColor: "#4CAF50",

                                    }}
                                />
                            </View>
                            <View>
                                <Text style={styles.statValue}>50K+</Text>
                                <Text style={styles.statLabel}>Partners</Text>
                            </View>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <View style={styles.statIconContainer}>

                                <Image
                                    source={require('../../asset/growth.png')}
                                    style={{
                                        width: 16,
                                        height: 16,
                                        tintColor: "#FF8C00",

                                    }}
                                />
                            </View>
                            <View>
                                <Text style={styles.statValue}>₹1.5K</Text>
                                <Text style={styles.statLabel}>Daily Income</Text>
                            </View>
                        </View>
                    </View>

                    {/* Get Started Button - Only on Last Step */}
                    {isLastStep && (
                        <TouchableOpacity
                            style={styles.getStartedButton}
                            onPress={handleGetStarted}
                        >
                            <Text style={styles.getStartedText}>Get Started</Text>

                            <Image
                                source={require('../../asset/right-arrow.png')}
                                style={{
                                    width: 22,
                                    height: 22,
                                    tintColor: "#FFFFFF",

                                }}
                            />
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 8,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FF8C00',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    logoEmoji: {
        fontSize: 24,
    },
    logoName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A1A1A',
        letterSpacing: -0.5,
        lineHeight: 22,
    },
    logoSubName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FF8C00',
        letterSpacing: -0.5,
        lineHeight: 22,
        marginTop: -2,
    },
    stepContainer: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    stepText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    imageContainer: {
        height: height * 0.38,
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    imageWrapper: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 16,
        left: 16,
    },
    imageIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    imageIcon: {
        fontSize: 26,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 12,
        paddingBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1A1A1A',
        lineHeight: 34,
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 16,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#DDD',
    },
    dotActive: {
        backgroundColor: '#FF8C00',
        width: 28,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptySpace: {
        width: 100,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 50,
        minWidth: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    prevButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#FF8C00',
    },
    nextButton: {
        backgroundColor: '#FF8C00',
        borderWidth: 2,
        borderColor: '#E67A00',
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    navButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FF8C00',
        marginHorizontal: 4,
    },
    nextButtonText: {
        color: '#FFFFFF',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        paddingVertical: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    statLabel: {
        fontSize: 10,
        color: '#888',
        fontWeight: '400',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E8E8E8',
    },
    getStartedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF8C00',
        paddingVertical: 16,
        borderRadius: 50,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#E67A00',
        gap: 8,
        marginTop: 4,
    },
    getStartedText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});

export default OnboardingScreen;