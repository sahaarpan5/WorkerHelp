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
    Image,
    TextInput,
    Alert,
    Modal,
    FlatList,
    Animated,
    ActivityIndicator,
    ImageBackground,
    Linking,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';


const { width, height } = Dimensions.get('window');

const JobDetailsScreen = ({ navigation, route }) => {

    const params = route?.params || {};
    const jobDetails = {
        id: params.id ?? params.assignmentId ?? '',
        assignmentId: params.assignmentId ?? params.id ?? '',
        bookingNo: params.bookingNo ?? '',
        jobType: params.serviceName ?? params.title ?? 'Home Service',
        customerName: params.customerName ?? 'Customer',
        customerRating: params.customerRating ?? null,
        customerPhone: params.customerPhone ?? '',
        location:
            params.address ??
            [
                params.addressLine1,
                params.addressLine2,
                params.city,
                params.state,
                params.postalCode,
            ]
                .filter(Boolean)
                .join(', ') ??
            'Address not available',
        coordinates: {
            latitude:
                params.latitude != null
                    ? Number(params.latitude)
                    : null,
            longitude:
                params.longitude != null
                    ? Number(params.longitude)
                    : null,
        },
        status: params.status ?? 'Accepted',
        time:
            params.time ??
            `${params.startTime || '--:--'} - ${params.endTime || '--:--'}`,
        distance: params.distance ?? 'Not available',
        duration:
            params.hours != null
                ? `${params.hours} hours`
                : params.duration ?? 'Not available',
        price:
            params.rate != null
                ? `₹${params.rate}`
                : 'Not available',
        serviceNotes: params.serviceNotes ?? '',
        subServices: Array.isArray(params.subServices)
            ? params.subServices
            : [],
        jobList: Array.isArray(params.jobList)
            ? params.jobList
            : params.serviceNotes
                ? [params.serviceNotes]
                : [],
    };
    const [currentStatus, setCurrentStatus] = useState('upcoming');
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [showServicesModal, setShowServicesModal] = useState(false);
    const [selectedServices, setSelectedServices] = useState([]);
    const [capturedImages, setCapturedImages] = useState({});
    const [showEndServiceModal, setShowEndServiceModal] = useState(false);
    const [endServiceOTP, setEndServiceOTP] = useState(['', '', '', '']);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Animation values
    const statusPulseAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const markerPulseAnim = useRef(new Animated.Value(1)).current;
    const customerPulseAnim = useRef(new Animated.Value(1)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(1)).current;
    const headerTranslateY = useRef(new Animated.Value(0)).current;

    const otpRefs = useRef([]);
    const endOtpRefs = useRef([]);

    // Dummy job data


    const totalServices = jobDetails.subServices.length;
    const completedServices = Object.keys(capturedImages).length;
    const progressPercentage = Math.round((completedServices / totalServices) * 100);

    const ORANGE_COLOR = '#FF8C00';
    const CARD_COLOR = '#6A1B9A';
    const CARD_COLOR_LIGHT = '#8B3AB0';
    const CARD_COLOR_DARK = '#4A1280';
    const ORANGE_LIGHT = '#FFF4E6';

    useEffect(() => {
        // Status pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(statusPulseAnim, {
                    toValue: 1.05,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(statusPulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Customer card pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(customerPulseAnim, {
                    toValue: 1.02,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(customerPulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Marker pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(markerPulseAnim, {
                    toValue: 1.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(markerPulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Slide in animation
        Animated.timing(slideAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
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

    const openGoogleMaps = () => {
        const { latitude, longitude } = jobDetails.coordinates;

        const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Unable to open Google Maps.');
        });
    };

    const navigateToLocation = async () => {
        const { latitude, longitude } = jobDetails.coordinates;

        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

        try {
            const supported = await Linking.canOpenURL(url);

            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Google Maps is not available.');
            }
        } catch (error) {
            Alert.alert('Error', 'Unable to open navigation.');
        }
    };

    // Simulate upload progress
    const simulateUploadProgress = () => {
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    const handleOTPVerify = () => {
        const otpValue = otp.join('');
        if (otpValue.length < 4) {
            Alert.alert('Invalid OTP', 'Please enter the complete OTP');
            return;
        }
        Alert.alert('Verified', 'OTP verified successfully! You can now start the service.');
        setShowOTPModal(false);
        setOtp(['', '', '', '']);
        setCurrentStatus('in-progress');
    };

    const handleEndServiceOTP = () => {
        const otpValue = endServiceOTP.join('');
        if (otpValue.length < 4) {
            Alert.alert('Invalid OTP', 'Please enter the complete OTP');
            return;
        }
        setShowEndServiceModal(false);
        setEndServiceOTP(['', '', '', '']);
        setShowServicesModal(true);
    };

    const handleServiceComplete = () => {
        navigation.replace('JobCompletionScreen');
        setCurrentStatus('completed');
    };

    const toggleService = (serviceId) => {
        if (selectedServices.includes(serviceId)) {
            setSelectedServices(selectedServices.filter(id => id !== serviceId));
        } else {
            setSelectedServices([...selectedServices, serviceId]);
        }
    };

    const handleCapturePress = (serviceId) => {
        Alert.alert('Capture Image', 'Camera functionality will be available soon.');
        setCapturedImages({ ...capturedImages, [serviceId]: 'captured' });
        simulateUploadProgress();
    };

    const handleStartService = () => {
        setShowOTPModal(true);
    };

    const handleEndTask = () => {
        setShowEndServiceModal(true);
    };

    const getStatusColor = () => {
        switch (currentStatus) {
            case 'in-progress': return '#FF8C00';
            case 'upcoming': return '#FF8C00';
            case 'completed': return '#4CAF50';
            default: return '#FF8C00';
        }
    };

    const getStatusIcon = () => {
        switch (currentStatus) {
            case 'in-progress': return '⚡';
            case 'upcoming': return '📅';
            case 'completed': return '✅';
            default: return '📅';
        }
    };

    const getStatusLabel = () => {
        switch (currentStatus) {
            case 'in-progress': return 'In Progress';
            case 'upcoming': return 'Upcoming';
            case 'completed': return 'Completed';
            default: return 'Upcoming';
        }
    };

    const renderStatusBadge = () => {
        const statusColor = getStatusColor();
        const statusIcon = getStatusIcon();
        const statusLabel = getStatusLabel();

        return (
            <Animated.View
                style={[
                    styles.statusBadgeContainer,
                    {
                        backgroundColor: ORANGE_COLOR,
                        transform: [{ scale: statusPulseAnim }]
                    }
                ]}
            >
                <Text style={styles.statusBadgeIcon}>{statusIcon}</Text>
                <Text style={styles.statusBadgeText}>{statusLabel}</Text>
            </Animated.View>
        );
    };

    const renderActionButton = () => {
        if (currentStatus === 'in-progress') {
            return (
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: ORANGE_COLOR }]} onPress={handleEndTask}>

                    <Image
                        source={require('../../asset/check-mark.png')}
                        style={{
                            width: 22,
                            height: 22,
                            tintColor: "#FFFFFF",

                        }}
                    />
                    <Text style={styles.primaryButtonText}>End Task</Text>
                </TouchableOpacity>
            );
        } else if (currentStatus === 'upcoming') {
            return (

                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: ORANGE_COLOR }]} onPress={handleStartService}>

                    <Image
                        source={require('../../asset/play-circle-outline.png')}
                        style={{
                            width: 22,
                            height: 22,
                            tintColor: "#FFFFFF",

                        }}
                    />
                    <Text style={styles.primaryButtonText}>Start Service</Text>
                </TouchableOpacity>


            );
        } else if (currentStatus === 'completed') {
            return (
                <View style={[styles.primaryButton, { backgroundColor: '#4CAF50', opacity: 0.8 }]}>

                    <Image
                        source={require('../../asset/checked.png')}
                        style={{
                            width: 22,
                            height: 22,
                            tintColor: "#FFFFFF",

                        }}
                    />
                    <Text style={styles.primaryButtonText}>Service Completed</Text>
                </View>
            );
        }
        return null;
    };

    const renderJobItem = ({ item, index }) => (
        <Animated.View
            style={[
                styles.jobListItem,
                {
                    opacity: fadeAnim,
                    transform: [{
                        translateX: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20 * (index + 1), 0],
                        })
                    }]
                }
            ]}
        >
            <View style={styles.jobListNumber}>
                <Text style={styles.jobListNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.jobListText}>{item}</Text>
            <View style={styles.jobListCheck}>

                <Image
                    source={require('../../asset/check-mark.png')}
                    style={{
                        width: 22,
                        height: 22,
                        tintColor: "#4CAF50",

                    }}
                />
            </View>
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={ORANGE_COLOR} />

            {/* Curved Toolbar - Orange */}
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
                        <Text style={styles.toolbarTitle}>{jobDetails.jobType}</Text>
                        <View style={styles.toolbarStatus}>
                            <View style={[styles.toolbarStatusDot, { backgroundColor: '#FFFFFF' }]} />
                            <Text style={styles.toolbarStatusText}>{getStatusLabel()}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.toolbarShare}>

                        <Image
                            source={require('../../asset/share.png')}
                            style={{
                                width: 22,
                                height: 22,
                                tintColor: "#FFFFFF",

                            }}
                        />
                    </TouchableOpacity>
                </View>
                {/* Curved bottom */}
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
            >
                {/* ATM Card Style Customer Card with #6A1B9A */}
                <Animated.View
                    style={[
                        styles.customerCard,
                        {
                            transform: [{ scale: customerPulseAnim }],
                        }
                    ]}
                >
                    {/* Card Background Gradient */}
                    <ImageBackground
                        source={{ uri: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop' }}
                        style={styles.cardBackground}
                        imageStyle={styles.cardBackgroundImage}
                    >
                        <View style={[styles.cardOverlay, { backgroundColor: '#dab319ef' }]}>
                            {/* Card Chip */}
                            <View style={styles.cardChipContainer}>
                                <View style={[styles.cardChip, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                                    <View style={styles.cardChipLine} />
                                    <View style={styles.cardChipLine2} />
                                </View>
                                <View style={styles.cardChipRight}>
                                    <Text style={styles.cardChipLabel}>HomeHelp</Text>
                                </View>
                            </View>

                            {/* Customer Info */}
                            <View style={styles.cardCustomerInfo}>
                                <View style={styles.cardCustomerNameContainer}>
                                    <Text style={styles.cardCustomerName}>{jobDetails.customerName}</Text>
                                    <View style={styles.cardCustomerRating}>

                                        <Image
                                            source={require('../../asset/star-fill.png')}
                                            style={{
                                                width: 14,
                                                height: 14,
                                                tintColor: "#ffda08",

                                            }}
                                        />
                                        <Text style={styles.cardCustomerRatingText}>{jobDetails.customerRating}</Text>
                                    </View>
                                </View>
                                <View style={[styles.cardCustomerStatus, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                                    <View style={[styles.cardCustomerStatusDot, { backgroundColor: '#FFFFFF' }]} />
                                    <Text style={styles.cardCustomerStatusText}>{getStatusLabel()}</Text>
                                </View>
                            </View>

                            {/* Card Details */}
                            <View style={styles.cardDetails}>
                                <View style={styles.cardDetailItem}>

                                    <Image
                                        source={require('../../asset/time-outline.png')}
                                        style={{
                                            width: 16,
                                            height: 16,
                                            tintColor: "rgba(255,255,255,0.7)",

                                        }}
                                    />
                                    <Text style={styles.cardDetailText}>Today, {jobDetails.time}</Text>
                                </View>
                                <View style={styles.cardDetailItem}>

                                    <Image
                                        source={require('../../asset/hourglass-outline.png')}
                                        style={{
                                            width: 16,
                                            height: 16,
                                            tintColor: "rgba(255,255,255,0.7)",

                                        }}
                                    />
                                    <Text style={styles.cardDetailText}>{jobDetails.duration}</Text>
                                </View>
                                <View style={styles.cardDetailItem}>

                                    <Image
                                        source={require('../../asset/location-outline.png')}
                                        style={{
                                            width: 16,
                                            height: 16,
                                            tintColor: "rgba(255,255,255,0.7)",

                                        }}
                                    />
                                    <Text style={styles.cardDetailText}>{jobDetails.distance}</Text>
                                </View>
                            </View>

                            {/* Card Footer */}
                            <View style={styles.cardFooter}>
                                <View style={styles.cardFooterLeft}>
                                    <Text style={styles.cardFooterLabel}>BOOKING ID</Text>
                                    <Text style={styles.cardFooterValue}>#HH-{String(jobDetails.bookingNo).padStart(4, '0')}</Text>
                                </View>
                                <TouchableOpacity style={[styles.cardCallButton, { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }]}
                                    onPress={() => {
                                        if (!jobDetails.customerPhone) {
                                            Alert.alert('Unavailable', 'Customer phone number is not available.');
                                            return;
                                        }

                                        Linking.openURL(
                                            `tel:${jobDetails.customerPhone}`
                                        ).catch(() => {
                                            Alert.alert('Error', 'Unable to make the call.');
                                        });
                                    }}
                                >>
                                    <Image
                                        source={require('../../asset/telephone.png')}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            tintColor: "#FFFFFF"
                                        }}
                                    />
                                    <Text style={styles.cardCallButtonText}>Call</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ImageBackground>
                </Animated.View>

                {/* Location with Map Design */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>

                        <Image
                            source={require('../../asset/location-outline.png')}
                            style={{
                                width: 22,
                                height: 22,
                                tintColor: "#FF4757"
                            }}
                        />
                        <Text style={styles.cardTitle}>Location</Text>
                    </View>
                    <View style={styles.locationRow}>
                        <Text style={styles.locationText}>{jobDetails.location}</Text>
                    </View>

                    <View style={styles.mapContainer}>
                        <View style={styles.mapPlaceholder}>
                            {/* <View style={styles.mapGrid}>
                                {[...Array(8)].map((_, i) => (
                                    <View key={i} style={[styles.mapGridLine, { top: i * 25 }]} />
                                ))}
                                {[...Array(6)].map((_, i) => (
                                    <View key={i} style={[styles.mapGridLineVertical, { left: i * 30 }]} />
                                ))}
                            </View> */}

                            {/* <MapView
                                style={{ flex: 1 }}
                                initialRegion={{
                                    latitude: jobDetails.coordinates.latitude,
                                    longitude: jobDetails.coordinates.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: jobDetails.coordinates.latitude,
                                        longitude: jobDetails.coordinates.longitude,
                                    }}
                                    title={jobDetails.customerName}
                                    description={jobDetails.location}
                                />
                            </MapView> */}

                            <Image
                                style={styles.mapImage}
                                source={{
                                    uri: `https://maps.googleapis.com/maps/api/staticmap?center=${jobDetails.coordinates.latitude},${jobDetails.coordinates.longitude}&zoom=18&size=800x500&scale=2&maptype=satellite&markers=color:yellow|label:H|${jobDetails.coordinates.latitude},${jobDetails.coordinates.longitude}&key=AIzaSyBuxUn1s4S2yv8fqwd0wGUTFegxNyASL1g`,
                                }}
                            />

                            {/* <Animated.View
                                style={[
                                    styles.markerWrapper,
                                    { transform: [{ scale: markerPulseAnim }] }
                                ]}
                            >
                                <View style={styles.markerPulseRing} />
                                <View style={styles.markerContainer}>

                                    <Image
                                        source={require('../../asset/map-outline.png')}
                                        style={{
                                            width: 40,
                                            height: 40,

                                        }}
                                    />
                                </View>
                            </Animated.View> */}


                        </View>

                        <View style={styles.mapOverlay}>
                            <TouchableOpacity style={styles.mapButton} onPress={openGoogleMaps}>

                                <Image
                                    source={require('../../asset/location-outline.png')}
                                    style={{
                                        width: 18,
                                        height: 18,
                                        tintColor: "#FF8C00"

                                    }}
                                />
                                <Text style={styles.mapButtonText}>View in Maps</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.mapButton} onPress={navigateToLocation}>
                                <Image
                                    source={require('../../asset/navigate-outline.png')}
                                    style={{
                                        width: 18,
                                        height: 18,
                                        tintColor: "#FF8C00"
                                    }}
                                />
                                <Text style={styles.mapButtonText}>Navigate</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Professional Job Tasks */}
               

                {/* Action Button */}
                {renderActionButton()}

                <View style={{ height: 20 }} />
            </Animated.ScrollView>

            {/* Start Service OTP Modal */}
            <Modal visible={showOTPModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Verify to Start</Text>
                            <TouchableOpacity onPress={() => setShowOTPModal(false)}>

                                <Image
                                    source={require('../../asset/close.png')}
                                    style={{
                                        width: 24,
                                        height: 24,
                                        tintColor: "#666"

                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalSubtitle}>Enter the OTP sent to customer to start the service</Text>
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
                                />
                            ))}
                        </View>
                        <TouchableOpacity style={styles.modalButton} onPress={handleOTPVerify}>
                            <Text style={styles.modalButtonText}>Verify & Start</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* End Service OTP Modal */}
            <Modal visible={showEndServiceModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>End Service</Text>
                            <TouchableOpacity onPress={() => setShowEndServiceModal(false)}>
                                <Image
                                    source={require('../../asset/close.png')}
                                    style={{
                                        width: 24,
                                        height: 24,
                                        tintColor: "#666"
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalSubtitle}>Enter the OTP to end the service</Text>
                        <View style={styles.otpContainer}>
                            {endServiceOTP.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => (endOtpRefs.current[index] = ref)}
                                    style={[styles.otpInput, digit && styles.otpInputFilled]}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    value={digit}
                                    onChangeText={(text) => {
                                        const newOtp = [...endServiceOTP];
                                        newOtp[index] = text;
                                        setEndServiceOTP(newOtp);
                                        if (text && index < 3) {
                                            endOtpRefs.current[index + 1]?.focus();
                                        }
                                        if (!text && index > 0) {
                                            endOtpRefs.current[index - 1]?.focus();
                                        }
                                    }}
                                />
                            ))}
                        </View>
                        <TouchableOpacity style={styles.modalButton} onPress={handleEndServiceOTP}>
                            <Text style={styles.modalButtonText}>Verify & End</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Services Checklist Modal */}
            <Modal visible={showServicesModal} transparent animationType="slide">
                <View style={styles.servicesModalOverlay}>
                    <View style={styles.servicesModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Service Checklist</Text>
                            <TouchableOpacity onPress={() => setShowServicesModal(false)}>

                                <Image
                                    source={require('../../asset/close.png')}
                                    style={{
                                        width: 24,
                                        height: 24,
                                        tintColor: "#666"

                                    }}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.taskProgressContainer}>
                            <View style={styles.taskProgressHeader}>
                                <Text style={styles.taskProgressTitle}>📸 Upload Progress</Text>
                                <Text style={styles.taskProgressCount}>{completedServices}/{totalServices} Completed</Text>
                            </View>
                            <View style={styles.taskProgressBar}>
                                <View style={[styles.taskProgressFill, { width: `${progressPercentage}%` }]} />
                            </View>
                            <Text style={styles.taskProgressPercent}>{progressPercentage}%</Text>
                        </View>

                        <Text style={styles.modalSubtitle}>Upload images for completed services</Text>

                        <FlatList
                            data={jobDetails.subServices}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => {
                                const isCaptured = capturedImages[item.id];
                                return (
                                    <View style={styles.serviceItem}>
                                        <View style={styles.serviceInfo}>
                                            <Text style={styles.serviceIcon}>{item.icon}</Text>
                                            <Text style={styles.serviceName}>{item.name}</Text>
                                        </View>

                                        <TouchableOpacity
                                            style={[styles.captureButton, isCaptured && styles.captureButtonDone]}
                                            onPress={() => handleCapturePress(item.id)}
                                        >
                                            <Image
                                                source={
                                                    isCaptured
                                                        ? require('../../asset/check-mark.png')
                                                        : require('../../asset/camera.png')
                                                }
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                    tintColor: isCaptured ? '#4CAF50' : '#FF8C00', // Remove if your PNGs are already colored
                                                    resizeMode: 'contain',
                                                }}
                                            />
                                            <Text style={[styles.captureText, isCaptured && styles.captureTextDone]}>
                                                {isCaptured ? 'Uploaded' : 'Upload'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            }}
                            scrollEnabled={true}
                            style={styles.servicesList}
                        />

                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <View style={styles.progressContainer}>
                                <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
                                <View style={styles.progressBar}>
                                    <Animated.View
                                        style={[
                                            styles.progressFill,
                                            { width: `${uploadProgress}%` }
                                        ]}
                                    />
                                </View>
                            </View>
                        )}

                        {Object.keys(capturedImages).length > 0 && (
                            <View style={styles.imagePreviewContainer}>
                                <Text style={styles.imagePreviewTitle}>📸 Captured Images</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewScroll}>
                                    {Object.entries(capturedImages).map(([serviceId, uri]) => {
                                        const service = jobDetails.subServices.find(s => s.id === parseInt(serviceId));
                                        return (
                                            <View key={serviceId} style={styles.imagePreviewItem}>
                                                <View style={styles.imagePlaceholder}>

                                                    <Image
                                                        source={require('../../asset/image-outline.png')}
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            tintColor: "#999"

                                                        }}
                                                    />
                                                    <Text style={styles.imagePreviewLabel}>{service?.name || 'Image'}</Text>
                                                </View>
                                                <View style={styles.imageStatusBadge}>

                                                    <Image
                                                        source={require('../../asset/check-mark.png')}
                                                        style={{
                                                            width: 12,
                                                            height: 12,
                                                            tintColor: "#4CAF50"

                                                        }}
                                                    />
                                                    <Text style={styles.imageStatusText}>Uploaded</Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        )}

                        <TouchableOpacity style={styles.modalButton} onPress={handleServiceComplete}>
                            <Text style={styles.modalButtonText}>Done - Complete Service</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    // Curved Toolbar
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
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    // ATM Card Style Customer Card with #6A1B9A
    customerCard: {
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#6A1B9A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardBackground: {
        width: '100%',
        height: 190,
    },
    cardBackgroundImage: {
        borderRadius: 16,
    },
    cardOverlay: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    // Card Chip
    cardChipContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardChip: {
        width: 44,
        height: 32,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    cardChipLine: {
        width: 20,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 1,
        marginBottom: 3,
    },
    cardChipLine2: {
        width: 14,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 1,
    },
    cardChipRight: {
        alignItems: 'flex-end',
    },
    cardChipLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1,
    },
    // Customer Info
    cardCustomerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardCustomerNameContainer: {
        flex: 1,
    },
    cardCustomerName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    cardCustomerRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    cardCustomerRatingText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#ffda08',
    },
    cardCustomerStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    cardCustomerStatusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    cardCustomerStatusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Card Details
    cardDetails: {
        flexDirection: 'row',
        gap: 16,
    },
    cardDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    cardDetailText: {
        fontSize: 12,
        color: '#FFF',
        fontWeight: '500',
    },
    // Card Footer
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardFooterLeft: {
        flex: 1,
    },
    cardFooterLabel: {
        fontSize: 8,
        color: '#FFF',
        fontWeight: '600',
        letterSpacing: 1.5,
    },
    cardFooterValue: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    cardCallButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
    },
    cardCallButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
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
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    locationText: {
        fontSize: 14,
        color: '#444',
        flex: 1,
        lineHeight: 20,
    },
    mapContainer: {
        height: 180,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 4,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        backgroundColor: '#E8F0FE',
    },
    mapPlaceholder: {
        flex: 1,
        //backgroundColor: '#E8F0FE',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    mapGrid: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    mapGridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(100, 100, 100, 0.1)',
    },
    mapGridLineVertical: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: 'rgba(100, 100, 100, 0.1)',
    },
    markerWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    markerPulseRing: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 71, 87, 0.15)',
        borderWidth: 2,
        borderColor: 'rgba(255, 71, 87, 0.3)',
    },
    markerContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    mapLabels: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mapLabel: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    mapLabelText: {
        fontSize: 12,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    mapLabelDistance: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    mapLabelDistanceText: {
        fontSize: 12,
        color: '#2ED573',
        fontWeight: '500',
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        flexDirection: 'row',
        gap: 8,
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    mapButtonText: {
        fontSize: 11,
        color: '#FF8C00',
        fontWeight: '500',
    },
    jobListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        gap: 12,
    },
    jobListNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFF8F3',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FFE8DC',
    },
    jobListNumberText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FF8C00',
    },
    jobListText: {
        flex: 1,
        fontSize: 14,
        color: '#444',
        fontWeight: '500',
    },
    jobListCheck: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F1F8F4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButton: {
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginTop: 8,
        marginBottom: 20,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: width * 0.85,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    modalSubtitle: {
        fontSize: 13,
        color: '#888',
        marginBottom: 20,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 20,
    },
    otpInput: {
        flex: 1,
        height: 54,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    otpInputFilled: {
        borderColor: '#FF8C00',
        backgroundColor: '#FFF8F3',
    },
    modalButton: {
        backgroundColor: '#FF8C00',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    servicesModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    servicesModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: height * 0.85,
    },
    servicesList: {
        maxHeight: height * 0.3,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    serviceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    serviceIcon: {
        fontSize: 20,
    },
    serviceName: {
        fontSize: 14,
        color: '#1A1A1A',
    },
    captureButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F3',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
        borderWidth: 1,
        borderColor: '#FFE8DC',
    },
    captureButtonDone: {
        backgroundColor: '#E8F5E9',
        borderColor: '#4CAF50',
    },
    captureText: {
        fontSize: 11,
        color: '#FF8C00',
        fontWeight: '500',
    },
    captureTextDone: {
        color: '#4CAF50',
    },
    progressContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
    },
    progressText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E8E8E8',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FF8C00',
        borderRadius: 3,
    },
    taskProgressContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    taskProgressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    taskProgressTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    taskProgressCount: {
        fontSize: 12,
        color: '#888',
        fontWeight: '500',
    },
    taskProgressBar: {
        height: 8,
        backgroundColor: '#E8E8E8',
        borderRadius: 4,
        overflow: 'hidden',
    },
    taskProgressFill: {
        height: '100%',
        backgroundColor: '#FF8C00',
        borderRadius: 4,
    },
    taskProgressPercent: {
        fontSize: 11,
        color: '#888',
        marginTop: 4,
        textAlign: 'right',
    },
    imagePreviewContainer: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    imagePreviewTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    imagePreviewScroll: {
        flexDirection: 'row',
    },
    imagePreviewItem: {
        marginRight: 12,
        alignItems: 'center',
    },
    imagePlaceholder: {
        width: 70,
        height: 70,
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    imagePreviewLabel: {
        fontSize: 9,
        color: '#999',
        marginTop: 4,
        textAlign: 'center',
    },
    imageStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 2,
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    imageStatusText: {
        fontSize: 8,
        color: '#4CAF50',
        fontWeight: '500',
    },
    mapImage: {
        width: '100%',
        height: '100%',
    }
});

export default JobDetailsScreen;