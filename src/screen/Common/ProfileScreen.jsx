import Geolocation from '@react-native-community/geolocation';
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
    TextInput,
    Alert,
    Modal,
    FlatList,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Platform,
    PermissionsAndroid
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../util/API';

import {
    launchCamera,
    launchImageLibrary,
} from 'react-native-image-picker';
import axios from 'axios';
import Loader from '../../util/Loader';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
    // Profile state
    const [profileImage, setProfileImage] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [location, setLocation] = useState('');
    const [area, setArea] = useState('');
    const [pincode, setPincode] = useState('');
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [experience, setExperience] = useState('');
    const [experienceYears, setExperienceYears] = useState('');
    const [showExperienceModal, setShowExperienceModal] = useState(false);
    const [skills, setSkills] = useState([]);
    const [skillList, setSkillList] = useState([]);
    const [showSkillBottomSheet, setShowSkillBottomSheet] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [isEditingSkills, setIsEditingSkills] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const [showAddSkill, setShowAddSkill] = useState(false);
    const [isEditingSkillIndex, setIsEditingSkillIndex] = useState(null);
    const [editingSkillValue, setEditingSkillValue] = useState('');
    const [rating, setRating] = useState(4.8);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    const [showRefNumberModal, setShowRefNumberModal] = useState(false);
    const [tempDocId, setTempDocId] = useState(null);
    const [tempRefNumber, setTempRefNumber] = useState('');
    const [showDocumentOptions, setShowDocumentOptions] = useState(false);

    const [showLocationModal, setShowLocationModal] = useState(false);
    const [searchLocationText, setSearchLocationText] = useState('');
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [tempLocation, setTempLocation] = useState('');
    const [tempLatitude, setTempLatitude] = useState(null);
    const [tempLongitude, setTempLongitude] = useState(null);
    const [tempArea, setTempArea] = useState('');
    const [tempPincode, setTempPincode] = useState('');
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [mapRegion, setMapRegion] = useState(null);
    const locationSearchTimeout = useRef(null);
    const isReverseGeocoding = useRef(false);
    const [showImagePickerModal, setShowImagePickerModal] = useState(false);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [completionPercentage, setCompletionPercentage] = useState(0);

    const [profileCompleteness, setProfileCompleteness] = useState(0);
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [isDocumentUploading, setIsDocumentUploading] = useState(false);
    const [documentUploadProgress, setDocumentUploadProgress] = useState(0);
    const [uploadingDocId, setUploadingDocId] = useState(null);
    const GOOGLE_MAPS_API_KEY =
        'AIzaSyBuxUn1s4S2yv8fqwd0wGUTFegxNyASL1g'

    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [profileUploadProgress, setProfileUploadProgress] = useState(0);
    const [isEditingReferenceNumber, setIsEditingReferenceNumber] =
        useState(false);

    const [showUploadOptionsModal, setShowUploadOptionsModal] = useState(false);
    const [uploadDocId, setUploadDocId] = useState(null);

    const [isUpdatingExperience, setIsUpdatingExperience] =
        useState(false);

    const [experienceUploadProgress, setExperienceUploadProgress] =
        useState(0);


    const [isUpdatingLocation, setIsUpdatingLocation] =
        useState(false);

    const [locationUploadProgress, setLocationUploadProgress] =
        useState(0);


    const [isUpdatingDocument, setIsUpdatingDocument] = useState(false);

    const [availableServices, setAvailableServices] = useState([]);
    const [isSavingSkills, setIsSavingSkills] = useState(false);
    const [selectedServices, setSelectedServices] = useState([]);

    const [serviceSearch, setServiceSearch] = useState('');

    // 5 Documents
    const [uploadedDocuments, setUploadedDocuments] = useState([
        {
            id: 1,
            name: 'Aadhar Card',
            image: require('../../asset/aadhaar.png'),
            verified: true,
            uploaded: true,
            documentNumber: '1234 5678 9012',
            refNumber: '123456789012', // Added refNumber
            uploadDate: '15 Jan 2027',
            documentImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=150&fit=crop',
        },
        {
            id: 2,
            name: 'Passport',
            image: require('../../asset/passport.png'),
            verified: false,
            uploaded: false,
            documentNumber: '',
            refNumber: '',
            uploadDate: '',
            documentImage: null,
        },
        {
            id: 3,
            name: 'PAN Card',
            image: require('../../asset/pan.png'),
            verified: true,
            uploaded: true,
            documentNumber: 'ABCDE1234F',
            refNumber: 'ABCDE1234F',
            uploadDate: '10 Jan 2027',
            documentImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=150&fit=crop',
        },
        {
            id: 4,
            name: 'Bank Passbook',
            image: require('../../asset/book.png'),
            verified: false,
            uploaded: false,
            documentNumber: '',
            refNumber: '',
            uploadDate: '',
            documentImage: null,
        },
        {
            id: 5,
            name: 'Driving License',
            image: require('../../asset/driving-license.png'),
            verified: false,
            uploaded: false,
            documentNumber: '',
            refNumber: '',
            uploadDate: '',
            documentImage: null,
        },
    ]);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(1)).current;
    const headerTranslateY = useRef(new Animated.Value(0)).current;
    const modalSlideAnim = useRef(new Animated.Value(height)).current;

    const ORANGE_COLOR = '#FF8C00';

    // Calculate profile completion


    const starImages = {
        full: require('../../asset/star-fill.png'),
        half: require('../../asset/star-half.png'),
        empty: require('../../asset/star-outline.png'),
    };

    //const completionPercentage = calculateCompletion();

    const bottomSheetAnim = useRef(new Animated.Value(height)).current;

    const animateBottomSheetIn = () => {
        bottomSheetAnim.setValue(height);
        Animated.spring(bottomSheetAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const animateBottomSheetOut = (callback) => {
        Animated.timing(bottomSheetAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            if (callback) callback();
        });
    };


    const availableSkillsList = [
        'Plumbing',
        'Electrical',
        'Cleaning',
        'Carpentry',
        'Painting',
        'AC Repair',
        'Appliance Repair',
        'CCTV Installation',
        'Home Automation',
        'Smart Home Setup',
        'Security System',
        'Water Purifier',
        'RO Service',
        'Solar Installation',
        'Smart Lighting',
        'Home Theater',
        'Network Setup',
        'Computer Repair',
        'Mobile Repair',
        'Furniture Assembly',
    ];

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
        ]).start();

        Animated.timing(progressAnim, {
            toValue: completionPercentage,
            duration: 1000,
            useNativeDriver: false,
        }).start();

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

    useEffect(() => {
        fetchPartnerSkills();
        fetchServiceCategories();
        fetchProfile();
    }, []);

    const animateModalIn = () => {
        modalSlideAnim.setValue(height);
        Animated.spring(modalSlideAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const animateModalOut = (callback) => {
        Animated.timing(modalSlideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            if (callback) callback();
        });
    };
    const requestCameraPermission = async () => {
        if (Platform.OS !== 'android') {
            return true;
        }

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Camera Permission',
                    message: 'Camera permission is required to capture your document.',
                    buttonPositive: 'Allow',
                    buttonNegative: 'Cancel',
                }
            );

            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (error) {
            console.log('Camera permission error:', error);
            return false;
        }
    };


    const openDocumentCamera = async (docId) => {
        try {
            const hasPermission =
                await requestCameraPermission();

            if (!hasPermission) {
                Alert.alert(
                    'Camera Permission Required',
                    'Please allow camera permission from your phone settings.'
                );
                return;
            }

            const result = await launchCamera({
                mediaType: 'photo',
                cameraType: 'back',
                quality: 0.8,
                maxWidth: 2000,
                maxHeight: 2000,
                saveToPhotos: false,
            });

            console.log(
                'Camera result:',
                result
            );

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

            const file =
                result.assets?.[0];

            if (!file?.uri) {
                Alert.alert(
                    'Error',
                    'Unable to capture document.'
                );
                return;
            }

            // Upload immediately
            await uploadDocumentToAPI(
                docId,
                file,
                tempRefNumber
            );

        } catch (error) {
            console.log(
                'Document camera error:',
                error
            );

            Alert.alert(
                'Camera Error',
                'Unable to capture document.'
            );
        }
    };

    const openDocumentGallery = async (docId) => {
        try {

            const result =
                await launchImageLibrary({
                    mediaType: 'photo',
                    selectionLimit: 1,
                    quality: 0.8,
                    maxWidth: 2000,
                    maxHeight: 2000,
                });

            console.log(
                'Gallery result:',
                result
            );

            if (result.didCancel) {
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

            const file =
                result.assets?.[0];

            if (!file?.uri) {
                Alert.alert(
                    'Error',
                    'Unable to select document.'
                );
                return;
            }

            // Upload immediately
            await uploadDocumentToAPI(
                docId,
                file,
                tempRefNumber
            );

        } catch (error) {

            console.log(
                'Document gallery error:',
                error
            );

            Alert.alert(
                'Gallery Error',
                'Unable to select document.'
            );
        }
    };


    const openSelfieCamera = async () => {
        try {
            const hasPermission =
                await requestCameraPermission();

            if (!hasPermission) {
                Alert.alert(
                    'Camera Permission Required',
                    'Please allow camera permission.'
                );
                return;
            }

            const result = await launchCamera({
                mediaType: 'photo',
                cameraType: 'front',
                quality: 0.8,
                maxWidth: 1000,
                maxHeight: 1000,
                saveToPhotos: false,
            });

            if (result.didCancel) {
                return;
            }

            if (result.errorCode) {
                Alert.alert(
                    'Camera Error',
                    result.errorMessage ||
                    'Unable to capture photo.'
                );
                return;
            }

            const file = result.assets?.[0];

            if (!file?.uri) {
                Alert.alert(
                    'Error',
                    'Unable to capture profile photo.'
                );
                return;
            }

            // Show image immediately
            // setProfileImage(file.uri);

            // Upload profile photo
            await updatePartnerProfile(file);

        } catch (error) {

            console.log(
                'Selfie camera error:',
                error
            );

            Alert.alert(
                'Camera Error',
                'Unable to capture profile photo.'
            );
        }
    };


    const openProfileGallery = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 1,
                quality: 0.8,
                maxWidth: 1000,
                maxHeight: 1000,
            });

            if (result.didCancel) {
                return;
            }

            if (result.errorCode) {
                Alert.alert(
                    'Gallery Error',
                    result.errorMessage ||
                    'Unable to select image.'
                );
                return;
            }

            const file = result.assets?.[0];

            if (!file?.uri) {
                Alert.alert(
                    'Error',
                    'Unable to select profile photo.'
                );
                return;
            }

            // Show image immediately


            // Upload to API
            await updatePartnerProfile(file);

        } catch (error) {

            console.log(
                'Profile gallery error:',
                error
            );

            Alert.alert(
                'Gallery Error',
                'Unable to select image.'
            );
        }
    };

    const searchLocationPlaces = (text) => {
        setSearchLocationText(text);

        if (locationSearchTimeout.current) {
            clearTimeout(locationSearchTimeout.current);
        }

        if (!text.trim() || text.trim().length < 3) {
            setLocationSuggestions([]);
            setShowLocationSuggestions(false);
            return;
        }

        locationSearchTimeout.current = setTimeout(() => {
            searchGooglePlaces(text.trim());
        }, 700);
    };


    const updateExperience = async (experienceYears) => {
        try {
            setIsUpdatingExperience(true);
            setExperienceUploadProgress(0);

            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert(
                    'Session Expired',
                    'Please login again.'
                );
                return;
            }

            const formData = new FormData();

            // Experience
            formData.append(
                'ExperienceYears',
                String(experienceYears)
            );

            // Other existing profile values
            formData.append(
                'Latitude',
                tempLatitude
            );

            formData.append(
                'Longitude',
                tempLongitude
            );

            formData.append(
                'PreferredArea',
                area || ''
            );

            formData.append(
                'PreferredAreaAddress',
                location || ''
            );

            formData.append(
                'PreferredAreaPINcode',
                pincode || ''
            );

            // -----------------------------------------
            // Existing Profile Image as File
            // -----------------------------------------

            if (profileImage) {

                const profilePhotoUrl =
                    profileImage;

                const fileName =
                    profileImage.split('/').pop() ||
                    `profile_${Date.now()}.jpg`;

                const extension =
                    fileName.split('.').pop()?.toLowerCase();

                let mimeType = 'image/jpeg';

                if (extension === 'png') {
                    mimeType = 'image/png';
                } else if (
                    extension === 'jpg' ||
                    extension === 'jpeg'
                ) {
                    mimeType = 'image/jpeg';
                }

                formData.append('ProfilePhoto', {
                    uri: profilePhotoUrl,
                    name: fileName,
                    type: mimeType,
                });
            }

            const response = await axios.put(
                API.PARTNER_PROFILE,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                        Accept: '*/*',
                    },

                    onUploadProgress: progressEvent => {
                        if (progressEvent.total) {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) /
                                progressEvent.total
                            );

                            setExperienceUploadProgress(progress);
                        }
                    },
                }
            );

            console.log(
                'Update Experience Response:',
                response.data
            );

            if (response.data?.success === true) {

                setProfileUploadProgress(100);

                // await fetchProfile();

                setExperienceYears(experienceYears);
                setExperience(experienceYears === '10+' ? '10+ years' : `${experienceYears} years`);
                setShowExperienceModal(false);

                Alert.alert(
                    'Success',
                    'Experience updated successfully.'
                );
            } else {

                Alert.alert(
                    'Failed',
                    response.data?.message ||
                    'Unable to update experience.'
                );
            }

        } catch (error) {

            console.log(
                'Update Experience Error:',
                error?.response?.data || error
            );

            Alert.alert(
                'Error',
                error?.response?.data?.message ||
                'Unable to update experience.'
            );

        } finally {

            setIsUpdatingExperience(false);

            setTimeout(() => {
                setExperienceUploadProgress(0);
            }, 500);
        }
    };


    const updateLocation = async (address, latitude, longitude, area, pincode) => {
        try {

            setIsUpdatingLocation(true);
            setLocationUploadProgress(0);

            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert(
                    'Session Expired',
                    'Please login again.'
                );
                return;
            }

            const formData = new FormData();

            // Experience
            formData.append(
                'ExperienceYears',
                String(experienceYears)
            );

            // Other existing profile values
            formData.append(
                'Latitude',
                latitude
            );

            formData.append(
                'Longitude',
                longitude
            );

            formData.append(
                'PreferredArea',
                area || ''
            );

            formData.append(
                'PreferredAreaAddress',
                address || ''
            );

            formData.append(
                'PreferredAreaPINcode',
                pincode || ''
            );

            // -----------------------------------------
            // Existing Profile Image as File
            // -----------------------------------------

            if (profileImage) {

                const profilePhotoUrl =
                    profileImage;

                const fileName =
                    profileImage.split('/').pop() ||
                    `profile_${Date.now()}.jpg`;

                const extension =
                    fileName.split('.').pop()?.toLowerCase();

                let mimeType = 'image/jpeg';

                if (extension === 'png') {
                    mimeType = 'image/png';
                } else if (
                    extension === 'jpg' ||
                    extension === 'jpeg'
                ) {
                    mimeType = 'image/jpeg';
                }

                formData.append('ProfilePhoto', {
                    uri: profilePhotoUrl,
                    name: fileName,
                    type: mimeType,
                });
            }

            const response = await axios.put(
                API.PARTNER_PROFILE,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                        Accept: '*/*',
                    },

                    onUploadProgress: progressEvent => {
                        if (progressEvent.total) {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) /
                                progressEvent.total
                            );

                            setLocationUploadProgress(progress);
                        }
                    },
                }
            );

            console.log(
                'Update Location Response:',
                response.data
            );

            if (response.data?.success === true) {

                setLocationUploadProgress(100);

                setLocation(address);
                setArea(area);
                setPincode(pincode);
                setShowLocationModal(false);

                // await fetchProfile();



                Alert.alert(
                    'Success',
                    'Location updated successfully.'
                );
            } else {

                Alert.alert(
                    'Failed',
                    response.data?.message ||
                    'Unable to update location.'
                );
            }

        } catch (error) {

            console.log(
                'Update Location Error:',
                error?.response?.data || error
            );

            Alert.alert(
                'Error',
                error?.response?.data?.message ||
                'Unable to update location.'
            );

        } finally {

            setIsUpdatingLocation(false);

            setTimeout(() => {
                setLocationUploadProgress(0);
            }, 500);
        }
    };


    const updatePartnerProfile = async (profilePhotoFile = null) => {
        try {
            setIsUpdatingProfile(true);
            setProfileUploadProgress(0);

            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert(
                    'Session Expired',
                    'Please login again.'
                );
                return false;
            }

            const formData = new FormData();

            // Profile Photo
            if (profilePhotoFile?.uri) {
                formData.append('ProfilePhoto', {
                    uri: profilePhotoFile.uri,
                    name:
                        profilePhotoFile.fileName ||
                        profilePhotoFile.name ||
                        `profile_${Date.now()}.jpg`,
                    type:
                        profilePhotoFile.type ||
                        'image/jpeg',
                });
            }

            // Other profile data
            formData.append(
                'Latitude',
                tempLatitude
            );

            formData.append(
                'Longitude',
                tempLongitude
            );

            formData.append(
                'ExperienceYears',
                String(experienceYears || 0)
            );

            formData.append(
                'PreferredArea',
                area || ''
            );

            formData.append(
                'PreferredAreaAddress',
                location || ''
            );

            formData.append(
                'PreferredAreaPINcode',
                pincode || ''
            );

            console.log(
                'Updating Partner Profile:',
                {
                    Latitude: tempLatitude,
                    Longitude: tempLongitude,
                    ExperienceYears: experienceYears,
                    PreferredArea: area,
                    PreferredAreaAddress: location,
                    PreferredAreaPINcode: pincode,
                    HasProfilePhoto: !!profilePhotoFile?.uri,
                }
            );

            const response = await axios.put(
                API.PARTNER_PROFILE,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                        Accept: '*/*',
                    },

                    // Upload Progress
                    onUploadProgress: progressEvent => {
                        if (progressEvent.total) {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) /
                                progressEvent.total
                            );

                            console.log(
                                'Profile Upload Progress:',
                                progress
                            );

                            setProfileUploadProgress(progress);
                        }
                    },
                }
            );

            console.log(
                'Update Profile Response:',
                response.data
            );

            if (response.data?.success === true) {

                setProfileUploadProgress(100);
                setProfileImage(profilePhotoFile.uri);

                //await fetchProfile();

                Alert.alert(
                    'Success',
                    response.data?.message ||
                    'Profile updated successfully.'
                );

                return true;
            }

            Alert.alert(
                'Update Failed',
                response.data?.message ||
                'Unable to update profile.'
            );

            return false;

        } catch (error) {

            console.log(
                'Update Profile Error:',
                error?.response?.data || error.message
            );

            Alert.alert(
                'Update Failed',
                error?.response?.data?.message ||
                'Something went wrong while updating profile.'
            );

            return false;

        } finally {

            setIsUpdatingProfile(false);

            setTimeout(() => {
                setProfileUploadProgress(0);
            }, 500);
        }
    };


    const toggleServiceSelection = (serviceId) => {
        if (selectedServices.includes(serviceId)) {
            setSelectedServices(
                selectedServices.filter(id => id !== serviceId)
            );
        } else {
            setSelectedServices([
                ...selectedServices,
                serviceId
            ]);
        }
    };

    const handleSaveSkills = async () => {
        try {
            setIsSavingSkills(true);

            const selectedServicesArray = availableServices
                .filter(service =>
                    selectedSkills.some(
                        skill =>
                            skill?.trim().toLowerCase() ===
                            service.name?.trim().toLowerCase()
                    )
                )
                .map(service => ({
                    id: service.id,
                    name: service.name,
                }));

            console.log('Selected Services:', selectedServicesArray);


            if (selectedServicesArray.length === 0) {
                Alert.alert(
                    'Select Service',
                    'Please choose at least one service.'
                );
                setIsSavingSkills(false);
                return;
            }

            // Convert IDs to comma-separated string
            const serviceCategoryIds = selectedServicesArray.map(
                service => String(service.id)
            );

            console.log(
                'serviceCategoryIds:',
                serviceCategoryIds
            );

            const authToken = await AsyncStorage.getItem('token');

            const response = await axios.put(
                API.SERVICE_CATEGORY_MAPPING,
                {
                    serviceCategoryIds: serviceCategoryIds,
                },
                {
                    headers: {
                        Accept: 'text/plain',
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Save Skills Response:', "hello");
            await fetchPartnerSkills();

            setShowSkillBottomSheet(false);
            setIsEditingSkills(false);

            Alert.alert(
                'Success',
                'Skills updated successfully.'
            );


        } catch (error) {
            console.log(
                'Save Skills Error:',
                error?.response?.data || error.message
            );

            Alert.alert(
                'Error',
                'Failed to update skills.'
            );
        } finally {
            setIsSavingSkills(false);
        }
    };


    const fetchPartnerSkills = async () => {
        try {
            setIsProfileLoading(true);

            const authToken = await AsyncStorage.getItem('token');

            if (!authToken) {
                console.log('Token not found');
                return;
            }

            const response = await axios.get(
                API.SERVICE_CATEGORY_MAPPING,
                {
                    headers: {
                        Accept: 'text/plain',
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            console.log(
                'Partner Skills Response:',
                response.data
            );

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            // Keep complete API objects
            // Example:
            // {
            //   serviceCategoryId: 1,
            //   serviceCategoryName: "Home Cleaning"
            // }
            setSkillList(data);

            // Get skill names for Profile display
            const skillNames = data
                .map(item => item.serviceCategoryName)
                .filter(Boolean);

            // Profile Skills section
            setSkills(skillNames);

            // IMPORTANT:
            // Bottom sheet selection will use NAMES
            setSelectedSkills(skillNames);

            console.log(
                'Existing Skill Names:',
                skillNames
            );

        } catch (error) {
            console.log(
                'Partner Skills API Error:',
                error?.response?.data ||
                error?.message
            );

            setSkillList([]);
            setSkills([]);
            setSelectedSkills([]);

        } finally {
            setIsProfileLoading(false);
        }
    };




    const fetchServiceCategories = async () => {
        try {
            setIsProfileLoading(true);
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                console.log('Authentication token not found');
                setAvailableServices([]);
                return;
            }

            const response = await axios.get(
                API.SERVICE_CATEGORY_DROPDOWN,
                {
                    headers: {
                        Accept: 'text/plain',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                'Service Category Response:',
                response.data
            );

            const categories = Array.isArray(response.data)
                ? response.data
                : [];

            const formattedServices = categories.map((item, index) => ({
                id: item.serviceCategoryId,
                name: item.categoryName,
                icon: require('../../asset/settings.png'),
                category: item.categoryName,
            }));

            setAvailableServices(formattedServices);

        } catch (error) {
            console.log(
                'Service Category API Error:',
                error?.response?.data || error?.message
            );

            setAvailableServices([]);
        } finally {

        }
    };


    const fetchProfile = async () => {
        try {
            setIsProfileLoading(true);

            const token = await AsyncStorage.getItem('token');

            console.log('Profile Token:', token);

            if (!token) {
                Alert.alert(
                    'Session Expired',
                    'Please login again.'
                );
                return;
            }

            const response = await fetch(API.PARTNER_PROFILE, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            const data = await response.json();

            console.log('Profile API Response:', data);

            if (!response.ok || data?.success !== true) {
                Alert.alert(
                    'Error',
                    data?.message || 'Unable to fetch profile.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack(),
                        },
                    ],
                    { cancelable: false }
                );
                return;
            }

            // -----------------------------
            // Personal Information
            // -----------------------------

            setFirstName(data.firstName || '');
            setLastName(data.lastName || '');
            setGender(data.gender || '');
            setDob(formatDob(data.dob));
            const preferredLocation =
                `${data.preferredArea || ''}, ${data.preferredAreaPINcode || ''}`;
            setLocation(data.preferredAreaAddress)
            setArea(data.preferredArea)
            setPincode(data.preferredArea)
            setProfileCompleteness(
                Number(data.profileCompletenessPercentage || 0)
            );

            const percentage = Number(
                data.profileCompletenessPercentage || 0
            );

            setCompletionPercentage(percentage);

            Animated.timing(progressAnim, {
                toValue: percentage,
                duration: 800,
                useNativeDriver: false,
            }).start();

            setMobileNumber(
                data.mobileNo
                    ? `+91 ${data.mobileNo}`
                    : ''
            );

            setEmail(data.email || '');

            // -----------------------------
            // Experience
            // -----------------------------

            const years = Number(data.experienceYears || 0);

            setExperienceYears(
                years > 10 ? '10+' : String(years)
            );

            setExperience(
                years > 10
                    ? '10+ years'
                    : `${years} years`
            );

            // -----------------------------
            // Location
            // -----------------------------

            if (
                data.latitude !== null &&
                data.longitude !== null
            ) {
                setTempLatitude(data.latitude);
                setTempLongitude(data.longitude);

                setMapRegion({
                    latitude: Number(data.latitude),
                    longitude: Number(data.longitude),
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                });

                // Get address from coordinates
                await reverseGeocodeLocation(
                    Number(data.latitude),
                    Number(data.longitude)
                );
            }

            // -----------------------------
            // Profile Photo
            // -----------------------------

            if (data.profilePhoto) {
                setProfileImage(
                    data.profilePhoto.startsWith('http')
                        ? data.profilePhoto
                        : `https://www.geniushomehelp.com/${data.profilePhoto}`
                );
            } else {
                setProfileImage(null);
            }

            // -----------------------------
            // Documents
            // -----------------------------

            if (Array.isArray(data.documents)) {

                const documentMap = {
                    'Aadhaar Card': {
                        id: 1,
                        name: 'Aadhar Card',
                        image: require('../../asset/aadhaar.png'),
                    },
                    'PAN Card': {
                        id: 3,
                        name: 'PAN Card',
                        image: require('../../asset/pan.png'),
                    },
                    'Passport': {
                        id: 2,
                        name: 'Passport',
                        image: require('../../asset/passport.png'),
                    },
                    'Bank Passbook': {
                        id: 4,
                        name: 'Bank Passbook',
                        image: require('../../asset/book.png'),
                    },
                    'Driving License': {
                        id: 5,
                        name: 'Driving License',
                        image: require('../../asset/driving-license.png'),
                    },
                };

                const updatedDocuments =
                    uploadedDocuments.map(localDoc => {

                        const apiDoc =
                            data.documents.find(
                                doc =>
                                    doc.documentType === localDoc.name ||
                                    (
                                        localDoc.name === 'Aadhar Card' &&
                                        doc.documentType === 'Aadhaar Card'
                                    )
                            );

                        if (!apiDoc) {
                            return {
                                ...localDoc,
                                uploaded: false,
                                verified: false,
                                documentNumber: '',
                                refNumber: '',
                                uploadDate: '',
                                documentImage: null,
                            };
                        }

                        return {
                            ...localDoc,
                            uploaded: true,

                            verified:
                                apiDoc.verificationStatus === 'Verified',

                            documentNumber:
                                apiDoc.documentNo || '',

                            refNumber:
                                apiDoc.documentNo || '',

                            uploadDate:
                                apiDoc.documentSubmittedOn
                                    ? new Date(
                                        apiDoc.documentSubmittedOn
                                    ).toLocaleDateString(
                                        'en-US',
                                        {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        }
                                    )
                                    : '',

                            documentImage:
                                apiDoc.filePath
                                    ? `https://www.geniushomehelp.com/${apiDoc.filePath}`
                                    : null,

                            verificationStatus:
                                apiDoc.verificationStatus,

                            documentId:
                                apiDoc.documentId,
                        };
                    });

                setUploadedDocuments(updatedDocuments);
            }

        } catch (error) {
            console.log(
                'Fetch Profile Error:',
                error
            );

            Alert.alert(
                'Error',
                'Something went wrong while loading your profile.'
            );

        } finally {
            setIsProfileLoading(false);
        }
    };


    const uploadDocumentToAPI = async (docId, file, refNumber) => {
        try {
            // --------------------------------
            // Find selected document
            // --------------------------------
            const doc = uploadedDocuments.find(
                item => item.id === docId
            );

            if (!doc) {
                Alert.alert(
                    'Error',
                    'Document not found.'
                );
                return false;
            }

            // --------------------------------
            // Reference number
            // --------------------------------
            const referenceNumber =
                refNumber?.trim().toUpperCase() || '';

            // --------------------------------
            // Validate reference number
            // --------------------------------


            // --------------------------------
            // Validate file
            // --------------------------------
            if (!file?.uri) {
                Alert.alert(
                    'Document Required',
                    'Please select or capture a document.'
                );
                return false;
            }

            // --------------------------------
            // Get token
            // --------------------------------
            const token =
                await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert(
                    'Session Expired',
                    'Please login again.'
                );
                return false;
            }

            // --------------------------------
            // Start upload
            // --------------------------------
            setIsDocumentUploading(true);
            setUploadingDocId(docId);
            setDocumentUploadProgress(0);

            // --------------------------------
            // Document Type
            // --------------------------------
            const documentTypeMap = {
                'Aadhar Card': 'Aadhaar Card',
                'Aadhaar Card': 'Aadhaar Card',
                'PAN Card': 'PAN Card',
                'Passport': 'Passport',
                'Bank Passbook': 'Bank Passbook',
                'Driving License': 'Driving License',
            };

            const documentType =
                documentTypeMap[doc.name] || doc.name;

            // --------------------------------
            // Create FormData
            // --------------------------------
            const formData = new FormData();

            formData.append(
                'DocumentType',
                documentType
            );

            formData.append(
                'DocumentNo',
                referenceNumber
            );

            formData.append('File', {
                uri: file.uri,

                name:
                    file.fileName ||
                    file.name ||
                    `document_${docId}_${Date.now()}.jpg`,

                type:
                    file.type ||
                    'image/jpeg',
            });

            console.log(
                'Document Upload Request:',
                {
                    DocumentType: documentType,
                    DocumentNo: referenceNumber,
                    File: {
                        uri: file.uri,
                        name:
                            file.fileName ||
                            file.name ||
                            `document_${docId}_${Date.now()}.jpg`,
                        type:
                            file.type ||
                            'image/jpeg',
                    },
                }
            );

            // --------------------------------
            // Upload API
            // --------------------------------
            const response = await axios.post(
                API.UPLOAD_PARTNER_DOCUMENT,
                formData,
                {
                    headers: {
                        'Content-Type':
                            'multipart/form-data',

                        Authorization:
                            `Bearer ${token}`,

                        Accept:
                            'application/json',
                    },

                    onUploadProgress: progressEvent => {
                        if (
                            progressEvent.total
                        ) {
                            const progress =
                                Math.round(
                                    (
                                        progressEvent.loaded *
                                        100
                                    ) /
                                    progressEvent.total
                                );

                            console.log(
                                `Document upload ${progress}%`
                            );

                            setDocumentUploadProgress(
                                progress
                            );
                        }
                    },
                }
            );

            console.log(
                'Document Upload Response:',
                response.data
            );

            // --------------------------------
            // Upload successful
            // --------------------------------
            if (
                response.data?.success === true
            ) {
                setDocumentUploadProgress(100);

                // Refresh profile/document list
                await fetchProfile();

                // Update local document
                setUploadedDocuments(
                    previousDocuments =>
                        previousDocuments.map(item =>
                            item.id === docId
                                ? {
                                    ...item,
                                    uploaded: true,
                                    documentNumber:
                                        referenceNumber,
                                    refNumber:
                                        referenceNumber,
                                    documentImage:
                                        file.uri,
                                    verified: false,
                                    verificationStatus:
                                        'Pending',
                                    uploadDate:
                                        new Date().toLocaleDateString(
                                            'en-US',
                                            {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            }
                                        ),
                                }
                                : item
                        )
                );

                Alert.alert(
                    'Upload Successful',
                    response.data.message ||
                    `${doc.name} uploaded successfully.`
                );

                return true;
            }

            // --------------------------------
            // API success = false
            // --------------------------------
            Alert.alert(
                'Upload Failed',
                response.data?.message ||
                'Unable to upload document.'
            );

            return false;

        } catch (error) {

            console.log(
                'Document Upload Error:',
                error?.response?.data ||
                error.message
            );

            if (
                error?.response?.status === 401
            ) {
                Alert.alert(
                    'Session Expired',
                    'Please login again.'
                );
            } else {
                Alert.alert(
                    'Upload Failed',
                    error?.response?.data?.message ||
                    error.message ||
                    'Something went wrong while uploading the document.'
                );
            }

            return false;

        } finally {

            setIsDocumentUploading(false);
            setUploadingDocId(null);

            // Don't reset immediately if you want
            // the user to see 100%.
            setTimeout(() => {
                setDocumentUploadProgress(0);
            }, 500);
        }
    };


    const validateDocumentNumber = (documentName, value) => {
        const number = value.trim().toUpperCase();

        if (!number) {
            return 'Please enter reference number.';
        }

        switch (documentName) {

            case 'Aadhar Card':
            case 'Aadhaar Card':
                if (!/^\d{12}$/.test(number)) {
                    return 'Aadhaar number must contain exactly 12 digits.';
                }
                break;

            case 'PAN Card':
                if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(number)) {
                    return 'Please enter a valid PAN number. Example: ABCDE1234F';
                }
                break;

            case 'Passport':
                if (!/^[A-Z][0-9]{7}$/.test(number)) {
                    return 'Please enter a valid Passport number. Example: A1234567';
                }
                break;

            case 'Driving License':
                if (!/^[A-Z0-9-]{10,20}$/.test(number)) {
                    return 'Please enter a valid Driving License number.';
                }
                break;

            case 'Bank Passbook':
                if (!/^\d{9,18}$/.test(number)) {
                    return 'Please enter a valid bank account number.';
                }
                break;

            default:
                break;
        }

        return null;
    };

    const formatDob = (dob) => {
        if (!dob) return '';

        const [year, month, day] = dob.split('-');

        const date = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getGenderImage = (gender) => {
        const value = String(gender || '').toLowerCase();

        if (value === 'female') {
            return require('../../asset/woman.png');
        }

        if (
            value === 'male' ||
            value === 'man'
        ) {
            return require('../../asset/man.png');
        }

        return require('../../asset/genlogo.png');
    };

    const searchGooglePlaces = async (text) => {
        try {
            setIsSearchingLocation(true);

            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
                    text
                )}&components=country:in&key=AIzaSyBuxUn1s4S2yv8fqwd0wGUTFegxNyASL1g`
            );

            const data = await response.json();

            if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
                setLocationSuggestions([]);
                return;
            }

            setLocationSuggestions(data.predictions || []);
            setShowLocationSuggestions(data.predictions?.length > 0);

        } catch (error) {
            console.log('Google Places search error:', error);
        } finally {
            setIsSearchingLocation(false);
        }
    };

    const handleLocationSelect = async (item) => {
        try {
            setIsSearchingLocation(true);
            setShowLocationSuggestions(false);
            setLocationSuggestions([]);

            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json` +
                `?place_id=${item.place_id}` +
                `&fields=formatted_address,geometry,address_components` +
                `&key=AIzaSyBuxUn1s4S2yv8fqwd0wGUTFegxNyASL1g`
            );

            const data = await response.json();

            if (data.status !== 'OK') {
                Alert.alert('Location Error', 'Unable to get location details.');
                return;
            }

            const result = data.result;
            const selectedLatitude = result.geometry?.location?.lat;
            const selectedLongitude = result.geometry?.location?.lng;
            const address = result.formatted_address || item.description || '';

            const components = result.address_components || [];
            const areaComponent = components.find(component =>
                component.types?.includes('sublocality_level_1')
            ) || components.find(component =>
                component.types?.includes('sublocality')
            ) || components.find(component =>
                component.types?.includes('neighborhood')
            ) || components.find(component =>
                component.types?.includes('locality')
            );

            const pincodeComponent = components.find(component =>
                component.types?.includes('postal_code')
            );

            setTempLocation(address);
            setTempArea(areaComponent?.long_name || '');
            setTempPincode(pincodeComponent?.long_name || '');
            setTempLatitude(selectedLatitude);
            setTempLongitude(selectedLongitude);
            setMapRegion({
                latitude: selectedLatitude,
                longitude: selectedLongitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
            setSearchLocationText(address);

        } catch (error) {
            console.log('Place details error:', error);
        } finally {
            setIsSearchingLocation(false);
        }
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

    const fetchCurrentLocationForModal = async () => {
        if (isFetchingLocation) return;

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
                const { latitude, longitude } = position.coords;
                setTempLatitude(latitude);
                setTempLongitude(longitude);
                setMapRegion({
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                });

                await reverseGeocodeLocation(latitude, longitude);

                setIsFetchingLocation(false);
            },
            (error) => {
                setIsFetchingLocation(false);
                Alert.alert('Location Error', 'Unable to get your current location. Please try again.');
            },
            {
                enableHighAccuracy: false,
                timeout: 30000,
                maximumAge: 60000,
                distanceFilter: 10,
            }
        );
    };

    // 3. Reverse Geocode
    const reverseGeocodeLocation = async (
        latitude,
        longitude,
        updateMainLocation = false
    ) => {
        if (isReverseGeocoding.current) return;

        isReverseGeocoding.current = true;

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?` +
                `latlng=${latitude},${longitude}` +
                `&key=${GOOGLE_MAPS_API_KEY}`
            );

            const data = await response.json();

            if (
                data.status === 'OK' &&
                data.results?.length > 0
            ) {
                const result = data.results[0];

                const components =
                    result.address_components || [];

                const address =
                    result.formatted_address || '';

                const areaComponent =
                    components.find(component =>
                        component.types?.includes(
                            'sublocality_level_1'
                        )
                    ) ||
                    components.find(component =>
                        component.types?.includes(
                            'sublocality'
                        )
                    ) ||
                    components.find(component =>
                        component.types?.includes(
                            'neighborhood'
                        )
                    ) ||
                    components.find(component =>
                        component.types?.includes(
                            'locality'
                        )
                    );

                const pincodeComponent =
                    components.find(component =>
                        component.types?.includes(
                            'postal_code'
                        )
                    );

                const selectedArea =
                    areaComponent?.long_name || '';

                const selectedPincode =
                    pincodeComponent?.long_name || '';

                setTempLocation(address);
                setTempArea(selectedArea);
                setTempPincode(selectedPincode);

                setSearchLocationText(address);

                if (updateMainLocation) {
                    setLocation(address);
                    setArea(selectedArea);
                    setPincode(selectedPincode);
                }
            }

        } catch (error) {
            console.log(
                'Reverse geocode error:',
                error
            );
        } finally {
            isReverseGeocoding.current = false;
        }
    };


    const handleOpenSkillBottomSheet = () => {
        // selectedSkills already contains skill names
        setSelectedSkills([...skills]);

        setIsEditingSkills(false);
        setShowSkillBottomSheet(true);

        setTimeout(() => {
            animateBottomSheetIn();
        }, 100);
    };

    const handleEditSkills = () => {
        setSelectedSkills([...skills]);

        setIsEditingSkills(false);
        setShowSkillBottomSheet(true);

        setTimeout(() => {
            animateBottomSheetIn();
        }, 100);
    };

    const toggleSkillSelection = (serviceName) => {
        if (!serviceName) {
            return;
        }

        const normalizedName = serviceName.trim().toLowerCase();

        const selectedService = availableServices.find(
            service =>
                service.name?.trim().toLowerCase() === normalizedName
        );

        if (!selectedService) {
            console.log('Service not found:', serviceName);
            return;
        }

        const alreadySelected = selectedSkills.some(
            skill =>
                skill?.trim().toLowerCase() === normalizedName
        );

        if (alreadySelected) {
            // Remove service
            setSelectedSkills(prev => {
                const updatedSkills = prev.filter(
                    skill =>
                        skill?.trim().toLowerCase() !== normalizedName
                );

                // Print remaining selected services with ID + name
                const selectedServicesArray = availableServices
                    .filter(service =>
                        updatedSkills.some(
                            skill =>
                                skill?.trim().toLowerCase() ===
                                service.name?.trim().toLowerCase()
                        )
                    )
                    .map(service => ({
                        id: service.id,
                        name: service.name,
                    }));

                console.log(
                    'Selected Services:',
                    selectedServicesArray
                );

                return updatedSkills;
            });
        } else {
            // Add service
            setSelectedSkills(prev => {
                const updatedSkills = [
                    ...prev,
                    serviceName.trim(),
                ];

                // Print ALL selected services with ID + name
                const selectedServicesArray = availableServices
                    .filter(service =>
                        updatedSkills.some(
                            skill =>
                                skill?.trim().toLowerCase() ===
                                service.name?.trim().toLowerCase()
                        )
                    )
                    .map(service => ({
                        id: service.id,

                    }));

                console.log(
                    'Selected Services:',
                    selectedServicesArray
                );

                return updatedSkills;
            });
        }
    };

    const selectedSkillObjects = skillList.filter(item =>
        selectedSkills.includes(item.serviceCategoryName)
    );

    const selectedSkillIds = selectedSkillObjects.map(
        item => item.serviceCategoryId
    );



    const handleRemoveSkill = (skillToRemove) => {
        Alert.alert(
            'Remove Skill',
            `Are you sure you want to remove "${skillToRemove}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        const updatedSkills = skills.filter(s => s !== skillToRemove);
                        setSkills(updatedSkills);
                    }
                }
            ]
        );
    };

    // Handle image picker
    const handleImagePicker = () => {
        Alert.alert(
            'Change Profile Picture',
            'Choose an option',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Camera', onPress: () => Alert.alert('Camera', 'Camera functionality will be available soon') },
                { text: 'Gallery', onPress: () => Alert.alert('Gallery', 'Gallery functionality will be available soon') },
            ]
        );
    };

    // Location Edit Handlers
    const handleEditLocation = () => {
        setTempLocation(location);
        setTempLatitude(28.6139); // Default Delhi coordinates
        setTempLongitude(77.2090);
        setTempArea('');
        setTempPincode('');
        setSearchLocationText('');
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
        setShowLocationModal(true);
        setTimeout(() => {
            if (mapRegion) {
                setMapRegion({
                    latitude: tempLatitude || 28.6139,
                    longitude: tempLongitude || 77.2090,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                });
            }
        }, 100);
    };

    const handleSaveLocationFromModal = () => {
        if (!tempLocation.trim()) {
            Alert.alert('Required', 'Please select a location');
            return;
        }

        updateLocation(tempLocation, tempLatitude, tempLongitude, tempArea, tempPincode);

    };

    const handleSaveLocation = () => {
        setIsEditingLocation(false);
        Alert.alert('Success', 'Location updated successfully!');
    };

    // Skill Handlers
    const handleAddSkill = () => {
        if (newSkill.trim()) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
            setShowAddSkill(false);
        }
    };

    const handleEditSkill = (index) => {
        setIsEditingSkillIndex(index);
        setEditingSkillValue(skills[index]);
    };

    const handleSaveSkill = (index) => {
        if (editingSkillValue.trim()) {
            const updatedSkills = [...skills];
            updatedSkills[index] = editingSkillValue.trim();
            setSkills(updatedSkills);
            setIsEditingSkillIndex(null);
            setEditingSkillValue('');
            Alert.alert('Success', 'Skill updated successfully!');
        }
    };



    // Document Handlers
    const handleViewDocument = (doc) => {
        setSelectedDocument(doc);
        setShowDocumentModal(true);
        setTimeout(() => animateModalIn(), 100);
    };

    const closeDocumentModal = () => {
        animateModalOut(() => {
            setShowDocumentModal(false);
            setSelectedDocument(null);
        });
    };

    const handleUploadDocument = (docId) => {
        const doc = uploadedDocuments.find(d => d.id === docId);

        // If document already has ref number, show upload options directly
        if (doc?.refNumber) {
            showUploadOptions(docId);
        } else {
            // Show ref number modal first
            setTempDocId(docId);
            setTempRefNumber('');
            setShowRefNumberModal(true);
        }
    };

    const showUploadOptions = (docId) => {
        setUploadDocId(docId);
        setShowUploadOptionsModal(true);
        // Animate modal in after it becomes visible
        setTimeout(() => {
            animateModalIn();
        }, 100);
    };

    const handleSaveRefNumber = () => {

        const doc = uploadedDocuments.find(
            item => item.id === tempDocId
        );

        if (!doc) {
            return;
        }

        const referenceNumber =
            tempRefNumber.trim().toUpperCase();

        // Validate
        const validationError =
            validateDocumentNumber(
                doc.name,
                referenceNumber
            );

        if (validationError) {
            Alert.alert(
                'Invalid Reference Number',
                validationError
            );
            return;
        }

        // Save reference number
        const updatedDocs =
            uploadedDocuments.map(item =>
                item.id === tempDocId
                    ? {
                        ...item,
                        refNumber:
                            referenceNumber,
                        documentNumber:
                            referenceNumber,
                    }
                    : item
            );

        setUploadedDocuments(updatedDocs);

        setShowRefNumberModal(false);

        // Open Camera / Gallery
        setTimeout(() => {
            showUploadOptions(tempDocId);
        }, 300);
    };

    // const handleEditDocument = (docId) => {
    //     Alert.alert(
    //         'Edit Document',
    //         'Enter document number',
    //         [
    //             { text: 'Cancel', style: 'cancel' },
    //             {
    //                 text: 'Save',
    //                 onPress: () => {
    //                     const updatedDocs = uploadedDocuments.map(doc =>
    //                         doc.id === docId ? { ...doc, documentNumber: 'Updated Number' } : doc
    //                     );
    //                     setUploadedDocuments(updatedDocs);
    //                     Alert.alert('Success', 'Document updated successfully!');
    //                 }
    //             }
    //         ]
    //     );
    // };



    const handleEditDocument = (doc) => {
        // Verified document cannot be edited
        if (
            doc?.verificationStatus?.toLowerCase() ===
            'verified'
        ) {
            Alert.alert(
                'Document Verified',
                'This document has already been verified and cannot be edited.'
            );
            return;
        }

        Alert.alert(
            'Edit Document',
            `What would you like to change for ${doc.name || doc.documentType}?`,
            [
                {
                    text: 'Change Reference Number',
                    onPress: () => {
                        handleChangeReferenceNumber(doc);
                    },
                },
                {
                    text: 'Change Document',
                    onPress: () => {
                        handleChangeDocument(doc);
                    },
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };


    const handleChangeReferenceNumber = (doc) => {
        setSelectedDocument(doc);

        setTempRefNumber(
            doc.documentNo ||
            doc.refNumber ||
            ''
        );

        setIsEditingReferenceNumber(true);

        setShowRefNumberModal(true);
    };


    const handleUpdateReferenceNumber = async () => {
        if (!selectedDocument) {
            return;
        }

        const referenceNumber =
            tempRefNumber.trim().toUpperCase();

        if (!referenceNumber) {
            Alert.alert(
                'Required',
                'Please enter reference number.'
            );
            return;
        }

        const validationError =
            validateDocumentNumber(
                selectedDocument.documentType ||
                selectedDocument.name,
                referenceNumber
            );

        if (validationError) {
            Alert.alert(
                'Invalid Reference Number',
                validationError
            );
            return;
        }

        // setShowRefNumberModal(false);

        /*
         * For reference-number-only update,
         * we still need to send a File because
         * your API multipart contract includes File.
         *
         * Use existing document file if available,
         * otherwise backend API should support optional File.
         */

        handleEditDocumentUpload(
            selectedDocument,
            null,
            referenceNumber
        );
    };


    const handleChangeDocument = (doc) => {
        setSelectedDocument(doc);

        Alert.alert(
            'Change Document',
            'Select document source',
            [
                {
                    text: 'Camera',
                    onPress: () => {
                        setTimeout(() => {
                            openEditDocumentCamera(doc);
                        }, 300);
                    },
                },
                {
                    text: 'File / Gallery',
                    onPress: () => {
                        setTimeout(() => {
                            openEditDocumentGallery(doc);
                        }, 300);
                    },
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };


    const openEditDocumentCamera = async (doc) => {
        try {
            const hasPermission =
                await requestCameraPermission();

            if (!hasPermission) {
                Alert.alert(
                    'Permission Required',
                    'Camera permission is required.'
                );
                return;
            }

            const result = await launchCamera({
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 2000,
                maxHeight: 2000,
                saveToPhotos: false,
            });

            if (result.didCancel) {
                return;
            }

            if (result.errorCode) {
                Alert.alert(
                    'Camera Error',
                    result.errorMessage ||
                    'Unable to capture document.'
                );
                return;
            }

            const file = result.assets?.[0];

            if (!file?.uri) {
                Alert.alert(
                    'Error',
                    'Unable to capture document.'
                );
                return;
            }

            // Update document using existing reference number
            await handleEditDocumentUpload(
                doc,
                file,
                doc.documentNo || doc.refNumber
            );

        } catch (error) {
            console.log(
                'Document camera error:',
                error
            );

            Alert.alert(
                'Camera Error',
                'Unable to capture document.'
            );
        }
    };

    const openEditDocumentGallery = async (doc) => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 1,
                quality: 0.8,
            });

            if (result.didCancel) {
                return;
            }

            if (result.errorCode) {
                Alert.alert(
                    'File Error',
                    result.errorMessage ||
                    'Unable to select document.'
                );
                return;
            }

            const file = result.assets?.[0];

            if (!file?.uri) {
                Alert.alert(
                    'Error',
                    'Unable to select document.'
                );
                return;
            }

            await handleEditDocumentUpload(
                doc,
                file,
                doc.documentNo || doc.refNumber
            );

        } catch (error) {
            console.log(
                'Document gallery error:',
                error
            );

            Alert.alert(
                'File Error',
                'Unable to select document.'
            );
        }
    };

    // const handleEditDocumentUpload = async (
    //     doc,
    //     file,
    //     referenceNumber
    // ) => {
    //     try {
    //         const token =
    //             await AsyncStorage.getItem('token');

    //         if (!token) {
    //             Alert.alert(
    //                 'Session Expired',
    //                 'Please login again.'
    //             );
    //             return false;
    //         }

    //         const documentId =
    //             doc.documentId;

    //         if (!documentId) {
    //             Alert.alert(
    //                 'Error',
    //                 'Document ID not found.'
    //             );
    //             return false;
    //         }

    //         const formData = new FormData();

    //         formData.append(
    //             'DocumentType',
    //             doc.documentType || doc.name
    //         );

    //         formData.append(
    //             'DocumentNo',
    //             referenceNumber.trim().toUpperCase()
    //         );

    //         // Only append file when changing document
    //         if (file?.uri) {
    //             formData.append('File', {
    //                 uri: file.uri,
    //                 name:
    //                     file.fileName ||
    //                     file.name ||
    //                     `document_${Date.now()}.jpg`,
    //                 type:
    //                     file.type ||
    //                     'image/jpeg',
    //             });
    //         }


    //         console.log(
    //             'Updating doc:',
    //             {
    //                 DocumentType: doc.documentType || doc.name,
    //                 DocumentNo: referenceNumber.trim().toUpperCase(),
    //                 HasProfilePhoto: !!file?.uri,
    //                 DocumentID: documentId
    //             }
    //         );

    //         setIsDocumentUploading(true);
    //         setUploadingDocId(documentId);
    //         setDocumentUploadProgress(0);

    //         const response = await axios.put(
    //             API.UPDATE_PARTNER_DOCUMENT(documentId),
    //             formData,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                     'Content-Type': 'multipart/form-data',
    //                     Accept: '*/*',
    //                 },

    //                 onUploadProgress: progressEvent => {
    //                     if (progressEvent.total) {
    //                         const progress = Math.round(
    //                             (progressEvent.loaded * 100) /
    //                             progressEvent.total
    //                         );

    //                         setDocumentUploadProgress(progress);
    //                     }
    //                 },
    //             }
    //         );

    //         console.log(
    //             'Update Document Response:',
    //             response.data
    //         );

    //         if (response.data?.success === true) {

    //             setDocumentUploadProgress(100);

    //             await fetchProfile();

    //             Alert.alert(
    //                 'Success',
    //                 response.data?.message ||
    //                 'Document updated successfully.'
    //             );

    //             return true;
    //         }

    //         Alert.alert(
    //             'Update Failed',
    //             response.data?.message ||
    //             'Unable to update document.'
    //         );

    //         return false;

    //     } catch (error) {

    //         console.log(
    //             'Update Document Error:',
    //             error?.response?.data || error
    //         );

    //         Alert.alert(
    //             'Update Failed',
    //             error?.response?.data?.message ||
    //             'Unable to update document.'
    //         );

    //         return false;

    //     } finally {

    //         setIsDocumentUploading(false);
    //         setUploadingDocId(null);

    //         setTimeout(() => {
    //             setDocumentUploadProgress(0);
    //         }, 500);
    //     }
    // };



    const handleEditDocumentUpload = async (
        doc,
        file,
        referenceNumber
    ) => {
        try {

            setIsUpdatingDocument(true);
            setDocumentUploadProgress(0);
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert(
                    'Session Expired',
                    'Please login again.'
                );
                return false;
            }

            const documentId = doc.documentId;

            if (!documentId) {
                Alert.alert(
                    'Error',
                    'Document ID not found.'
                );
                return false;
            }

            const formData = new FormData();

            formData.append(
                'DocumentType',
                doc.documentType || doc.name
            );

            formData.append(
                'DocumentNo',
                referenceNumber.trim().toUpperCase()
            );

            console.log(
                'Updating doc:',
                {
                    DocumentType: doc.documentType || doc.name,
                    DocumentNo: referenceNumber.trim().toUpperCase(),
                    HasProfilePhoto: !!file?.uri,
                    DocumentID: documentId,
                    filePath: doc.documentImage
                }
            );

            // ------------------------------------
            // NEW FILE OR EXISTING DOCUMENT FILE
            // ------------------------------------
            let fileToUpload = file;

            // If only reference number changed,
            // use existing document file
            if (!fileToUpload?.uri && doc.documentImage) {

                const existingFileUrl =
                    doc.documentImage;

                const fileName =
                    doc.documentImage.split('/').pop() ||
                    `document_${Date.now()}.jpg`;

                const extension =
                    fileName.split('.').pop()?.toLowerCase();

                let mimeType = 'image/jpeg';

                if (extension === 'png') {
                    mimeType = 'image/png';
                } else if (
                    extension === 'pdf'
                ) {
                    mimeType = 'application/pdf';
                } else if (
                    extension === 'jpeg' ||
                    extension === 'jpg'
                ) {
                    mimeType = 'image/jpeg';
                }

                fileToUpload = {
                    uri: existingFileUrl,
                    name: fileName,
                    type: mimeType,
                };
            }

            if (!fileToUpload?.uri) {
                Alert.alert(
                    'Document Required',
                    'Unable to find the existing document file.'
                );
                return false;
            }

            // Append File
            formData.append('File', {
                uri: fileToUpload.uri,
                name:
                    fileToUpload.fileName ||
                    fileToUpload.name ||
                    `document_${Date.now()}.jpg`,
                type:
                    fileToUpload.type ||
                    'image/jpeg',
            });


            console.log(
                'Updating doc:',
                {
                    DocumentType: doc.documentType || doc.name,
                    DocumentNo: referenceNumber.trim().toUpperCase(),
                    HasProfilePhoto: !!file?.uri,
                    DocumentID: documentId,
                    filePath: doc.documentImage
                }
            );

            // ------------------------------------
            // START PROGRESS
            // ------------------------------------
            setIsDocumentUploading(true);
            setUploadingDocId(documentId);
            setDocumentUploadProgress(0);

            // ------------------------------------
            // PUT API
            // ------------------------------------
            const response = await axios.put(
                API.UPDATE_PARTNER_DOCUMENT(documentId),
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                        Accept: '*/*',
                    },

                    onUploadProgress: progressEvent => {
                        if (progressEvent.total) {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) /
                                progressEvent.total
                            );

                            console.log(
                                'Document upload progress:',
                                progress
                            );

                            setDocumentUploadProgress(progress);
                        }
                    },
                }
            );

            console.log(
                'Update Document Response:',
                response.data
            );

            if (response.data?.success === true) {

                setDocumentUploadProgress(100);
                setShowRefNumberModal(false);

                // Reset edit states
                setIsEditingReferenceNumber(false);
                setTempRefNumber('');
                setSelectedDocument(null);

                await fetchProfile();

                Alert.alert(
                    'Success',
                    response.data?.message ||
                    'Document updated successfully.'
                );

                return true;
            }

            Alert.alert(
                'Update Failed',
                response.data?.message ||
                'Unable to update document.'
            );

            return false;

        } catch (error) {

            console.log(
                'Update Document Error:',
                error?.response?.data ||
                error.message
            );

            Alert.alert(
                'Update Failed',
                error?.response?.data?.message ||
                'Unable to update document.'
            );

            return false;

        } finally {
            setIsUpdatingDocument(false);
            setIsDocumentUploading(false);
            setUploadingDocId(null);

            setTimeout(() => {
                setDocumentUploadProgress(0);
            }, 500);
        }
    };




    const handleDeleteDocument = (docId) => {
        Alert.alert(
            'Delete Document',
            'Are you sure you want to delete this document?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        const updatedDocs = uploadedDocuments.map(doc =>
                            doc.id === docId ? {
                                ...doc,
                                uploaded: false,
                                verified: false,
                                documentNumber: '',
                                uploadDate: ''
                            } : doc
                        );
                        setUploadedDocuments(updatedDocs);
                        Alert.alert('Success', 'Document deleted successfully!');
                    }
                }
            ]
        );
    };


    // Render Upload Options Modal
    const renderUploadOptionsModal = () => (
        <Modal
            visible={showUploadOptionsModal}
            transparent
            animationType="none"
            onRequestClose={() => setShowUploadOptionsModal(false)}
        >
            <TouchableOpacity
                style={styles.uploadOptionsOverlay}
                activeOpacity={1}
                onPress={() => setShowUploadOptionsModal(false)}
            >
                <TouchableWithoutFeedback>
                    <Animated.View
                        style={[
                            styles.uploadOptionsContent,
                            {
                                transform: [{
                                    translateY: modalSlideAnim.interpolate({
                                        inputRange: [0, height],
                                        outputRange: [0, height]
                                    })
                                }]
                            }
                        ]}
                    >
                        <View style={styles.uploadOptionsHandle} />

                        <View style={styles.uploadOptionsHeader}>
                            <Text style={styles.uploadOptionsTitle}>Upload Document</Text>
                            <Text style={styles.uploadOptionsSubtitle}>
                                Choose how you want to upload your document
                            </Text>
                        </View>

                        <View style={styles.uploadOptionsContainer}>
                            {/* Camera Option */}
                            <TouchableOpacity
                                style={styles.uploadOptionItem}
                                onPress={() => {
                                    setShowUploadOptionsModal(false);
                                    setTimeout(() => {
                                        if (uploadDocId) {
                                            openDocumentCamera(uploadDocId);
                                        }
                                    }, 300);
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.uploadOptionIcon, { backgroundColor: '#FF8C0015' }]}>
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
                                <View style={styles.uploadOptionTextContainer}>
                                    <Text style={styles.uploadOptionTitle}>Camera</Text>
                                    <Text style={styles.uploadOptionDescription}>
                                        Take a photo with your camera
                                    </Text>
                                </View>
                                <Image
                                    source={require('../../asset/arrow-forward.png')}
                                    style={{
                                        width: 16,
                                        height: 16,
                                        tintColor: '#CCC',
                                        resizeMode: 'contain',
                                    }}
                                />
                            </TouchableOpacity>

                            {/* Gallery Option */}
                            <TouchableOpacity
                                style={styles.uploadOptionItem}
                                onPress={() => {
                                    setShowUploadOptionsModal(false);
                                    setTimeout(() => {
                                        if (uploadDocId) {
                                            openDocumentGallery(uploadDocId);
                                        }
                                    }, 300);
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.uploadOptionIcon, { backgroundColor: '#0984E315' }]}>
                                    <Image
                                        source={require('../../asset/attach.png')}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            tintColor: '#0984E3',
                                            resizeMode: 'contain',
                                        }}
                                    />
                                </View>
                                <View style={styles.uploadOptionTextContainer}>
                                    <Text style={styles.uploadOptionTitle}>Gallery</Text>
                                    <Text style={styles.uploadOptionDescription}>
                                        Choose from your gallery or files
                                    </Text>
                                </View>
                                <Image
                                    source={require('../../asset/arrow-forward.png')}
                                    style={{
                                        width: 16,
                                        height: 16,
                                        tintColor: '#CCC',
                                        resizeMode: 'contain',
                                    }}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.uploadOptionsCancel}
                            onPress={() => setShowUploadOptionsModal(false)}
                        >
                            <Text style={styles.uploadOptionsCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
    const renderImagePickerModal = () => (
        <Modal
            visible={showImagePickerModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowImagePickerModal(false)}
        >
            <TouchableOpacity
                style={styles.imagePickerOverlay}
                activeOpacity={1}
                onPress={() => setShowImagePickerModal(false)}
            >
                <View style={styles.imagePickerModalContent}>
                    <View style={styles.imagePickerModalHandle} />

                    <Text style={styles.imagePickerModalTitle}>Change Profile Picture</Text>
                    <Text style={styles.imagePickerModalSubtitle}>Choose how you want to update your profile photo</Text>

                    <View style={styles.imagePickerOptions}>
                        {/* Camera Option */}
                        <TouchableOpacity
                            style={styles.imagePickerOption}
                            onPress={() => {
                                setShowImagePickerModal(false);

                                setTimeout(() => {
                                    openSelfieCamera();
                                }, 300);
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.imagePickerOptionIcon, { backgroundColor: '#FF8C0015' }]}>
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
                            <Text style={styles.imagePickerOptionTitle}>Camera</Text>
                            <Text style={styles.imagePickerOptionDesc}>Take a photo with your camera</Text>
                            <View style={styles.imagePickerOptionArrow}>
                                <Image
                                    source={require('../../asset/arrow-forward.png')}
                                    style={{
                                        width: 16,
                                        height: 16,
                                        tintColor: '#CCC',
                                        resizeMode: 'contain',
                                    }}
                                />
                            </View>
                        </TouchableOpacity>

                        {/* Gallery Option */}
                        <TouchableOpacity
                            style={styles.imagePickerOption}
                            onPress={() => {
                                setShowImagePickerModal(false);

                                setTimeout(() => {
                                    openProfileGallery();
                                }, 300);
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.imagePickerOptionIcon, { backgroundColor: '#0984E315' }]}>
                                <Image
                                    source={require('../../asset/attach.png')}
                                    style={{
                                        width: 32,
                                        height: 32,
                                        tintColor: '#0984E3',
                                        resizeMode: 'contain',
                                    }}
                                />
                            </View>
                            <Text style={styles.imagePickerOptionTitle}>Gallery</Text>
                            <Text style={styles.imagePickerOptionDesc}>Choose from your gallery</Text>
                            <View style={styles.imagePickerOptionArrow}>
                                <Image
                                    source={require('../../asset/arrow-forward.png')}
                                    style={{
                                        width: 16,
                                        height: 16,
                                        tintColor: '#CCC',
                                        resizeMode: 'contain',
                                    }}
                                />
                            </View>
                        </TouchableOpacity>

                        {/* Remove Photo Option */}
                        <TouchableOpacity
                            style={[styles.imagePickerOption, styles.imagePickerRemoveOption]}
                            onPress={() => {
                                setShowImagePickerModal(false);
                                Alert.alert(
                                    'Remove Photo',
                                    'Are you sure you want to remove your profile photo?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Remove',
                                            style: 'destructive',
                                            onPress: () => {
                                                setProfileImage('https://ui-avatars.com/api/?name=Rajesh+Kumar&background=FF8C00&color=fff&size=100');
                                                Alert.alert('Success', 'Profile photo removed successfully!');
                                            }
                                        }
                                    ]
                                );
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.imagePickerOptionIcon, { backgroundColor: '#E1705515' }]}>
                                <Image
                                    source={require('../../asset/bin.png')}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        tintColor: '#E17055',
                                        resizeMode: 'contain',
                                    }}
                                />
                            </View>
                            <Text style={[styles.imagePickerOptionTitle, { color: '#E17055' }]}>Remove Photo</Text>
                            <Text style={[styles.imagePickerOptionDesc, { color: '#E17055' }]}>Remove your current profile photo</Text>
                            <View style={styles.imagePickerOptionArrow}>
                                <Image
                                    source={require('../../asset/arrow-forward.png')}
                                    style={{
                                        width: 16,
                                        height: 16,
                                        tintColor: '#E17055',
                                        resizeMode: 'contain',
                                    }}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.imagePickerCancelButton}
                        onPress={() => setShowImagePickerModal(false)}
                    >
                        <Text style={styles.imagePickerCancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );


    // const renderLocationModal = () => (
    //     <Modal
    //         visible={showLocationModal}
    //         transparent
    //         animationType="slide"
    //         onRequestClose={() => setShowLocationModal(false)}
    //     >

    //         {isUpdatingLocation && (
    //             <View style={styles.experienceLoadingOverlay}>
    //                 <View style={styles.experienceLoadingBox}>

    //                     <ActivityIndicator
    //                         size="large"
    //                         color="#FF8C00"
    //                     />

    //                     <Text style={styles.experienceLoadingTitle}>
    //                         Updating Location
    //                     </Text>

    //                     <Text style={styles.experienceLoadingProgress}>
    //                         {locationUploadProgress}%
    //                     </Text>

    //                     <Text style={styles.experienceLoadingSubtitle}>
    //                         Please wait...
    //                     </Text>

    //                 </View>
    //             </View>
    //         )}
    //         <View style={styles.locationModalOverlay}>
    //             <View style={styles.locationModalContent}>
    //                 <View style={styles.locationModalHandle} />
    //                 <ScrollView
    //                     style={styles.locationModalScroll}
    //                     showsVerticalScrollIndicator={false}
    //                     keyboardShouldPersistTaps="handled"
    //                     nestedScrollEnabled={true}
    //                 >
    //                     <View style={styles.locationModalHeader}>
    //                         <Text style={styles.locationModalTitle}>Select Location</Text>
    //                         <TouchableOpacity onPress={() => setShowLocationModal(false)}>
    //                             <Image
    //                                 source={require('../../asset/close.png')}
    //                                 style={{
    //                                     width: 24,
    //                                     height: 24,
    //                                     tintColor: '#666',
    //                                     resizeMode: 'contain',
    //                                 }}
    //                             />
    //                         </TouchableOpacity>
    //                     </View>
    //                 </ScrollView>


    //                 {/* Search Input */}
    //                 <View style={styles.locationSearchWrapper}>
    //                     <Image
    //                         source={require('../../asset/search.png')}
    //                         style={{
    //                             width: 20,
    //                             height: 20,
    //                             tintColor: '#999',
    //                             resizeMode: 'contain',
    //                             marginRight: 10,
    //                         }}
    //                     />
    //                     <TextInput
    //                         style={styles.locationSearchInput}
    //                         placeholder="Search location..."
    //                         placeholderTextColor="#999"
    //                         value={searchLocationText}
    //                         onChangeText={searchLocationPlaces}
    //                         autoCorrect={false}
    //                         autoCapitalize="none"
    //                         returnKeyType="search"
    //                         clearButtonMode="while-editing"
    //                     />
    //                     {isSearchingLocation && (
    //                         <ActivityIndicator size="small" color="#FF8C00" style={{ marginLeft: 8 }} />
    //                     )}
    //                     {searchLocationText.length > 0 && !isSearchingLocation && (
    //                         <TouchableOpacity
    //                             onPress={() => {
    //                                 setSearchLocationText('');
    //                                 setLocationSuggestions([]);
    //                                 setShowLocationSuggestions(false);
    //                             }}
    //                             style={{ marginLeft: 8 }}
    //                         >
    //                             <Image
    //                                 source={require('../../asset/edit.png')}
    //                                 style={{
    //                                     width: 20,
    //                                     height: 20,
    //                                     tintColor: '#999',
    //                                     resizeMode: 'contain',
    //                                 }}
    //                             />
    //                         </TouchableOpacity>
    //                     )}
    //                 </View>

    //                 {/* Location Suggestions */}
    //                 {showLocationSuggestions && locationSuggestions.length > 0 && (
    //                     <View style={styles.locationSuggestionsContainer}>
    //                         <ScrollView
    //                             style={styles.locationSuggestionsList}
    //                             nestedScrollEnabled={true}
    //                             keyboardShouldPersistTaps="handled"
    //                             showsVerticalScrollIndicator={true}
    //                         >
    //                             {locationSuggestions.map((item, index) => (
    //                                 <TouchableOpacity
    //                                     key={`${item.place_id}-${index}`}
    //                                     style={styles.locationSuggestionItem}
    //                                     onPress={() => handleLocationSelect(item)}
    //                                     activeOpacity={0.7}
    //                                 >
    //                                     <View style={styles.locationSuggestionIconContainer}>
    //                                         <Image
    //                                             source={require('../../asset/location-outline.png')}
    //                                             style={{
    //                                                 width: 18,
    //                                                 height: 18,
    //                                                 tintColor: '#FF8C00',
    //                                                 resizeMode: 'contain',
    //                                             }}
    //                                         />
    //                                     </View>
    //                                     <View style={styles.locationSuggestionTextContainer}>
    //                                         <Text style={styles.locationSuggestionTitle} numberOfLines={1}>
    //                                             {item.structured_formatting?.main_text || item.description}
    //                                         </Text>
    //                                         <Text style={styles.locationSuggestionAddress} numberOfLines={1}>
    //                                             {item.structured_formatting?.secondary_text || ''}
    //                                         </Text>
    //                                     </View>
    //                                 </TouchableOpacity>
    //                             ))}
    //                         </ScrollView>
    //                     </View>
    //                 )}

    //                 {/* Map View */}
    //                 {/* Map View */}
    //                 <View style={styles.locationMapContainer}>
    //                     {tempLatitude && tempLongitude ? (
    //                         <MapView
    //                             style={styles.locationMap}
    //                             region={mapRegion || {
    //                                 latitude: tempLatitude,
    //                                 longitude: tempLongitude,
    //                                 latitudeDelta: 0.005,
    //                                 longitudeDelta: 0.005,
    //                             }}
    //                             onRegionChangeComplete={(region) => {
    //                                 // Only update when region changes significantly
    //                                 const latDiff = Math.abs(region.latitude - tempLatitude);
    //                                 const lngDiff = Math.abs(region.longitude - tempLongitude);
    //                                 if (latDiff > 0.0001 || lngDiff > 0.0001) {
    //                                     setTempLatitude(region.latitude);
    //                                     setTempLongitude(region.longitude);
    //                                     setMapRegion(region);
    //                                 }
    //                             }}
    //                             showsUserLocation={true}
    //                             showsMyLocationButton={true}
    //                             zoomEnabled={true}
    //                             scrollEnabled={true}
    //                             onMapReady={() => {
    //                                 console.log('Map ready');
    //                             }}
    //                         >
    //                             <Marker
    //                                 coordinate={{
    //                                     latitude: tempLatitude,
    //                                     longitude: tempLongitude,
    //                                 }}
    //                                 title="Selected Location"
    //                                 description={tempLocation || 'Your location'}
    //                                 draggable
    //                                 onDragEnd={(e) => {
    //                                     const { latitude, longitude } = e.nativeEvent.coordinate;
    //                                     setTempLatitude(latitude);
    //                                     setTempLongitude(longitude);
    //                                     // Update map region
    //                                     setMapRegion({
    //                                         latitude: latitude,
    //                                         longitude: longitude,
    //                                         latitudeDelta: 0.005,
    //                                         longitudeDelta: 0.005,
    //                                     });
    //                                     // Reverse geocode
    //                                     reverseGeocodeLocation(latitude, longitude);
    //                                 }}
    //                             />
    //                         </MapView>
    //                     ) : (
    //                         <View style={styles.locationMapLoading}>
    //                             <ActivityIndicator size="large" color="#FF8C00" />
    //                             <Text style={styles.locationMapLoadingText}>Loading map...</Text>
    //                         </View>
    //                     )}
    //                 </View>

    //                 {/* Location Details */}
    //                 {tempLocation && (
    //                     <View style={styles.locationDetailsCard}>
    //                         <View style={styles.locationDetailRow}>
    //                             <Image
    //                                 source={require('../../asset/location-outline.png')}
    //                                 style={{
    //                                     width: 18,
    //                                     height: 18,
    //                                     tintColor: '#FF8C00',
    //                                     resizeMode: 'contain',
    //                                 }}
    //                             />
    //                             <Text style={styles.locationDetailText} numberOfLines={2}>
    //                                 {tempLocation}
    //                             </Text>
    //                         </View>
    //                         {tempArea && (
    //                             <View style={styles.locationDetailRow}>
    //                                 <Image
    //                                     source={require('../../asset/location-outline.png')}
    //                                     style={{
    //                                         width: 16,
    //                                         height: 16,
    //                                         tintColor: '#999',
    //                                         resizeMode: 'contain',
    //                                     }}
    //                                 />
    //                                 <Text style={styles.locationDetailSubText}>
    //                                     Area: {tempArea} {tempPincode ? `• ${tempPincode}` : ''}
    //                                 </Text>
    //                             </View>
    //                         )}
    //                     </View>
    //                 )}

    //                 {/* Action Buttons */}
    //                 <View style={styles.locationModalActions}>
    //                     <TouchableOpacity
    //                         style={[styles.locationModalButton, styles.locationCurrentButton]}
    //                         onPress={fetchCurrentLocationForModal}
    //                         disabled={isFetchingLocation}
    //                     >
    //                         <Image
    //                             source={require('../../asset/location-outline.png')}
    //                             style={{
    //                                 width: 18,
    //                                 height: 18,
    //                                 tintColor: '#FF8C00',
    //                                 resizeMode: 'contain',
    //                             }}
    //                         />
    //                         <Text style={styles.locationCurrentButtonText}>
    //                             {isFetchingLocation ? 'Getting...' : 'Current Location'}
    //                         </Text>
    //                     </TouchableOpacity>

    //                     <TouchableOpacity
    //                         style={[styles.locationModalButton, styles.locationSaveButton]}
    //                         onPress={handleSaveLocationFromModal}
    //                     >
    //                         <Text style={styles.locationSaveButtonText}>Save Location</Text>
    //                     </TouchableOpacity>
    //                 </View>
    //             </View>
    //         </View>



    //     </Modal>
    // );



    const renderLocationModal = () => (
        <Modal
            visible={showLocationModal}
            transparent
            animationType="slide"
            onRequestClose={() => {
                if (!isUpdatingLocation) {
                    setShowLocationModal(false);
                }
            }}
        >
            <View style={styles.locationModalOverlay}>

                <View style={styles.locationModalContent}>

                    {/* ================= HEADER ================= */}
                    <View style={styles.locationModalHeader}>
                        <Text style={styles.locationModalTitle}>
                            Select Location
                        </Text>

                        <TouchableOpacity
                            disabled={isUpdatingLocation}
                            onPress={() => {
                                if (!isUpdatingLocation) {
                                    setShowLocationModal(false);
                                }
                            }}
                        >
                            <Image
                                source={require('../../asset/close.png')}
                                style={{
                                    width: 24,
                                    height: 24,
                                    tintColor: '#666',
                                    resizeMode: 'contain',
                                    opacity: isUpdatingLocation ? 0.4 : 1,
                                }}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* ================= SEARCH INPUT ================= */}
                    <View style={styles.locationSearchWrapper}>
                        <Image
                            source={require('../../asset/search.png')}
                            style={{
                                width: 20,
                                height: 20,
                                tintColor: '#999',
                                resizeMode: 'contain',
                                marginRight: 10,
                            }}
                        />

                        <TextInput
                            style={styles.locationSearchInput}
                            placeholder="Search location..."
                            placeholderTextColor="#999"
                            value={searchLocationText}
                            onChangeText={searchLocationPlaces}
                            autoCorrect={false}
                            autoCapitalize="none"
                            returnKeyType="search"
                            clearButtonMode="while-editing"
                            editable={!isUpdatingLocation}
                        />

                        {isSearchingLocation && (
                            <ActivityIndicator
                                size="small"
                                color="#FF8C00"
                                style={{ marginLeft: 8 }}
                            />
                        )}

                        {searchLocationText.length > 0 &&
                            !isSearchingLocation && (
                                <TouchableOpacity
                                    disabled={isUpdatingLocation}
                                    onPress={() => {
                                        setSearchLocationText('');
                                        setLocationSuggestions([]);
                                        setShowLocationSuggestions(false);
                                    }}
                                    style={{ marginLeft: 8 }}
                                >
                                    <Image
                                        source={require('../../asset/edit.png')}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            tintColor: '#999',
                                            resizeMode: 'contain',
                                        }}
                                    />
                                </TouchableOpacity>
                            )}
                    </View>

                    {/* ================= LOCATION SUGGESTIONS ================= */}
                    {showLocationSuggestions &&
                        locationSuggestions.length > 0 && (
                            <View
                                style={
                                    styles.locationSuggestionsContainer
                                }
                            >
                                <ScrollView
                                    style={
                                        styles.locationSuggestionsList
                                    }
                                    nestedScrollEnabled={true}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={true}
                                >
                                    {locationSuggestions.map(
                                        (item, index) => (
                                            <TouchableOpacity
                                                key={`${item.place_id}-${index}`}
                                                style={
                                                    styles.locationSuggestionItem
                                                }
                                                disabled={
                                                    isUpdatingLocation
                                                }
                                                onPress={() =>
                                                    handleLocationSelect(
                                                        item
                                                    )
                                                }
                                                activeOpacity={0.7}
                                            >
                                                <View
                                                    style={
                                                        styles.locationSuggestionIconContainer
                                                    }
                                                >
                                                    <Image
                                                        source={require('../../asset/location-outline.png')}
                                                        style={{
                                                            width: 18,
                                                            height: 18,
                                                            tintColor:
                                                                '#FF8C00',
                                                            resizeMode:
                                                                'contain',
                                                        }}
                                                    />
                                                </View>

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
                                                        {item
                                                            .structured_formatting
                                                            ?.main_text ||
                                                            item.description}
                                                    </Text>

                                                    <Text
                                                        style={
                                                            styles.locationSuggestionAddress
                                                        }
                                                        numberOfLines={1}
                                                    >
                                                        {item
                                                            .structured_formatting
                                                            ?.secondary_text ||
                                                            ''}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    )}
                                </ScrollView>
                            </View>
                        )}

                    {/* ================= MAP ================= */}
                    <View style={styles.locationMapContainer}>
                        {tempLatitude && tempLongitude ? (
                            <MapView
                                style={styles.locationMap}
                                region={
                                    mapRegion || {
                                        latitude: tempLatitude,
                                        longitude: tempLongitude,
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }
                                }
                                onRegionChangeComplete={region => {
                                    if (isUpdatingLocation) {
                                        return;
                                    }

                                    const latDiff = Math.abs(
                                        region.latitude -
                                        tempLatitude
                                    );

                                    const lngDiff = Math.abs(
                                        region.longitude -
                                        tempLongitude
                                    );

                                    if (
                                        latDiff > 0.0001 ||
                                        lngDiff > 0.0001
                                    ) {
                                        setTempLatitude(
                                            region.latitude
                                        );

                                        setTempLongitude(
                                            region.longitude
                                        );

                                        setMapRegion(region);
                                    }
                                }}
                                showsUserLocation={true}
                                showsMyLocationButton={true}
                                zoomEnabled={!isUpdatingLocation}
                                scrollEnabled={!isUpdatingLocation}
                                onMapReady={() => {
                                    console.log('Map ready');
                                }}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: tempLatitude,
                                        longitude: tempLongitude,
                                    }}
                                    title="Selected Location"
                                    description={
                                        tempLocation ||
                                        'Your location'
                                    }
                                    draggable={!isUpdatingLocation}
                                    onDragEnd={e => {
                                        if (isUpdatingLocation) {
                                            return;
                                        }

                                        const {
                                            latitude,
                                            longitude,
                                        } =
                                            e.nativeEvent.coordinate;

                                        setTempLatitude(latitude);
                                        setTempLongitude(longitude);

                                        setMapRegion({
                                            latitude,
                                            longitude,
                                            latitudeDelta: 0.005,
                                            longitudeDelta: 0.005,
                                        });

                                        reverseGeocodeLocation(
                                            latitude,
                                            longitude
                                        );
                                    }}
                                />
                            </MapView>
                        ) : (
                            <View
                                style={
                                    styles.locationMapLoading
                                }
                            >
                                <ActivityIndicator
                                    size="large"
                                    color="#FF8C00"
                                />

                                <Text
                                    style={
                                        styles.locationMapLoadingText
                                    }
                                >
                                    Loading map...
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* ================= LOCATION DETAILS ================= */}
                    {tempLocation && (
                        <View
                            style={
                                styles.locationDetailsCard
                            }
                        >
                            <View
                                style={
                                    styles.locationDetailRow
                                }
                            >
                                <Image
                                    source={require('../../asset/location-outline.png')}
                                    style={{
                                        width: 18,
                                        height: 18,
                                        tintColor: '#FF8C00',
                                        resizeMode: 'contain',
                                    }}
                                />

                                <Text
                                    style={
                                        styles.locationDetailText
                                    }
                                    numberOfLines={2}
                                >
                                    {tempLocation}
                                </Text>
                            </View>

                            {tempArea && (
                                <View
                                    style={
                                        styles.locationDetailRow
                                    }
                                >
                                    <Image
                                        source={require('../../asset/location-outline.png')}
                                        style={{
                                            width: 16,
                                            height: 16,
                                            tintColor: '#999',
                                            resizeMode: 'contain',
                                        }}
                                    />

                                    <Text
                                        style={
                                            styles.locationDetailSubText
                                        }
                                    >
                                        Area: {tempArea}
                                        {tempPincode
                                            ? ` • ${tempPincode}`
                                            : ''}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* ================= ACTION BUTTONS ================= */}
                    <View
                        style={
                            styles.locationModalActions
                        }
                    >
                        <TouchableOpacity
                            style={[
                                styles.locationModalButton,
                                styles.locationCurrentButton,
                                (
                                    isFetchingLocation ||
                                    isUpdatingLocation
                                ) && {
                                    opacity: 0.6,
                                },
                            ]}
                            onPress={
                                fetchCurrentLocationForModal
                            }
                            disabled={
                                isFetchingLocation ||
                                isUpdatingLocation
                            }
                        >
                            <Image
                                source={require('../../asset/location-outline.png')}
                                style={{
                                    width: 18,
                                    height: 18,
                                    tintColor: '#FF8C00',
                                    resizeMode: 'contain',
                                }}
                            />

                            <Text
                                style={
                                    styles.locationCurrentButtonText
                                }
                            >
                                {isFetchingLocation
                                    ? 'Getting...'
                                    : 'Current Location'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.locationModalButton,
                                styles.locationSaveButton,
                                isUpdatingLocation && {
                                    opacity: 0.6,
                                },
                            ]}
                            disabled={isUpdatingLocation}
                            onPress={
                                handleSaveLocationFromModal
                            }
                        >
                            <Text
                                style={
                                    styles.locationSaveButtonText
                                }
                            >
                                {isUpdatingLocation
                                    ? 'Updating...'
                                    : 'Save Location'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* ================= UPDATE LOADER ================= */}
                    {isUpdatingLocation && (
                        <View
                            style={
                                styles.locationLoadingOverlay
                            }
                        >
                            <View
                                style={
                                    styles.experienceLoadingBox
                                }
                            >
                                <ActivityIndicator
                                    size="large"
                                    color="#FF8C00"
                                />

                                <Text
                                    style={
                                        styles.experienceLoadingTitle
                                    }
                                >
                                    Updating Location
                                </Text>

                                <Text
                                    style={
                                        styles.experienceLoadingProgress
                                    }
                                >
                                    {locationUploadProgress}%
                                </Text>

                                <Text
                                    style={
                                        styles.experienceLoadingSubtitle
                                    }
                                >
                                    Please wait...
                                </Text>
                            </View>
                        </View>
                    )}

                </View>
            </View>
        </Modal>
    );







    // Render stars


    const renderSkillBottomSheet = () => {
        const filteredServices = availableServices.filter(service =>
            service.name
                ?.toLowerCase()
                .includes(serviceSearch.toLowerCase())
        );

        return (
            <Modal
                visible={showSkillBottomSheet}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSkillBottomSheet(false)}
            >
                <View style={styles.bottomSheetOverlay}>

                    <View style={styles.skillBottomSheet}>

                        {/* Header */}
                        <View style={styles.skillSheetHeader}>
                            <Text style={styles.skillSheetTitle}>
                                Select Services
                            </Text>

                            <TouchableOpacity
                                onPress={() =>
                                    setShowSkillBottomSheet(false)
                                }
                            >
                                <Text style={styles.skillSheetClose}>
                                    ✕
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Search */}
                        <View style={styles.skillSearchContainer}>
                            <TextInput
                                value={serviceSearch}
                                onChangeText={setServiceSearch}
                                placeholder="Search services..."
                                placeholderTextColor="#999"
                                style={styles.skillSearchInput}
                            />
                        </View>

                        {/* Loading */}
                        <FlatList
                            data={filteredServices}
                            keyExtractor={(item) => String(item.id)}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingBottom: 20,
                            }}
                            renderItem={({ item }) => {
                                const isSelected = selectedSkills.some(
                                    skill =>
                                        skill?.trim().toLowerCase() ===
                                        item.name?.trim().toLowerCase()
                                );

                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.skillItem,
                                            isSelected && styles.skillItemSelected,
                                        ]}
                                        onPress={() => toggleSkillSelection(item.name)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.skillTextContainer}>
                                            <Text
                                                style={[
                                                    styles.skillName,
                                                    isSelected && styles.skillNameSelected,
                                                ]}
                                            >
                                                {item.name}
                                            </Text>
                                        </View>

                                        <View
                                            style={[
                                                styles.skillCheckbox,
                                                isSelected &&
                                                styles.skillCheckboxSelected,
                                            ]}
                                        >
                                            {isSelected && (
                                                <Text style={styles.skillCheckmark}>
                                                    ✓
                                                </Text>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />

                        {/* Done */}
                        <TouchableOpacity
                            style={styles.skillDoneButton}
                            onPress={handleSaveSkills}
                            disabled={isSavingSkills}
                        >
                            {isSavingSkills ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                />
                            ) : (
                                <Text style={styles.skillDoneButtonText}>
                                    Done
                                </Text>
                            )}
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>
        );
    };


    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            let image = starImages.empty;
            let tintColor = '#DDD';

            if (i < fullStars) {
                image = starImages.full;
                tintColor = '#FFD700';
            } else if (i === fullStars && hasHalfStar) {
                image = starImages.half;
                tintColor = '#FFD700';
            }

            stars.push(
                <Image
                    key={i}
                    source={image}
                    style={{
                        width: 16,
                        height: 16,
                        tintColor,
                        resizeMode: 'contain',
                        marginHorizontal: 1,
                    }}
                />
            );
        }
        return stars;
    };


    const renderRefNumberModal = () => (
        <Modal
            visible={showRefNumberModal}
            transparent
            animationType="fade"
            onRequestClose={() => {
                if (!isUpdatingDocument) {
                    setShowRefNumberModal(false);
                }
            }}
        >
            <View style={styles.modalOverlay}>

                <View
                    style={[
                        styles.refModalContent,
                        { position: 'relative' }
                    ]}
                >
                    <View style={styles.refModalHeader}>
                        <Text style={styles.refModalTitle}>
                            {isEditingReferenceNumber
                                ? 'Change Reference Number'
                                : 'Enter Reference Number'}
                        </Text>

                        <Text style={styles.refModalSubtitle}>
                            {isEditingReferenceNumber
                                ? 'Update the document reference number'
                                : 'Please enter the document reference number before uploading'}
                        </Text>
                    </View>

                    <TextInput
                        style={styles.refModalInput}
                        placeholder="Enter reference number"
                        placeholderTextColor="#999"
                        value={tempRefNumber}
                        onChangeText={setTempRefNumber}
                        autoFocus
                        keyboardType="default"
                        autoCapitalize="characters"
                        editable={!isUpdatingDocument}
                    />

                    <View style={styles.refModalActions}>

                        <TouchableOpacity
                            style={[
                                styles.refModalButton,
                                styles.refCancelButton,
                            ]}
                            disabled={isUpdatingDocument}
                            onPress={() =>
                                setShowRefNumberModal(false)
                            }
                        >
                            <Text style={styles.refCancelText}>
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.refModalButton,
                                styles.refSaveButton,
                                isUpdatingDocument && {
                                    opacity: 0.6,
                                },
                            ]}
                            disabled={isUpdatingDocument}
                            onPress={
                                isEditingReferenceNumber
                                    ? handleUpdateReferenceNumber
                                    : handleSaveRefNumber
                            }
                        >
                            <Text style={styles.refSaveText}>
                                {isUpdatingDocument
                                    ? 'Updating...'
                                    : isEditingReferenceNumber
                                        ? 'Update'
                                        : 'Continue'}
                            </Text>
                        </TouchableOpacity>

                    </View>

                    {/* ================= DOCUMENT UPDATE LOADER ================= */}


                </View>
            </View>
        </Modal>
    );

    // Render Document Modal
    const renderDocumentModal = () => (
        <Modal
            transparent={true}
            visible={showDocumentModal}
            animationType="none"
            onRequestClose={closeDocumentModal}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={closeDocumentModal}
            >
                <TouchableWithoutFeedback>
                    <Animated.View
                        style={[
                            styles.documentModalContent,
                            { transform: [{ translateY: modalSlideAnim }] }
                        ]}
                    >
                        <View style={styles.modalHandle} />

                        {selectedDocument && (
                            <>
                                {/* Document Image - Show only if uploaded */}
                                {selectedDocument.uploaded && selectedDocument.documentImage ? (
                                    <View style={styles.documentModalImageContainer}>
                                        <Image
                                            source={{ uri: selectedDocument.documentImage }}
                                            style={styles.documentModalImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.documentModalImageOverlay}>
                                            <View style={styles.documentModalImageBadge}>
                                                <Text style={styles.documentModalImageBadgeText}>
                                                    {selectedDocument.verified ? 'Verified ✅' : 'Pending ⏳'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.documentModalNoImage}>
                                        <View style={styles.documentModalIcon}>
                                            <Image
                                                source={selectedDocument.image}
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    resizeMode: 'contain',
                                                    tintColor: "#FF8C00",
                                                }}
                                            />
                                        </View>
                                        <Text style={styles.documentModalNoImageText}>
                                            {selectedDocument.uploaded ? 'Document Uploaded' : 'No Document Uploaded'}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.documentModalHeader}>
                                    <Text style={styles.documentModalTitle}>{selectedDocument.name}</Text>
                                    <Text style={styles.documentModalStatus}>
                                        {selectedDocument.verified ? '✅ Verified' : selectedDocument.uploaded ? '⏳ Pending Verification' : '📤 Not Uploaded'}
                                    </Text>
                                </View>

                                <View style={styles.documentModalInfo}>
                                    <View style={styles.documentModalRow}>
                                        <Text style={styles.documentModalLabel}>Reference Number</Text>
                                        <Text style={styles.documentModalValue}>
                                            {selectedDocument.refNumber || 'Not provided'}
                                        </Text>
                                    </View>
                                    <View style={styles.documentModalRow}>
                                        <Text style={styles.documentModalLabel}>Upload Date</Text>
                                        <Text style={styles.documentModalValue}>
                                            {selectedDocument.uploadDate || 'Not uploaded'}
                                        </Text>
                                    </View>
                                    <View style={styles.documentModalRow}>
                                        <Text style={styles.documentModalLabel}>Status</Text>
                                        <Text style={[
                                            styles.documentModalValue,
                                            selectedDocument.verified ? { color: '#4CAF50' } : selectedDocument.uploaded ? { color: '#FF8C00' } : { color: '#999' }
                                        ]}>
                                            {selectedDocument.verified ? 'Verified' : selectedDocument.uploaded ? 'Pending' : 'Not Uploaded'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.documentModalActions}>
                                    {!selectedDocument.uploaded && (
                                        <TouchableOpacity
                                            style={[styles.documentModalAction, styles.uploadAction]}
                                            onPress={() => {
                                                closeDocumentModal();
                                                setTimeout(() => handleUploadDocument(selectedDocument.id), 300);
                                            }}
                                        >
                                            <Image
                                                source={require('../../asset/camera.png')}
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    tintColor: '#FFFFFF',
                                                    resizeMode: 'contain',
                                                }}
                                            />
                                            <Text style={styles.documentModalActionText}>Upload</Text>
                                        </TouchableOpacity>
                                    )}
                                    {selectedDocument.uploaded && !selectedDocument.verified && (
                                        <TouchableOpacity
                                            style={[styles.documentModalAction, styles.editAction]}
                                            onPress={() => {
                                                closeDocumentModal();
                                                setTimeout(() => handleEditDocument(selectedDocument), 300);
                                            }}
                                        >
                                            <Image
                                                source={require('../../asset/edit.png')}
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    tintColor: '#FFFFFF',
                                                    resizeMode: 'contain',
                                                }}
                                            />
                                            <Text style={styles.documentModalActionText}>Edit Document</Text>
                                        </TouchableOpacity>
                                    )}
                                    {/* {selectedDocument.uploaded && !selectedDocument.verified && (
                                        <TouchableOpacity
                                            style={[styles.documentModalAction, styles.deleteAction]}
                                            onPress={() => {
                                                closeDocumentModal();
                                                setTimeout(() => handleDeleteDocument(selectedDocument.id), 300);
                                            }}
                                        >
                                            <Image
                                                source={require('../../asset/bin.png')}
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    tintColor: '#FFFFFF',
                                                    resizeMode: 'contain',
                                                }}
                                            />
                                            <Text style={styles.documentModalActionText}>Delete</Text>
                                        </TouchableOpacity>
                                    )} */}
                                </View>

                                <TouchableOpacity
                                    style={styles.documentModalClose}
                                    onPress={closeDocumentModal}
                                >
                                    <Text style={styles.documentModalCloseText}>Close</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </Animated.View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={ORANGE_COLOR} />
            {isProfileLoading ? (

                <Loader />
            ) : (
                <>
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
                                <Text style={styles.toolbarTitle}>My Profile</Text>
                            </View>
                            <View style={styles.toolbarPlaceholder} />
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
                        {/* Profile Image Section */}
                        <Animated.View
                            style={[
                                styles.profileImageSection,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }],
                                }
                            ]}
                        >
                            <View style={styles.profileImageContainer}>
                                <View style={styles.profileImageWrapper}>
                                    <Image
                                        source={
                                            profileImage
                                                ? { uri: profileImage }
                                                : getGenderImage(gender)
                                        }
                                        style={styles.profileImage}
                                    />
                                    <View style={styles.profileImageOverlay} />
                                </View>

                                {isUpdatingProfile && (
                                    <View style={styles.profileUploadOverlay}>
                                        <ActivityIndicator
                                            size="small"
                                            color="#FFFFFF"
                                        />

                                        <Text style={styles.profileUploadText}>
                                            {profileUploadProgress}%
                                        </Text>
                                    </View>
                                )}

                                {!isUpdatingProfile && (
                                    <TouchableOpacity
                                        style={styles.editImageButton}
                                        onPress={() => setShowImagePickerModal(true)}
                                    >
                                        <Image
                                            source={require('../../asset/camera.png')}
                                            style={{
                                                width: 20,
                                                height: 20,
                                                tintColor: "#FFFFFF",
                                            }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>







                            <Text style={styles.profileName}>{firstName} {lastName}</Text>
                            <View style={styles.ratingContainer}>
                                {renderStars(rating)}
                                <Text style={styles.ratingText}>{rating}</Text>
                            </View>
                        </Animated.View>

                        {/* Profile Completion */}
                        <Animated.View
                            style={[
                                styles.completionCard,
                                { opacity: fadeAnim }
                            ]}
                        >
                            <View style={styles.completionHeader}>
                                <Text style={styles.completionTitle}>
                                    Profile Completion
                                </Text>

                                <Text style={styles.completionPercentage}>
                                    {completionPercentage}%
                                </Text>
                            </View>

                            <View style={styles.progressBarContainer}>
                                <Animated.View
                                    style={[
                                        styles.progressBarFill,
                                        {
                                            width: progressAnim.interpolate({
                                                inputRange: [0, 100],
                                                outputRange: ['0%', '100%'],
                                            }),
                                        },
                                    ]}
                                />
                            </View>

                            <Text style={styles.completionSubtext}>
                                {completionPercentage < 100
                                    ? 'Complete your profile to get more job opportunities'
                                    : 'Profile complete!'}
                            </Text>
                        </Animated.View>

                        {/* Personal Information */}
                        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                            <Text style={styles.cardTitle}>Personal Information</Text>

                            {/* First Name - Read Only */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>First Name</Text>
                                <Text style={styles.fieldValue}>{firstName}</Text>
                            </View>

                            {/* Last Name - Read Only */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Last Name</Text>
                                <Text style={styles.fieldValue}>{lastName}</Text>
                            </View>

                            {/* Mobile Number - Read Only */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Mobile Number</Text>
                                <Text style={styles.fieldValue}>{mobileNumber}</Text>
                            </View>

                            {/* Email - Read Only */}
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Email ID</Text>
                                <Text style={styles.fieldValue}>{email}</Text>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Gender</Text>
                                <Text style={styles.fieldValue}>{gender}</Text>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Date Of Birth</Text>
                                <Text style={styles.fieldValue}>{dob}</Text>
                            </View>

                            {/* Location - Editable Item */}
                            <View style={styles.fieldContainer}>
                                <View style={styles.fieldHeader}>
                                    <Text style={styles.fieldLabel}>Preferable Service Location</Text>
                                    <TouchableOpacity onPress={handleEditLocation} style={styles.editIconButton}>
                                        <Image
                                            source={require('../../asset/edit.png')}
                                            style={{
                                                width: 18,
                                                height: 18,
                                                tintColor: '#FF8C00',
                                                resizeMode: 'contain',
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.fieldValue}>{location}</Text>
                            </View>

                            {/* Experience - Editable Item */}
                            <View style={styles.fieldContainer}>
                                <View style={styles.fieldHeader}>
                                    <Text style={styles.fieldLabel}>Experience</Text>
                                    <TouchableOpacity onPress={() => setShowExperienceModal(true)}>
                                        <Image
                                            source={require('../../asset/edit.png')}
                                            style={{
                                                width: 18,
                                                height: 18,
                                                tintColor: '#FF8C00',
                                                resizeMode: 'contain',
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.fieldValue}>{experience}</Text>
                            </View>
                        </Animated.View>

                        {/* Skills Section - Editable Items */}
                        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                            <View style={styles.skillsHeader}>
                                <Text style={styles.cardTitle}>Skills</Text>
                                <View style={styles.skillsHeaderActions}>
                                    <TouchableOpacity
                                        style={styles.skillHeaderButton}
                                        onPress={handleEditSkills}
                                    >
                                        <Image
                                            source={require('../../asset/edit.png')}
                                            style={{
                                                width: 20,
                                                height: 20,
                                                tintColor: "#FF8C00",
                                            }}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.skillHeaderButton}
                                        onPress={handleOpenSkillBottomSheet}
                                    >
                                        <Image
                                            source={require('../../asset/add.png')}
                                            style={{
                                                width: 20,
                                                height: 20,
                                                tintColor: "#FF8C00",
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.skillsContainer}>
                                {skills.map((skill, index) => (
                                    <View key={index} style={styles.skillItem}>
                                        <Text style={styles.skillText}>{skill}</Text>
                                        
                                    </View>
                                ))}
                                {skills.length === 0 && (
                                    <Text style={styles.noSkillsText}>No skills added. Tap + to add skills.</Text>
                                )}
                            </View>
                        </Animated.View>

                        {/* Uploaded Documents */}
                        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                            <Text style={styles.cardTitle}>Uploaded Documents</Text>
                            {uploadedDocuments.map((doc) => (
                                <TouchableOpacity
                                    key={doc.id}
                                    style={styles.documentItem}
                                    onPress={() => {
                                        if (!isDocumentUploading) {
                                            handleViewDocument(doc);
                                        }
                                    }}
                                    activeOpacity={0.7}
                                    disabled={
                                        isDocumentUploading &&
                                        uploadingDocId === doc.id
                                    }
                                >

                                    <View style={styles.documentLeft}>

                                        <View style={styles.documentIcon}>
                                            <Image
                                                source={doc.image}
                                                style={{
                                                    width: 22,
                                                    height: 22,
                                                    resizeMode: 'contain',
                                                    tintColor: '#FF8C00',
                                                }}
                                            />
                                        </View>

                                        <View style={{ flex: 1 }}>

                                            <Text style={styles.documentName}>
                                                {doc.name}
                                            </Text>

                                            {/* Normal status */}
                                            {!(
                                                isDocumentUploading &&
                                                uploadingDocId === doc.id
                                            ) && (
                                                    <Text style={styles.documentStatus}>
                                                        {doc.verified
                                                            ? '✅ Verified'
                                                            : doc.uploaded
                                                                ? '⏳ Pending Verification'
                                                                : doc.refNumber
                                                                    ? '📤 Ready to Upload'
                                                                    : '📝 Not uploaded yet'}
                                                    </Text>
                                                )}

                                            {/* Upload Progress */}
                                            {isDocumentUploading &&
                                                uploadingDocId === doc.id && (
                                                    <View style={styles.uploadProgressWrapper}>

                                                        <View style={styles.uploadProgressHeader}>
                                                            <Text style={styles.uploadProgressText}>
                                                                Uploading...
                                                            </Text>

                                                            <Text style={styles.uploadProgressPercentage}>
                                                                {documentUploadProgress}%
                                                            </Text>
                                                        </View>

                                                        <View style={styles.uploadProgressBar}>
                                                            <View
                                                                style={[
                                                                    styles.uploadProgressFill,
                                                                    {
                                                                        width: `${documentUploadProgress}%`,
                                                                    },
                                                                ]}
                                                            />
                                                        </View>

                                                    </View>
                                                )}

                                        </View>
                                    </View>

                                    <View style={styles.documentRight}>

                                        {isDocumentUploading &&
                                            uploadingDocId === doc.id ? (
                                            <ActivityIndicator
                                                size="small"
                                                color="#FF8C00"
                                            />
                                        ) : (
                                            <>
                                                {doc.verified && (
                                                    <View style={styles.verifiedBadge}>
                                                        <Image
                                                            source={require('../../asset/checked.png')}
                                                            style={{
                                                                width: 20,
                                                                height: 20,
                                                                tintColor: '#4CAF50',
                                                            }}
                                                        />
                                                    </View>
                                                )}

                                                <Image
                                                    source={require('../../asset/arrow-forward.png')}
                                                    style={{
                                                        width: 16,
                                                        height: 16,
                                                        tintColor: '#999',
                                                        resizeMode: 'contain',
                                                    }}
                                                />
                                            </>
                                        )}

                                    </View>

                                </TouchableOpacity>
                            ))}
                        </Animated.View>

                        {/* Add Skill Modal */}
                        <Modal
                            visible={showAddSkill}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setShowAddSkill(false)}
                        >
                            <TouchableOpacity
                                style={styles.modalOverlay}
                                activeOpacity={1}
                                onPress={() => setShowAddSkill(false)}
                            >
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Add New Skill</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Enter skill name"
                                        placeholderTextColor="#999"
                                        value={newSkill}
                                        onChangeText={setNewSkill}
                                        autoFocus
                                    />
                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity
                                            style={[styles.modalButton, styles.modalCancelButton]}
                                            onPress={() => setShowAddSkill(false)}
                                        >
                                            <Text style={styles.modalCancelText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.modalButton, styles.modalAddButton]}
                                            onPress={handleAddSkill}
                                        >
                                            <Text style={styles.modalAddText}>Add Skill</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Modal>

                        {/* Experience Selection Modal */}
                        <Modal
                            visible={showExperienceModal}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setShowExperienceModal(false)}
                        >
                            <TouchableOpacity
                                style={styles.modalOverlay}
                                activeOpacity={1}
                                onPress={() => setShowExperienceModal(false)}
                            >
                                <View style={styles.experienceModalContent}>
                                    <View style={styles.experienceModalHeader}>
                                        <Text style={styles.experienceModalTitle}>Select Experience</Text>
                                        <Text style={styles.experienceModalSubtitle}>
                                            How many years of experience do you have?
                                        </Text>
                                    </View>

                                    <View style={styles.experienceGrid}>
                                        {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '10+'].map((year) => (
                                            <TouchableOpacity
                                                key={year}
                                                style={[
                                                    styles.experienceOption,
                                                    experienceYears === year && styles.experienceOptionSelected,
                                                ]}
                                                onPress={() => {
                                                    updateExperience(year);
                                                }}
                                            >
                                                <Text style={[
                                                    styles.experienceOptionText,
                                                    experienceYears === year && styles.experienceOptionTextSelected,
                                                ]}>
                                                    {year}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <TouchableOpacity
                                        style={styles.experienceCancelButton}
                                        onPress={() => setShowExperienceModal(false)}
                                    >
                                        <Text style={styles.experienceCancelText}>Cancel</Text>
                                    </TouchableOpacity>



                                </View>
                            </TouchableOpacity>


                            {isUpdatingExperience && (
                                <View style={styles.experienceLoadingOverlay}>
                                    <View style={styles.experienceLoadingBox}>

                                        <ActivityIndicator
                                            size="large"
                                            color="#FF8C00"
                                        />

                                        <Text style={styles.experienceLoadingTitle}>
                                            Updating Experience
                                        </Text>

                                        <Text style={styles.experienceLoadingProgress}>
                                            {experienceUploadProgress}%
                                        </Text>

                                        <Text style={styles.experienceLoadingSubtitle}>
                                            Please wait...
                                        </Text>

                                    </View>
                                </View>
                            )}
                        </Modal>

                        {/* Document Modal */}
                        {renderDocumentModal()}
                        {renderRefNumberModal()}
                        {renderSkillBottomSheet()}
                        {renderLocationModal()}
                        {renderImagePickerModal()}
                        {renderUploadOptionsModal()}


                        <Modal
                            visible={isUpdatingDocument}
                            transparent={true}
                            animationType="fade"
                            statusBarTranslucent={true}
                        >
                            <View style={styles.documentLoadingFullScreen}>
                                <View style={styles.experienceLoadingBox}>
                                    <ActivityIndicator
                                        size="large"
                                        color="#FF8C00"
                                    />

                                    <Text style={styles.experienceLoadingTitle}>
                                        Updating Document
                                    </Text>

                                    <Text style={styles.experienceLoadingProgress}>
                                        {documentUploadProgress}%
                                    </Text>

                                    <Text style={styles.experienceLoadingSubtitle}>
                                        Please wait...
                                    </Text>
                                </View>
                            </View>
                        </Modal>


                        <View style={{ height: 20 }} />
                    </Animated.ScrollView>

                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
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
    toolbarPlaceholder: {
        width: 32,
    },
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        marginTop: 20,
        position: 'relative',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    // Profile Image Section
    profileImageSection: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    profileImageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#FF8C00',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    profileImageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    editImageButton: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: '#FF8C00',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginLeft: 4,
    },
    // Completion Card
    completionCard: {
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
    completionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    completionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    completionPercentage: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FF8C00',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#F0F0F0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FF8C00',
        borderRadius: 4,
    },
    completionSubtext: {
        fontSize: 12,
        color: '#888',
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
    // Field
    fieldContainer: {
        marginBottom: 12,
    },
    fieldHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    fieldLabel: {
        fontSize: 13,
        color: '#888',
        fontWeight: '500',
    },
    fieldValue: {
        fontSize: 15,
        color: '#1A1A1A',
        fontWeight: '500',
        paddingVertical: 6,
    },
    fieldInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 15,
        color: '#1A1A1A',
        borderWidth: 1.5,
        borderColor: '#FF8C00',
    },
    editFieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    saveEditButton: {
        backgroundColor: '#FF8C00',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },
    saveEditText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    // Experience
    experienceInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8F9FA',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1.5,
        borderColor: '#FF8C00',
    },
    experienceInputText: {
        fontSize: 15,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    // Skills
    skillsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    addSkillButton: {
        padding: 4,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillItemWrapper: {
        marginBottom: 4,
    },
    skillItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F3',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFE8DC',
        gap: 8,
    },
    skillText: {
        fontSize: 13,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    skillActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    skillActionButton: {
        padding: 2,
    },
    editSkillRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFF8F3',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FF8C00',
    },
    editSkillInput: {
        fontSize: 13,
        color: '#1A1A1A',
        paddingVertical: 4,
        minWidth: 80,
    },
    saveSkillButton: {
        backgroundColor: '#FF8C00',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    saveSkillText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },
    // Documents
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    documentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    documentIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#FFF8F3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    documentName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    documentStatus: {
        fontSize: 12,
        color: '#888',
    },
    documentRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    verifiedBadge: {
        padding: 4,
    },
    // Document Modal
    documentModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 34,
        maxHeight: height * 0.75,
    },
    documentModalHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    documentModalIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFF8F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    documentModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    documentModalStatus: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    documentModalInfo: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    documentModalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    documentModalLabel: {
        fontSize: 13,
        color: '#888',
    },
    documentModalValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    documentModalActions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    documentModalAction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 10,
    },
    uploadAction: {
        backgroundColor: '#FF8C00',
    },
    editAction: {
        backgroundColor: '#0984E3',
    },
    deleteAction: {
        backgroundColor: '#E17055',
    },
    documentModalActionText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    documentModalClose: {
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    documentModalCloseText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#666',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: width * 0.85,
        alignSelf: 'center',
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
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1A1A1A',
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        marginBottom: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        height: 50,
        alignItems: 'center',
    },
    modalCancelButton: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    modalCancelText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '600',
    },
    modalAddButton: {
        backgroundColor: '#FF8C00',
    },
    modalAddText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    // Experience Grid
    experienceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
        marginBottom: 10,
    },
    experienceOption: {
        width: (width * 0.75) / 4 - 10,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#F8F9FA',
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        alignItems: 'center',
    },
    experienceOptionSelected: {
        backgroundColor: '#FFF8F3',
        borderColor: '#FF8C00',
    },
    experienceOptionText: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    experienceOptionTextSelected: {
        color: '#FF8C00',
        fontWeight: '700',
    },

    experienceModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: width * 0.9,
        maxWidth: 400,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    experienceModalHeader: {
        marginBottom: 20,
        alignItems: 'center',
    },
    experienceModalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    experienceModalSubtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 4,
    },
    experienceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
        marginBottom: 20,
    },
    experienceOption: {
        width: (width * 0.8) / 4 - 10,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        borderWidth: 2,
        borderColor: '#E8E8E8',
        alignItems: 'center',
    },
    experienceOptionSelected: {
        backgroundColor: '#FFF8F3',
        borderColor: '#FF8C00',
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    experienceOptionText: {
        fontSize: 16,
        color: '#1A1A1A',
        fontWeight: '600',
    },
    experienceOptionTextSelected: {
        color: '#FF8C00',
        fontWeight: '700',
    },
    experienceCancelButton: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    experienceCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },

    // Document Modal Styles
    documentModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 34,
        maxHeight: height * 0.85,
    },
    documentModalImageContainer: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        position: 'relative',
    },
    documentModalImage: {
        width: '100%',
        height: '100%',
    },
    documentModalImageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
        padding: 12,
    },
    documentModalImageBadge: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    documentModalImageBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    documentModalNoImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#E8E8E8',
        borderStyle: 'dashed',
    },
    documentModalNoImageText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    documentModalHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    documentModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    documentModalStatus: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    documentModalIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    documentModalInfo: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    documentModalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    documentModalLabel: {
        fontSize: 13,
        color: '#888',
    },
    documentModalValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    documentModalActions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    documentModalAction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 10,
    },
    uploadAction: {
        backgroundColor: '#FF8C00',
    },
    editAction: {
        backgroundColor: '#0984E3',
    },
    deleteAction: {
        backgroundColor: '#E17055',
    },
    documentModalActionText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    documentModalClose: {
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    documentModalCloseText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#666',
    },


    refModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: width * 0.9,
        maxWidth: 400,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    refModalHeader: {
        marginBottom: 20,
        alignItems: 'center',
    },
    refModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    refModalSubtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 4,
    },
    refModalInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1A1A1A',
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        marginBottom: 20,
    },
    refModalActions: {
        flexDirection: 'row',
        gap: 10,
    },
    refModalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    refCancelButton: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    refCancelText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    refSaveButton: {
        backgroundColor: '#FF8C00',
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    refSaveText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    bottomSheetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheetContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 20,
        maxHeight: height * 0.85,
    },
    bottomSheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E0E0E0',
        alignSelf: 'center',
        marginBottom: 16,
    },
    bottomSheetHeader: {
        marginBottom: 16,
    },
    bottomSheetTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    bottomSheetSubtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 4,
    },
    bottomSheetCount: {
        alignItems: 'center',
        marginTop: 8,
    },
    bottomSheetCountText: {
        fontSize: 13,
        color: '#FF8C00',
        fontWeight: '600',
    },
    bottomSheetSelectedTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    bottomSheetTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F3',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFE0CC',
        gap: 4,
    },
    bottomSheetTagText: {
        fontSize: 12,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    bottomSheetScroll: {
        maxHeight: height * 0.5,
    },
    bottomSheetGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingBottom: 8,
    },
    bottomSheetSkillItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F8F9FA',
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        flex: 1,
        minWidth: '47%',
    },
    bottomSheetSkillItemSelected: {
        backgroundColor: '#FFF8F3',
        borderColor: '#FF8C00',
    },
    bottomSheetSkillLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    bottomSheetSkillIcon: {
        fontSize: 16,
    },
    bottomSheetSkillText: {
        fontSize: 13,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    bottomSheetSkillTextSelected: {
        color: '#FF8C00',
        fontWeight: '600',
    },
    bottomSheetCheckbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#E8E8E8',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    bottomSheetCheckboxSelected: {
        backgroundColor: '#FF8C00',
        borderColor: '#FF8C00',
    },
    bottomSheetActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    bottomSheetButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomSheetCancelButton: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    bottomSheetCancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },
    bottomSheetSaveButton: {
        backgroundColor: '#FF8C00',
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    bottomSheetSaveText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // Skills Header Actions
    skillsHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    skillHeaderButton: {
        padding: 4,
    },
    noSkillsText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingVertical: 10,
    },
    skillRemoveButton: {
        padding: 2,
    },
    locationModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    locationModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 20,
        maxHeight: height * 0.92,
        position: 'relative',
        overflow: 'hidden',
    },
    locationModalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E0E0E0',
        alignSelf: 'center',
        marginBottom: 12,
    },
    locationModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    locationModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
    },


    locationSuggestionsList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        maxHeight: 150,
        marginBottom: 8,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },
    locationSuggestionItem: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    locationSuggestionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    locationSuggestionAddress: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    locationMapContainer: {
        height: 250,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        backgroundColor: '#F8F9FA',
        marginBottom: 12,
    },
    locationMap: {
        width: '100%',
        height: '100%',
    },
    locationMapLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationMapLoadingText: {
        fontSize: 14,
        color: '#888',
        marginTop: 8,
    },
    locationDetailsCard: {
        backgroundColor: '#FFF8F3',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#FFE0CC',
    },
    locationDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 2,
    },
    locationDetailText: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '500',
        flex: 1,
    },
    locationDetailSubText: {
        fontSize: 12,
        color: '#888',
        flex: 1,
    },
    locationModalActions: {
        flexDirection: 'row',
        gap: 10,
    },
    locationModalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    locationCurrentButton: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
    },
    locationCurrentButtonText: {
        color: '#FF8C00',
        fontSize: 14,
        fontWeight: '600',
    },
    locationSaveButton: {
        backgroundColor: '#FF8C00',
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    locationSaveButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    locationSuggestionsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        maxHeight: 180,
        marginBottom: 8,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        zIndex: 999,
    },
    locationSuggestionsList: {
        maxHeight: 180,
    },
    locationSuggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FFFFFF',
    },
    locationSuggestionIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFF8F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    locationSuggestionTextContainer: {
        flex: 1,
    },
    locationSuggestionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    locationSuggestionAddress: {
        fontSize: 12,
        color: '#888',
        marginTop: 1,
    },

    locationModalScroll: {
        flex: 1,
    },
    locationSearchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        marginBottom: 8,
        zIndex: 1000,
    },
    locationSearchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A1A',
        padding: 0,
        height: 40,
    },

    imagePickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    imagePickerModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 34,
    },
    imagePickerModalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E0E0E0',
        alignSelf: 'center',
        marginBottom: 16,
    },
    imagePickerModalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 4,
    },
    imagePickerModalSubtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginBottom: 20,
    },
    imagePickerOptions: {
        gap: 12,
    },
    imagePickerOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    imagePickerRemoveOption: {
        borderColor: '#FDEDEC',
        backgroundColor: '#FFF5F5',
    },
    imagePickerOptionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    imagePickerOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        flex: 1,
    },
    imagePickerOptionDesc: {
        fontSize: 12,
        color: '#888',
        position: 'absolute',
        left: 76,
        bottom: 10,
    },
    imagePickerOptionArrow: {
        marginLeft: 'auto',
    },
    imagePickerCancelButton: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    imagePickerCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },

    profileLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },

    profileLoadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },

    uploadProgressWrapper: {
        marginTop: 6,
        width: '95%',
    },

    uploadProgressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },

    uploadProgressText: {
        fontSize: 11,
        color: '#888',
        fontWeight: '500',
    },

    uploadProgressPercentage: {
        fontSize: 11,
        color: '#FF8C00',
        fontWeight: '700',
    },

    uploadProgressBar: {
        height: 6,
        backgroundColor: '#EEEEEE',
        borderRadius: 3,
        overflow: 'hidden',
    },

    uploadProgressFill: {
        height: '100%',
        backgroundColor: '#FF8C00',
        borderRadius: 3,
    },

    profileUploadOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 55,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    profileUploadText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        marginTop: 5,
    },


    // Upload Options Modal Styles
    uploadOptionsOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    uploadOptionsContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 34,
    },
    uploadOptionsHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E0E0E0',
        alignSelf: 'center',
        marginBottom: 16,
    },
    uploadOptionsHeader: {
        marginBottom: 20,
        alignItems: 'center',
    },
    uploadOptionsTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    uploadOptionsSubtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 4,
    },
    uploadOptionsContainer: {
        gap: 12,
        marginBottom: 20,
    },
    uploadOptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    uploadOptionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    uploadOptionTextContainer: {
        flex: 1,
    },
    uploadOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    uploadOptionDescription: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    uploadOptionsCancel: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    uploadOptionsCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    experienceLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },

    experienceLoadingBox: {
        width: 220,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 25,
        paddingHorizontal: 20,
        alignItems: 'center',
        elevation: 10,
    },

    experienceLoadingTitle: {
        marginTop: 15,
        fontSize: 17,
        fontWeight: '700',
        color: '#222',
    },

    experienceLoadingProgress: {
        marginTop: 8,
        fontSize: 22,
        fontWeight: '700',
        color: '#FF8C00',
    },

    experienceLoadingSubtitle: {
        marginTop: 5,
        fontSize: 13,
        color: '#777',
    },

    locationLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        backgroundColor: 'rgba(0,0,0,0.45)',

        justifyContent: 'center',
        alignItems: 'center',

        zIndex: 9999,
        elevation: 9999,
    },

    documentLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        elevation: 9999,
    },

    documentLoadingFullScreen: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    skillDoneButton: {
        backgroundColor: '#FF8C00',
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        marginBottom: 10,
    },
    skillDoneButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    skillBottomSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        height: '85%',
    },

    skillSheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    skillSheetTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333333',
    },

    skillSheetClose: {
        fontSize: 22,
        fontWeight: '600',
        color: '#666666',
        padding: 5,
    },

    skillSearchContainer: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        backgroundColor: '#F8F8F8',
        paddingHorizontal: 14,
        justifyContent: 'center',
        marginBottom: 15,
    },

    skillItemSelected: {
        backgroundColor: '#FFF3E6',
        borderColor: '#FF8C00',
    },

    skillCheckmark: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
    skillCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: '#CCCCCC',
        alignItems: 'center',
        justifyContent: 'center',
    },

    skillCheckboxSelected: {
        backgroundColor: '#FF8C00',
        borderColor: '#FF8C00',
    },
    skillSearchInput: {
        flex: 1,
        fontSize: 15,
        color: '#333333',
        paddingVertical: 0,
    },



});

export default ProfileScreen;