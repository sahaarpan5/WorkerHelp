import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Dimensions,
    Animated,
    Image,
    Modal,
    Alert,
    Easing,
    TextInput,
    Linking,
} from 'react-native';


const { width, height } = Dimensions.get('window');

const JobCompletionScreen = ({ navigation }) => {
    const [cashReceived, setCashReceived] = useState(false);
    const [paymentMode, setPaymentMode] = useState('online');
    const [isOnline, setIsOnline] = useState(true);
    const [showNextJob, setShowNextJob] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);
    const [customerRating, setCustomerRating] = useState(0);
    const [customerFeedback, setCustomerFeedback] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [ratingSubmitted, setRatingSubmitted] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(1)).current;
    const headerTranslateY = useRef(new Animated.Value(0)).current;
    const successScaleAnim = useRef(new Animated.Value(0.5)).current;
    const successFadeAnim = useRef(new Animated.Value(0)).current;
    const confettiAnim = useRef(new Animated.Value(0)).current;
    const confettiAnim2 = useRef(new Animated.Value(0)).current;
    const confettiAnim3 = useRef(new Animated.Value(0)).current;
    const sparkleAnim = useRef(new Animated.Value(0)).current;
    const ratingSectionAnim = useRef(new Animated.Value(0)).current;

    const ORANGE_COLOR = '#FF8C00';

    // Job completion data
    const jobData = {
        jobId: 'HH-2026-0789',
        bookingId: 'BK-2026-4567',
        service: 'Plumbing Repair',
        category: 'Home Services',
        customer: 'Mr. Rajesh Sharma',
        customerPhone: '+91 98765 43210',
        address: 'Andheri East, Mumbai - 400093',
        date: '06 Jul 2026',
        startTime: '9:00 AM',
        endTime: '11:30 AM',
        duration: '2.5 hrs',
        serviceCharges: 1200,
        gst: 216,
        platformFee: 84,
        netEarnings: 1500,
        walletBalance: 16850,
        customerRating: 4.8,
        customerFeedback: 'Excellent work! Very professional and quick service. Fixed all issues perfectly.',
        customerFeedbackSubmitted: true,
        checklist: {
            otpVerified: true,
            serviceCompleted: true,
            photosUploaded: true,
            paymentConfirmed: true,
        },
        timeline: [
            {
                id: 1,
                event: 'Started Service',
                time: '9:00 AM',
                completed: true,
                image: require('../../asset/play-circle-outline.png'),
            },
            {
                id: 2,
                event: 'Work Completed',
                time: '11:15 AM',
                completed: true,
                image: require('../../asset/checked.png'),
            },
            {
                id: 3,
                event: 'OTP Verified',
                time: '11:20 AM',
                completed: true,
                image: require('../../asset/shield.png'),
            },
            {
                id: 4,
                event: 'Job Closed',
                time: '11:30 AM',
                completed: true,
                image: require('../../asset/flag.png'),
            },
        ],
        nextJob: {
            id: 1,
            title: 'Electrical Work',
            time: '2:00 PM',
            client: 'Mrs. Patel',
            clientPhone: '+91 98765 43220',
            location: 'Bandra West',
            distance: '4.8 km',
            amount: '₹850',
            status: 'Upcoming',
        },
        achievements: {
            count: 342,
            message: 'Excellent Performance',
        },
    };

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(successScaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(successFadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Confetti animation - delayed start
        setTimeout(() => {
            setShowConfetti(true);
            Animated.loop(
                Animated.sequence([
                    Animated.timing(confettiAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                        easing: Easing.linear,
                    }),
                    Animated.timing(confettiAnim, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(confettiAnim2, {
                        toValue: 1,
                        duration: 2500,
                        useNativeDriver: true,
                        easing: Easing.linear,
                    }),
                    Animated.timing(confettiAnim2, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(confettiAnim3, {
                        toValue: 1,
                        duration: 1800,
                        useNativeDriver: true,
                        easing: Easing.linear,
                    }),
                    Animated.timing(confettiAnim3, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(sparkleAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(sparkleAnim, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }, 500);

        // Animate rating section
        Animated.timing(ratingSectionAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        // Scroll listener for toolbar
        scrollY.addListener(({ value }) => {
            const translateY = Math.min(value * 0.3, 30);
            headerTranslateY.setValue(-translateY);
            const opacity = Math.max(0.7, 1 - (value - 50) / 150);
            headerOpacity.setValue(opacity);
        });

        return () => {
            scrollY.removeAllListeners();
        };
    }, []);

    const submitFeedback = () => {
        if (customerRating === 0) {
            Alert.alert('Rating Required', 'Please select a rating for the customer');
            return;
        }
        if (!customerFeedback.trim()) {
            Alert.alert('Feedback Required', 'Please provide your feedback');
            return;
        }

        setFeedbackSubmitted(true);
        setRatingSubmitted(true);
        Alert.alert('Thank You!', 'Your feedback has been submitted successfully.');
    };

    const handleCall = (phoneNumber) => {
        if (phoneNumber) {
            Linking.openURL(`tel:${phoneNumber}`).catch(() => {
                Alert.alert('Error', 'Unable to make call');
            });
        } else {
            Alert.alert('No Phone Number', 'Phone number is not available');
        }
    };

    // Render timeline item - Professional
    const renderTimelineItem = (item, index) => (
        <View key={item.id} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, item.completed && styles.timelineDotCompleted]} />
                {index < jobData.timeline.length - 1 && (
                    <View style={[styles.timelineLine, item.completed && styles.timelineLineCompleted]} />
                )}
            </View>
            <View style={styles.timelineContent}>
                <View style={styles.timelineCard}>
                    <View style={[styles.timelineIconContainer, item.completed && styles.timelineIconContainerCompleted]}>
                        <Image
                            source={item.image}
                            style={{
                                width: 18,
                                height: 18,
                                tintColor: item.completed ? '#FFFFFF' : '#888', // Remove if your PNGs are already colored
                                resizeMode: 'contain',
                            }}
                        />
                    </View>
                    <View style={styles.timelineTextContainer}>
                        <Text style={[styles.timelineEvent, item.completed && styles.timelineEventCompleted]}>
                            {item.event}
                        </Text>
                        <Text style={styles.timelineTime}>{item.time}</Text>
                    </View>
                    {item.completed && (
                        <View style={styles.timelineCheckBadge}>

                            <Image
                                source={require('../../asset/checked.png')}
                                style={{
                                    width: 16,
                                    height: 16,
                                    tintColor: "#4CAF50",

                                }}
                            />
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={ORANGE_COLOR} />

            {/* Curved Orange Toolbar */}
            <Animated.View
                style={[
                    styles.toolbarContainer,
                    {
                        opacity: headerOpacity,
                        transform: [{ translateY: headerTranslateY }],
                        backgroundColor: ORANGE_COLOR,
                    }
                ]}
            >
                <View style={styles.toolbarContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.toolbarBack}>

                        <Image
                            source={require('../../asset/arrow-back.png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: "#FFFFFF",

                            }}
                        />
                    </TouchableOpacity>
                    <View style={styles.toolbarCenter}>
                        <Text style={styles.toolbarTitle}>Job Completed</Text>
                        <View style={styles.toolbarStatus}>
                            <View style={[styles.toolbarStatusDot, { backgroundColor: '#FFFFFF' }]} />
                            <Text style={styles.toolbarStatusText}>#HH-2026-0789</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.toolbarShare}>

                        <Image
                            source={require('../../asset/refresh.png')}
                            style={{
                                width: 22,
                                height: 22,
                                tintColor: "#FFFFFF",

                            }}
                        />
                    </TouchableOpacity>
                </View>
                <View style={[styles.toolbarCurve, { backgroundColor: ORANGE_COLOR }]} />
            </Animated.View>

            <Animated.ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Confetti Effects */}
                {showConfetti && (
                    <View style={styles.confettiContainer}>
                        <Animated.View style={[styles.confetti, styles.confetti1, {
                            transform: [{
                                translateY: confettiAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 400],
                                })
                            }]
                        }]} />
                        <Animated.View style={[styles.confetti, styles.confetti2, {
                            transform: [{
                                translateY: confettiAnim2.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 350],
                                })
                            }]
                        }]} />
                        <Animated.View style={[styles.confetti, styles.confetti3, {
                            transform: [{
                                translateY: confettiAnim3.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 450],
                                })
                            }]
                        }]} />
                        <Animated.View style={[styles.confetti, styles.confetti4, {
                            transform: [{
                                translateY: confettiAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 380],
                                })
                            }]
                        }]} />
                        <Animated.View style={[styles.confetti, styles.confetti5, {
                            transform: [{
                                translateY: confettiAnim2.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 420],
                                })
                            }]
                        }]} />
                        <Animated.View style={[styles.confetti, styles.confetti6, {
                            transform: [{
                                translateY: confettiAnim3.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 360],
                                })
                            }]
                        }]} />
                    </View>
                )}

                {/* Success Header with Sparkle */}
                <Animated.View
                    style={[
                        styles.successContainer,
                        {
                            opacity: successFadeAnim,
                            transform: [{ scale: successScaleAnim }],
                        }
                    ]}
                >
                    <View style={styles.successIconContainer}>

                        <Image
                            source={require('../../asset/checked.png')}
                            style={{
                                width: 64,
                                height: 64,
                                tintColor: "#4CAF50",

                            }}
                        />
                        <Animated.View style={[styles.sparkle, { opacity: sparkleAnim }]}>
                            <Text style={styles.sparkleText}>✨</Text>
                        </Animated.View>
                    </View>
                    <Text style={styles.successTitle}>Service Completed Successfully! 🎉</Text>
                    <Text style={styles.successSubtitle}>Great work! The customer has been notified.</Text>
                </Animated.View>

                {/* Service Summary */}
                <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.cardTitle}>Service Summary</Text>

                    <View style={styles.summaryGrid}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Job ID</Text>
                            <Text style={styles.summaryValue}>{jobData.jobId}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Booking ID</Text>
                            <Text style={styles.summaryValue}>{jobData.bookingId}</Text>
                        </View>
                    </View>

                    <View style={styles.summaryGrid}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Service</Text>
                            <Text style={styles.summaryValue}>{jobData.service}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Category</Text>
                            <Text style={styles.summaryValue}>{jobData.category}</Text>
                        </View>
                    </View>

                    <View style={styles.summaryGrid}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Customer</Text>
                            <Text style={styles.summaryValue}>{jobData.customer}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Address</Text>
                            <Text style={styles.summaryValue}>{jobData.address}</Text>
                        </View>
                    </View>

                    <View style={styles.summaryGrid}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Date</Text>
                            <Text style={styles.summaryValue}>{jobData.date}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Start Time</Text>
                            <Text style={styles.summaryValue}>{jobData.startTime}</Text>
                        </View>
                    </View>

                    <View style={styles.summaryGrid}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>End Time</Text>
                            <Text style={styles.summaryValue}>{jobData.endTime}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Duration</Text>
                            <Text style={styles.summaryValue}>{jobData.duration}</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Rating & Review Section - Always Visible */}
                {!ratingSubmitted ? (
                    <Animated.View style={[styles.ratingSectionContainer, { opacity: ratingSectionAnim }]}>
                        <View style={styles.ratingSectionHeader}>

                            <Image
                                source={require('../../asset/star.png')}
                                style={{
                                    width: 22,
                                    height: 22,
                                    tintColor: "#FF8C00",

                                }}
                            />
                            <Text style={styles.ratingSectionTitle}>Rate & Review Customer</Text>
                        </View>

                        <View style={styles.ratingSection}>
                            <Text style={styles.ratingCustomerName}>How was your experience with {jobData.customer}?</Text>

                            {/* Star Rating */}
                            <View style={styles.ratingStarsContainer}>
                                <Text style={styles.ratingStarsLabel}>Your Rating</Text>
                                <View style={styles.ratingStars}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <TouchableOpacity
                                            key={star}
                                            onPress={() => setCustomerRating(star)}
                                            style={styles.ratingStarButton}
                                        >
                                            <Image
                                                source={
                                                    star <= customerRating
                                                        ? require('../../asset/star-fill.png')
                                                        : require('../../asset/star-outline.png')
                                                }
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    tintColor: star <= customerRating ? '#FFD700' : '#DDD', // Remove if your PNGs are already colored
                                                    resizeMode: 'contain',
                                                }}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {customerRating > 0 && (
                                    <Text style={styles.ratingStarsText}>
                                        {customerRating === 5 ? '🌟 Excellent!' :
                                            customerRating === 4 ? '👍 Very Good!' :
                                                customerRating === 3 ? '👌 Good' :
                                                    customerRating === 2 ? '😐 Fair' :
                                                        '😕 Poor'}
                                    </Text>
                                )}
                            </View>

                            {/* Feedback Input */}
                            <View style={styles.ratingFeedbackContainer}>
                                <Text style={styles.ratingFeedbackLabel}>Your Feedback</Text>
                                <TextInput
                                    style={styles.ratingFeedbackInput}
                                    placeholder="Share your experience with the customer..."
                                    placeholderTextColor="#999"
                                    multiline
                                    numberOfLines={4}
                                    value={customerFeedback}
                                    onChangeText={setCustomerFeedback}
                                />
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={styles.ratingSubmitButton}
                                onPress={submitFeedback}
                            >
                                <Text style={styles.ratingSubmitText}>Submit Feedback</Text>

                                <Image
                                    source={require('../../asset/right-arrow.png')}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        tintColor: "#FFFFFF",

                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                ) : (
                    <Animated.View style={[styles.ratingSubmittedContainer, { opacity: fadeAnim }]}>

                        <Image
                            source={require('../../asset/checked.png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: "#4CAF50",

                            }}
                        />
                        <Text style={styles.ratingSubmittedText}>Thank you for your feedback!</Text>
                        <Text style={styles.ratingSubmittedSubtext}>Your rating helps us improve our service quality.</Text>
                    </Animated.View>
                )}

                {/* Payment Summary */}
                <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                    <Text style={styles.cardTitle}>Payment Summary</Text>

                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Service Charges</Text>
                        <Text style={styles.paymentValue}>₹{jobData.serviceCharges}</Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>GST (18%)</Text>
                        <Text style={styles.paymentValue}>₹{jobData.gst}</Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Platform Fee</Text>
                        <Text style={styles.paymentValue}>₹{jobData.platformFee}</Text>
                    </View>
                    <View style={[styles.paymentRow, styles.paymentTotal]}>
                        <Text style={styles.paymentTotalLabel}>Net Earnings</Text>
                        <Text style={styles.paymentTotalValue}>₹{jobData.netEarnings}</Text>
                    </View>

                    <View style={styles.paymentModeDisplay}>
                        <View style={[styles.paymentModeBadge, paymentMode === 'online' ? styles.paymentModeOnline : styles.paymentModeCash]}>
                            <Image
                                source={
                                    paymentMode === 'online'
                                        ? require('../../asset/wallet.png')
                                        : require('../../asset/money.png')
                                }
                                style={{
                                    width: 16,
                                    height: 16,
                                    tintColor: '#FFFFFF', // Remove if your PNGs are already white/colored
                                    resizeMode: 'contain',
                                }}
                            />
                            <Text style={styles.paymentModeBadgeText}>
                                {paymentMode === 'online' ? 'Online Payment' : 'Cash Payment'}
                            </Text>
                        </View>
                    </View>

                    {paymentMode === 'online' ? (
                        <View style={styles.walletInfo}>

                            <Image
                                source={require('../../asset/wallet.png')}
                                style={{
                                    width: 20,
                                    height: 20,
                                    tintColor: "#4CAF50",

                                }}
                            />
                            <Text style={styles.walletInfoText}>
                                Credited to Wallet • Balance: ₹{jobData.walletBalance.toLocaleString()}
                            </Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.cashReceivedButton, cashReceived && styles.cashReceivedButtonActive]}
                            onPress={() => {
                                setCashReceived(!cashReceived);
                                if (!cashReceived) {
                                    Alert.alert('Success', 'Cash payment confirmed!');
                                }
                            }}
                        >
                            <View style={[styles.checkbox, cashReceived && styles.checkboxActive]}>
                                {cashReceived && <Image
                                    source={require('../../asset/checked.png')}
                                    style={{
                                        width: 16,
                                        height: 16,
                                        tintColor: "#ffffff",

                                    }}
                                />}
                            </View>
                            <Text style={[styles.cashReceivedText, cashReceived && styles.cashReceivedTextActive]}>
                                {cashReceived ? '✓ Cash Received' : 'Confirm Cash Received'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>

                {/* Customer Feedback from Customer */}
                <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                    <Text style={styles.cardTitle}>Customer's Feedback</Text>

                    {jobData.customerFeedbackSubmitted ? (
                        <View>
                            <View style={styles.feedbackRating}>
                                <View style={styles.feedbackStars}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Image
                                            key={star}
                                            source={
                                                star <= jobData.customerRating
                                                    ? require('../../asset/star-fill.png')
                                                    : require('../../asset/star-outline.png')
                                            }
                                            style={{
                                                width: 20,
                                                height: 20,
                                                tintColor: star <= jobData.customerRating ? '#FFD700' : '#DDD', // Remove if your PNGs are already colored
                                                resizeMode: 'contain',
                                            }}
                                        />
                                    ))}
                                </View>
                                <Text style={styles.feedbackRatingText}>{jobData.customerRating} ⭐</Text>
                            </View>
                            <Text style={styles.feedbackText}>"{jobData.customerFeedback}"</Text>
                        </View>
                    ) : (
                        <View style={styles.feedbackWaiting}>

                            <Image
                                source={require('../../asset/time-outline.png')}
                                style={{
                                    width: 32,
                                    height: 32,
                                    tintColor: "#FF8C00",

                                }}
                            />
                            <Text style={styles.feedbackWaitingTitle}>Waiting for Customer Feedback</Text>
                            <Text style={styles.feedbackWaitingSubtext}>
                                The customer has 24 hours to submit a review.
                            </Text>
                        </View>
                    )}
                </Animated.View>

                {/* Checklist */}
                <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                    <Text style={styles.cardTitle}>Checklist</Text>
                    <View style={styles.checklistItem}>
                        <View style={[styles.checklistIcon, jobData.checklist.otpVerified && styles.checklistIconCompleted]}>
                            <Image
                                source={
                                    jobData.checklist.otpVerified
                                        ? require('../../asset/checked.png')
                                        : require('../../asset/time-outline.png')
                                }
                                style={{
                                    width: 14,
                                    height: 14,
                                    tintColor: jobData.checklist.otpVerified ? '#FFFFFF' : '#888', // Remove if your PNGs are already colored
                                    resizeMode: 'contain',
                                }}
                            />
                        </View>
                        <Text style={[styles.checklistText, jobData.checklist.otpVerified && styles.checklistTextCompleted]}>Customer OTP Verified</Text>
                        {jobData.checklist.otpVerified && <View style={styles.checklistVerified}><Text style={styles.checklistVerifiedText}>✓ Verified</Text></View>}
                    </View>
                    <View style={styles.checklistItem}>
                        <View style={[styles.checklistIcon, jobData.checklist.serviceCompleted && styles.checklistIconCompleted]}>
                            <Image
                                source={
                                    jobData.checklist.serviceCompleted
                                        ? require('../../asset/checked.png')
                                        : require('../../asset/time-outline.png')
                                }
                                style={{
                                    width: 14,
                                    height: 14,
                                    tintColor: jobData.checklist.serviceCompleted ? '#FFFFFF' : '#888',
                                    resizeMode: 'contain',
                                }}
                            />
                        </View>
                        <Text style={[styles.checklistText, jobData.checklist.serviceCompleted && styles.checklistTextCompleted]}>Service Completed</Text>
                        {jobData.checklist.serviceCompleted && <View style={styles.checklistVerified}><Text style={styles.checklistVerifiedText}>✓ Verified</Text></View>}
                    </View>
                    <View style={styles.checklistItem}>
                        <View style={[styles.checklistIcon, jobData.checklist.photosUploaded && styles.checklistIconCompleted]}>
                            <Image
                                source={
                                    jobData.checklist.photosUploaded
                                        ? require('../../asset/checked.png')
                                        : require('../../asset/time-outline.png')
                                }
                                style={{
                                    width: 14,
                                    height: 14,
                                    tintColor: jobData.checklist.photosUploaded ? '#FFFFFF' : '#888', // Remove if your PNGs are already colored
                                    resizeMode: 'contain',
                                }}
                            />
                        </View>
                        <Text style={[styles.checklistText, jobData.checklist.photosUploaded && styles.checklistTextCompleted]}>Photos Uploaded</Text>
                        {jobData.checklist.photosUploaded && <View style={styles.checklistVerified}><Text style={styles.checklistVerifiedText}>✓ Verified</Text></View>}
                    </View>
                    <View style={styles.checklistItem}>
                        <View style={[styles.checklistIcon, jobData.checklist.paymentConfirmed && styles.checklistIconCompleted]}>
                            <Image
                                source={
                                    jobData.checklist.paymentConfirmed
                                        ? require('../../asset/checked.png')
                                        : require('../../asset/time-outline.png')
                                }
                                style={{
                                    width: 14,
                                    height: 14,
                                    tintColor: jobData.checklist.paymentConfirmed ? '#FFFFFF' : '#888',
                                    resizeMode: 'contain',
                                }}
                            />
                        </View>
                        <Text style={[styles.checklistText, jobData.checklist.paymentConfirmed && styles.checklistTextCompleted]}>Payment Confirmed</Text>
                        {jobData.checklist.paymentConfirmed && <View style={styles.checklistVerified}><Text style={styles.checklistVerifiedText}>✓ Verified</Text></View>}
                    </View>
                </Animated.View>

                {/* Professional Job Timeline */}
                <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                    <Text style={styles.cardTitle}>Job Timeline</Text>
                    <View style={styles.timelineContainer}>
                        {jobData.timeline.map((item, index) => renderTimelineItem(item, index))}
                    </View>
                </Animated.View>

                {/* Enhanced Next Assignment with Call Option */}
                <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                    <View style={styles.nextJobHeader}>
                        <Text style={styles.cardTitle}>Next Assignment</Text>
                        {showNextJob ? (
                            <TouchableOpacity onPress={() => setShowNextJob(false)}>

                                <Image
                                    source={require('../../asset/chevron-up.png')}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        tintColor: "#666",

                                    }}
                                />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => setShowNextJob(true)}>
                                <Image
                                    source={require('../../asset/chevron-down.png')}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        tintColor: "#666",
                                    }}
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    {showNextJob && jobData.nextJob ? (
                        <View style={styles.nextJobCard}>
                            <View style={styles.nextJobTopBar}>
                                <View style={styles.nextJobStatusBadge}>
                                    <View style={styles.nextJobStatusDot} />
                                    <Text style={styles.nextJobStatusText}>{jobData.nextJob.status}</Text>
                                </View>
                                <Text style={styles.nextJobAmount}>{jobData.nextJob.amount}</Text>
                            </View>

                            <View style={styles.nextJobTitleContainer}>
                                <View style={styles.nextJobIcon}>

                                    <Image
                                        source={require('../../asset/briefcase.png')}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            tintColor: "#FF8C00",
                                        }}
                                    />

                                </View>
                                <Text style={styles.nextJobTitle}>{jobData.nextJob.title}</Text>
                            </View>

                            <View style={styles.nextJobDetails}>
                                <View style={styles.nextJobDetail}>

                                    <Image
                                        source={require('../../asset/time-outline.png')}
                                        style={{
                                            width: 16,
                                            height: 16,
                                            tintColor: "#FF8C00",
                                        }}
                                    />
                                    <Text style={styles.nextJobDetailText}>{jobData.nextJob.time}</Text>
                                </View>
                                <View style={styles.nextJobDetail}>
                                    <Image
                                        source={require('../../asset/person-outline.png')}
                                        style={{
                                            width: 16,
                                            height: 16,
                                            tintColor: "#FF8C00",
                                        }}
                                    />
                                    <Text style={styles.nextJobDetailText}>{jobData.nextJob.client}</Text>
                                </View>
                                <View style={styles.nextJobDetail}>

                                    <Image
                                        source={require('../../asset/location-outline.png')}
                                        style={{
                                            width: 16,
                                            height: 16,
                                            tintColor: "#FF8C00",
                                        }}
                                    />
                                    <Text style={styles.nextJobDetailText}>{jobData.nextJob.location}</Text>
                                </View>
                                <View style={styles.nextJobDetail}>
                                    <Image
                                        source={require('../../asset/navigate-outline.png')}
                                        style={{
                                            width: 16,
                                            height: 16,
                                            tintColor: "#FF8C00",
                                        }}
                                    />
                                    <Text style={styles.nextJobDetailText}>{jobData.nextJob.distance}</Text>
                                </View>
                            </View>

                            <View style={styles.nextJobActions}>
                                <TouchableOpacity style={styles.nextJobButton} onPress={() => handleCall(jobData.nextJob.clientPhone)}>

                                    <Image
                                        source={require('../../asset/telephone.png')}
                                        style={{
                                            width: 18,
                                            height: 18,
                                            tintColor: "#FFFFFF",
                                        }}
                                    />

                                    <Text style={styles.nextJobButtonText}>Call Client</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.nextJobButton, styles.nextJobButtonSecondary]}>
                                    <Text style={[styles.nextJobButtonText, styles.nextJobButtonTextSecondary]}>View Details</Text>

                                    <Image
                                        source={require('../../asset/view.png')}
                                        style={{
                                            width: 18,
                                            height: 18,
                                            tintColor: "#FF8C00",
                                        }}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.noJobContainer}>
                            <View style={styles.noJobIconContainer}>

                                <Image
                                    source={require('../../asset/checked.png')}
                                    style={{
                                        width: 32,
                                        height: 32,
                                        tintColor: "#4CAF50",
                                    }}
                                />
                            </View>
                            <Text style={styles.noJobText}>No Upcoming Jobs</Text>
                            <Text style={styles.noJobSubtext}>You're all set for now!</Text>
                        </View>
                    )}
                </Animated.View>

                {/* Stay Online */}
                <Animated.View style={[styles.stayOnlineContainer, { opacity: fadeAnim }]}>
                    <View style={styles.stayOnlineContent}>
                        <View style={styles.stayOnlineLeft}>
                            <View style={[styles.stayOnlineDot, isOnline && styles.stayOnlineDotActive]} />
                            <Text style={styles.stayOnlineText}>
                                {isOnline ? 'You are Online' : 'You are Offline'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.stayOnlineButton, isOnline && styles.stayOnlineButtonActive]}
                            onPress={() => setIsOnline(!isOnline)}
                        >
                            <Text style={styles.stayOnlineButtonText}>
                                {isOnline ? 'Online' : 'Go Online'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.stayOnlineSubtext}>to receive more bookings.</Text>
                </Animated.View>

                {/* Achievement */}
                <Animated.View style={[styles.achievementContainer, { opacity: fadeAnim }]}>
                    <View style={styles.achievementContent}>
                        <Text style={styles.achievementEmoji}>🏅</Text>
                        <View style={styles.achievementInfo}>
                            <Text style={styles.achievementTitle}>{jobData.achievements.message}</Text>
                            <Text style={styles.achievementCount}>
                                {jobData.achievements.count} Jobs Completed
                            </Text>
                            <Text style={styles.achievementCongrats}>🎉 Congratulations!</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Quick Actions */}
                <Animated.View style={[styles.quickActionsContainer, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={styles.quickActionItem}
                        onPress={() => navigation.replace('DashboardScreen')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#FF8C00' }]}>

                            <Image
                                source={require('../../asset/home.png')}
                                style={{
                                    width: 22,
                                    height: 22,
                                    tintColor: "#FFFFFF",
                                }}
                            />
                        </View>
                        <Text style={styles.quickActionLabel}>Dashboard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionItem}
                        onPress={() => navigation.replace('ScheduleScreen')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#2196F3' }]}>

                            <Image
                                source={require('../../asset/calendar-outline.png')}
                                style={{
                                    width: 22,
                                    height: 22,
                                    tintColor: "#FFFFFF",
                                }}
                            />
                        </View>
                        <Text style={styles.quickActionLabel}>Schedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionItem}
                        onPress={() => navigation.replace('WalletScreen')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#4CAF50' }]}>

                            <Image
                                source={require('../../asset/wallet.png')}
                                style={{
                                    width: 22,
                                    height: 22,
                                    tintColor: "#FFFFFF",
                                }}
                            />
                        </View>
                        <Text style={styles.quickActionLabel}>Wallet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionItem}
                        onPress={() => navigation.replace('EarningsScreen')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#9C27B0' }]}>

                            <Image
                                source={require('../../asset/growth.png')}
                                style={{
                                    width: 22,
                                    height: 22,
                                    tintColor: "#FFFFFF",
                                }}
                            />
                        </View>
                        <Text style={styles.quickActionLabel}>Earnings</Text>
                    </TouchableOpacity>
                </Animated.View>

                <View style={{ height: 20 }} />
            </Animated.ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    // Curved Orange Toolbar
    toolbarContainer: {
        paddingTop: 8,
        paddingBottom: 0,
        zIndex: 10,
        elevation: 8,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
    },
    toolbarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    toolbarCurve: {
        height: 30,
        width: '100%',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    toolbarBack: {
        padding: 4,
    },
    toolbarCenter: {
        alignItems: 'center',
        flex: 1,
    },
    toolbarTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    toolbarStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    toolbarStatusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    toolbarStatusText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    toolbarShare: {
        padding: 4,
    },
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    // Success Header
    successContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 20,
        marginBottom: 16,
        position: 'relative',
    },
    successIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        position: 'relative',
    },
    sparkle: {
        position: 'absolute',
        top: -10,
        right: -10,
    },
    sparkleText: {
        fontSize: 24,
    },
    successTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 4,
    },
    // Confetti
    confettiContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 999,
        overflow: 'hidden',
    },
    confetti: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 2,
    },
    confetti1: {
        left: '10%',
        backgroundColor: '#FF6B6B',
        top: -10,
    },
    confetti2: {
        left: '25%',
        backgroundColor: '#FFD93D',
        top: -10,
    },
    confetti3: {
        left: '45%',
        backgroundColor: '#6BCB77',
        top: -10,
    },
    confetti4: {
        left: '65%',
        backgroundColor: '#4D96FF',
        top: -10,
    },
    confetti5: {
        left: '80%',
        backgroundColor: '#FF6B6B',
        top: -10,
    },
    confetti6: {
        left: '90%',
        backgroundColor: '#FFD93D',
        top: -10,
    },
    // Rating Section - Always Visible
    ratingSectionContainer: {
        marginBottom: 16,
    },
    ratingSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    ratingSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    ratingCustomerName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        textAlign: 'center',
    },
    ratingSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    ratingStarsContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    ratingStarsLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginBottom: 8,
    },
    ratingStars: {
        flexDirection: 'row',
        gap: 6,
    },
    ratingStarButton: {
        padding: 4,
    },
    ratingStarsText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FF8C00',
        marginTop: 8,
    },
    ratingFeedbackContainer: {
        marginBottom: 16,
    },
    ratingFeedbackLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginBottom: 6,
    },
    ratingFeedbackInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1A1A1A',
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    ratingSubmitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF8C00',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    ratingSubmitText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    ratingSubmittedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#C8E6C9',
        gap: 10,
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    ratingSubmittedText: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
    },
    ratingSubmittedSubtext: {
        fontSize: 12,
        color: '#666',
    },
    // Card
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    // Summary
    summaryGrid: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    summaryItem: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 11,
        color: '#888',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 13,
        color: '#1A1A1A',
        fontWeight: '500',
        marginTop: 2,
    },
    // Payment
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    paymentLabel: {
        fontSize: 13,
        color: '#666',
    },
    paymentValue: {
        fontSize: 13,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    paymentTotal: {
        borderBottomWidth: 0,
        paddingTop: 8,
        marginTop: 4,
        borderTopWidth: 2,
        borderTopColor: '#F0F0F0',
    },
    paymentTotalLabel: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '700',
    },
    paymentTotalValue: {
        fontSize: 16,
        color: '#FF8C00',
        fontWeight: '700',
    },
    paymentModeDisplay: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    paymentModeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 10,
        alignSelf: 'flex-start',
        gap: 6,
    },
    paymentModeOnline: {
        backgroundColor: '#4CAF50',
    },
    paymentModeCash: {
        backgroundColor: '#FF8C00',
    },
    paymentModeBadgeText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    walletInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        gap: 8,
    },
    walletInfoText: {
        fontSize: 13,
        color: '#4CAF50',
        fontWeight: '500',
    },
    cashReceivedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        gap: 10,
    },
    cashReceivedButtonActive: {
        backgroundColor: '#E8F5E9',
        borderColor: '#4CAF50',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#E8E8E8',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxActive: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    cashReceivedText: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    cashReceivedTextActive: {
        color: '#4CAF50',
    },
    // Feedback
    feedbackRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    feedbackStars: {
        flexDirection: 'row',
        gap: 2,
    },
    feedbackRatingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    feedbackText: {
        fontSize: 14,
        color: '#555',
        fontStyle: 'italic',
        marginTop: 8,
        lineHeight: 20,
    },
    feedbackWaiting: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    feedbackWaitingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginTop: 8,
    },
    feedbackWaitingSubtext: {
        fontSize: 13,
        color: '#888',
        textAlign: 'center',
        marginTop: 4,
    },
    // Checklist
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    checklistIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checklistIconCompleted: {
        backgroundColor: '#4CAF50',
    },
    checklistText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
    },
    checklistTextCompleted: {
        color: '#1A1A1A',
        fontWeight: '500',
    },
    checklistVerified: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    checklistVerifiedText: {
        fontSize: 10,
        color: '#4CAF50',
        fontWeight: '600',
    },
    // Professional Timeline
    timelineContainer: {
        paddingVertical: 4,
    },
    timelineItem: {
        flexDirection: 'row',
        paddingVertical: 4,
    },
    timelineLeft: {
        width: 24,
        alignItems: 'center',
        position: 'relative',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#E8E8E8',
        borderWidth: 2,
        borderColor: '#E8E8E8',
        zIndex: 2,
    },
    timelineDotCompleted: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    timelineLine: {
        position: 'absolute',
        top: 16,
        left: 11,
        bottom: -8,
        width: 2,
        backgroundColor: '#E8E8E8',
    },
    timelineLineCompleted: {
        backgroundColor: '#4CAF50',
    },
    timelineContent: {
        flex: 1,
        paddingLeft: 12,
        paddingBottom: 8,
    },
    timelineCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        flex: 1,
    },
    timelineIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    timelineIconContainerCompleted: {
        backgroundColor: '#4CAF50',
    },
    timelineTextContainer: {
        flex: 1,
    },
    timelineEvent: {
        fontSize: 13,
        color: '#888',
        fontWeight: '500',
    },
    timelineEventCompleted: {
        color: '#1A1A1A',
    },
    timelineTime: {
        fontSize: 11,
        color: '#999',
        marginTop: 1,
    },
    timelineCheckBadge: {
        marginLeft: 8,
    },
    // Enhanced Next Job with Call
    nextJobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nextJobCard: {
        backgroundColor: '#FFF8F3',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FFE8DC',
        marginTop: 10,
    },
    nextJobTopBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    nextJobStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    nextJobStatusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4CAF50',
    },
    nextJobStatusText: {
        fontSize: 11,
        color: '#4CAF50',
        fontWeight: '600',
    },
    nextJobAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FF8C00',
    },
    nextJobTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    nextJobIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FFF8F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    nextJobTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    nextJobDetails: {
        gap: 6,
        marginBottom: 12,
    },
    nextJobDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    nextJobDetailText: {
        fontSize: 13,
        color: '#555',
    },
    nextJobActions: {
        flexDirection: 'row',
        gap: 8,
    },
    nextJobButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF8C00',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        gap: 6,
        flex: 1,
        justifyContent: 'center',
    },
    nextJobButtonSecondary: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#FF8C00',
    },
    nextJobButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    nextJobButtonTextSecondary: {
        color: '#FF8C00',
    },
    noJobContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    noJobIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    noJobText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    noJobSubtext: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    // Stay Online
    stayOnlineContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    stayOnlineContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stayOnlineLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stayOnlineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#E8E8E8',
    },
    stayOnlineDotActive: {
        backgroundColor: '#4CAF50',
    },
    stayOnlineText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    stayOnlineButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#E8E8E8',
    },
    stayOnlineButtonActive: {
        backgroundColor: '#4CAF50',
    },
    stayOnlineButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    stayOnlineSubtext: {
        fontSize: 12,
        color: '#888',
        marginTop: 6,
    },
    // Achievement
    achievementContainer: {
        backgroundColor: '#FFF8F3',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFE8DC',
    },
    achievementContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    achievementEmoji: {
        fontSize: 32,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    achievementCount: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    achievementCongrats: {
        fontSize: 13,
        color: '#FF8C00',
        fontWeight: '600',
        marginTop: 2,
    },
    // Quick Actions
    quickActionsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    quickActionItem: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    quickActionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    quickActionLabel: {
        fontSize: 11,
        color: '#444',
        fontWeight: '500',
    },
});

export default JobCompletionScreen;