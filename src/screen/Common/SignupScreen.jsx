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
} from 'react-native';


const { width, height } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
    // Step management
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const totalSteps = 5;

    // Step 1: Phone & OTP
    const [phoneNumber, setPhoneNumber] = useState('');
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
    const [city, setCity] = useState('');
    const [cities, setCities] = useState(['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Kolkata', 'Surat', 'Jaipur']);

    // Step 3: Location
    const [location, setLocation] = useState('');

    // Step 4: Documents Upload
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState({});

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

    const genderOptions = [
        {
            id: 'male',
            label: 'Male',
            image: require('../../asset/male.png'),
        },
        {
            id: 'female',
            label: 'Female',
            image: require('../../asset/female.png'),
        },
        {
            id: 'other',
            label: 'Other',
            image: require('../../asset/transgender.png'),
        },
    ];

    const documentOptions = [
        {
            id: 'aadhar',
            label: 'Aadhar Card',
            image: require('../../asset/aadhaar.png'),
            description: 'Government ID proof',
        },
        {
            id: 'passport',
            label: 'Passport',
            image: require('../../asset/passport.png'),
            description: 'International travel document',
        },
        {
            id: 'pan',
            label: 'PAN Card',
            image: require('../../asset/pan.png'),
            description: 'Tax identification number',
        },
        {
            id: 'certificate',
            label: 'Course Certificate',
            image: require('../../asset/certificate.png'),
            description: 'Professional certification',
        },
        {
            id: 'driving',
            label: 'Driving License',
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
        {
            image: require('../../asset/shield.png'),
            label: 'PIN',
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

    const handleCompletePersonalDetails = () => {
        if (!firstName.trim() || !lastName.trim() || !gender || !city.trim() || !dob) {
            Alert.alert('Missing Fields', 'Please fill all required fields');
            return;
        }
        markStepComplete(1);
        goToNextStep();
    };

    const handleCompleteLocation = () => {
        if (!location.trim()) {
            Alert.alert('Missing Location', 'Please enter your location');
            return;
        }
        markStepComplete(2);
        goToNextStep();
    };

    const handleCompleteDocuments = () => {
        if (selectedDocuments.length === 0) {
            Alert.alert('No Documents', 'Please select and upload at least one document');
            return;
        }
        markStepComplete(3);
        goToNextStep();
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

    const toggleDocument = (docId) => {
        if (selectedDocuments.includes(docId)) {
            setSelectedDocuments(selectedDocuments.filter(id => id !== docId));
            const newUploads = { ...uploadedFiles };
            delete newUploads[docId];
            setUploadedFiles(newUploads);
        } else {
            setSelectedDocuments([...selectedDocuments, docId]);
        }
    };

    const simulateUpload = (docId) => {
        setUploadedFiles({
            ...uploadedFiles,
            [docId]: { name: `${docId}_document.pdf`, size: '2.4 MB', uploaded: true }
        });
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
                                <Text style={[
                                    styles.stepIndicatorLabel,
                                    isActive && styles.stepIndicatorLabelActive,
                                    isCompleted && styles.stepIndicatorLabelCompleted,
                                ]}>
                                    {step.label}
                                </Text>
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
                    <Text style={styles.inputLabel}>First Name</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="First name"
                        placeholderTextColor="#999"
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                </View>
                <View style={[styles.inputCard, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Last Name</Text>
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
                <Text style={styles.inputLabel}>Gender</Text>
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
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#999"
                    value={dob}
                    onChangeText={setDob}
                    keyboardType="default"
                    maxLength={10}
                />
            </View>

            <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>City</Text>
                <View style={styles.cityContainer}>
                    <TextInput
                        style={[styles.textInput, styles.cityInput]}
                        placeholder="Type your city"
                        placeholderTextColor="#999"
                        value={city}
                        onChangeText={setCity}
                    />
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.citySuggestions}
                    >
                        {cities.map((c) => (
                            <TouchableOpacity
                                key={c}
                                style={styles.cityChip}
                                onPress={() => setCity(c)}
                            >
                                <Text style={styles.cityChipText}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
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
            <View style={styles.stepHeader}>
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
            </View>

            <View style={styles.mapPlaceholder}>

                <Image
                    source={require('../../asset/map-outline.png')}
                    style={{
                        width: 64,
                        height: 64,


                    }}
                />
                <Text style={styles.mapPlaceholderText}>Map will appear here</Text>
                <Text style={styles.mapPlaceholderSubtext}>Pin will be set automatically</Text>
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
                    <Text style={styles.locationPreviewText}>Location set: {location}</Text>
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
                                onPress={() => toggleDocument(doc.id)}
                            >
                                <View style={styles.documentCardHeader}>
                                    <View style={styles.documentIconContainer}>
                                       

                                        <Image
                                            source={doc.image}
                                            style={{
                                                width: 24,
                                                height: 24,
                                                tintColor: isSelected === doc.id ? '#FF8C00' : '#666',
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
                                    <TouchableOpacity
                                        style={styles.uploadButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            simulateUpload(doc.id);
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
                                            {isUploaded ? 'Uploaded ✓' : 'Upload File'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <Text style={styles.documentHelperText}>
                    {selectedDocuments.length > 0
                        ? `${selectedDocuments.length} document(s) selected. Tap "Upload File" to upload each document.`
                        : 'Select a document to upload'}
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.primaryButton, selectedDocuments.length === 0 && styles.buttonDisabled]}
                onPress={handleCompleteDocuments}
                disabled={selectedDocuments.length === 0}
            >
                <Text style={styles.primaryButtonText}>Continue →</Text>
            </TouchableOpacity>
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
});

export default SignupScreen;