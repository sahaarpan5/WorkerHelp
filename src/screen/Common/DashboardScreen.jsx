import AsyncStorage from '@react-native-async-storage/async-storage';
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
    FlatList,
    Modal,
    Alert,
    TouchableWithoutFeedback,
    ImageBackground,
    ActivityIndicator,
} from 'react-native';
import API from '../../util/API';
import Loader from '../../util/Loader';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import MapView, { Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
    // State variables
    const [isOnline, setIsOnline] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState('Dashboard');
    const [rating, setRating] = useState(4.8);
    const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availabilitySchedule, setAvailabilitySchedule] = useState([]);
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [showAllSchedule, setShowAllSchedule] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    // Animation values
    const sidebarAnim = useRef(new Animated.Value(-width * 0.75)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;
    const modalFadeAnim = useRef(new Animated.Value(0)).current;
    const modalSlideAnim = useRef(new Animated.Value(50)).current;
    const statusMenuAnim = useRef(new Animated.Value(0)).current;


    const [profileImage, setProfileImage] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [isNewTaskLoading, setNewTaskLoading] = useState(false);
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [showAllTasks, setShowAllTasks] = useState(false);

    const [partnerLocation, setPartnerLocation] = useState({
        latitude: null,
        longitude: null,
    });


    const [location, setLocation] = useState({
        latitude: null,
        longitude: null,
    });

    const [gender, setGender] = useState('');
    const [selectedUpcomingTask, setSelectedUpcomingTask] = useState(null);
    const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);

    const [latestTaskSeconds, setLatestTaskSeconds] = useState(10);
    const [latestTaskProgress, setLatestTaskProgress] = useState(1);

    const [isAcceptingTask, setIsAcceptingTask] = useState(false);

    const latestTaskTimerRef = useRef(null);
    const latestTaskProgressRef = useRef(null);

    const SHOWN_LATEST_TASKS_KEY = '@homehelp_shown_latest_tasks';

    const [acceptingTaskId, setAcceptingTaskId] = useState(null);

    const [allSchedule, setAllSchedule] = useState([]);


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


    useFocusEffect(
        useCallback(() => {
            const loadDashboard = async () => {
                console.log('===== DASHBOARD LOAD START =====');

                // 1. First fetch profile
                const location = await fetchProfile();
                setLocation(location);

                console.log('Profile Location Received:', location);

                await fetchTodaySchedule(location);

                // 2. After fetchProfile completes, fetch upcoming tasks
                await fetchUpcomingTasks(location);

                console.log('===== DASHBOARD LOAD END =====');
            };

            loadDashboard();
        }, [])
    );


    useEffect(() => {
        return () => {
            if (latestTaskTimerRef.current) {
                clearInterval(
                    latestTaskTimerRef.current
                );
            }

            if (latestTaskProgressRef.current) {
                clearInterval(
                    latestTaskProgressRef.current
                );
            }
        };
    }, []);

    const handleAcceptTask = async (task = selectedUpcomingTask) => {
        if (!task) {
            return;
        }

        const assignmentId =
            task.assignmentId ||
            task.id;

        if (!assignmentId) {
            Alert.alert(
                'Error',
                'Assignment ID is missing.'
            );
            return;
        }

        try {
            // Show loader only for this task
            setAcceptingTaskId(String(assignmentId));
            setIsAcceptingTask(true);

            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert(
                    'Error',
                    'Authentication token not found.'
                );
                return;
            }

            console.log(
                'Accept Assignment ID:',
                assignmentId
            );

            const response = await fetch(
                API.ACCEPT_PARTNER_ASSIGNMENT(assignmentId),
                {
                    method: 'POST',
                    headers: {
                        Accept: '*/*',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            console.log(
                'Accept Assignment Response:',
                data
            );

            if (!response.ok) {
                Alert.alert(
                    'Unable to Accept',
                    data?.message ||
                    'Unable to accept this service.'
                );
                return;
            }

            // Stop timer if this was the latest task
            if (latestTaskTimerRef.current) {
                clearInterval(latestTaskTimerRef.current);
                latestTaskTimerRef.current = null;
            }

            if (latestTaskProgressRef.current) {
                clearInterval(latestTaskProgressRef.current);
                latestTaskProgressRef.current = null;
            }

            // Remove only the accepted task
            setUpcomingTasks(prevTasks =>
                prevTasks.filter(
                    item =>
                        String(
                            item.assignmentId || item.id
                        ) !== String(assignmentId)
                )
            );

            setShowTaskDetailsModal(false);
            setSelectedUpcomingTask(null);
            setLatestTaskSeconds(0);
            setLatestTaskProgress(0);
            fetchTodaySchedule(location);

            Alert.alert(
                'Success',
                data?.message ||
                'Service accepted successfully.'
            );

        } catch (error) {
            console.log(
                'Accept Assignment Error:',
                error
            );

            Alert.alert(
                'Error',
                'Something went wrong while accepting the service.'
            );

        } finally {
            // Hide loader only for this task
            setAcceptingTaskId(null);
            setIsAcceptingTask(false);
        }
    };


    const openTaskDetails = async (task) => {
        // Mark this task as already shown.
        // Therefore it will not automatically appear again.
        await markTaskAsShown(task);

        // Stop any previous timer
        if (latestTaskTimerRef.current) {
            clearInterval(latestTaskTimerRef.current);
            latestTaskTimerRef.current = null;
        }

        if (latestTaskProgressRef.current) {
            clearInterval(latestTaskProgressRef.current);
            latestTaskProgressRef.current = null;
        }

        setSelectedUpcomingTask(task);
        setLatestTaskSeconds(10);
        setLatestTaskProgress(1);
        setShowTaskDetailsModal(true);
    };


    const showLatestTaskModal = async (task) => {
        if (!task) {
            return;
        }

        const taskId = getTaskUniqueId(task);

        if (!taskId) {
            return;
        }

        try {
            const shownTasks = await getShownLatestTasks();

            // Already shown before
            if (shownTasks.includes(taskId)) {
                console.log(
                    'Latest task already shown:',
                    taskId
                );
                return;
            }

            // -----------------------------------------
            // Mark task as shown FIRST
            // -----------------------------------------
            await markTaskAsShown(task);

            // -----------------------------------------
            // Remove this task from Upcoming Tasks
            // -----------------------------------------
            // setUpcomingTasks(prevTasks =>
            //     prevTasks.filter(
            //         item =>
            //             getTaskUniqueId(item) !== taskId
            //     )
            // );

            // -----------------------------------------
            // Stop previous timers
            // -----------------------------------------
            if (latestTaskTimerRef.current) {
                clearInterval(
                    latestTaskTimerRef.current
                );

                latestTaskTimerRef.current = null;
            }

            if (latestTaskProgressRef.current) {
                clearInterval(
                    latestTaskProgressRef.current
                );

                latestTaskProgressRef.current = null;
            }

            // -----------------------------------------
            // Open modal
            // -----------------------------------------
            setSelectedUpcomingTask(task);
            setLatestTaskSeconds(10);
            setLatestTaskProgress(1);
            setShowTaskDetailsModal(true);

            const startTime = Date.now();
            const duration = 10000;

            // -----------------------------------------
            // Countdown
            // -----------------------------------------
            latestTaskTimerRef.current = setInterval(() => {

                const elapsed =
                    Date.now() - startTime;

                const remaining = Math.max(
                    0,
                    duration - elapsed
                );

                const seconds = Math.ceil(
                    remaining / 1000
                );

                setLatestTaskSeconds(seconds);

                if (remaining <= 0) {

                    clearInterval(
                        latestTaskTimerRef.current
                    );

                    latestTaskTimerRef.current = null;

                    setShowTaskDetailsModal(false);
                    setSelectedUpcomingTask(null);
                    setLatestTaskSeconds(0);
                    setLatestTaskProgress(0);
                }

            }, 100);

            // -----------------------------------------
            // Progress
            // -----------------------------------------
            latestTaskProgressRef.current =
                setInterval(() => {

                    const elapsed =
                        Date.now() - startTime;

                    const progress = Math.max(
                        0,
                        1 - elapsed / duration
                    );

                    setLatestTaskProgress(progress);

                    if (progress <= 0) {

                        clearInterval(
                            latestTaskProgressRef.current
                        );

                        latestTaskProgressRef.current = null;
                    }

                }, 50);

        } catch (error) {

            console.log(
                'Show latest task modal error:',
                error
            );
        }
    };

    const closeTaskDetails = () => {
        // Stop automatic countdown
        if (latestTaskTimerRef.current) {
            clearInterval(latestTaskTimerRef.current);
            latestTaskTimerRef.current = null;
        }

        // Stop progress animation
        if (latestTaskProgressRef.current) {
            clearInterval(latestTaskProgressRef.current);
            latestTaskProgressRef.current = null;
        }

        setShowTaskDetailsModal(false);

        setLatestTaskSeconds(0);
        setLatestTaskProgress(0);

        setTimeout(() => {
            setSelectedUpcomingTask(null);
        }, 200);
    };


    const formatTaskDate = (dateString) => {
        if (!dateString) return '—';

        const date = new Date(`${dateString}T00:00:00`);

        if (isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '—';

        const [hours, minutes] = timeString.split(':');

        let hour = parseInt(hours, 10);
        const minute = minutes || '00';

        const period = hour >= 12 ? 'PM' : 'AM';

        hour = hour % 12 || 12;

        return `${hour}:${minute} ${period}`;
    };

    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime) {
            return '—';
        }

        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const startTotalMinutes =
            startHour * 60 + startMinute;

        const endTotalMinutes =
            endHour * 60 + endMinute;

        let difference = endTotalMinutes - startTotalMinutes;

        if (difference < 0) {
            difference += 24 * 60;
        }

        const hours = Math.floor(difference / 60);
        const minutes = difference % 60;

        if (minutes === 0) {
            return `${hours} hr${hours !== 1 ? 's' : ''}`;
        }

        if (hours === 0) {
            return `${minutes} min`;
        }

        return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min`;
    };

    const getTaskLocation = (item) => {
        if (item.addressLine2) {
            return item.addressLine2;
        }

        if (item.city) {
            return item.city;
        }

        if (item.addressLine1) {
            return item.addressLine1;
        }

        return 'Location not available';
    };

    const getServiceIcon = () => {
        return '💼';

    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (
            lat1 == null ||
            lon1 == null ||
            lat2 == null ||
            lon2 == null
        ) {
            return null;
        }

        const R = 6371; // Earth radius in KM

        const dLat = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
        const dLon = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((Number(lat1) * Math.PI) / 180) *
            Math.cos((Number(lat2) * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const getShownLatestTasks = async () => {
        try {
            const stored = await AsyncStorage.getItem(
                SHOWN_LATEST_TASKS_KEY
            );

            if (!stored) {
                return [];
            }

            const parsed = JSON.parse(stored);

            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.log('Get shown latest tasks error:', error);
            return [];
        }
    };


    const getTaskUniqueId = (task) => {
        return String(

            task?.bookingNo ||

            ''
        );
    };



    const markTaskAsShown = async (task) => {
        try {
            const taskId = getTaskUniqueId(task);

            if (!taskId) {
                return;
            }

            const existing = await getShownLatestTasks();

            if (!existing.includes(taskId)) {
                const updated = [
                    ...existing,
                    taskId,
                ];

                await AsyncStorage.setItem(
                    SHOWN_LATEST_TASKS_KEY,
                    JSON.stringify(updated)
                );
            }

            console.log('Task marked as shown:', taskId);

        } catch (error) {
            console.log(
                'Mark task as shown error:',
                error
            );
        }
    };






    const fetchTodaySchedule = async (partnerLocation) => {
        setIsProfileLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                console.log('No token found');
                return;
            }

            const response = await fetch(
                API.PARTNER_ACCEPTED_BOOKING_ASSIGNMENTS,
                {
                    method: 'GET',
                    headers: {
                        Accept: '*/*',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            console.log('Accepted Assignments:', data);

            if (!response.ok) {
                console.log(
                    'Schedule API Error:',
                    data?.message || data
                );
                setAllSchedule([]);
                return;
            }

            if (!Array.isArray(data)) {
                setAllSchedule([]);
                return;
            }

            // Current date in yyyy-MM-dd format
            const today = new Date();

            const currentDate = [
                today.getFullYear(),
                String(today.getMonth() + 1).padStart(2, '0'),
                String(today.getDate()).padStart(2, '0'),
            ].join('-');

            const todaySchedule = (Array.isArray(data) ? data : [])
                .filter(item => item?.serviceDate === currentDate)
                .map(item => {
                    const startTime = item.startTime || '';
                    const endTime = item.endTime || '';

                    const showstartTime = formatTime(item.startTime);
                    const showendTime = formatTime(item.endTime);

                    // Calculate duration in hours
                    let hours = 0;

                    if (startTime && endTime) {
                        const [startHour, startMinute] = startTime
                            .split(':')
                            .map(Number);

                        const [endHour, endMinute] = endTime
                            .split(':')
                            .map(Number);

                        const startMinutes = startHour * 60 + startMinute;
                        let endMinutes = endHour * 60 + endMinute;

                        // Handle services that finish after midnight
                        if (endMinutes < startMinutes) {
                            endMinutes += 24 * 60;
                        }

                        hours = Number(
                            ((endMinutes - startMinutes) / 60).toFixed(2)
                        );
                    }


                    const distance = calculateDistance(
                        partnerLocation?.latitude,
                        partnerLocation?.longitude,
                        item.latitude,
                        item.longitude
                    );

                    return {
                        ...item,
                        id: item.bookingDetailId,
                        assignmentId: item.assignmentId,
                        bookingNo: item.bookingNo || '',
                        serviceName: item.serviceName || 'Service',
                        serviceStatus: item.serviceStatus || 'Upcoming',
                        customerName: item.customerName || 'Customer',
                        customerPhone: item.customerPhone || '',
                        customerId: item.customerId || '',
                        rate: Number(item.rate) || 0,
                        icon: getServiceIcon(),

                        address: [
                            item.addressLine1,
                            item.addressLine2,
                            item.city,
                            item.state,
                            item.postalCode,
                        ]
                            .filter(Boolean)
                            .join(', '),



                        time: `${showstartTime || '--:--'} - ${showendTime || '--:--'
                            }`,

                        hours,
                        latitude:
                            item.latitude != null ? Number(item.latitude) : null,
                        longitude:
                            item.longitude != null ? Number(item.longitude) : null,

                        distance:
                            distance !== null
                                ? `${distance.toFixed(1)} km`
                                : '—',
                    };
                });

            setAllSchedule(todaySchedule);

        } catch (error) {
            console.log(
                'Fetch Today Schedule Error:',
                error
            );

            setAllSchedule([]);
        }
        finally {
            setIsProfileLoading(false);
        }
    };


    const fetchUpcomingTasks = async (partnerLocation) => {
        try {
            setIsProfileLoading(true);

            const token = await AsyncStorage.getItem('token');

            if (!token) {
                console.log('No token found');
                return;
            }

            const response = await fetch(API.PARTNER_BOOKING_ASSIGNMENTS, {
                method: 'GET',
                headers: {
                    Accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            console.log('Booking Assignments API Response:', data);

            if (!response.ok) {
                Alert.alert(
                    'Error',
                    data?.message || 'Unable to fetch booking assignments.'
                );
                return;
            }

            if (!Array.isArray(data)) {
                console.log('Unexpected assignments response:', data);
                setUpcomingTasks([]);
                return;
            }

            const mappedTasks = data
                .filter(item => item?.status?.toLowerCase() === 'pending')
                .map((item, index) => {

                    const startTime = formatTime(item.startTime);
                    const endTime = formatTime(item.endTime);

                    const distance = calculateDistance(
                        partnerLocation?.latitude,
                        partnerLocation?.longitude,
                        item.latitude,
                        item.longitude
                    );

                    return {
                        id: item.assignmentId || index.toString(),

                        assignmentId: item.assignmentId,
                        bookingNo: item.bookingNo,

                        title: item.serviceName || 'Service',

                        date: formatTaskDate(item.serviceDate),

                        time: startTime,

                        duration: calculateDuration(
                            item.startTime,
                            item.endTime
                        ),

                        client: item.customerName || 'Customer',

                        location: getTaskLocation(item),

                        distance:
                            distance !== null
                                ? `${distance.toFixed(1)} km`
                                : '—',

                        icon: getServiceIcon(),

                        status: item.status?.toLowerCase() || 'pending',

                        rate: item.rate || 0,

                        serviceNotes: item.serviceNotes || '',

                        addressLine1: item.addressLine1 || '',
                        addressLine2: item.addressLine2 || '',
                        city: item.city || '',
                        state: item.state || '',
                        postalCode: item.postalCode || '',

                        latitude: item.latitude,
                        longitude: item.longitude,

                        customerPhone: item.customerPhone || '',

                        startTime: item.startTime,
                        endTime: item.endTime,

                        isLatest: item.isLatest,
                    };
                });

            setUpcomingTasks(mappedTasks);
            const shownTasks = await getShownLatestTasks();

            console.log(
                'Previously shown tasks:',
                shownTasks
            );

            // Find latest task which has NOT been shown
            const latestUnseenTask = mappedTasks.find(task => {

                const taskId = getTaskUniqueId(task);

                return (
                    (
                        task.isLatest === true ||
                        task.isLatest === 'true'
                    ) &&
                    !shownTasks.includes(taskId)
                );
            });

            // Remove already shown services from Upcoming Tasks
            const visibleUpcomingTasks = mappedTasks.filter(task => {

                const taskId = getTaskUniqueId(task);

                return !shownTasks.includes(taskId);
            });

            // Show only unseen services
            // setUpcomingTasks(visibleUpcomingTasks);

            // Show latest unseen service in popup
            if (latestUnseenTask) {
                await showLatestTaskModal(latestUnseenTask);
            }

        } catch (error) {
            console.log('Fetch Upcoming Tasks Error:', error);

            Alert.alert(
                'Error',
                'Something went wrong while loading new task requests.'
            );

            setUpcomingTasks([]);
        } finally {
            setIsProfileLoading(false);
        }
    };


    const fetchNewTasks = async (partnerLocation) => {
        try {
            setNewTaskLoading(true);

            const token = await AsyncStorage.getItem('token');

            if (!token) {
                console.log('No token found');
                return;
            }

            const response = await fetch(API.PARTNER_BOOKING_ASSIGNMENTS, {
                method: 'GET',
                headers: {
                    Accept: '*/*',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            console.log('Booking Assignments API Response:', data);

            if (!response.ok) {
                Alert.alert(
                    'Error',
                    data?.message || 'Unable to fetch booking assignments.'
                );
                return;
            }

            if (!Array.isArray(data)) {
                console.log('Unexpected assignments response:', data);
                setUpcomingTasks([]);
                return;
            }

            const mappedTasks = data
                .filter(item => item?.status?.toLowerCase() === 'pending')
                .map((item, index) => {

                    const startTime = formatTime(item.startTime);
                    const endTime = formatTime(item.endTime);

                    const distance = calculateDistance(
                        partnerLocation?.latitude,
                        partnerLocation?.longitude,
                        item.latitude,
                        item.longitude
                    );

                    return {
                        id: item.assignmentId || index.toString(),

                        assignmentId: item.assignmentId,
                        bookingNo: item.bookingNo,

                        title: item.serviceName || 'Service',

                        date: formatTaskDate(item.serviceDate),

                        time: startTime,

                        duration: calculateDuration(
                            item.startTime,
                            item.endTime
                        ),

                        client: item.customerName || 'Customer',

                        location: getTaskLocation(item),

                        distance:
                            distance !== null
                                ? `${distance.toFixed(1)} km`
                                : '—',

                        icon: getServiceIcon(),

                        status: item.status?.toLowerCase() || 'pending',

                        rate: item.rate || 0,

                        serviceNotes: item.serviceNotes || '',

                        addressLine1: item.addressLine1 || '',
                        addressLine2: item.addressLine2 || '',
                        city: item.city || '',
                        state: item.state || '',
                        postalCode: item.postalCode || '',

                        latitude: item.latitude,
                        longitude: item.longitude,

                        customerPhone: item.customerPhone || '',

                        startTime: item.startTime,
                        endTime: item.endTime,

                        isLatest: item.isLatest,
                    };
                });

            setUpcomingTasks(mappedTasks);
            const shownTasks = await getShownLatestTasks();

            console.log(
                'Previously shown tasks:',
                shownTasks
            );

            // Find latest task which has NOT been shown
            const latestUnseenTask = mappedTasks.find(task => {

                const taskId = getTaskUniqueId(task);

                return (
                    (
                        task.isLatest === true ||
                        task.isLatest === 'true'
                    ) &&
                    !shownTasks.includes(taskId)
                );
            });

            // Remove already shown services from Upcoming Tasks
            const visibleUpcomingTasks = mappedTasks.filter(task => {

                const taskId = getTaskUniqueId(task);

                return !shownTasks.includes(taskId);
            });

            // Show only unseen services
            // setUpcomingTasks(visibleUpcomingTasks);

            // Show latest unseen service in popup
            if (latestUnseenTask) {
                await showLatestTaskModal(latestUnseenTask);
            }

        } catch (error) {
            console.log('Fetch Upcoming Tasks Error:', error);

            Alert.alert(
                'Error',
                'Something went wrong while loading new task requests.'
            );

            setUpcomingTasks([]);
        } finally {
            setNewTaskLoading(false);
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
            const latitude = Number(data.latitude);
            const longitude = Number(data.longitude);

            const location = {
                latitude,
                longitude,
            };

            console.log(
                'Partner Service Location:',
                location
            );

            setPartnerLocation(location);




            setMobileNumber(
                data.mobileNo
                    ? `+91 ${data.mobileNo}`
                    : ''
            );




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

            return location;

            // -----------------------------
            // Documents
            // -----------------------------

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

    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Check if today is offline
    const isTodayOffline = () => {
        const today = new Date().toDateString();
        return availabilitySchedule.some(item =>
            item.date.toDateString() === today
        );
    };

    // Get current status display
    const getCurrentStatus = () => {
        if (isTodayOffline()) {
            return 'Offline';
        }
        return isOnline ? 'Online' : 'Offline';
    };

    const getCurrentStatusColor = () => {
        if (isTodayOffline()) {
            return '#FF4444';
        }
        return isOnline ? '#4CAF50' : '#FF4444';
    };

    // Check if screen should be dimmed (offline)
    const isOffline = () => {
        return isTodayOffline() || !isOnline;
    };
    const starImages = {
        full: require('../../asset/star-fill.png'),
        half: require('../../asset/star-half.png'),
        empty: require('../../asset/star-outline.png'),
    };

    // User data
    const userData = {
        name: 'Rajesh Kumar',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        rating: 4.8,
        totalJobs: 342,
        totalEarnings: 28450,
        todayEarnings: 1250,
        todayTasks: 4,
        completedTasks: 3,
        assignedJobs: 7,
        pendingJobs: 4,
        completedJobs: 3,
    };

    // Today's Schedule with professional data - ORDERED: In Progress first, then Upcoming, then Completed


    // Sort schedule: In Progress first, then Upcoming, then Completed
    const sortedSchedule = [...allSchedule].sort((a, b) => a.priority - b.priority);

    // Get displayed schedule (max 3 items)
    const getDisplayedSchedule = () => {
        if (showAllSchedule) {
            return sortedSchedule;
        }
        return sortedSchedule.slice(0, 3);
    };

    // Upcoming tasks with date, time, and duration


    // Quick actions
    const quickActions = [
        {
            id: 1,
            label: 'Schedule',
            color: '#FF8C00',
            image: require('../../asset/calendar-outline.png'),
            screen: 'ScheduleScreen',
        },
        {
            id: 2,
            label: 'Earnings',
            color: '#4CAF50',
            image: require('../../asset/growth.png'),
            screen: 'EarningsScreen',
        },
        {
            id: 3,
            label: 'My Wallet',
            color: '#2196F3',
            image: require('../../asset/wallet.png'),
            screen: 'WalletScreen',
        },
        {
            id: 4,
            label: 'Ratings',
            color: '#FFD700',
            image: require('../../asset/star.png'),
            screen: 'RatingsScreen',
        },
    ];



    const navItems = [
        {
            id: 1,
            label: 'Dashboard',
            image: require('../../asset/home.png'),
            screen: 'DashboardScreen',
        },
        {
            id: 2,
            label: 'Profile',
            image: require('../../asset/profile.png'),
            screen: 'ProfileScreen',

        },
        {
            id: 3,
            label: 'Schedule',
            image: require('../../asset/calendar-outline.png'),
            screen: 'ScheduleScreen',

        },
        {
            id: 4,
            label: 'Earnings',
            image: require('../../asset/earnings.png'),
            screen: 'EarningsScreen',
        },

        {
            id: 5,
            label: 'My Wallet',
            image: require('../../asset/wallet.png'),
            screen: 'WalletScreen',
        },
        {
            id: 6,
            label: 'Ratings',
            image: require('../../asset/star.png'),
            screen: 'RatingsScreen',

        },

        {
            id: 7,
            label: 'Settings',
            image: require('../../asset/settings.png'),
            screen: 'SettingsScreen',
        },
        {
            id: 8,
            label: 'Support',
            image: require('../../asset/support.png'),
        },
    ];

    // Generate date options for next 7 days
    const getDateOptions = () => {
        const options = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            options.push({
                label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dateString,
                date: date,
                value: i,
                isToday: i === 0,
            });
        }
        return options;
    };

    const dateOptions = getDateOptions();

    // Toggle sidebar
    const toggleSidebar = () => {
        if (isSidebarOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    };

    const openSidebar = () => {
        setIsSidebarOpen(true);
        Animated.parallel([
            Animated.timing(sidebarAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(overlayAnim, {
                toValue: 0.5,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeSidebar = () => {
        Animated.parallel([
            Animated.timing(sidebarAnim, {
                toValue: -width * 0.75,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(overlayAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => setIsSidebarOpen(false));
    };

    // Status Menu functions
    const toggleStatusMenu = () => {
        setShowStatusMenu(!showStatusMenu);
        if (!showStatusMenu) {
            Animated.timing(statusMenuAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(statusMenuAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    };

    // Availability Modal functions
    const openAvailabilityModal = () => {
        setShowStatusMenu(false);
        setShowAvailabilityModal(true);
        setSelectedDateIndex(0);
        Animated.parallel([
            Animated.timing(modalFadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(modalSlideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeAvailabilityModal = () => {
        Animated.parallel([
            Animated.timing(modalFadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(modalSlideAnim, {
                toValue: 50,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => setShowAvailabilityModal(false));
    };

    const addAvailabilitySchedule = () => {
        const selectedDateObj = dateOptions[selectedDateIndex].date;

        // Check if already scheduled for this date
        const existing = availabilitySchedule.some(item =>
            item.date.toDateString() === selectedDateObj.toDateString()
        );

        if (existing) {
            Alert.alert('Already Scheduled', 'You already have an offline schedule for this date');
            return;
        }

        const newSchedule = {
            id: Date.now(),
            date: selectedDateObj,
            dateString: selectedDateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            status: 'offline',
        };

        setAvailabilitySchedule([...availabilitySchedule, newSchedule]);

        // If scheduling today, update online status
        if (selectedDateObj.toDateString() === new Date().toDateString()) {
            setIsOnline(false);
        }

        Alert.alert('Success', 'Offline schedule added successfully');
        closeAvailabilityModal();
    };

    const removeAvailabilitySchedule = (id) => {
        Alert.alert(
            'Remove Schedule',
            'Are you sure you want to remove this offline schedule?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        const removed = availabilitySchedule.find(item => item.id === id);
                        setAvailabilitySchedule(availabilitySchedule.filter(item => item.id !== id));

                        // If removing today's schedule, set online status back
                        if (removed && removed.date.toDateString() === new Date().toDateString()) {
                            setIsOnline(true);
                        }
                    }
                }
            ]
        );
    };

    // Toggle online/offline status
    const toggleOnlineStatus = () => {
        if (isTodayOffline()) {
            Alert.alert(
                'Scheduled Offline',
                'You have a scheduled offline for today. Would you like to go online anyway?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Go Online',
                        onPress: () => {
                            const todaySchedule = availabilitySchedule.find(item =>
                                item.date.toDateString() === new Date().toDateString()
                            );
                            if (todaySchedule) {
                                removeAvailabilitySchedule(todaySchedule.id);
                            }
                            setIsOnline(true);
                            setShowStatusMenu(false);
                        }
                    }
                ]
            );
        } else {
            setIsOnline(!isOnline);
            setShowStatusMenu(false);
        }
    };

    // Render star rating
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
                        tintColor, // Remove this if your PNGs are already colored
                        resizeMode: 'contain',
                        marginHorizontal: 1,
                    }}
                />
            );
        }
        return stars;
    };

    // Get status color and background
    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed':
                return { bg: '#E8F5E9', text: '#4CAF50', dot: '#4CAF50' };
            case 'in-progress':
                return { bg: '#FFF3E0', text: '#FF8C00', dot: '#FF8C00' };
            case 'upcoming':
                return { bg: '#E3F2FD', text: '#2196F3', dot: '#2196F3' };
            case 'pending':
                return { bg: '#FFF8E1', text: '#FFC107', dot: '#FFC107' };
            default:
                return { bg: '#F5F5F5', text: '#888', dot: '#888' };
        }
    };

    // Render today's schedule item - White Background with Distinct Styles
    const renderScheduleItem = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);
        const isInProgress = item.status === 'in-progress';
        const isCompleted = item.status === 'completed';
        const isUpcoming = item.status === 'upcoming';

        // Different styles based on status
        const getCardStyle = () => {
            if (isInProgress) {
                return {
                    borderColor: '#FF8C00',
                    borderWidth: 2.5,
                    shadowColor: '#FF8C00',
                    shadowOpacity: 0.15,
                    iconBg: '#FF8C00',
                    titleColor: '#E65100',
                    statusBg: '#FFF3E0',
                    statusText: '#FF8C00',
                    leftBorderColor: '#FF8C00',
                };
            } else if (isCompleted) {
                return {
                    borderColor: '#E8E8E8',
                    borderWidth: 1,
                    shadowColor: '#4CAF50',
                    shadowOpacity: 0.05,
                    iconBg: '#4CAF50',
                    titleColor: '#1B5E20',
                    statusBg: '#E8F5E9',
                    statusText: '#4CAF50',
                    leftBorderColor: '#4CAF50',
                };
            } else {
                return {
                    borderColor: '#E8E8E8',
                    borderWidth: 1,
                    shadowColor: '#2196F3',
                    shadowOpacity: 0.05,
                    iconBg: '#2196F3',
                    titleColor: '#0D47A1',
                    statusBg: '#E3F2FD',
                    statusText: '#2196F3',
                    leftBorderColor: '#2196F3',
                };
            }
        };

        const cardStyle = getCardStyle();

        // Icon colors for different details
        const iconColors = {
            client: '#4A90D9',
            time: '#FF6B35',
            location: '#E74C3C',
            distance: '#2ED573',
        };

        return (
            <TouchableOpacity
                onPress={() => {
                    const navigationParams = {
                        id: item.bookingDetailId,
                        assignmentId: item.assignmentId,
                        bookingNo: item.bookingNo,
                        serviceName: item.serviceName,
                        customerName: item.customerName,
                        customerPhone: item.customerPhone,
                        time: item.time,
                        startTime: item.startTime,
                        endTime: item.endTime,
                        hours: item.hours,
                        duration: item.duration,
                        distance: item.distance,
                        location: item.location,
                        addressLine1: item.addressLine1,
                        addressLine2: item.addressLine2,
                        city: item.city,
                        state: item.state,
                        postalCode: item.postalCode,
                        latitude: item.latitude,
                        longitude: item.longitude,
                        rate: item.rate,
                        serviceNotes: item.serviceNotes,
                        serviceDate: item.serviceDate,
                        status: item.status,
                        serviceStatus: item.serviceStatus,
                        customerId:item.customerId,
                        bookingDetailId :item.bookingDetailId,
                    };

                    if (
                        String(item.serviceStatus || '').trim().toLowerCase() ===
                        'completed'
                    ) {
                        navigation.navigate('JobCompletionScreen', navigationParams);
                    } else {
                        // Preserve existing navigation logic
                        navigation.navigate('JobDetailsScreen', navigationParams);
                    }
                }}
                style={[
                    styles.scheduleCard,
                    {
                        backgroundColor: '#FFFFFF',
                        borderColor: cardStyle.borderColor,
                        borderWidth: cardStyle.borderWidth,
                        shadowColor: cardStyle.shadowColor,
                        shadowOpacity: cardStyle.shadowOpacity,
                    },
                    isInProgress && styles.scheduleCardInProgress
                ]}
            >
                {/* Left Border Accent */}
                <View style={[styles.scheduleCardAccent, { backgroundColor: cardStyle.leftBorderColor }]} />


                <View style={[styles.inProgressBadge, { backgroundColor: cardStyle.iconBg }]}>
                    <Text style={styles.inProgressBadgeText}>{item.serviceStatus}</Text>
                </View>


                <View style={styles.scheduleCardHeader}>
                    <View style={[styles.scheduleCardIcon, { backgroundColor: cardStyle.iconBg + '15', borderColor: cardStyle.iconBg }]}>
                        <Text style={styles.scheduleCardIconText}>{item.icon}</Text>
                    </View>
                    <View style={styles.scheduleCardTitleContainer}>
                        <Text style={[styles.scheduleCardTitle, { color: cardStyle.titleColor }]}>
                            {item.serviceName}
                        </Text>
                        <View style={[styles.scheduleCardStatus, { backgroundColor: cardStyle.statusBg }]}>

                            <Image
                                source={require('../../asset/time-outline.png')}
                                style={{
                                    width: 14,
                                    height: 14,
                                    tintColor: iconColors.time,

                                }}
                            />
                            <Text style={styles.scheduleCardDetailText}>{item.time}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.scheduleCardBody}>
                    <View style={styles.scheduleCardDetail}>

                        <Image
                            source={require('../../asset/person-outline.png')}
                            style={{
                                width: 14,
                                height: 14,
                                tintColor: iconColors.client,

                            }}
                        />
                        <Text style={styles.scheduleCardDetailText}>{item.customerName}</Text>
                    </View>


                    <View style={styles.scheduleCardDetail}>

                        <Image
                            source={require('../../asset/hourglass-outline.png')}
                            style={{
                                width: 14,
                                height: 14,
                                tintColor: iconColors.time,

                            }}
                        />
                        <Text style={styles.scheduleCardDetailText}>{item.hours}hrs</Text>
                    </View>

                    <View style={styles.scheduleCardDetail}>

                        <Image
                            source={require('../../asset/navigate-outline.png')}
                            style={{
                                width: 14,
                                height: 14,
                                tintColor: iconColors.location,

                            }}
                        />
                        <Text style={styles.scheduleCardDetailText}>{item.distance}</Text>
                    </View>
                    <View style={styles.scheduleCardDetail}>

                        <Image
                            source={require('../../asset/location-outline.png')}
                            style={{
                                width: 14,
                                height: 14,
                                tintColor: iconColors.location,

                            }}
                        />
                        <Text style={styles.scheduleCardDetailText}>{item.address}</Text>
                    </View>

                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <View
                        style={styles.upcomingDeclineButton}
                        activeOpacity={0.8}

                    >
                        <Text style={styles.upcomingDeclineText}>
                            View Details
                        </Text>


                    </View>
                </View>



            </TouchableOpacity>
        );
    };

    // Render upcoming task item with date, time, and duration
    const renderUpcomingItem = ({ item }) => {
        const cardColors = ['#FFF5F5', '#FFF8F0', '#F0F7FF'];
        const randomColor = cardColors[item.id % 3];

        return (
            <View style={[styles.upcomingCard, { backgroundColor: randomColor }]}>
                <View style={styles.upcomingLeft}>
                    <View style={styles.upcomingIconContainer}>
                        <Text style={styles.upcomingIcon}>{item.icon}</Text>
                    </View>
                    <View style={styles.upcomingInfo}>
                        <Text style={styles.upcomingTitle}>{item.title}</Text>
                        <Text style={styles.upcomingClient}>👤 {item.client}</Text>

                        {/* Date, Time, and Duration Row */}
                        <View style={styles.upcomingDateTimeRow}>
                            <View style={styles.upcomingDateTimeItem}>

                                <Image
                                    source={require('../../asset/calendar-outline.png')}
                                    style={{
                                        width: 11,
                                        height: 11,
                                        tintColor: "#666",

                                    }}
                                />
                                <Text style={styles.upcomingDateTimeText}>{item.date}</Text>
                            </View>
                            <View style={styles.upcomingDateTimeDivider} />
                            <View style={styles.upcomingDateTimeItem}>

                                <Image
                                    source={require('../../asset/time-outline.png')}
                                    style={{
                                        width: 11,
                                        height: 11,
                                        tintColor: "#666",

                                    }}
                                />
                                <Text style={styles.upcomingDateTimeText}>{item.time}</Text>
                            </View>
                            <View style={styles.upcomingDateTimeDivider} />
                            <View style={styles.upcomingDateTimeItem}>

                                <Image
                                    source={require('../../asset/hourglass-outline.png')}
                                    style={{
                                        width: 11,
                                        height: 11,
                                        tintColor: "#666",

                                    }}
                                />
                                <Text style={styles.upcomingDateTimeText}>{item.duration}</Text>
                            </View>
                        </View>

                        <View style={styles.upcomingMetaRow}>
                            <View style={styles.upcomingMetaItem}>

                                <Image
                                    source={require('../../asset/location-outline.png')}
                                    style={{
                                        width: 11,
                                        height: 11,
                                        tintColor: "#888",

                                    }}
                                />
                                <Text style={styles.upcomingMetaText}>{item.location}</Text>
                            </View>
                            <View style={styles.upcomingMetaItem}>
                                <Image
                                    source={require('../../asset/navigate-outline.png')}
                                    style={{
                                        width: 11,
                                        height: 11,
                                        tintColor: "#888",

                                    }}
                                />
                                <Text style={styles.upcomingMetaText}>{item.distance}</Text>
                            </View>
                        </View>

                    </View>
                </View>
                <View style={styles.upcomingActions}>
                    <TouchableOpacity
                        style={styles.upcomingAcceptButton}
                        activeOpacity={0.8}
                        onPress={() => handleAcceptTask(item)}
                        disabled={
                            acceptingTaskId ===
                            String(item.assignmentId || item.id)
                        }
                    >
                        {acceptingTaskId ===
                            String(item.assignmentId || item.id) ? (
                            <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                            />
                        ) : (
                            <Text style={styles.upcomingAcceptText}>
                                Accept
                            </Text>
                        )}
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={styles.upcomingDeclineButton} >
                        <Text style={styles.upcomingDeclineText}>Decline</Text>
                    </TouchableOpacity> */}


                    <TouchableOpacity
                        style={styles.upcomingDeclineButton}
                        activeOpacity={0.8}
                        onPress={() => openTaskDetails(item)}
                    >
                        <Text style={styles.upcomingDeclineText}>
                            View Details
                        </Text>


                    </TouchableOpacity>



                </View>

            </View>
        );
    };


    const renderTaskDetailsModal = () => {
        if (!selectedUpcomingTask) {
            return null;
        }

        const task = selectedUpcomingTask;

        const latitude = Number(task.latitude);
        const longitude = Number(task.longitude);

        const hasCoordinates =
            Number.isFinite(latitude) &&
            Number.isFinite(longitude);

        const fullAddress = [
            task.addressLine1,
            task.addressLine2,
            task.city,
            task.state,
            task.postalCode,
        ]
            .filter(Boolean)
            .join(', ');

        return (
            <Modal
                visible={showTaskDetailsModal}
                transparent
                animationType="slide"
                onRequestClose={closeTaskDetails}
            >
                <View style={styles.taskDetailsOverlay}>

                    <View style={styles.taskDetailsModal}>

                        {/* Auto Close Countdown */}
                        {task.isLatest && (
                            <View style={styles.latestTaskAlertContainer}>

                                <View style={styles.latestTaskAlertHeader}>
                                    <View style={styles.latestTaskAlertTitleRow}>
                                        <View style={styles.latestTaskLiveDot} />

                                        <Text style={styles.latestTaskAlertTitle}>
                                            New Job Request
                                        </Text>
                                    </View>

                                    <Text style={styles.latestTaskCountdown}>
                                        {latestTaskSeconds}s
                                    </Text>
                                </View>

                                <View style={styles.latestTaskProgressTrack}>
                                    <View
                                        style={[
                                            styles.latestTaskProgressBar,
                                            {
                                                width: `${latestTaskProgress * 100}%`,
                                            },
                                        ]}
                                    />
                                </View>

                                <Text style={styles.latestTaskAlertSubtitle}>
                                    This request will close automatically
                                </Text>
                            </View>
                        )}

                        {/* Header */}
                        <View style={styles.taskDetailsHeader}>

                            <View style={styles.taskDetailsHeaderLeft}>
                                <View style={styles.taskDetailsIconContainer}>
                                    <Text style={styles.taskDetailsIcon}>
                                        {task.icon || '🏠'}
                                    </Text>
                                </View>

                                <View style={styles.taskDetailsHeaderInfo}>
                                    <Text
                                        style={styles.taskDetailsTitle}
                                        numberOfLines={1}
                                    >
                                        {task.serviceName || task.title}
                                    </Text>

                                    <Text style={styles.taskDetailsBookingNo}>
                                        Booking #{task.bookingNo || '—'}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.taskDetailsCloseButton}
                                onPress={closeTaskDetails}
                            >
                                <Image
                                    source={require('../../asset/close.png')}
                                    style={styles.taskDetailsCloseIcon}
                                />
                            </TouchableOpacity>

                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={
                                styles.taskDetailsScrollContent
                            }
                        >

                            {/* Customer */}
                            <View style={styles.taskDetailsSection}>

                                <Text style={styles.taskDetailsSectionTitle}>
                                    Customer Details
                                </Text>

                                <View style={styles.taskDetailRow}>

                                    <View style={styles.taskDetailIconBox}>
                                        <Image
                                            source={require('../../asset/person-outline.png')}
                                            style={styles.taskDetailIcon}
                                        />
                                    </View>

                                    <View style={styles.taskDetailTextContainer}>
                                        <Text style={styles.taskDetailLabel}>
                                            Customer Name
                                        </Text>

                                        <Text style={styles.taskDetailValue}>
                                            {task.client || '—'}
                                        </Text>
                                    </View>

                                </View>

                            </View>

                            {/* Service Details */}
                            <View style={styles.taskDetailsSection}>

                                <Text style={styles.taskDetailsSectionTitle}>
                                    Service Details
                                </Text>

                                <View style={styles.taskDetailsGrid}>

                                    <View style={styles.taskDetailGridItem}>
                                        <Text style={styles.taskDetailLabel}>
                                            Service
                                        </Text>

                                        <Text style={styles.taskDetailValue}>
                                            {task.title || '—'}
                                        </Text>
                                    </View>

                                    <View style={styles.taskDetailGridItem}>
                                        <Text style={styles.taskDetailLabel}>
                                            Rate
                                        </Text>

                                        <Text
                                            style={[
                                                styles.taskDetailValue,
                                                styles.taskRateValue,
                                            ]}
                                        >
                                            ₹{Number(task.rate || 0).toLocaleString()}
                                        </Text>
                                    </View>

                                </View>

                            </View>

                            {/* Schedule */}
                            <View style={styles.taskDetailsSection}>

                                <Text style={styles.taskDetailsSectionTitle}>
                                    Schedule
                                </Text>


                                <View style={[styles.taskDetailsTimeCard, { marginBottom: 5 }]}>

                                    <View style={styles.taskTimeItem}>

                                        <View style={styles.taskTimeIconBox}>
                                            <Image
                                                source={require('../../asset/time-outline.png')}
                                                style={styles.taskTimeIcon}
                                            />
                                        </View>

                                        <View>
                                            <Text style={styles.taskDetailLabel}>
                                                Date
                                            </Text>

                                            <Text style={styles.taskTimeValue}>
                                                {task.date}
                                            </Text>
                                        </View>

                                    </View>





                                </View>

                                <View style={styles.taskDetailsTimeCard}>

                                    <View style={styles.taskTimeItem}>

                                        <View style={styles.taskTimeIconBox}>
                                            <Image
                                                source={require('../../asset/time-outline.png')}
                                                style={styles.taskTimeIcon}
                                            />
                                        </View>

                                        <View>
                                            <Text style={styles.taskDetailLabel}>
                                                Start Time
                                            </Text>

                                            <Text style={styles.taskTimeValue}>
                                                {formatTime(task.startTime)}
                                            </Text>
                                        </View>

                                    </View>

                                    <View style={styles.taskTimeDivider} />

                                    <View style={styles.taskTimeItem}>

                                        <View style={styles.taskTimeIconBox}>
                                            <Image
                                                source={require('../../asset/time-outline.png')}
                                                style={styles.taskTimeIcon}
                                            />
                                        </View>

                                        <View>
                                            <Text style={styles.taskDetailLabel}>
                                                End Time
                                            </Text>

                                            <Text style={styles.taskTimeValue}>
                                                {formatTime(task.endTime)}
                                            </Text>
                                        </View>

                                    </View>

                                </View>

                            </View>

                            {/* Address */}
                            <View style={styles.taskDetailsSection}>

                                <Text style={styles.taskDetailsSectionTitle}>
                                    Service Address
                                </Text>

                                <View style={styles.addressCard}>

                                    <View style={styles.addressIconBox}>
                                        <Image
                                            source={require('../../asset/location-outline.png')}
                                            style={styles.addressIcon}
                                        />
                                    </View>

                                    <Text style={styles.addressText}>
                                        {fullAddress || 'Address not available'}
                                    </Text>

                                </View>

                            </View>

                            {/* Map */}
                            <View style={styles.taskDetailsSection}>

                                <View style={styles.mapHeader}>
                                    <Text style={styles.taskDetailsSectionTitle}>
                                        Service Location
                                    </Text>

                                    {hasCoordinates && (
                                        <Text style={styles.coordinateText}>
                                            {latitude.toFixed(6)}, {longitude.toFixed(6)}
                                        </Text>
                                    )}
                                </View>

                                {hasCoordinates ? (
                                    <View style={styles.taskMapContainer}>

                                        <MapView
                                            style={styles.taskMap}
                                            initialRegion={{
                                                latitude,
                                                longitude,
                                                latitudeDelta: 0.008,
                                                longitudeDelta: 0.008,
                                            }}
                                            scrollEnabled={true}
                                            zoomEnabled={true}
                                            rotateEnabled={false}
                                            pitchEnabled={false}
                                        >
                                            <Marker
                                                coordinate={{
                                                    latitude,
                                                    longitude,
                                                }}
                                                title={
                                                    task.customerName ||
                                                    'Customer Location'
                                                }
                                                description={
                                                    task.addressLine1 ||
                                                    task.serviceName ||
                                                    'Service Location'
                                                }
                                            />
                                        </MapView>

                                    </View>
                                ) : (
                                    <View style={styles.noMapContainer}>
                                        <Image
                                            source={require('../../asset/location-outline.png')}
                                            style={styles.noMapIcon}
                                        />

                                        <Text style={styles.noMapText}>
                                            Location coordinates are not available
                                        </Text>
                                    </View>
                                )}

                            </View>

                            <View style={styles.taskModalActions}>



                                <TouchableOpacity
                                    style={styles.taskModalAcceptButton}
                                    activeOpacity={0.85}
                                    onPress={() => handleAcceptTask(selectedUpcomingTask)}
                                    disabled={
                                        acceptingTaskId ===
                                        String(
                                            selectedUpcomingTask?.assignmentId ||
                                            selectedUpcomingTask?.id ||
                                            ''
                                        )
                                    }
                                >
                                    {acceptingTaskId ===
                                        String(
                                            selectedUpcomingTask?.assignmentId ||
                                            selectedUpcomingTask?.id ||
                                            ''
                                        ) ? (
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <ActivityIndicator
                                                size="small"
                                                color="#FFFFFF"
                                            />

                                            <Text
                                                style={[
                                                    styles.taskModalAcceptButtonText,
                                                    { marginLeft: 8 },
                                                ]}
                                            >
                                                Accepting...
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.taskModalAcceptButtonText}>
                                            Accept Job
                                        </Text>
                                    )}
                                </TouchableOpacity>

                            </View>

                            {/* Bottom close button */}


                        </ScrollView>

                    </View>

                </View>
            </Modal>
        );
    };

    // Render Status Menu
    const renderStatusMenu = () => {
        const isOfflineStatus = isTodayOffline() || !isOnline;

        return (
            <Modal
                visible={showStatusMenu}
                transparent
                animationType="none"
                onRequestClose={() => setShowStatusMenu(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowStatusMenu(false)}>
                    <View style={styles.statusMenuOverlay}>
                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={[
                                    styles.statusMenuContainer,
                                    {
                                        opacity: statusMenuAnim,
                                        transform: [{
                                            scale: statusMenuAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.9, 1],
                                            })
                                        }]
                                    }
                                ]}
                            >
                                <View style={styles.statusMenuHeader}>
                                    <Text style={styles.statusMenuTitle}>Working Status</Text>
                                    <TouchableOpacity onPress={() => setShowStatusMenu(false)}>

                                        <Image
                                            source={require('../../asset/close.png')}
                                            style={{
                                                width: 24,
                                                height: 24,
                                                tintColor: "#666",

                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.statusMenuCurrent}>
                                    <Text style={styles.statusMenuCurrentLabel}>Current Status</Text>
                                    <View style={[styles.statusMenuCurrentBadge, { backgroundColor: isOfflineStatus ? '#FFEBEE' : '#E8F5E9' }]}>
                                        <View style={[styles.statusDot, { backgroundColor: isOfflineStatus ? '#FF4444' : '#4CAF50' }]} />
                                        <Text style={[styles.statusMenuCurrentText, { color: isOfflineStatus ? '#FF4444' : '#4CAF50' }]}>
                                            {isOfflineStatus ? 'Offline' : 'Online'}
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.statusMenuButton}
                                    onPress={toggleOnlineStatus}
                                >

                                    <Image
                                        source={
                                            isOfflineStatus
                                                ? require('../../asset/wifi.png')
                                                : require('../../asset/wifi-off.png')
                                        }
                                        style={{
                                            width: 20,
                                            height: 20,
                                            tintColor: '#FF8C00', // Remove if your PNGs are already orange
                                            resizeMode: 'contain',
                                        }}
                                    />
                                    <Text style={styles.statusMenuButtonText}>
                                        {isOfflineStatus ? 'Go Online' : 'Go Offline'}
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.statusMenuDivider} />

                                <TouchableOpacity
                                    style={styles.statusMenuSchedule}
                                    onPress={openAvailabilityModal}
                                >
                                    <View style={styles.statusMenuScheduleHeader}>

                                        <Image
                                            source={require('../../asset/calendar-outline.png')}
                                            style={{
                                                width: 20,
                                                height: 20,
                                                tintColor: "#FF8C00",

                                            }}
                                        />
                                        <Text style={styles.statusMenuScheduleTitle}>Schedule Offline</Text>
                                    </View>
                                    <Text style={styles.statusMenuScheduleSubtitle}>
                                        Set specific dates when you'll be unavailable
                                    </Text>
                                    {availabilitySchedule.length > 0 && (
                                        <View style={styles.statusMenuScheduleList}>
                                            {availabilitySchedule.map((item) => (
                                                <View key={item.id} style={styles.statusMenuScheduleItem}>
                                                    <Text style={styles.statusMenuScheduleDate}>{item.dateString}</Text>
                                                    <TouchableOpacity onPress={() => removeAvailabilitySchedule(item.id)}>

                                                        <Image
                                                            source={require('../../asset/close.png')}
                                                            style={{
                                                                width: 18,
                                                                height: 18,
                                                                tintColor: "#FF4444",

                                                            }}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    };

    // Render sidebar
    const renderSidebar = () => {
        const statusText = getCurrentStatus();
        const statusColor = getCurrentStatusColor();

        return (
            <>
                <Animated.View
                    style={[
                        styles.sidebarOverlay,
                        {
                            opacity: overlayAnim,
                            pointerEvents: isSidebarOpen ? 'auto' : 'none',
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.overlayTouch}
                        activeOpacity={1}
                        onPress={closeSidebar}
                    />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.sidebar,
                        {
                            transform: [{ translateX: sidebarAnim }],
                        },
                    ]}
                >
                    <View style={styles.sidebarHeader}>
                        <View style={styles.sidebarProfile}>
                            <Image source={
                                profileImage
                                    ? { uri: profileImage }
                                    : getGenderImage(gender)
                            } style={styles.sidebarAvatar} />
                            <View style={styles.sidebarUserInfo}>
                                <Text style={styles.sidebarUserName}>{firstName} {lastName}</Text>
                                <TouchableOpacity
                                    style={styles.sidebarStatus}
                                    onPress={() => {
                                        closeSidebar();
                                        setTimeout(() => setShowStatusMenu(true), 300);
                                    }}
                                >
                                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                                    <Text style={styles.sidebarStatusText}>{statusText}</Text>

                                    <Image
                                        source={require('../../asset/chevron-down.png')}
                                        style={{
                                            width: 14,
                                            height: 14,
                                            tintColor: "#888",

                                        }}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity onPress={toggleSidebar} style={styles.sidebarClose}>

                            <Image
                                source={require('../../asset/close.png')}
                                style={{
                                    width: 24,
                                    height: 24,
                                    tintColor: "#666",

                                }}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sidebarStats}>
                        <View style={styles.sidebarStat}>
                            <Text style={styles.sidebarStatValue}>₹{userData.totalEarnings.toLocaleString()}</Text>
                            <Text style={styles.sidebarStatLabel}>Total Earned</Text>
                        </View>
                        <View style={styles.sidebarStatDivider} />
                        <View style={styles.sidebarStat}>
                            <Text style={styles.sidebarStatValue}>{userData.totalJobs}</Text>
                            <Text style={styles.sidebarStatLabel}>Jobs Done</Text>
                        </View>
                        <View style={styles.sidebarStatDivider} />
                        <View style={styles.sidebarStat}>
                            <Text style={styles.sidebarStatValue}>{userData.rating}</Text>
                            <Text style={styles.sidebarStatLabel}>Rating</Text>
                        </View>
                    </View>

                    <View style={styles.sidebarNav}>
                        {navItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.sidebarNavItem,
                                    selectedTab === item.label && styles.sidebarNavItemActive,

                                ]}
                                onPress={() => {
                                    setSelectedTab(item.label);
                                    closeSidebar();
                                    navigation.navigate(item.screen);
                                }}
                            >
                                <Image
                                    source={item.image}
                                    style={{
                                        width: 22,
                                        height: 22,
                                        tintColor: selectedTab === item.label ? '#FF8C00' : '#666',
                                        resizeMode: 'contain',
                                    }}
                                />
                                <Text
                                    style={[
                                        styles.sidebarNavLabel,
                                        selectedTab === item.label && styles.sidebarNavLabelActive,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                                {item.label === 'Schedule' && availabilitySchedule.length > 0 && (
                                    <View style={styles.sidebarBadge}>
                                        <Text style={styles.sidebarBadgeText}>{availabilitySchedule.length}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.sidebarFooter}>
                        <TouchableOpacity style={styles.sidebarLogout} onPress={() => {
                            navigation.replace('LoginScreen');
                        }}>

                            <Image
                                source={require('../../asset/log-out.png')}
                                style={{
                                    width: 22,
                                    height: 22,
                                    tintColor: "#FF4444",

                                }}
                            />
                            <Text style={styles.sidebarLogoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </>
        );
    };

    // Render Availability Modal
    const renderAvailabilityModal = () => (
        <Modal
            visible={showAvailabilityModal}
            transparent
            animationType="none"
            onRequestClose={closeAvailabilityModal}
        >
            <TouchableWithoutFeedback onPress={closeAvailabilityModal}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.modalContent,
                                {
                                    opacity: modalFadeAnim,
                                    transform: [{ translateY: modalSlideAnim }]
                                }
                            ]}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Set Offline Schedule</Text>
                                <TouchableOpacity onPress={closeAvailabilityModal}>

                                    <Image
                                        source={require('../../asset/close.png')}
                                        style={{
                                            width: 24,
                                            height: 24,
                                            tintColor: "#666",

                                        }}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalBody}>
                                <Text style={styles.modalLabel}>Select Date</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.dateOptionsScroll}
                                >
                                    {dateOptions.map((option, index) => {
                                        const isScheduled = availabilitySchedule.some(item =>
                                            item.date.toDateString() === option.date.toDateString()
                                        );
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.dateOptionButton,
                                                    selectedDateIndex === index && styles.dateOptionButtonActive,
                                                    isScheduled && styles.dateOptionButtonScheduled,
                                                ]}
                                                onPress={() => setSelectedDateIndex(index)}
                                                disabled={isScheduled}
                                            >
                                                <Text style={[
                                                    styles.dateOptionButtonText,
                                                    selectedDateIndex === index && styles.dateOptionButtonTextActive,
                                                    isScheduled && styles.dateOptionButtonTextScheduled,
                                                ]}>
                                                    {option.label}
                                                    {isScheduled && ' 📅'}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>

                                <View style={styles.modalInfo}>

                                    <Image
                                        source={require('../../asset/information-circle.png')}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            tintColor: "#FF8C00",

                                        }}
                                    />
                                    <Text style={styles.modalInfoText}>
                                        You won't receive new job requests on this date
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={addAvailabilitySchedule}
                                >
                                    <Text style={styles.modalButtonText}>Add Offline Schedule</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    const displayedSchedule = getDisplayedSchedule();
    const hasMoreItems = sortedSchedule.length > 3;
    const isOfflineStatus = isOffline();

    return (
        <SafeAreaView style={[styles.safeArea, isOfflineStatus && styles.safeAreaOffline]}>
            <StatusBar barStyle="dark-content" backgroundColor={isOfflineStatus ? '#F0F0F0' : '#FFFFFF'} />


            {isProfileLoading ? (

                <Loader />
            ) : (
                <>
                    {/* Status Menu */}
                    {renderStatusMenu()}

                    {/* Sidebar */}
                    {renderSidebar()}

                    {/* Availability Modal */}
                    {renderAvailabilityModal()}


                    {renderTaskDetailsModal()}

                    {/* Main Content */}
                    <ScrollView
                        style={[styles.mainContent, isOfflineStatus && styles.mainContentOffline]}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[styles.scrollContent, isOfflineStatus && styles.scrollContentOffline]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>

                                <Image
                                    source={require('../../asset/menu.png')}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        tintColor: "#1A1A1A",

                                    }}
                                />
                            </TouchableOpacity>
                            <View style={styles.headerRight}>
                                <TouchableOpacity style={styles.notificationButton}>

                                    <Image
                                        source={require('../../asset/notifications.png')}
                                        style={{
                                            width: 24,
                                            height: 24,
                                            tintColor: "#1A1A1A",

                                        }}
                                    />
                                    <View style={styles.notificationBadge} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Greeting and Status with Menu */}
                        <View style={styles.greetingContainer}>
                            <View>
                                <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
                                <Text style={styles.userName}>{firstName} {lastName}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.statusContainer, isOfflineStatus && styles.statusContainerOffline]}
                                onPress={toggleStatusMenu}
                            >
                                <View style={[styles.statusDot, { backgroundColor: getCurrentStatusColor() }]} />
                                <Text style={[styles.statusText, isOfflineStatus && styles.statusTextOffline]}>
                                    {getCurrentStatus()}
                                </Text>
                                <Image
                                    source={require('../../asset/chevron-down.png')}
                                    style={{
                                        width: 16,
                                        height: 16,
                                        tintColor: isOfflineStatus ? '#FF4444' : '#888'
                                    }}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Offline Banner */}
                        {isOfflineStatus && (
                            <View style={styles.offlineBanner}>

                                <Image
                                    source={require('../../asset/alert.png')}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        tintColor: "#FF4444",

                                    }}
                                />
                                <Text style={styles.offlineBannerText}>
                                    You are currently offline. Tap the status button to go online.
                                </Text>
                            </View>
                        )}

                        {/* Availability Schedule Summary */}
                        {availabilitySchedule.length > 0 && (
                            <View style={[styles.availabilitySummary, isOfflineStatus && styles.availabilitySummaryOffline]}>
                                <View style={styles.availabilitySummaryHeader}>
                                    <Image
                                        source={require('../../asset/calendar-outline.png')}
                                        style={{
                                            width: 16,
                                            height: 16,
                                            tintColor: "#FF8C00"
                                        }}
                                    />
                                    <Text style={styles.availabilitySummaryTitle}>Offline Schedule</Text>
                                    <TouchableOpacity onPress={openAvailabilityModal}>
                                        <Text style={styles.availabilitySummaryAdd}>+ Add</Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={availabilitySchedule}
                                    keyExtractor={(item) => item.bookingNo.toString()}
                                    renderItem={({ item }) => (
                                        <View style={styles.availabilitySummaryItem}>
                                            <View style={styles.availabilitySummaryItemLeft}>
                                                <View style={styles.availabilitySummaryDot} />
                                                <Text style={styles.availabilitySummaryDate}>{item.dateString}</Text>
                                                {item.date.toDateString() === new Date().toDateString() && (
                                                    <View style={styles.availabilitySummaryToday}>
                                                        <Text style={styles.availabilitySummaryTodayText}>Today</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <TouchableOpacity onPress={() => removeAvailabilitySchedule(item.id)}>

                                                <Image
                                                    source={require('../../asset/close.png')}
                                                    style={{
                                                        width: 20,
                                                        height: 20,
                                                        tintColor: "#FF4444",

                                                    }}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                            </View>
                        )}


                        {/* Weather Forecast */}





                        {/* Today's Summary - Professional Colorful Cards */}







                        <ImageBackground
                            source={require('../../asset/bgclean.png')}
                            style={styles.summaryCardContainer}
                            imageStyle={styles.summaryCardImage}
                        >
                            <View style={styles.summaryCardOverlay}>
                                <Text style={styles.summaryCardTitle}>Today's Summary</Text>
                                <View style={styles.summaryCardGrid}>
                                    {/* Earnings */}
                                    <View style={styles.summaryCardItem}>
                                        <View style={[styles.summaryCardIconContainer, { backgroundColor: '#4CAF50' }]}>
                                            <Image
                                                source={require('../../asset/cash.png')}
                                                style={{
                                                    width: 22,
                                                    height: 22,
                                                    tintColor: "#FFFFFF",
                                                }}
                                            />
                                        </View>
                                        <View style={styles.summaryCardItemContent}>
                                            <Text style={styles.summaryCardItemValue}>₹{userData.todayEarnings}</Text>
                                            <Text style={styles.summaryCardItemLabel}>Earnings</Text>
                                        </View>
                                    </View>

                                    <View style={styles.summaryCardDivider} />

                                    {/* Assigned */}
                                    <View style={styles.summaryCardItem}>
                                        <View style={[styles.summaryCardIconContainer, { backgroundColor: '#FF8C00' }]}>
                                            <Image
                                                source={require('../../asset/briefcase.png')}
                                                style={{
                                                    width: 22,
                                                    height: 22,
                                                    tintColor: "#FFFFFF",
                                                }}
                                            />
                                        </View>
                                        <View style={styles.summaryCardItemContent}>
                                            <Text style={styles.summaryCardItemValue}>{userData.assignedJobs}</Text>
                                            <Text style={styles.summaryCardItemLabel}>Assigned</Text>
                                        </View>
                                    </View>

                                    <View style={styles.summaryCardDivider} />

                                    {/* Completed */}
                                    <View style={styles.summaryCardItem}>
                                        <View style={[styles.summaryCardIconContainer, { backgroundColor: '#4CAF50' }]}>
                                            <Image
                                                source={require('../../asset/check-mark.png')}
                                                style={{
                                                    width: 22,
                                                    height: 22,
                                                    tintColor: "#FFFFFF",
                                                }}
                                            />
                                        </View>
                                        <View style={styles.summaryCardItemContent}>
                                            <Text style={styles.summaryCardItemValue}>{userData.completedJobs}</Text>
                                            <Text style={styles.summaryCardItemLabel}>Completed</Text>
                                        </View>
                                    </View>

                                    <View style={styles.summaryCardDivider} />

                                    {/* Pending */}
                                    <View style={styles.summaryCardItem}>
                                        <View style={[styles.summaryCardIconContainer, { backgroundColor: '#FF6B35' }]}>
                                            <Image
                                                source={require('../../asset/time-outline.png')}
                                                style={{
                                                    width: 22,
                                                    height: 22,
                                                    tintColor: "#FFFFFF",

                                                }}
                                            />
                                        </View>
                                        <View style={styles.summaryCardItemContent}>
                                            <Text style={styles.summaryCardItemValue}>{userData.pendingJobs}</Text>
                                            <Text style={styles.summaryCardItemLabel}>Pending</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </ImageBackground>





                        {/* Today's Schedule - White Background with Distinct Styles */}

                        {allSchedule.length > 0 && (
                            <View style={styles.scheduleContainer}>
                                <View style={styles.scheduleHeader}>
                                    <Text style={styles.sectionTitle}>Today's Schedule</Text>
                                    <TouchableOpacity onPress={() => setShowAllSchedule(!showAllSchedule)}>
                                        <Text style={styles.viewAllText}>
                                            {showAllSchedule ? 'Show Less' : hasMoreItems ? 'View All' : ''}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={displayedSchedule}
                                    keyExtractor={(item) => item.bookingNo.toString()}
                                    renderItem={renderScheduleItem}
                                    scrollEnabled={false}
                                />
                                {!showAllSchedule && hasMoreItems && (
                                    <TouchableOpacity
                                        style={styles.viewAllButton}
                                        onPress={() => setShowAllSchedule(true)}
                                    >
                                        <Text style={styles.viewAllButtonText}>View All {sortedSchedule.length} Tasks</Text>

                                        <Image
                                            source={require('../../asset/arrow-forward.png')}
                                            style={{
                                                width: 16,
                                                height: 16,
                                                tintColor: "#FF8C00",

                                            }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        <View style={{ alignItems: 'flex-end', flexDirection: 'raw', justifyContent: 'flex-end', marginBottom: 10 }}>
                            <TouchableOpacity style={[styles.taskModalAcceptButton, { paddingHorizontal: 10 }]} onPress={() => fetchNewTasks(location)} disabled={isNewTaskLoading}>

                                {isNewTaskLoading ? (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <ActivityIndicator
                                            size="small"
                                            color="#FFFFFF"
                                        />

                                        <Text
                                            style={[
                                                styles.taskModalAcceptButtonText,
                                                {
                                                    fontSize: 12,
                                                    marginLeft: 8,
                                                },
                                            ]}
                                        >
                                            Searching...
                                        </Text>
                                    </View>
                                ) : (
                                    <Text
                                        style={[
                                            styles.taskModalAcceptButtonText,
                                            { fontSize: 12 },
                                        ]}
                                    >
                                        Search New Job
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>


                        <View style={[styles.upcomingFloatContainer, isOfflineStatus && styles.upcomingFloatContainerOffline]}>





                            <View style={styles.upcomingSectionHeader}>
                                <Text style={styles.sectionTitle}>New Job Requests</Text>



                                {upcomingTasks.length > 3 && (
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => setShowAllTasks(prev => !prev)}
                                    >
                                        <Text style={styles.viewMoreText}>
                                            {showAllTasks ? 'Show Less' : 'View More'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <FlatList
                                data={
                                    showAllTasks
                                        ? upcomingTasks
                                        : upcomingTasks.slice(0, 3)
                                }
                                keyExtractor={(item, index) =>
                                    String(item.assignmentId || index)
                                }
                                renderItem={renderUpcomingItem}
                                scrollEnabled={false}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>

                        {/* Self Rating and Job Stats */}
                        <View style={[styles.ratingContainer, isOfflineStatus && styles.ratingContainerOffline]}>
                            <View style={styles.ratingSection}>
                                <Text style={styles.sectionTitle}>Your Rating</Text>
                                <View style={styles.ratingDisplay}>
                                    <Text style={styles.ratingNumber}>{userData.rating}</Text>
                                    <View style={styles.starsContainer}>{renderStars(userData.rating)}</View>
                                </View>
                                <Text style={styles.ratingLabel}>Based on {userData.totalJobs} jobs</Text>
                            </View>
                            <View style={styles.jobStats}>
                                <View style={styles.jobStat}>
                                    <Text style={styles.jobStatNumber}>{userData.totalJobs}</Text>
                                    <Text style={styles.jobStatLabel}>Jobs Done</Text>
                                </View>
                                <View style={styles.jobStatDivider} />
                                <View style={styles.jobStat}>
                                    <Text style={styles.jobStatNumber}>₹{userData.totalEarnings.toLocaleString()}</Text>
                                    <Text style={styles.jobStatLabel}>Total Earned</Text>
                                </View>
                            </View>
                        </View>

                        {/* Upcoming Tasks with Date, Time, Duration */}


                        {/* Quick Actions */}
                        <View style={styles.quickActionsContainer}>
                            <Text style={styles.sectionTitle}>Quick Actions</Text>
                            <View style={styles.quickActionsGrid}>
                                {quickActions.map((action) => (
                                    <TouchableOpacity key={action.id} style={[styles.quickActionItem, isOfflineStatus && styles.quickActionItemOffline]} onPress={() => {

                                        navigation.navigate(action.screen);
                                    }}>
                                        <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                                            <Image
                                                source={action.image}
                                                style={{
                                                    width: 24,
                                                    height: 24,
                                                    tintColor: action.color, // Remove if your PNGs are already colored
                                                    resizeMode: 'contain',
                                                }}
                                            />
                                        </View>
                                        <Text style={styles.quickActionLabel}>{action.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Pro Tip */}
                        <View style={[styles.proTipContainer, isOfflineStatus && styles.proTipContainerOffline]}>
                            <View style={styles.proTipContent}>
                                <Text style={styles.proTipIcon}>💡</Text>
                                <View style={styles.proTipTextContainer}>
                                    <Text style={styles.proTipTitle}>Pro Tip</Text>
                                    <Text style={styles.proTipDescription}>
                                        Complete 5 jobs this week to unlock a ₹500 bonus! Keep up the great work.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Refer and Earn */}
                        <View style={[styles.referContainer, isOfflineStatus && styles.referContainerOffline]}>
                            <View style={styles.referContent}>
                                <Text style={styles.referIcon}>🎁</Text>
                                <View style={styles.referTextContainer}>
                                    <Text style={styles.referTitle}>Refer & Earn</Text>
                                    <Text style={styles.referDescription}>
                                        Invite friends to join HomeHelp Partner and earn ₹200 for each successful referral!
                                    </Text>
                                    <TouchableOpacity style={styles.referButton}>
                                        <Text style={styles.referButtonText}>Refer Now →</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Why Use HomeHelp */}
                        <View style={styles.whyContainer}>
                            <Text style={styles.sectionTitle}>Why Use HomeHelp Partner?</Text>
                            <View style={styles.whyGrid}>
                                {['Fair Earnings', 'Flexible Hours', 'Secure Platform', 'Growth Opportunities'].map((title, index) => (
                                    <View key={index} style={[styles.whyItem, isOfflineStatus && styles.whyItemOffline]}>
                                        <View style={styles.whyIconContainer}>
                                            <Image
                                                source={[
                                                    require('../../asset/cash.png'),
                                                    require('../../asset/time-outline.png'),
                                                    require('../../asset/shield.png'),
                                                    require('../../asset/growth.png'),
                                                ][index]}
                                                style={{
                                                    width: 24,
                                                    height: 24,
                                                    tintColor: '#FF8C00', // Remove if your PNGs are already colored
                                                    resizeMode: 'contain',
                                                }}
                                            />
                                        </View>
                                        <Text style={styles.whyTitle}>{title}</Text>
                                        <Text style={styles.whyDescription}>
                                            {['Get paid competitively with transparent pricing',
                                                'Work on your own schedule, anytime anywhere',
                                                'Safe and verified customers & payments',
                                                'Access training and career advancement'][index]}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Footer spacing */}
                        <View style={{ height: 20 }} />
                    </ScrollView>
                </>

            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    safeAreaOffline: {
        backgroundColor: '#ddd7d7',
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    mainContentOffline: {
        backgroundColor: '#F0F0F0',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    scrollContentOffline: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: '#F0F0F0',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    menuButton: {
        padding: 4,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationButton: {
        padding: 4,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF4444',
    },
    greetingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    greeting: {
        fontSize: 16,
        color: '#888',
        fontWeight: '400',
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        marginTop: 2,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statusContainerOffline: {
        borderWidth: 1,
        borderColor: '#FF4444',
        backgroundColor: '#FFEBEE',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#444',
        marginRight: 4,
    },
    statusTextOffline: {
        color: '#FF4444',
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    offlineBannerText: {
        fontSize: 13,
        color: '#FF4444',
        marginLeft: 8,
        flex: 1,
    },
    availabilitySummary: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFE8DC',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    availabilitySummaryOffline: {
        backgroundColor: '#FAFAFA',
        borderColor: '#E0E0E0',
        opacity: 0.85,
    },
    availabilitySummaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    availabilitySummaryTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
        marginLeft: 6,
        flex: 1,
    },
    availabilitySummaryAdd: {
        fontSize: 12,
        color: '#FF8C00',
        fontWeight: '600',
    },
    availabilitySummaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    availabilitySummaryItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    availabilitySummaryDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FF4444',
        marginRight: 8,
    },
    availabilitySummaryDate: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    availabilitySummaryToday: {
        backgroundColor: '#FF8C00',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8,
    },
    availabilitySummaryTodayText: {
        fontSize: 9,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 10,
    },
    // Today's Summary Styles - Professional Colorful Cards
    summaryContainer: {
        marginBottom: 16,
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: 10,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        paddingTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    summaryCardIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryCardValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    summaryCardLabel: {
        fontSize: 12,
        color: '#888',
        fontWeight: '500',
        marginBottom: 8,
    },
    summaryCardProgress: {
        width: '100%',
        height: 3,
        backgroundColor: '#F0F0F0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    summaryCardProgressBar: {
        height: '100%',
        borderRadius: 2,
    },
    assignedCard: {
        borderTopWidth: 3,
        borderTopColor: '#FF8C00',
    },
    completedCard: {
        borderTopWidth: 3,
        borderTopColor: '#4CAF50',
    },
    pendingCard: {
        borderTopWidth: 3,
        borderTopColor: '#FF6B35',
    },
    // Today's Earnings Summary Card
    earningSummaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#FF8C00',
    },
    earningSummaryCardOffline: {
        backgroundColor: '#FAFAFA',
        opacity: 0.85,
    },
    earningSummaryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    earningSummaryIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    earningSummaryLabel: {
        fontSize: 12,
        color: '#888',
        fontWeight: '500',
    },
    earningSummaryValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    earningSummaryRight: {
        alignItems: 'flex-end',
    },
    earningSummaryChange: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4CAF50',
    },
    earningSummaryChangeLabel: {
        fontSize: 11,
        color: '#888',
    },
    scheduleContainer: {
        marginBottom: 5,
    },
    scheduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    viewAllText: {
        fontSize: 13,
        color: '#FF8C00',
        fontWeight: '500',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        marginTop: 4,
    },
    viewAllButtonText: {
        fontSize: 13,
        color: '#FF8C00',
        fontWeight: '500',
        marginRight: 4,
    },
    scheduleCard: {
        borderRadius: 14,
        padding: 14,
        paddingLeft: 18,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 4,
        position: 'relative',
        backgroundColor: '#FFFFFF',
    },
    scheduleCardAccent: {
        position: 'absolute',
        left: 0,
        top: 12,
        bottom: 12,
        width: 4,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    scheduleCardInProgress: {
        shadowColor: '#FF8C00',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    inProgressBadge: {
        position: 'absolute',
        top: -6,
        right: 12,
        backgroundColor: '#FF8C00',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 12,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 1,
        marginTop: 20
    },
    inProgressBadgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,

    },
    scheduleCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    scheduleCardIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
        borderWidth: 1,
    },
    scheduleCardIconText: {
        fontSize: 20,
    },
    scheduleCardTitleContainer: {
        flex: 1,
        marginLeft: 12,
    },
    scheduleCardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    scheduleCardStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginTop: 2,
    },
    scheduleCardStatusDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        marginRight: 4,
    },
    scheduleCardStatusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    scheduleCardBody: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    scheduleCardDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    scheduleCardDetailText: {
        fontSize: 11,
        color: '#555',
        marginLeft: 4,
        fontWeight: '500',
    },
    ratingContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    ratingContainerOffline: {
        backgroundColor: '#FAFAFA',
        opacity: 0.85,
    },
    ratingSection: {
        marginBottom: 12,
    },
    ratingDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    ratingNumber: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        marginRight: 10,
    },
    starsContainer: {
        flexDirection: 'row',
    },
    ratingLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    jobStats: {
        flexDirection: 'row',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    jobStat: {
        flex: 1,
        alignItems: 'center',
    },
    jobStatNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    jobStatLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    jobStatDivider: {
        width: 1,
        backgroundColor: '#F0F0F0',
    },
    upcomingFloatContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#FFE8DC',
    },
    upcomingFloatContainerOffline: {
        backgroundColor: '#FAFAFA',
        borderColor: '#E0E0E0',
        opacity: 0.85,
    },
    upcomingFloatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    upcomingFloatBadge: {
        backgroundColor: '#FF8C00',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 12,
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    upcomingCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',


        padding: 13,
        marginBottom: 10,

        backgroundColor: '#FFFFFF',

        // Subtle border
        borderWidth: 1,
        borderColor: '#F0EBF3',

        // iOS
        shadowColor: '#5E4A68',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 5,

        // Android
        elevation: 3,
    },
    upcomingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    upcomingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    upcomingIcon: {
        fontSize: 18,
    },
    upcomingInfo: {
        flex: 1,
    },
    upcomingTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    upcomingClient: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    upcomingDateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        flexWrap: 'wrap',
    },
    upcomingDateTimeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 6,
    },
    upcomingDateTimeText: {
        fontSize: 11,
        color: '#555',
        marginLeft: 2,
        fontWeight: '500',
    },
    upcomingDateTimeDivider: {
        width: 1,
        height: 12,
        backgroundColor: '#DDD',
        marginHorizontal: 4,
    },
    upcomingMetaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    upcomingMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    upcomingMetaText: {
        fontSize: 10,
        color: '#888',
        marginLeft: 2,
    },
    upcomingAcceptButton: {
        backgroundColor: '#FF8C00',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    upcomingAcceptText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center'
    },
    quickActionsContainer: {
        marginBottom: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    quickActionItem: {
        flex: 1,
        minWidth: (width - 60) / 4 - 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    quickActionItemOffline: {
        backgroundColor: '#FAFAFA',
        opacity: 0.85,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    quickActionLabel: {
        fontSize: 11,
        color: '#444',
        fontWeight: '500',
        textAlign: 'center',
    },
    proTipContainer: {
        backgroundColor: '#FFF8F3',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFE8DC',
    },
    proTipContainerOffline: {
        backgroundColor: '#F5F0EC',
        borderColor: '#E0D8D0',
        opacity: 0.85,
    },
    proTipContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    proTipIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    proTipTextContainer: {
        flex: 1,
    },
    proTipTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    proTipDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    referContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#FFE8DC',
    },
    referContainerOffline: {
        backgroundColor: '#FAFAFA',
        borderColor: '#E0E0E0',
        opacity: 0.85,
    },
    referContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    referIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    referTextContainer: {
        flex: 1,
    },
    referTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    referDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        marginBottom: 10,
    },
    referButton: {
        alignSelf: 'flex-start',
    },
    referButtonText: {
        fontSize: 14,
        color: '#FF8C00',
        fontWeight: '600',
    },
    whyContainer: {
        marginBottom: 16,
    },
    whyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    whyItem: {
        flex: 1,
        minWidth: (width - 60) / 2 - 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    whyItemOffline: {
        backgroundColor: '#FAFAFA',
        opacity: 0.85,
    },
    whyIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FFF8F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    whyTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 2,
    },
    whyDescription: {
        fontSize: 11,
        color: '#888',
        textAlign: 'center',
        lineHeight: 15,
    },
    // Status Menu Styles
    statusMenuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusMenuContainer: {
        width: width * 0.85,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    statusMenuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusMenuTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    statusMenuCurrent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    statusMenuCurrentLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    statusMenuCurrentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusMenuCurrentText: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
    },
    statusMenuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF8F3',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFE8DC',
        marginBottom: 16,
    },
    statusMenuButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF8C00',
        marginLeft: 8,
    },
    statusMenuDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 16,
    },
    statusMenuSchedule: {
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 12,
    },
    statusMenuScheduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    statusMenuScheduleTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginLeft: 8,
    },
    statusMenuScheduleSubtitle: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8,
    },
    statusMenuScheduleList: {
        marginTop: 8,
    },
    statusMenuScheduleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    statusMenuScheduleDate: {
        fontSize: 12,
        color: '#666',
    },
    // Sidebar Styles
    sidebarOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        zIndex: 999,
    },
    overlayTouch: {
        flex: 1,
    },
    sidebar: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width * 0.75,
        height: '100%',
        backgroundColor: '#FFFFFF',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    sidebarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        paddingTop: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sidebarProfile: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sidebarAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    sidebarUserInfo: {
        flex: 1,
    },
    sidebarUserName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    sidebarStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    sidebarStatusText: {
        fontSize: 12,
        color: '#888',
        marginLeft: 4,
    },
    sidebarClose: {
        padding: 4,
    },
    sidebarStats: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFF9F5',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    sidebarStat: {
        flex: 1,
        alignItems: 'center',
    },
    sidebarStatValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    sidebarStatLabel: {
        fontSize: 11,
        color: '#888',
        marginTop: 2,
    },
    sidebarStatDivider: {
        width: 1,
        backgroundColor: '#E8E8E8',
    },
    sidebarNav: {
        flex: 1,
        paddingTop: 12,
    },
    sidebarNavItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginHorizontal: 8,
        borderRadius: 10,
    },
    sidebarNavItemActive: {
        backgroundColor: '#FFF8F3',
    },
    sidebarNavLabel: {
        fontSize: 15,
        color: '#666',
        marginLeft: 14,
        fontWeight: '500',
    },
    sidebarNavLabelActive: {
        color: '#FF8C00',
        fontWeight: '600',
    },
    sidebarBadge: {
        backgroundColor: '#FF8C00',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 10,
        marginLeft: 'auto',
    },
    sidebarBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    sidebarFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    sidebarLogout: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sidebarLogoutText: {
        fontSize: 15,
        color: '#FF4444',
        marginLeft: 14,
        fontWeight: '500',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: height * 0.6,
        transform: [{ translateY: 0 }],
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    modalBody: {
        marginBottom: 16,
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
        marginBottom: 8,
    },
    dateOptionsScroll: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    dateOptionButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    dateOptionButtonActive: {
        backgroundColor: '#FF8C00',
        borderColor: '#FF8C00',
    },
    dateOptionButtonScheduled: {
        backgroundColor: '#F5F5F5',
        borderColor: '#DDD',
        opacity: 0.6,
    },
    dateOptionButtonText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    dateOptionButtonTextActive: {
        color: '#FFFFFF',
    },
    dateOptionButtonTextScheduled: {
        color: '#999',
    },
    modalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F3',
        padding: 12,
        borderRadius: 10,
        marginTop: 16,
    },
    modalInfoText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },
    modalButton: {
        backgroundColor: '#FF8C00',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
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

    upcomingActions: {

        gap: 6,
    },
    upcomingDeclineButton: {
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFCDD2',
        justifyContent: 'center'
    },
    upcomingDeclineText: {
        color: '#FF4444',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center'
    },
    summaryCardContainer: {
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        height: 140,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    summaryCardImage: {
        borderRadius: 16,
    },
    summaryCardOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        padding: 14,
        justifyContent: 'center',
    },
    summaryCardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    summaryCardGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    summaryCardItem: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryCardIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 3,
    },
    summaryCardItemContent: {
        alignItems: 'center',
    },
    summaryCardItemValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    summaryCardItemLabel: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    summaryCardDivider: {
        width: 1,
        height: 35,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },

    weatherContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        height: 240,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    weatherContainerOffline: {
        opacity: 0.85,
    },
    weatherBackgroundImage: {
        borderRadius: 16,
    },
    weatherOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    weatherContent: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    weatherHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    weatherLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    weatherTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginLeft: 8,
    },
    weatherUpdate: {
        fontSize: 10,
        color: '#999',
        fontWeight: '400',
    },
    weatherMain: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    weatherTempSection: {
        flex: 0.4,
    },
    weatherTemp: {
        fontSize: 36,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    weatherConditionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    weatherCondition: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '500',
        marginLeft: 4,
    },
    weatherDivider: {
        width: 1,
        height: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    weatherDetails: {
        flex: 0.6,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
    },
    weatherDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    weatherDetailText: {
        marginLeft: 4,
    },
    weatherDetailLabel: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '400',
    },
    weatherDetailValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    weatherAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    weatherAlertText: {
        fontSize: 12,
        color: '#FFFFFF',
        marginLeft: 8,
        flex: 1,
        fontWeight: '500',
    },
    upcomingSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#2F2633',
    },

    viewMoreText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#76577F',
    },

    taskDetailsOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        justifyContent: 'flex-end',
    },

    taskDetailsModal: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: height * 0.92,
        overflow: 'hidden',
    },

    taskDetailsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },

    taskDetailsHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    taskDetailsIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#FFF3E8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    taskDetailsIcon: {
        fontSize: 24,
    },

    taskDetailsHeaderInfo: {
        flex: 1,
    },

    taskDetailsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },

    taskDetailsBookingNo: {
        fontSize: 12,
        color: '#888888',
        marginTop: 3,
    },

    taskDetailsCloseButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },

    taskDetailsCloseIcon: {
        width: 18,
        height: 18,
        tintColor: '#555555',
    },

    taskDetailsScrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },

    taskDetailsSection: {
        marginTop: 20,
    },

    taskDetailsSectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#222222',
        marginBottom: 12,
    },

    taskDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        padding: 14,
    },

    taskDetailIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFF3E8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    taskDetailIcon: {
        width: 19,
        height: 19,
        tintColor: '#FF8C00',
    },

    taskDetailTextContainer: {
        flex: 1,
    },

    taskDetailLabel: {
        fontSize: 11,
        color: '#888888',
        marginBottom: 3,
    },

    taskDetailValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#222222',
    },

    taskRateValue: {
        color: '#2E9D59',
        fontWeight: '700',
    },

    taskDetailsGrid: {
        flexDirection: 'row',
        gap: 12,
    },

    taskDetailGridItem: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        padding: 14,
        minHeight: 72,
        justifyContent: 'center',
    },

    taskDetailsTimeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        padding: 14,
    },

    taskTimeItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    taskTimeIconBox: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: '#FFF3E8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    taskTimeIcon: {
        width: 17,
        height: 17,
        tintColor: '#FF8C00',
    },

    taskTimeValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#222222',
    },

    taskTimeDivider: {
        width: 1,
        height: 38,
        backgroundColor: '#DDDDDD',
        marginHorizontal: 10,
    },

    addressCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        padding: 14,
    },

    addressIconBox: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: '#FFF3E8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    addressIcon: {
        width: 18,
        height: 18,
        tintColor: '#FF8C00',
    },

    addressText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 21,
        color: '#444444',
    },

    mapHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    coordinateText: {
        fontSize: 10,
        color: '#888888',
    },

    taskMapContainer: {
        height: 220,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#EEEEEE',
    },

    taskMap: {
        width: '100%',
        height: '100%',
    },

    noMapContainer: {
        height: 180,
        borderRadius: 16,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },

    noMapIcon: {
        width: 32,
        height: 32,
        tintColor: '#AAAAAA',
        marginBottom: 10,
    },

    noMapText: {
        fontSize: 13,
        color: '#888888',
        textAlign: 'center',
    },

    taskDetailsDoneButton: {
        height: 50,
        borderRadius: 14,
        backgroundColor: '#FF8C00',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },

    taskDetailsDoneText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    viewDetailsButton: {
        backgroundColor: '#ff9f29',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
        shadowColor: '#f38d10',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },

    viewDetailsButtonText: {
        color: '#fdfdfd',
        fontSize: 13,
        fontWeight: '700',
    },

    viewDetailsArrow: {
        width: 14,
        height: 14,
        tintColor: '#FF8C00',
        marginLeft: 5,
    },

    latestTaskAlertContainer: {
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FFE0BF',
    },

    latestTaskAlertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    latestTaskAlertTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    latestTaskLiveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF8C00',
        marginRight: 7,
    },

    latestTaskAlertTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#E65100',
    },

    latestTaskCountdown: {
        fontSize: 16,
        fontWeight: '800',
        color: '#E65100',
    },

    latestTaskProgressTrack: {
        width: '100%',
        height: 5,
        borderRadius: 3,
        backgroundColor: '#FFE4CC',
        overflow: 'hidden',
    },

    latestTaskProgressBar: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: '#FF8C00',
    },

    latestTaskAlertSubtitle: {
        fontSize: 10,
        color: '#A66A32',
        marginTop: 6,
    },
    taskModalActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        backgroundColor: '#FFFFFF',
    },

    taskModalCloseButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },

    taskModalCloseButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#666666',
    },

    taskModalAcceptButton: {
        flex: 1.4,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF8C00',

        shadowColor: '#FF8C00',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 4,
    },

    taskModalAcceptButtonText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});

export default DashboardScreen;