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
    SafeAreaView,
    FlatList,
    Image,
    PermissionsAndroid,
    Modal,
    TouchableWithoutFeedback
} from 'react-native';

import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import API from '../../util/API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
const { width, height } = Dimensions.get('window');


const SignupScreen = ({ navigation, route }) => {
    // Step management

    const [phoneNumber, setPhoneNumber] = useState('');
    const [token, setToken] = useState('');
    const [mobileVerified, setMobileVerified] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const totalSteps = 4;

    // Step 1: Phone & OTP

    const [otp, setOtp] = useState(['', '', '', '']);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Step 2: Personal Details
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [showDobPicker, setShowDobPicker] = useState(false);
    const [city, setCity] = useState('');
    const [cities, setCities] = useState(['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Kolkata', 'Surat', 'Jaipur']);

    // Step 3: Location
    const [location, setLocation] = useState('');
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

    // Step 4: Documents Upload
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [uploadingDocument, setUploadingDocument] = useState(null);

    // Step 5: PIN Setup
    const [pin, setPin] = useState(['', '', '', '']);
    const [confirmPin, setConfirmPin] = useState(['', '', '', '']);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Refs for OTP and PIN inputs
    const otpRefs = useRef([]);
    const pinRefs = useRef([]);
    const confirmPinRefs = useRef([]);

    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [emailID, setEmailID] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);




    const reverseGeocodeTimeout = useRef(null);

    const GOOGLE_MAPS_API_KEY =
        'AIzaSyBuxUn1s4S2yv8fqwd0wGUTFegxNyASL1g'

    const searchTimeout = useRef(null);

    const COLORS = {
        gold: '#C9A84C',
        goldLight: '#D4AF37',
        goldDark: '#B8943E',
        goldFade: 'rgba(201, 168, 76, 0.1)',
        goldFadeStrong: 'rgba(201, 168, 76, 0.2)',
        white: '#FFFFFF',
        dark: '#1A1A1A',
        textLight: '#666666',
        lightBg: '#F8F6F0',
        border: '#E8E3D8',
        success: '#2ECC71',
        shadow: 'rgba(201, 168, 76, 0.15)',
        purple: '#6C5CE7',
        pink: '#FD79A8',
        blue: '#0984E3',
        green: '#00B894',
    };

    useEffect(() => {
        const mobileNo = route.params?.mobileNo;
        const verified = route.params?.mobileVerified;
        const routeToken = route.params?.token;
        const isRegistered = route.params?.isRegistered;

        console.log('Mobile No:', mobileNo);
        console.log('Mobile Verified:', verified);
        console.log('Token:', routeToken);
        console.log('Is Registered:', isRegistered);

        if (mobileNo) {
            setPhoneNumber(mobileNo);
        }

        if (routeToken) {
            setToken(routeToken);
        }

        setMobileVerified(verified === true);

        // Case 1:
        // Already registered + mobile verified
        // → Open Documents
        if (verified === true && isRegistered === true) {
            setCompletedSteps([0, 1, 2]);
            setCurrentStep(3);
            return;
        }

        // Case 2:
        // Not registered + mobile verified
        // → Open Personal Details
        if (verified === true && isRegistered === false) {
            setCompletedSteps([0]);
            setCurrentStep(1);
            return;
        }

        // Case 3:
        // All other cases
        // → Open first step
        setCompletedSteps([]);
        setCurrentStep(0);

    }, [route.params]);

    useEffect(() => {
        if (currentStep === 2 && !location) {
            fetchCurrentLocation();
        }
    }, [currentStep]);


    const searchLocation = (text) => {
        setLocation(text);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (!text.trim() || text.trim().length < 3) {
            setLocationSuggestions([]);
            setShowLocationSuggestions(false);
            return;
        }

        searchTimeout.current = setTimeout(() => {
            searchGooglePlaces(text.trim());
        }, 700);
    };

    const searchGooglePlaces = async (text) => {
        try {
            setIsSearchingLocation(true);

            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
                    text
                )}&components=country:in&key=${GOOGLE_MAPS_API_KEY}`
            );

            const data = await response.json();

            if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
                console.log(
                    'Google Places error:',
                    data.status,
                    data.error_message
                );

                setLocationSuggestions([]);
                return;
            }

            setLocationSuggestions(
                data.predictions || []
            );

            setShowLocationSuggestions(
                data.predictions?.length > 0
            );

        } catch (error) {
            console.log(
                'Google Places search error:',
                error
            );
        } finally {
            setIsSearchingLocation(false);
        }
    };

    const handleLocationSelect = async (item) => {
        try {
            setIsSearchingLocation(true);

            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json` +
                `?place_id=${item.place_id}` +
                `&fields=formatted_address,geometry` +
                `&key=${GOOGLE_MAPS_API_KEY}`
            );

            const data = await response.json();

            console.log('Place Details:', data);

            if (data.status !== 'OK') {
                Alert.alert(
                    'Location Error',
                    data.error_message || 'Unable to get location details.'
                );
                return;
            }

            const result = data.result;

            const selectedLatitude =
                result.geometry.location.lat;

            const selectedLongitude =
                result.geometry.location.lng;

            const address =
                result.formatted_address ||
                item.description;

            // Address shown to user
            setLocation(address);

            // Coordinates stored for API
            setLatitude(selectedLatitude);
            setLongitude(selectedLongitude);

            // Hide suggestions
            setLocationSuggestions([]);
            setShowLocationSuggestions(false);

            console.log('Selected Location:', {
                address,
                latitude: selectedLatitude,
                longitude: selectedLongitude,
            });

        } catch (error) {
            console.log(
                'Place details error:',
                error
            );
        } finally {
            setIsSearchingLocation(false);
        }
    };

    const formatDobInput = (text) => {
        // Remove anything except numbers
        const numbers = text.replace(/\D/g, '');

        let formatted = '';

        if (numbers.length <= 2) {
            formatted = numbers;
        } else if (numbers.length <= 4) {
            formatted =
                numbers.substring(0, 2) +
                '/' +
                numbers.substring(2);
        } else {
            formatted =
                numbers.substring(0, 2) +
                '/' +
                numbers.substring(2, 4) +
                '/' +
                numbers.substring(4, 8);
        }

        return formatted;
    };



    const requestLocationPermission = async () => {
        if (Platform.OS !== 'android') {
            return true;
        }

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message:
                        'HomeHelp Partner needs your location to find nearby opportunities and set your service location.',
                    buttonPositive: 'Allow',
                    buttonNegative: 'Cancel',
                }
            );

            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (error) {
            console.log('Permission error:', error);
            return false;
        }
    };

    const fetchCurrentLocation = async () => {
        setIsFetchingLocation(true);

        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
            setIsFetchingLocation(false);

            Alert.alert(
                'Location Permission Required',
                'Please allow location permission from your phone settings to continue.'
            );

            return;
        }

        Geolocation.getCurrentPosition(
            async (position) => {
                console.log('Current position:', position);

                const { latitude, longitude } = position.coords;

                setLatitude(latitude);
                setLongitude(longitude);

                try {
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?` +
                        `latlng=${latitude},${longitude}` +
                        `&key=${GOOGLE_MAPS_API_KEY}`
                    );

                    const data = await response.json();

                    console.log('Google Address:', data);

                    if (
                        data.status === 'OK' &&
                        data.results?.length > 0
                    ) {
                        const address =
                            data.results[0].formatted_address;

                        setLocation(address);

                        console.log('Address:', address);
                    } else {
                        console.log(
                            'Google Geocoding Error:',
                            data.status,
                            data.error_message
                        );

                        setLocation(
                            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                        );
                    }

                } catch (error) {
                    console.log(
                        'Google Address Error:',
                        error
                    );

                    setLocation(
                        `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                    );
                }

                setIsFetchingLocation(false);
            },

            (error) => {
                console.log('Location error:', error);

                setIsFetchingLocation(false);

                if (error.code === 3) {
                    Alert.alert(
                        'Location Timeout',
                        'Unable to get your current location. Please make sure GPS/Location is turned on and try again.'
                    );
                } else if (error.code === 1) {
                    Alert.alert(
                        'Permission Denied',
                        'Please allow location permission to continue.'
                    );
                } else {
                    Alert.alert(
                        'Location Error',
                        'Unable to determine your current location. Please try again.'
                    );
                }
            },

            {
                enableHighAccuracy: false,
                timeout: 30000,
                maximumAge: 60000,
                distanceFilter: 10,
            }
        );
    };

    const genderOptions = [
        {
            id: 'Male',
            label: 'Male',
            image: require('../../asset/male.png'),
        },
        {
            id: 'Female',
            label: 'Female',
            image: require('../../asset/female.png'),
        },
        {
            id: 'Other',
            label: 'Other',
            image: require('../../asset/transgender.png'),
        },
    ];

    const documentOptions = [
        {
            id: 'aadhar',
            label: 'Aadhar Card',
            documentType: 'Aadhaar Card',
            image: require('../../asset/aadhaar.png'),
            description: 'Government ID proof',
        },
        {
            id: 'passport',
            label: 'Passport',
            documentType: 'Passport',
            image: require('../../asset/passport.png'),
            description: 'International travel document',
        },
        {
            id: 'pan',
            label: 'PAN Card',
            documentType: 'PAN Card',
            image: require('../../asset/pan.png'),
            description: 'Tax identification number',
        },
        {
            id: 'passbook',
            label: 'Bank Passbook',
            documentType: 'Bank Passbook',
            image: require('../../asset/book.png'),
            description: 'Bank Passbook',
        },

        {
            id: 'driving',
            label: 'Driving License',
            documentType: 'Driving License',
            image: require('../../asset/driving-license.png'),
            description: "Driver's permit",
        },
    ];

    const stepData = [
        {
            image: require('../../asset/telephone.png'),
            label: 'Phone',
        },
        {
            image: require('../../asset/person-outline.png'),
            label: 'Details',
        },
        {
            image: require('../../asset/location-outline.png'),
            label: 'Location',
        },
        {
            image: require('../../asset/cloud-upload.png'),
            label: 'Documents',
        },

    ];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 20,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    }, [currentStep]);

    const markStepComplete = (step) => {
        if (!completedSteps.includes(step)) {
            setCompletedSteps([...completedSteps, step]);
        }
    };

    const goToNextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const isValidDob = (value) => {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
            return false;
        }

        const [day, month, year] = value.split('/').map(Number);

        const date = new Date(year, month - 1, day);

        return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        );
    };


    const isAtLeast18 = (dobValue) => {
        if (!dobValue) return false;

        const [day, month, year] = dobValue.split('/');

        const birthDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );

        const today = new Date();

        let age =
            today.getFullYear() -
            birthDate.getFullYear();

        const monthDifference =
            today.getMonth() -
            birthDate.getMonth();

        if (
            monthDifference < 0 ||
            (
                monthDifference === 0 &&
                today.getDate() < birthDate.getDate()
            )
        ) {
            age--;
        }

        return age >= 18;
    };

    const handleMapLocationChange = async (region) => {
        const { latitude, longitude } = region;

        console.log('MAP LOCATION:', latitude, longitude);

        // Update coordinates
        setLatitude(latitude);
        setLongitude(longitude);

        // Update map region
        setMapRegion(region);

        // Clear previous timer
        if (reverseGeocodeTimeout.current) {
            clearTimeout(reverseGeocodeTimeout.current);
        }

        reverseGeocodeTimeout.current = setTimeout(async () => {
            try {
                const url =
                    `https://maps.googleapis.com/maps/api/geocode/json` +
                    `?latlng=${latitude},${longitude}` +
                    `&key=${GOOGLE_MAPS_API_KEY}`;

                console.log('GEOCODING URL:', url);

                const response = await fetch(url);

                const data = await response.json();

                console.log('GEOCODING RESPONSE:', data);

                if (
                    data.status === 'OK' &&
                    data.results &&
                    data.results.length > 0
                ) {
                    const address =
                        data.results[0].formatted_address;

                    console.log('NEW ADDRESS:', address);

                    // THIS IS THE IMPORTANT PART
                    setLocation(address);
                } else {
                    console.log(
                        'Address not found:',
                        data.status,
                        data.error_message
                    );
                }

            } catch (error) {
                console.log(
                    'Reverse geocoding error:',
                    error
                );
            }
        }, 800);
    };

    const handleSendOtp = () => {
        if (phoneNumber.length < 10) {
            Alert.alert('Invalid Number', 'Please enter a valid mobile number');
            return;
        }
        if (!agreedToTerms) {
            Alert.alert('Agreement Required', 'Please agree to the Terms & Conditions');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsOtpSent(true);
            Alert.alert('OTP Sent', 'Verification code sent to your mobile number');
        }, 1500);
    };

    const handleVerifyOtp = () => {
        const otpValue = otp.join('');
        if (otpValue.length < 4) {
            Alert.alert('Invalid OTP', 'Please enter the complete OTP');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsPhoneVerified(true);
            markStepComplete(0);
            Alert.alert('Verified', 'Phone number verified successfully!');
            setTimeout(() => {
                goToNextStep();
            }, 500);
        }, 1500);
    };


    const validatePassword = (pass) => {
        if (pass.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters' };
        }
        if (!/[A-Z]/.test(pass)) {
            return { valid: false, message: 'Password must contain at least one uppercase letter' };
        }
        if (!/[a-z]/.test(pass)) {
            return { valid: false, message: 'Password must contain at least one lowercase letter' };
        }
        if (!/[0-9]/.test(pass)) {
            return { valid: false, message: 'Password must contain at least one number' };
        }
        return { valid: true, message: 'Password is strong' };
    };



    const handleCompletePersonalDetails = () => {


        if (!firstName.trim()) {
            Alert.alert('Required', 'Please enter your first name');

            return;
        }
        if (!lastName.trim()) {
            Alert.alert('Required', 'Please enter your last name');

            return;
        }
        if (!emailID) {
            Alert.alert('Required', 'Please enter your email id');

            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(emailID.trim())) {
            Alert.alert('Validation', 'Please enter a valid email id');

            return;
        }
        if (!gender) {
            Alert.alert('Required', 'Please select your gender');
            return;
        }

        if (!dob) {
            Alert.alert('Required', 'Please enter Date of birth');

            return;
        }

        if (!isValidDob(dob)) {
            Alert.alert(
                'Invalid Date',
                'Please enter a valid date in DD/MM/YYYY format.'
            );
            return;
        }
        if (!isAtLeast18(dob)) {
            Alert.alert(
                'Invalid Date of Birth',
                'You must be at least 18 years old.'
            );
            return;
        }

        if (!password) {
            Alert.alert('Required', 'Please enter a password');

            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            Alert.alert('Password Requirements', passwordValidation.message);

            return;
        }

        if (!confirmPassword) {
            Alert.alert('Required', 'Please confirm your password');

            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');

            return;
        }
        markStepComplete(1);
        goToNextStep();
    };

    const formatDobForApi = (dob) => {
        if (!dob) return '';

        const [day, month, year] = dob.split('/');

        return `${year}-${month}-${day}`;
    };

    const handleCompleteLocation = async () => {
        if (!location.trim()) {
            Alert.alert('Missing Location', 'Please enter your location');
            return;
        }



        try {
            setIsLoading(true);



            const requestBody = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                mobileNo: phoneNumber.trim(),
                email: emailID.trim(),
                gender: gender,
                dob: formatDobForApi(dob),
                password: password,
                latitude: latitude,
                longitude: longitude,

            };

            console.log('CREATE ACCOUNT REQUEST:', requestBody);

            const response = await axios.post(
                API.REGISTER_PARTNER,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                'CREATE ACCOUNT RESPONSE:',
                response.data
            );

            if (response.data?.success === true) {

                // Save new token
                if (response.data?.token) {
                    await AsyncStorage.setItem(
                        'token',
                        response.data.token
                    );

                    setToken(response.data.token);
                }

                // Save User ID


                await AsyncStorage.setItem(
                    'customerMob',
                    String(phoneNumber)
                );



                markStepComplete(2);
                goToNextStep();



            } else {

                Alert.alert(
                    'Create Account Failed',
                    response.data?.message ||
                    'Unable to create account.'
                );
            }

        } catch (error) {

            console.log(
                'CREATE ACCOUNT ERROR:',
                error?.response?.data || error?.message
            );

            Alert.alert(
                'Create Account Failed',
                error?.response?.data?.message ||
                'Something went wrong. Please try again.'
            );

        } finally {
            setIsLoading(false);
        }




    };

    const handleCompleteDocuments = () => {
        const uploadedDocumentCount = Object.values(uploadedFiles).filter(
            document =>
                document?.uploaded === true &&
                document?.uploadSuccess === true
        ).length;

        if (uploadedDocumentCount < 2) {
            const remaining = 2 - uploadedDocumentCount;

            Alert.alert(
                'Documents Required',
                `Please upload ${remaining} more document${remaining > 1 ? 's' : ''
                } to continue.`
            );
            return;
        }

        Alert.alert('Success!', 'Your account has been created successfully!', [
            { text: 'Continue', onPress: () => navigation.replace('DashboardScreen') }
        ]);
    };

    const handleCompleteSignup = () => {
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
        markStepComplete(4);
        Alert.alert('Success!', 'Your account has been created successfully!', [
            { text: 'Continue', onPress: () => navigation.replace('DashboardScreen') }
        ]);
    };



    const renderStepIndicator = () => {
        return (
            <View style={styles.stepIndicatorContainer}>
                <View style={styles.stepIndicatorBackground} />
                <View style={styles.stepIndicatorContent}>
                    {stepData.map((step, index) => {
                        const isCompleted = completedSteps.includes(index);
                        const isActive = currentStep === index;

                        return (
                            <View key={index} style={styles.stepIndicatorItem}>
                                <View style={styles.stepIndicatorLine}>
                                    <View style={[
                                        styles.stepIndicatorCircle,
                                        isCompleted && styles.stepIndicatorCircleCompleted,
                                        isActive && styles.stepIndicatorCircleActive,
                                    ]}>
                                        {isCompleted ? (
                                            <Image
                                                source={require('../../asset/check.png')}
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    tintColor: '#FFFFFF',
                                                    resizeMode: 'contain',
                                                }}
                                            />
                                        ) : (
                                            <Image
                                                source={step.image}
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    tintColor: isActive ? '#FFFFFF' : '#AAAAAA',
                                                    resizeMode: 'contain',
                                                }}
                                            />
                                        )}
                                    </View>
                                    {index < totalSteps - 1 && (
                                        <View style={[
                                            styles.stepIndicatorConnector,
                                            isCompleted && styles.stepIndicatorConnectorCompleted,
                                        ]} />
                                    )}
                                </View>
                                {/* <Text style={[
                                    styles.stepIndicatorLabel,
                                    isActive && styles.stepIndicatorLabelActive,
                                    isCompleted && styles.stepIndicatorLabelCompleted,
                                ]}>
                                    {step.label}
                                </Text> */}
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    const renderPhoneStep = () => (
        <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.stepHeader}>
                <View style={styles.stepIconContainer}>

                    <Image
                        source={require('../../asset/telephone.png')}
                        style={{
                            width: 24,
                            height: 24,
                            tintColor: "#FF8C00",

                        }}
                    />
                </View>
                <View>
                    <Text style={styles.stepTitle}>Verify Your Phone</Text>
                    <Text style={styles.stepSubtitle}>Enter your mobile number to get started</Text>
                </View>
            </View>

            {/* Features Grid */}
            <View style={styles.featuresGrid}>
                <View style={styles.featureItem}>

                    <Image
                        source={require('../../asset/verified.png')}
                        style={{
                            width: 20,
                            height: 20,
                            tintColor: "#4CAF50",

                        }}
                    />
                    <Text style={styles.featureText}>Secure Verification</Text>
                </View>
                <View style={styles.featureItem}>

                    <Image
                        source={require('../../asset/time-outline.png')}
                        style={{
                            width: 20,
                            height: 20,
                            tintColor: "#FF8C00",

                        }}
                    />
                    <Text style={styles.featureText}>Fast Onboarding</Text>
                </View>
                <View style={styles.featureItem}>

                    <Image
                        source={require('../../asset/cash.png')}
                        style={{
                            width: 20,
                            height: 20,
                            tintColor: "#2196F3",

                        }}
                    />
                    <Text style={styles.featureText}>Instant Earnings</Text>
                </View>
                <View style={styles.featureItem}>

                    <Image
                        source={require('../../asset/people.png')}
                        style={{
                            width: 20,
                            height: 20,
                            tintColor: "#9C27B0",

                        }}
                    />
                    <Text style={styles.featureText}>50K+ Partners</Text>
                </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <View style={styles.phoneInputWrapper}>
                    <View style={styles.countryCode}>
                        <Text style={styles.countryCodeText}>+91</Text>
                    </View>
                    <TextInput
                        style={styles.phoneInput}
                        placeholder="Enter mobile number"
                        placeholderTextColor="#999"
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        editable={!isLoading && !isPhoneVerified}
                    />
                </View>
                <Text style={styles.inputHelperText}>We'll send a verification code to this number</Text>
            </View>

            {/* Terms & Conditions */}
            <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
                <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}>
                    {agreedToTerms && (
                        <Image
                            source={require('../../asset/check.png')}
                            style={{
                                width: 14,
                                height: 14,
                                tintColor: '#FFFFFF', // Remove if your image is already white
                                resizeMode: 'contain',
                            }}
                        />
                    )}
                </View>
                <Text style={styles.termsText}>
                    I agree to the <Text style={styles.termsLink}>Terms & Conditions</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
            </TouchableOpacity>

            {isOtpSent && !isPhoneVerified && (
                <View style={styles.inputCard}>
                    <Text style={styles.inputLabel}>Enter OTP</Text>
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
                                editable={!isLoading && !isPhoneVerified}
                            />
                        ))}
                    </View>
                    <TouchableOpacity style={styles.resendButton} onPress={handleSendOtp}>
                        <Text style={styles.resendText}>Resend OTP</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!isOtpSent && !isPhoneVerified && (
                <TouchableOpacity
                    style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                    onPress={handleSendOtp}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.primaryButtonText}>Send OTP</Text>
                    )}
                </TouchableOpacity>
            )}

            {isOtpSent && !isPhoneVerified && (
                <TouchableOpacity
                    style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                    onPress={handleVerifyOtp}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.primaryButtonText}>Verify OTP</Text>
                    )}
                </TouchableOpacity>
            )}

            {isPhoneVerified && (
                <View style={styles.verifiedContainer}>

                    <Image
                        source={require('../../asset/check-mark.png')}
                        style={{
                            width: 48,
                            height: 48,
                            tintColor: "#4CAF50",

                        }}
                    />
                    <Text style={styles.verifiedText}>Phone Verified!</Text>
                    <Text style={styles.verifiedSubtext}>Your number has been successfully verified</Text>
                </View>
            )}
        </Animated.View>
    );

    const renderPersonalDetailsStep = () => (
        <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.stepHeader}>
                <View style={styles.stepIconContainer}>

                    <Image
                        source={require('../../asset/person-outline.png')}
                        style={{
                            width: 28,
                            height: 28,
                            tintColor: "#FF8C00",

                        }}
                    />
                </View>
                <View>
                    <Text style={styles.stepTitle}>Personal Details</Text>
                    <Text style={styles.stepSubtitle}>Tell us about yourself</Text>
                </View>
            </View>

            <View style={styles.rowContainer}>
                <View style={[styles.inputCard, { flex: 1, marginRight: 8 }]}>
                    {/* <Text style={styles.inputLabel}>First Name</Text> */}
                    <View style={styles.inputLabelContainer}>
                        <Text style={styles.inputLabel}>First Name</Text>
                        <Text style={styles.inputRequired}>*</Text>
                    </View>
                    <TextInput
                        style={styles.textInput}
                        placeholder="First name"
                        placeholderTextColor="#999"
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                </View>
                <View style={[styles.inputCard, { flex: 1, marginLeft: 8 }]}>

                    <View style={styles.inputLabelContainer}>
                        <Text style={styles.inputLabel}>Last Name</Text>
                        <Text style={styles.inputRequired}>*</Text>
                    </View>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Last name"
                        placeholderTextColor="#999"
                        value={lastName}
                        onChangeText={setLastName}
                    />
                </View>
            </View>

            <View style={styles.inputCard}>

                <View style={styles.inputLabelContainer}>
                    <Text style={styles.inputLabel}>Email ID</Text>
                    <Text style={styles.inputRequired}>*</Text>
                </View>
                <View style={styles.cityContainer}>
                    <TextInput
                        style={[styles.textInput]}
                        placeholder="Type your email id"
                        placeholderTextColor="#999"
                        value={emailID}
                        onChangeText={setEmailID}
                    />

                </View>
            </View>




            <View style={styles.inputCard}>

                <View style={styles.inputLabelContainer}>
                    <Text style={styles.inputLabel}>Gender</Text>
                    <Text style={styles.inputRequired}>*</Text>
                </View>
                <View style={styles.genderContainer}>
                    {genderOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.genderOption,
                                gender === option.id && styles.genderOptionActive,
                            ]}
                            onPress={() => setGender(option.id)}
                        >
                            <Image
                                source={option.image}
                                style={{
                                    width: 24,
                                    height: 24,
                                    tintColor: gender === option.id ? '#FF8C00' : '#666',
                                    resizeMode: 'contain',
                                }}
                            />
                            <Text style={[
                                styles.genderText,
                                gender === option.id && styles.genderTextActive,
                            ]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputCard}>

                <View style={styles.inputLabelContainer}>
                    <Text style={styles.inputLabel}>Date of Birth</Text>
                    <Text style={styles.inputRequired}>*</Text>
                </View>
                <TextInput
                    style={styles.textInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#999"
                    value={dob}
                    onChangeText={(text) => {
                        setDob(formatDobInput(text));
                    }}
                    keyboardType="number-pad"
                    maxLength={10}
                />


            </View>

            <View style={styles.inputCard}>
                <View style={styles.inputLabelContainer}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <Text style={styles.inputRequired}>*</Text>
                </View>


                <View style={[styles.cityContainer, {
                    flexDirection: 'row', backgroundColor: '#F8F9FA',
                    borderRadius: 10,
                    fontSize: 15,
                    color: '#1A1A1A',
                    borderWidth: 1.5,
                    borderColor: '#E8E8E8',
                    alignContent: 'center',

                }]}>

                    <TextInput

                        style={{ flex: 1 }}
                        placeholder="Create a strong password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        returnKeyType="next"

                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}

                    >
                        <Image
                            source={
                                showPassword
                                    ? require('../../asset/eye_open.png')
                                    : require('../../asset/eye_close.png')
                            }
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.textLight,
                                marginTop: 10
                            }}
                        />
                    </TouchableOpacity>
                </View>
                {password.length > 0 && (
                    <View style={styles.passwordStrength}>
                        <Text style={[
                            styles.passwordStrengthText,
                            password.length < 6 ? { color: COLORS.red } :
                                password.length < 8 ? { color: COLORS.orange } :
                                    { color: COLORS.success }
                        ]}>
                            {password.length < 6 ? 'Weak' :
                                password.length < 8 ? 'Medium' : 'Strong'}
                        </Text>
                        <View style={styles.strengthBar}>
                            <View style={[
                                styles.strengthFill,
                                {
                                    width: password.length < 6 ? '33%' :
                                        password.length < 8 ? '66%' : '100%',
                                    backgroundColor: password.length < 6 ? COLORS.red :
                                        password.length < 8 ? COLORS.orange : COLORS.success
                                }
                            ]} />
                        </View>
                    </View>
                )}

            </View>


            <View style={styles.inputCard}>
                <View style={styles.inputLabelContainer}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <Text style={styles.inputRequired}>*</Text>
                </View>


                <View style={[styles.cityContainer, {
                    flexDirection: 'row', backgroundColor: '#F8F9FA',
                    borderRadius: 10,
                    fontSize: 15,
                    color: '#1A1A1A',
                    borderWidth: 1.5,
                    borderColor: '#E8E8E8',
                    alignContent: 'center',

                }]}>

                    <TextInput

                        style={{ flex: 1 }}
                        placeholder="Confirm your password"
                        placeholderTextColor="#999"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        returnKeyType="next"

                    />
                    <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}

                    >
                        <Image
                            source={
                                showPassword
                                    ? require('../../asset/eye_open.png')
                                    : require('../../asset/eye_close.png')
                            }
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: 'contain',
                                tintColor: COLORS.textLight,
                                marginTop: 10
                            }}
                        />
                    </TouchableOpacity>
                </View>
                {confirmPassword.length > 0 && password.length > 0 && (
                    <Text style={[
                        styles.matchText,
                        password === confirmPassword ? { color: COLORS.success } : { color: COLORS.red }
                    ]}>
                        {password === confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                    </Text>
                )}

            </View>



            <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleCompletePersonalDetails}
            >
                <Text style={styles.primaryButtonText}>Continue →</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderLocationStep = () => (
        <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* <View style={styles.stepHeader}>
                <View style={styles.stepIconContainer}>

                    <Image
                        source={require('../../asset/location-outline.png')}
                        style={{
                            width: 28,
                            height: 28,
                            tintColor: "#FF8C00",

                        }}
                    />
                </View>
                <View>
                    <Text style={styles.stepTitle}>Set Your Location</Text>
                    <Text style={styles.stepSubtitle}>Enter your location to find nearby opportunities</Text>
                </View>
            </View>

            <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Location</Text>
                <View style={styles.locationInputWrapper}>

                    <Image
                        source={require('../../asset/location-outline.png')}
                        style={{
                            width: 28,
                            height: 28,
                            tintColor: "#FF8C00",

                        }}
                    />
                    <TextInput
                        style={styles.locationInput}
                        placeholder="Enter your location"
                        placeholderTextColor="#999"
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>
            </View> */}


            <View style={styles.inputCard}>
                <View style={styles.locationLabelRow}>
                    <Text style={styles.inputLabel}>Set Your Working Location</Text>

                    {isFetchingLocation && (
                        <ActivityIndicator
                            size="small"
                            color="#FF8C00"
                        />
                    )}
                </View>

                <View style={styles.locationInputWrapper}>
                    <Image
                        source={require('../../asset/location-outline.png')}
                        style={{
                            width: 24,
                            height: 24,
                            tintColor: "#FF8C00",
                        }}
                    />

                    <TextInput
                        style={styles.locationInput}
                        placeholder="Search your location"
                        placeholderTextColor="#999"
                        value={location}
                        onChangeText={searchLocation}
                        onFocus={() => {
                            if (locationSuggestions.length > 0) {
                                setShowLocationSuggestions(true);
                            }
                        }}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />

                    {location.length > 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                setLocation('');
                                setLocationSuggestions([]);
                                setShowLocationSuggestions(false);
                            }}
                        >
                            <Image
                                source={require('../../asset/edit.png')}
                                style={{
                                    width: 20,
                                    height: 20,
                                    resizeMode: 'contain',
                                }}
                            />
                        </TouchableOpacity>
                    )}

                    {isSearchingLocation && (
                        <ActivityIndicator
                            size="small"
                            color="#FF8C00"
                        />
                    )}
                </View>

                {showLocationSuggestions &&
                    locationSuggestions.length > 0 && (
                        <View style={styles.locationSuggestionsContainer}>
                            {locationSuggestions.map((item, index) => (
                                <TouchableOpacity
                                    key={`${item.place_id}-${index}`}
                                    style={styles.locationSuggestionItem}
                                    onPress={() => handleLocationSelect(item)}
                                    activeOpacity={0.7}
                                >
                                    <Image
                                        source={require('../../asset/location-outline.png')}
                                        style={styles.locationSuggestionIcon}
                                    />

                                    <View
                                        style={
                                            styles.locationSuggestionTextContainer
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.locationSuggestionTitle
                                            }
                                            numberOfLines={1}
                                        >
                                            {item.structured_formatting
                                                ?.main_text ||
                                                item.description ||
                                                ''}
                                        </Text>

                                        <Text
                                            style={
                                                styles.locationSuggestionAddress
                                            }
                                            numberOfLines={2}
                                        >
                                            {item.structured_formatting
                                                ?.secondary_text || ''}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                <TouchableOpacity
                    style={styles.useCurrentLocationButton}
                    onPress={fetchCurrentLocation}
                    disabled={isFetchingLocation}
                >
                    <Image
                        source={require('../../asset/location-outline.png')}
                        style={{
                            width: 18,
                            height: 18,
                            tintColor: "#FF8C00",
                        }}
                    />

                    <Text style={styles.useCurrentLocationText}>
                        {isFetchingLocation
                            ? 'Getting Location...'
                            : 'Use Current Location'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.mapContainer}>
                {latitude && longitude ? (
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: latitude,
                            longitude: longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }}
                        region={{
                            latitude: latitude,
                            longitude: longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }}
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                        zoomEnabled={true}
                        scrollEnabled={true}


                    >
                        <Marker
                            coordinate={{
                                latitude: latitude,
                                longitude: longitude,
                            }}
                            title="Your Location"
                            description={location}
                        />
                    </MapView>
                ) : (
                    <View style={styles.mapLoadingContainer}>
                        <ActivityIndicator size="large" color="#FF8C00" />
                        <Text style={styles.mapPlaceholderText}>
                            Fetching your location...
                        </Text>
                    </View>
                )}
            </View>

            {location && (
                <View style={styles.locationPreview}>

                    <Image
                        source={require('../../asset/checked.png')}
                        style={{
                            width: 20,
                            height: 20,
                            tintColor: "#4CAF50",

                        }}
                    />
                    <Text style={styles.locationPreviewText}>Working Location : {location}</Text>
                </View>
            )}

            <TouchableOpacity
                style={[styles.primaryButton, !location && styles.buttonDisabled]}
                onPress={handleCompleteLocation}
                disabled={!location}
            >
                <Text style={styles.primaryButtonText}>Continue →</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    // const toggleDocument = (docId) => {
    //     if (selectedDocuments.includes(docId)) {
    //         setSelectedDocuments(selectedDocuments.filter(id => id !== docId));
    //         const newUploads = { ...uploadedFiles };
    //         delete newUploads[docId];
    //         setUploadedFiles(newUploads);
    //     } else {
    //         setSelectedDocuments([...selectedDocuments, docId]);
    //         setUploadedFiles({
    //             ...uploadedFiles,
    //             [docId]: {
    //                 name: `${docId}_document.pdf`,
    //                 size: '2.4 MB',
    //                 uploaded: false,
    //                 referenceNumber: ''
    //             }
    //         });
    //     }
    // };

    const toggleDocument = (docId) => {
        const existingDocument = uploadedFiles[docId];

        // Never allow an uploaded document to be deselected
        if (existingDocument?.uploaded && existingDocument?.uploadSuccess) {
            return;
        }

        if (selectedDocuments.includes(docId)) {
            setSelectedDocuments(
                selectedDocuments.filter(id => id !== docId)
            );

            setUploadedFiles(prev => {
                const newUploads = { ...prev };
                delete newUploads[docId];
                return newUploads;
            });

        } else {
            setSelectedDocuments(prev => [...prev, docId]);

            setUploadedFiles(prev => ({
                ...prev,
                [docId]: {
                    uploaded: false,
                    uploadSuccess: false,
                    referenceNumber: '',
                    fileName: '',
                    uri: '',
                    type: '',
                    size: 0,
                    partnerDocumentId: null,
                    verificationStatus: '',
                    filePath: '',
                },
            }));
        }
    };


    const openUploadModal = (docId) => {
        const document = uploadedFiles[docId];

        // Already successfully uploaded
        if (document?.uploaded && document?.uploadSuccess) {
            Alert.alert(
                'Document Already Uploaded',
                'This document has already been uploaded successfully and cannot be changed.'
            );
            return;
        }

        const refNumber = document?.referenceNumber || '';

        if (!refNumber.trim()) {
            Alert.alert(
                'Reference Number Required',
                'Please enter the reference number first.'
            );
            return;
        }

        setSelectedDocId(docId);
        setUploadProgress(0);
        setShowUploadModal(true);
    };

    const handleCamera = async () => {
        try {
            if (!selectedDocId) {
                return;
            }

            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message:
                            'HomeHelp Partner needs camera access to capture your document.',
                        buttonPositive: 'Allow',
                        buttonNegative: 'Cancel',
                    }
                );

                if (
                    granted !== PermissionsAndroid.RESULTS.GRANTED
                ) {
                    Alert.alert(
                        'Permission Required',
                        'Camera permission is required to capture the document.'
                    );
                    return;
                }
            }

            const result = await launchCamera({
                mediaType: 'photo',
                cameraType: 'back',
                quality: 0.8,
                saveToPhotos: false,
            });

            if (result.didCancel) {
                return;
            }

            if (result.errorCode) {
                Alert.alert(
                    'Camera Error',
                    result.errorMessage ||
                    'Unable to open camera.'
                );
                return;
            }

            const asset = result.assets?.[0];

            if (!asset?.uri) {
                Alert.alert(
                    'Error',
                    'Unable to capture the document.'
                );
                return;
            }

            const file = {
                uri: asset.uri,
                fileName:
                    asset.fileName ||
                    `document_${Date.now()}.jpg`,
                type: asset.type || 'image/jpeg',
                fileSize: asset.fileSize || 0,
            };

            await uploadDocumentToApi(
                selectedDocId,
                file
            );

        } catch (error) {

            console.log('Camera exception:', error);

            Alert.alert(
                'Camera Error',
                'Unable to capture the document. Please try again.'
            );
        }
    };


    const handleAttachImage = async () => {
        try {
            if (!selectedDocId) {
                return;
            }
            setUploadProgress(0);
            setUploadingDocument(selectedDocId);

            const result = await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 1,
                quality: 0.8,
            });

            if (result.didCancel) {
                setUploadingDocument(null);
                return;
            }

            if (result.errorCode) {
                Alert.alert(
                    'Gallery Error',
                    result.errorMessage ||
                    'Unable to open gallery.'
                );
                return;
            }

            const asset = result.assets?.[0];

            if (!asset?.uri) {
                Alert.alert(
                    'Error',
                    'Unable to select the document.'
                );
                setUploadingDocument(null);
                return;
            }

            const file = {
                uri: asset.uri,
                fileName:
                    asset.fileName ||
                    `document_${Date.now()}.jpg`,
                type: asset.type || 'image/jpeg',
                fileSize: asset.fileSize || 0,
            };

            await uploadDocumentToApi(
                selectedDocId,
                file
            );

        } catch (error) {
            setUploadingDocument(null);

            console.log(
                'Gallery upload error:',
                error
            );

            Alert.alert(
                'Upload Error',
                'Unable to upload the selected document.'
            );
        }
    };


    const validateDocumentNumber = (documentType, value) => {
        const documentNo = value.trim().toUpperCase();

        switch (documentType) {

            case 'PAN Card':
                return {
                    valid: /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(documentNo),
                    message: 'Please enter a valid PAN number. Example: ABCDE1234F',
                };

            case 'Aadhaar Card':
                return {
                    valid: /^\d{12}$/.test(documentNo),
                    message: 'Aadhaar number must contain exactly 12 digits.',
                };

            case 'Passport':
                return {
                    valid: /^[A-Z][0-9]{7}$/.test(documentNo),
                    message: 'Please enter a valid passport number. Example: A1234567',
                };

            case 'Bank Passbook':
                return {
                    valid: /^\d{9,18}$/.test(documentNo),
                    message: 'Please enter a valid bank account number.',
                };

            case 'Driving License':
                return {
                    valid: /^[A-Z0-9-]{5,20}$/.test(documentNo),
                    message: 'Please enter a valid Driving License number.',
                };

            default:
                return {
                    valid: documentNo.length > 0,
                    message: 'Please enter a valid document number.',
                };
        }
    };

    const uploadDocumentToApi = async (docId, file) => {
        try {
            const documentOption = documentOptions.find(
                item => item.id === docId
            );

            if (!documentOption) {
                Alert.alert('Error', 'Invalid document selected.');
                return false;
            }



            const documentData = uploadedFiles[docId];

            const documentNo = documentData?.referenceNumber
                ?.trim()
                .toUpperCase();

            if (!documentNo) {
                Alert.alert(
                    'Reference Number Required',
                    `Please enter the ${documentOption.label} number.`
                );
                return false;
            }

            const validation = validateDocumentNumber(
                documentOption.documentType,
                documentNo
            );

            if (!validation.valid) {
                Alert.alert(
                    'Invalid Document Number',
                    validation.message
                );
                return false;
            }

            if (!documentData?.referenceNumber?.trim()) {
                Alert.alert(
                    'Reference Number Required',
                    `Please enter the ${documentOption.label} number.`
                );
                return false;
            }

            if (!file?.uri) {
                Alert.alert(
                    'File Required',
                    'Please select or capture a document.'
                );
                return false;
            }

            setUploadingDocument(docId);
            setUploadProgress(0);

            const formData = new FormData();

            formData.append(
                'DocumentType',
                documentOption.documentType
            );

            formData.append(
                'DocumentNo',
                documentData.referenceNumber.trim()
            );

            formData.append('File', {
                uri: file.uri,
                name:
                    file.fileName ||
                    file.name ||
                    `document_${Date.now()}.jpg`,
                type: file.type || 'image/jpeg',
            });

            const response = await axios.post(
                API.UPLOAD_PARTNER_DOCUMENT,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                    onUploadProgress: progressEvent => {
                        if (progressEvent.total) {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) /
                                progressEvent.total
                            );

                            setUploadProgress(progress);
                        }
                    },
                }
            );

            console.log(
                'Document upload response:',
                response.data
            );

            if (response.data?.success === true) {
                setUploadedFiles(prev => ({
                    ...prev,
                    [docId]: {
                        ...prev[docId],
                        uploaded: true,
                        uploadSuccess: true,

                        fileName:
                            file.fileName ||
                            file.name ||
                            `document_${Date.now()}`,

                        uri: file.uri,
                        type: file.type || 'image/jpeg',
                        size: file.fileSize || file.size || 0,

                        partnerDocumentId:
                            response.data.partnerDocumentId,

                        documentType:
                            response.data.documentType,

                        documentNo:
                            response.data.documentNo,

                        verificationStatus:
                            response.data.verificationStatus,

                        filePath:
                            response.data.filePath,
                    },
                }));

                setUploadProgress(100);
                setShowUploadModal(false);

                Alert.alert(
                    'Upload Successful',
                    response.data.message ||
                    'Document uploaded successfully.'
                );

                return true;
            }

            Alert.alert(
                'Upload Failed',
                response.data?.message ||
                'Unable to upload document.'
            );

            return false;

        } catch (error) {
            console.log(
                'Document upload error:',
                error?.response?.data || error?.message
            );

            Alert.alert(
                'Upload Failed',
                error?.response?.data?.message ||
                'Something went wrong while uploading the document.'
            );

            return false;

        } finally {
            setUploadingDocument(null);
        }
    };










    const simulateUploadWithProgress = (docId) => {
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    // Complete upload
                    setUploadedFiles({
                        ...uploadedFiles,
                        [docId]: {
                            ...uploadedFiles[docId],
                            uploaded: true,
                            fileName: `document_${Date.now()}.jpg`,
                        }
                    });
                    setShowUploadModal(false);
                    Alert.alert('Success', 'Document uploaded successfully!');
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const renderUploadModal = () => (
        <Modal
            transparent={true}
            visible={showUploadModal}
            animationType="slide"
            onRequestClose={() => setShowUploadModal(false)}
        >
            <TouchableWithoutFeedback onPress={() => setShowUploadModal(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View style={styles.modalContent}>
                            <View style={styles.modalHandle} />

                            <Text style={styles.modalTitle}>Upload Document</Text>
                            <Text style={styles.modalSubtitle}>
                                Choose how to upload your document
                            </Text>

                            {/* Upload Progress */}
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
                                    </View>
                                    <Text style={styles.progressText}>{uploadProgress}%</Text>
                                </View>
                            )}

                            <View style={styles.modalOptions}>
                                {/* Camera Option */}
                                <TouchableOpacity
                                    style={styles.modalOption}
                                    onPress={handleCamera}
                                    disabled={uploadProgress > 0 && uploadProgress < 100}
                                >
                                    <View style={[styles.modalOptionIcon, { backgroundColor: '#FF8C0015' }]}>
                                        <Image
                                            source={require('../../asset/camera.png')}
                                            style={{
                                                width: 32,
                                                height: 32,
                                                tintColor: '#FF8C00',
                                                resizeMode: 'contain',
                                            }}
                                        />
                                    </View>
                                    <Text style={styles.modalOptionTitle}>Camera</Text>
                                    <Text style={styles.modalOptionDesc}>Take a photo with your camera</Text>
                                </TouchableOpacity>

                                {/* Attach Option */}
                                <TouchableOpacity
                                    style={styles.modalOption}
                                    onPress={handleAttachImage}
                                    disabled={uploadProgress > 0 && uploadProgress < 100}
                                >
                                    <View style={[styles.modalOptionIcon, { backgroundColor: '#4CAF5015' }]}>
                                        <Image
                                            source={require('../../asset/attach.png')}
                                            style={{
                                                width: 32,
                                                height: 32,
                                                tintColor: '#4CAF50',
                                                resizeMode: 'contain',
                                            }}
                                        />
                                    </View>
                                    <Text style={styles.modalOptionTitle}>Attach</Text>
                                    <Text style={styles.modalOptionDesc}>Choose from gallery or files</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowUploadModal(false)}
                                disabled={uploadProgress > 0 && uploadProgress < 100}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );



    const renderDocumentsStep = () => (
        <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.stepHeader}>
                <View style={styles.stepIconContainer}>
                    <Image
                        source={require('../../asset/cloud-upload.png')}
                        style={{
                            width: 28,
                            height: 28,
                            tintColor: "#FF8C00",
                        }}
                    />
                </View>
                <View>
                    <Text style={styles.stepTitle}>Upload Documents</Text>
                    <Text style={styles.stepSubtitle}>Select and upload your documents for verification</Text>
                </View>
            </View>

            <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Select & Upload Documents</Text>
                <View style={styles.documentsGrid}>
                    {documentOptions.map((doc) => {
                        const isSelected = selectedDocuments.includes(doc.id);
                        const isUploaded = uploadedFiles[doc.id]?.uploaded;

                        return (
                            <TouchableOpacity
                                key={doc.id}
                                style={[
                                    styles.documentCard,
                                    isSelected && styles.documentCardActive,
                                    isUploaded && styles.documentCardUploaded,
                                ]}
                                onPress={() => {
                                    if (
                                        uploadedFiles[doc.id]?.uploaded &&
                                        uploadedFiles[doc.id]?.uploadSuccess
                                    ) {
                                        return;
                                    }

                                    toggleDocument(doc.id);
                                }}
                                activeOpacity={0.8}
                            >
                                <View style={styles.documentCardHeader}>
                                    <View style={styles.documentIconContainer}>
                                        <Image
                                            source={doc.image}
                                            style={{
                                                width: 24,
                                                height: 24,
                                                tintColor: isSelected ? '#FF8C00' : '#666',
                                                resizeMode: 'contain',
                                            }}
                                        />
                                    </View>
                                    {isUploaded && (
                                        <View style={styles.uploadedBadge}>
                                            <Image
                                                source={require('../../asset/check-mark.png')}
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    tintColor: "#4CAF50",
                                                }}
                                            />
                                        </View>
                                    )}
                                </View>
                                <Text style={[
                                    styles.documentCardTitle,
                                    isSelected && styles.documentCardTitleActive,
                                ]}>
                                    {doc.label}
                                </Text>
                                <Text style={styles.documentCardDescription}>{doc.description}</Text>

                                {isSelected && (
                                    <>
                                        {/* Reference Number Input */}
                                        <View style={styles.referenceInputContainer}>
                                            <Text style={styles.referenceInputLabel}>Reference Number</Text>
                                            <TextInput
                                                style={styles.referenceInput}
                                                placeholder={`Enter ${doc.label} number`}
                                                placeholderTextColor="#999"
                                                value={uploadedFiles[doc.id]?.referenceNumber || ''}
                                                editable={
                                                    !(
                                                        uploadedFiles[doc.id]?.uploaded &&
                                                        uploadedFiles[doc.id]?.uploadSuccess
                                                    )
                                                }
                                                onChangeText={(text) => {
                                                    setUploadedFiles(prev => ({
                                                        ...prev,
                                                        [doc.id]: {
                                                            ...prev[doc.id],
                                                            referenceNumber: text.toUpperCase(),
                                                        },
                                                    }));
                                                }}
                                                autoCapitalize="characters"
                                            />
                                        </View>

                                        {/* Upload Button - Opens Modal */}
                                        <TouchableOpacity
                                            style={[
                                                styles.uploadButton,
                                                isUploaded && styles.uploadButtonUploaded,
                                            ]}
                                            disabled={
                                                isUploaded ||
                                                uploadingDocument === doc.id
                                            }
                                            onPress={() => {
                                                if (isUploaded) {
                                                    Alert.alert(
                                                        'Already Uploaded',
                                                        'This document has already been uploaded successfully.'
                                                    );
                                                    return;
                                                }

                                                openUploadModal(doc.id);
                                            }}
                                        >
                                            <Image
                                                source={require('../../asset/cloud-upload.png')}
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    tintColor: "#FFFFFF",
                                                }}
                                            />
                                            <Text style={styles.uploadButtonText}>
                                                {uploadingDocument === doc.id
                                                    ? 'Uploading...'
                                                    : isUploaded
                                                        ? 'Uploaded ✓'
                                                        : 'Upload File'}
                                            </Text>
                                        </TouchableOpacity>

                                        {isUploaded && (
                                            <View style={{
                                                marginTop: 6,
                                                alignItems: 'center',
                                            }}>
                                                <Text style={{
                                                    fontSize: 11,
                                                    color: '#4CAF50',
                                                    fontWeight: '600',
                                                }}>
                                                    Verification: {
                                                        uploadedFiles[doc.id]?.verificationStatus ||
                                                        'Pending'
                                                    }
                                                </Text>
                                            </View>
                                        )}
                                    </>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <Text style={styles.documentHelperText}>
                    {selectedDocuments.length > 0
                        ? `${selectedDocuments.length} document(s) selected. Enter reference number and tap "Upload File".`
                        : 'Select a document to upload'}
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.primaryButton, selectedDocuments.length === 0 && styles.buttonDisabled]}
                onPress={handleCompleteDocuments}
                disabled={selectedDocuments.length === 0}
            >
                <Text style={styles.primaryButtonText}>Create Account →</Text>
            </TouchableOpacity>

            {/* Upload Modal */}
            {renderUploadModal()}
        </Animated.View>
    );



    const renderPinStep = () => (
        <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.stepHeader}>
                <View style={styles.stepIconContainer}>

                    <Image
                        source={require('../../asset/verified.png')}
                        style={{
                            width: 28,
                            height: 28,
                            tintColor: "#FF8C00",

                        }}
                    />
                </View>
                <View>
                    <Text style={styles.stepTitle}>Set Security PIN</Text>
                    <Text style={styles.stepSubtitle}>Create a 4-digit PIN to secure your account</Text>
                </View>
            </View>

            <View style={styles.pinInfoContainer}>

                <Image
                    source={require('../../asset/information.png')}
                    style={{
                        width: 20,
                        height: 20,
                        tintColor: "#FF8C00",

                    }}
                />
                <Text style={styles.pinInfoText}>
                    This PIN will be used for secure transactions and account access
                </Text>
            </View>

            <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Create 4-Digit PIN</Text>
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
                        />
                    ))}
                </View>
            </View>

            <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Confirm PIN</Text>
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
                        />
                    ))}
                </View>
            </View>

            <View style={styles.pinTips}>
                <Text style={styles.pinTipsTitle}>💡 PIN Tips:</Text>
                <Text style={styles.pinTipsText}>• Use a memorable but secure 4-digit combination</Text>
                <Text style={styles.pinTipsText}>• Avoid using 1234, 0000, or your birth year</Text>
                <Text style={styles.pinTipsText}>• Never share your PIN with anyone</Text>
            </View>

            <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleCompleteSignup}
            >
                <Text style={styles.primaryButtonText}>Create Account →</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderStep = () => {
        switch (currentStep) {
            case 0: return renderPhoneStep();
            case 1: return renderPersonalDetailsStep();
            case 2: return renderLocationStep();
            case 3: return renderDocumentsStep();
            case 4: return renderPinStep();
            default: return null;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header with App Title & Earning Boost */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>

                        <Image
                            source={require('../../asset/arrow-back.png')}
                            style={{
                                width: 24,
                                height: 24,


                            }}
                        />

                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>HomeHelp Partner</Text>
                        <Text style={styles.headerSubtitle}>🚀 Start Earning ₹50K+ Monthly</Text>
                    </View>
                    <View style={styles.headerPlaceholder} />
                </View>

                {/* Step Indicator */}
                {renderStepIndicator()}

                {/* Step Content */}
                <ScrollView
                    style={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContentContainer}
                >
                    {renderStep()}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    backButton: {
        padding: 4,
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#FF8C00',
        fontWeight: '600',
        marginTop: 1,
    },
    headerPlaceholder: {
        width: 32,
    },
    // Step Indicator - Light Orange Background
    stepIndicatorContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
        marginTop: 4,
        position: 'relative',
    },
    stepIndicatorBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFF5ED',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFE0CC',
    },
    stepIndicatorContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 16,
        paddingTop: 18,
    },
    stepIndicatorItem: {
        flex: 1,
        alignItems: 'center',
    },
    stepIndicatorLine: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
    },
    stepIndicatorCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#E8E8E8',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        borderWidth: 2,
        borderColor: '#E8E8E8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    stepIndicatorCircleActive: {
        backgroundColor: '#FF8C00',
        borderColor: '#FF8C00',
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    stepIndicatorCircleCompleted: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    stepIndicatorConnector: {
        flex: 1,
        height: 3,
        backgroundColor: '#E8E8E8',
        marginHorizontal: 6,
        borderRadius: 2,
        maxWidth: 40,
    },
    stepIndicatorConnectorCompleted: {
        backgroundColor: '#4CAF50',
    },
    stepIndicatorLabel: {
        fontSize: 10,
        color: '#999',
        marginTop: 6,
        fontWeight: '500',
        letterSpacing: 0.2,
        marginRight: 30

    },
    stepIndicatorLabelActive: {
        color: '#FF8C00',
        fontWeight: '600',
    },
    stepIndicatorLabelCompleted: {
        color: '#4CAF50',
    },
    scrollContent: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    stepContainer: {
        paddingTop: 4,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    stepIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#FFF8F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        borderWidth: 1,
        borderColor: '#FFE8DC',
    },
    stepTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    stepSubtitle: {
        fontSize: 13,
        color: '#888',
    },
    // Features Grid
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    featureItem: {
        flex: 1,
        minWidth: (width - 60) / 2 - 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
    },
    featureText: {
        fontSize: 12,
        color: '#444',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 16,
    },
    // Input Card with Shadow
    inputCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
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
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    inputHelperText: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
    },
    textInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1A1A1A',
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
    },
    phoneInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        overflow: 'hidden',
    },
    countryCode: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: '#F0F0F0',
        borderRightWidth: 1.5,
        borderRightColor: '#E8E8E8',
    },
    countryCodeText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    phoneInput: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1A1A1A',
        backgroundColor: 'transparent',
    },
    // Terms & Conditions
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#E8E8E8',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    checkboxActive: {
        backgroundColor: '#FF8C00',
        borderColor: '#FF8C00',
    },
    termsText: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    termsLink: {
        color: '#FF8C00',
        fontWeight: '600',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    otpInput: {
        flex: 1,
        height: 54,
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
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
    resendButton: {
        alignSelf: 'center',
        marginTop: 12,
    },
    resendText: {
        fontSize: 14,
        color: '#FF8C00',
        fontWeight: '600',
    },
    primaryButton: {
        backgroundColor: '#FF8C00',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
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
    buttonDisabled: {
        opacity: 0.7,
    },
    verifiedContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    verifiedText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4CAF50',
        marginTop: 8,
    },
    verifiedSubtext: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    rowContainer: {
        flexDirection: 'row',
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    genderOption: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        backgroundColor: '#F8F9FA',
    },
    genderOptionActive: {
        borderColor: '#FF8C00',
        backgroundColor: '#FFF8F3',
    },
    genderText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        fontWeight: '500',
    },
    genderTextActive: {
        color: '#FF8C00',
    },
    cityContainer: {
        flex: 1,
    },
    cityInput: {
        marginBottom: 8,
    },
    citySuggestions: {
        flexDirection: 'row',
        maxHeight: 40,
    },
    cityChip: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    cityChipText: {
        fontSize: 13,
        color: '#666',
    },
    locationInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
    },
    locationInput: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A1A',
        padding: 0,
        marginLeft: 10,
    },
    mapPlaceholder: {
        height: 180,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 12,
    },
    mapPlaceholderText: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
    },
    mapPlaceholderSubtext: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    locationPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 12,
    },
    locationPreviewText: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '500',
        marginLeft: 8,
    },
    // Documents Styles
    documentsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    documentCard: {
        flex: 1,
        minWidth: (width - 60) / 2 - 10,
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        padding: 14,
        borderWidth: 2,
        borderColor: '#E8E8E8',
        alignItems: 'center',
    },
    documentCardActive: {
        borderColor: '#FF8C00',
        backgroundColor: '#FFF8F3',
    },
    documentCardUploaded: {
        borderColor: '#4CAF50',
        backgroundColor: '#F1F8F4',
    },
    documentCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 6,
    },
    documentIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    uploadedBadge: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 2,
    },
    documentCardTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    documentCardTitleActive: {
        color: '#FF8C00',
    },
    documentCardDescription: {
        fontSize: 10,
        color: '#999',
        textAlign: 'center',
        marginBottom: 8,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF8C00',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    uploadButtonText: {
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    documentHelperText: {
        fontSize: 12,
        color: '#999',
        marginTop: 10,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    // PIN Styles
    pinInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F3',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: '#FFE8DC',
    },
    pinInfoText: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    pinContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    pinInput: {
        flex: 1,
        height: 54,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    pinInputFilled: {
        borderColor: '#FF8C00',
        backgroundColor: '#FFF8F3',
    },
    pinTips: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 14,
        marginTop: 8,
        marginBottom: 8,
    },
    pinTipsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    pinTipsText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },

    locationLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    mapContainer: {
        height: 220,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        marginVertical: 12,
        backgroundColor: '#F8F9FA',
    },

    map: {
        width: '100%',
        height: '100%',
    },

    mapLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    useCurrentLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#FFF8F3',
        borderWidth: 1,
        borderColor: '#FFE0CC',
        gap: 6,
    },

    useCurrentLocationText: {
        color: '#FF8C00',
        fontSize: 13,
        fontWeight: '600',
    },
    inputLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    inputRequired: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E17055',
        marginLeft: 4,
        bottom: 2
    },
    uploadButtonUploaded: {
        backgroundColor: '#4CAF50',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 34,
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E0E0E0',
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalOptions: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    modalOption: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    modalOptionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    modalOptionDesc: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    modalCancelButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8E8E8',
        backgroundColor: '#F8F9FA',
    },
    modalCancelText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#666',
    },
    // Progress Styles
    progressContainer: {
        marginBottom: 16,
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
    progressText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
    },
    // Reference Input Styles
    referenceInputContainer: {
        width: '100%',
        marginTop: 8,
        marginBottom: 8,
    },
    referenceInputLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
        marginBottom: 4,
    },
    referenceInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 13,
        color: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#E8E8E8',
        width: '100%',
    },
    uploadedRefText: {
        fontSize: 10,
        color: '#4CAF50',
        fontWeight: '500',
        marginTop: 4,
    },
    referenceInputContainer: {
        width: '100%',
        marginTop: 8,
        marginBottom: 8,
    },
    referenceInputLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
        marginBottom: 4,
    },
    referenceInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 13,
        color: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#E8E8E8',
        width: '100%',
    },
    uploadedRefText: {
        fontSize: 10,
        color: '#4CAF50',
        fontWeight: '500',
        marginTop: 4,
    },
    locationSuggestionsContainer: {
        marginTop: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        zIndex: 1000,
    },

    locationSuggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },

    locationSuggestionIcon: {
        width: 20,
        height: 20,
        tintColor: '#FF8C00',
        marginRight: 10,
    },

    locationSuggestionTextContainer: {
        flex: 1,
    },

    locationSuggestionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 2,
    },

    locationSuggestionAddress: {
        fontSize: 11,
        color: '#777',
        lineHeight: 15,
    },

    dobInput: {
        height: 50,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
    },

    dobText: {
        flex: 1,
        fontSize: 14,
        color: '#222',
    },

    dobPlaceholder: {
        color: '#999',
    },

    calendarIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
});

export default SignupScreen;