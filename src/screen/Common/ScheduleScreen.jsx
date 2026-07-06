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
    FlatList,
    Image,
    Modal,
    Alert,
} from 'react-native';


const { width, height } = Dimensions.get('window');

const ScheduleScreen = ({ navigation }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('today'); // 'today' | 'weekly' | 'monthly'
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedTask, setSelectedTask] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const modalFadeAnim = useRef(new Animated.Value(0)).current;
    const modalSlideAnim = useRef(new Animated.Value(50)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(1)).current;
    const headerTranslateY = useRef(new Animated.Value(0)).current;

    // Dummy schedule data with multiple description items
    const scheduleData = {
        '2026-07-06': [
            {
                id: 1,
                title: 'Plumbing Repair',
                time: '9:00 AM',
                duration: '2 hrs',
                client: 'Mr. Sharma',
                location: 'Andheri East',
                status: 'completed',
                amount: '₹1,200',
                descriptions: [
                    'Fix leaking kitchen pipe',
                    'Replace bathroom faucet',
                    'Check water pressure',
                    'Install new pipe fittings',
                ]
            },
            {
                id: 2,
                title: 'Electrical Work',
                time: '11:30 AM',
                duration: '1.5 hrs',
                client: 'Mrs. Patel',
                location: 'Bandra West',
                status: 'in-progress',
                amount: '₹850',
                descriptions: [
                    'Install new wiring',
                    'Replace switch board',
                    'Fix lighting fixtures',
                ]
            },
            {
                id: 3,
                title: 'Cleaning Service',
                time: '3:00 PM',
                duration: '3 hrs',
                client: 'Mr. Singh',
                location: 'Juhu',
                status: 'upcoming',
                amount: '₹2,500',
                descriptions: [
                    'Deep cleaning of entire house',
                    'Sofa and carpet cleaning',
                    'Window cleaning',
                    'Kitchen sanitization',
                ]
            },
        ],
        '2026-07-07': [
            {
                id: 4,
                title: 'AC Repair',
                time: '10:00 AM',
                duration: '2.5 hrs',
                client: 'Ms. Reddy',
                location: 'Powai',
                status: 'upcoming',
                amount: '₹1,500',
                descriptions: [
                    'AC gas refilling',
                    'Filter cleaning',
                    'Compressor check',
                    'Temperature calibration',
                ]
            },
            {
                id: 5,
                title: 'Painting Work',
                time: '3:30 PM',
                duration: '4 hrs',
                client: 'Mr. Gupta',
                location: 'Malad',
                status: 'upcoming',
                amount: '₹3,200',
                descriptions: [
                    'Interior wall painting - 2 rooms',
                    'Ceiling painting',
                    'Door frame painting',
                    'Wall preparation and primer',
                ]
            },
        ],
        '2026-07-08': [
            {
                id: 6,
                title: 'Plumbing Repair',
                time: '9:30 AM',
                duration: '2 hrs',
                client: 'Mr. Kumar',
                location: 'Andheri West',
                status: 'upcoming',
                amount: '₹1,100',
                descriptions: [
                    'Fix water leakage in bathroom',
                    'Replace water tap',
                    'Check pipe connections',
                ]
            },
        ],
        '2026-07-09': [
            {
                id: 7,
                title: 'Electrical Work',
                time: '1:00 PM',
                duration: '1.5 hrs',
                client: 'Mrs. Shah',
                location: 'Bandra East',
                status: 'upcoming',
                amount: '₹950',
                descriptions: [
                    'Fan installation',
                    'Light fitting replacement',
                    'Wiring check',
                ]
            },
            {
                id: 8,
                title: 'Cleaning Service',
                time: '4:00 PM',
                duration: '2.5 hrs',
                client: 'Mr. Mehta',
                location: 'Juhu',
                status: 'upcoming',
                amount: '₹1,800',
                descriptions: [
                    'Office cleaning',
                    'Sanitization',
                    'Floor mopping',
                    'Trash disposal',
                ]
            },
        ],
    };

    const ORANGE_COLOR = '#FF8C00';

    useEffect(() => {
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

    // Get schedule for specific date
    const getScheduleForDate = (date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return scheduleData[dateStr] || [];
    };

    // Check if date has schedule
    const hasSchedule = (day, month, year) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return scheduleData[dateStr] && scheduleData[dateStr].length > 0;
    };

    // Check if date is today
    const isToday = (day, month, year) => {
        const today = new Date();
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    // Check if date is selected
    const isSelected = (day, month, year) => {
        return day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
    };

    // Navigate month
    const navigateMonth = (direction) => {
        let newMonth = currentMonth + direction;
        let newYear = currentYear;
        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        } else if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    // Navigate week
    const navigateWeek = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + (direction * 7));
        setSelectedDate(newDate);
        setCurrentMonth(newDate.getMonth());
        setCurrentYear(newDate.getFullYear());
    };

    // Navigate day
    const navigateDay = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + direction);
        setSelectedDate(newDate);
        setCurrentMonth(newDate.getMonth());
        setCurrentYear(newDate.getFullYear());
    };

    // Get days in month
    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Get first day of month
    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay();
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#4CAF50';
            case 'in-progress': return '#FF8C00';
            case 'upcoming': return '#2196F3';
            default: return '#888';
        }
    };

    // Get status label
    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'in-progress': return 'In Progress';
            case 'upcoming': return 'Upcoming';
            default: return 'Upcoming';
        }
    };

    // Open modal with task details
    const openTaskDetails = (task) => {
        setSelectedTask(task);
        setModalVisible(true);
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

    // Close modal
    const closeModal = () => {
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
        ]).start(() => {
            setModalVisible(false);
            setSelectedTask(null);
        });
    };

    // Render description item
    const renderDescriptionItem = ({ item, index }) => (
        <View style={styles.descriptionItem}>
            <View style={styles.descriptionBullet}>
                <Text style={styles.descriptionBulletText}>{index + 1}</Text>
            </View>
            <Text style={styles.descriptionText}>{item}</Text>
        </View>
    );

    // Render Task Detail Modal with FlatList for descriptions
    const renderTaskModal = () => {
        if (!selectedTask) return null;

        return (
            <Modal
                visible={modalVisible}
                transparent
                animationType="none"
                onRequestClose={closeModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={closeModal}
                >
                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                opacity: modalFadeAnim,
                                transform: [{ translateY: modalSlideAnim }],
                            }
                        ]}
                    >
                        <TouchableOpacity activeOpacity={1} style={styles.modalInner}>
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <View style={styles.modalHeaderLeft}>
                                    <Text style={styles.modalTitle}>Task Details</Text>
                                    <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedTask.status) + '20' }]}>
                                        <View style={[styles.modalStatusDot, { backgroundColor: getStatusColor(selectedTask.status) }]} />
                                        <Text style={[styles.modalStatusText, { color: getStatusColor(selectedTask.status) }]}>
                                            {getStatusLabel(selectedTask.status)}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={closeModal} style={styles.modalClose}>

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

                            {/* Task Info */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Task Information</Text>
                                <View style={styles.modalInfoRow}>

                                    <Image
                                        source={require('../../asset/briefcase.png')}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            tintColor: "#FF8C00",

                                        }}
                                    />
                                    <Text style={styles.modalInfoLabel}>Job Title</Text>
                                    <Text style={styles.modalInfoValue}>{selectedTask.title}</Text>
                                </View>
                                <View style={styles.modalInfoRow}>

                                    <Image
                                        source={require('../../asset/time-outline.png')}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            tintColor: "#FF8C00",

                                        }}
                                    />
                                    <Text style={styles.modalInfoLabel}>Time</Text>
                                    <Text style={styles.modalInfoValue}>{selectedTask.time}</Text>
                                </View>
                                <View style={styles.modalInfoRow}>

                                    <Image
                                        source={require('../../asset/hourglass-outline.png')}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            tintColor: "#FF8C00",

                                        }}
                                    />
                                    <Text style={styles.modalInfoLabel}>Duration</Text>
                                    <Text style={styles.modalInfoValue}>{selectedTask.duration}</Text>
                                </View>
                                <View style={styles.modalInfoRow}>

                                    <Image
                                        source={require('../../asset/location-outline.png')}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            tintColor: "#FF8C00",

                                        }}
                                    />
                                    <Text style={styles.modalInfoLabel}>Location</Text>
                                    <Text style={styles.modalInfoValue}>{selectedTask.location}</Text>
                                    <TouchableOpacity style={styles.mapIconButtonModal}>
                                        <View style={styles.mapIconHighlight}>

                                            <Image
                                                source={require('../../asset/navigate-outline.png')}
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                    tintColor: "#FFFFFF",

                                                }}
                                            />
                                        </View>
                                        <Text style={styles.mapIconText}>Map</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Customer Details */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Customer Details</Text>
                                <View style={styles.modalInfoRow}>

                                    <Image
                                        source={require('../../asset/person-outline.png')}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            tintColor: "#4A90D9",

                                        }}
                                    />
                                    <Text style={styles.modalInfoLabel}>Name</Text>
                                    <Text style={styles.modalInfoValue}>{selectedTask.client}</Text>
                                </View>
                            </View>

                            {/* Descriptions with FlatList */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalSectionTitle}>Task Descriptions</Text>
                                {selectedTask.descriptions && selectedTask.descriptions.length > 0 ? (
                                    <FlatList
                                        data={selectedTask.descriptions}
                                        keyExtractor={(item, index) => index.toString()}
                                        renderItem={renderDescriptionItem}
                                        scrollEnabled={false}
                                    />
                                ) : (
                                    <Text style={styles.noDescriptionText}>No descriptions available</Text>
                                )}
                            </View>

                            {/* Amount */}
                            <View style={styles.modalAmountSection}>
                                <View style={styles.modalAmountLeft}>

                                    <Image
                                        source={require('../../asset/cash.png')}
                                        style={{
                                            width: 24,
                                            height: 24,
                                            tintColor: "#FF8C00",

                                        }}
                                    />
                                    <Text style={styles.modalAmountLabel}>Total Amount</Text>
                                </View>
                                <Text style={styles.modalAmountValue}>{selectedTask.amount || '₹0'}</Text>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.modalActionButton} onPress={closeModal}>
                                    <Text style={styles.modalActionButtonText}>Close</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalActionButtonPrimary}
                                    onPress={() => {
                                        closeModal();
                                        navigation.navigate('JobDetails', { jobData: selectedTask });
                                    }}
                                >
                                    <Text style={styles.modalActionButtonPrimaryText}>View Full Details</Text>

                                    <Image
                                        source={require('../../asset/arrow-forward.png')}
                                        style={{
                                            width: 18,
                                            height: 18,
                                            tintColor: "#FFFFFF",

                                        }}
                                    />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        );
    };

    // Render schedule card with view button on far right
    const renderScheduleCard = ({ item }) => (
        <TouchableOpacity
            style={styles.scheduleCard}
            activeOpacity={0.9}
        >
            <View style={styles.scheduleCardLeft}>
                <View style={[styles.scheduleCardStatusBar, { backgroundColor: getStatusColor(item.status) }]} />
                <View style={styles.scheduleCardContent}>
                    <View style={styles.scheduleCardHeader}>
                        <Text style={styles.scheduleCardTitle}>{item.title}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                            <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
                                {getStatusLabel(item.status)}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.scheduleCardClient}>👤 {item.client}</Text>
                    <View style={styles.scheduleCardMeta}>
                        <View style={styles.scheduleCardMetaItem}>

                            <Image
                                source={require('../../asset/time-outline.png')}
                                style={{
                                    width: 14,
                                    height: 14,
                                    tintColor: "#888",

                                }}
                            />
                            <Text style={styles.scheduleCardMetaText}>{item.time}</Text>
                        </View>
                        <View style={styles.scheduleCardMetaItem}>
                            <Image
                                source={require('../../asset/hourglass-outline.png')}
                                style={{
                                    width: 14,
                                    height: 14,
                                    tintColor: "#888",
                                }}
                            />
                            <Text style={styles.scheduleCardMetaText}>{item.duration}</Text>
                        </View>
                        <View style={styles.scheduleCardMetaItem}>
                            <Image
                                source={require('../../asset/location-outline.png')}
                                style={{
                                    width: 14,
                                    height: 14,
                                    tintColor: "#888",
                                }}
                            />
                            <Text style={styles.scheduleCardMetaText}>{item.location}</Text>
                            <TouchableOpacity style={styles.mapIconButtonCard}>
                                <View style={styles.mapIconHighlight}>

                                    <Image
                                        source={require('../../asset/navigate-outline.png')}
                                        style={{
                                            width: 14,
                                            height: 14,
                                            tintColor: "#FFFFFF",

                                        }}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            {/* View Button on far right */}
            <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => openTaskDetails(item)}
                activeOpacity={0.8}
            >
                <View style={styles.viewDetailsButtonInner}>

                    <Image
                        source={require('../../asset/view.png')}
                        style={{
                            width: 16,
                            height: 16,
                            tintColor: "#FFFFFF",

                        }}
                    />

                    <Text style={styles.viewDetailsText}>View</Text>
                </View>
                <View style={styles.viewDetailsShadow} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    // Render today view
    const renderTodayView = () => {
        const today = new Date();
        const todaySchedules = getScheduleForDate(today);

        return (
            <View style={styles.todayView}>
                <View style={styles.todayHeader}>
                    <TouchableOpacity onPress={() => navigateDay(-1)} style={styles.navButton}>
                        
                        <Image
                            source={require('../../asset/chevron-back.png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: "#1A1A1A",

                            }}
                        />
                    </TouchableOpacity>
                    <View style={styles.todayTitleContainer}>
                        <Text style={styles.todayTitle}>
                            {selectedDate.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </Text>
                        {selectedDate.toDateString() === today.toDateString() && (
                            <View style={styles.todayBadge}>
                                <Text style={styles.todayBadgeText}>Today</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity onPress={() => navigateDay(1)} style={styles.navButton}>
                       
                        <Image
                            source={require('../../asset/arrow-forward.png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: "#1A1A1A",

                            }}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.scheduleCount}>
                    {todaySchedules.length} {todaySchedules.length === 1 ? 'task' : 'tasks'} scheduled
                </Text>

                {todaySchedules.length > 0 ? (
                    <FlatList
                        data={todaySchedules}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderScheduleCard}
                        scrollEnabled={false}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        
                        <Image
                            source={require('../../asset/calendar-outline.png')}
                            style={{
                                width: 48,
                                height: 48,
                                tintColor: "#CCC",

                            }}
                        />
                        <Text style={styles.emptyText}>No schedules for this day</Text>
                        <Text style={styles.emptySubtext}>You're all set! Enjoy your day off.</Text>
                    </View>
                )}
            </View>
        );
    };

    // Render weekly view
    const renderWeeklyView = () => {
        const weekDays = [];
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const hasJobs = scheduleData[dateStr] && scheduleData[dateStr].length > 0;
            const isTodayDate = isToday(date.getDate(), date.getMonth(), date.getFullYear());
            const isSelectedDate = isSelected(date.getDate(), date.getMonth(), date.getFullYear());
            weekDays.push({
                date,
                day: date.getDate(),
                month: date.getMonth(),
                year: date.getFullYear(),
                dayName: date.toLocaleString('default', { weekday: 'short' }),
                hasJobs,
                isToday: isTodayDate,
                isSelected: isSelectedDate,
                dateStr,
                schedules: scheduleData[dateStr] || [],
            });
        }

        const weekSchedules = getScheduleForDate(selectedDate);

        return (
            <View style={styles.weekView}>
                <View style={styles.weekHeader}>
                    <TouchableOpacity onPress={() => navigateWeek(-1)} style={styles.navButton}>
                        <Image
                            source={require('../../asset/chevron-back.png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: "#1A1A1A",
                            }}
                        />
                    </TouchableOpacity>
                    <Text style={styles.weekTitle}>
                        {weekDays[0].date.toLocaleString('default', { month: 'short', day: 'numeric' })} -
                        {weekDays[6].date.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={() => navigateWeek(1)} style={styles.navButton}>
                       
                        <Image
                            source={require('../../asset/arrow-forward.png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: "#1A1A1A",
                            }}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.weekDaysRow}>
                    {weekDays.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.weekDayItem,
                                item.isSelected && styles.weekDayItemSelected,
                                item.isToday && !item.isSelected && styles.weekDayItemToday,
                            ]}
                            onPress={() => {
                                setSelectedDate(item.date);
                            }}
                        >
                            <Text style={[
                                styles.weekDayName,
                                item.isSelected && styles.weekDayNameSelected,
                                item.isToday && !item.isSelected && styles.weekDayNameToday,
                            ]}>
                                {item.dayName}
                            </Text>
                            <Text style={[
                                styles.weekDayNumber,
                                item.isSelected && styles.weekDayNumberSelected,
                                item.isToday && !item.isSelected && styles.weekDayNumberToday,
                            ]}>
                                {item.day}
                            </Text>
                            {item.hasJobs && (
                                <View style={[styles.weekDayDot, item.isSelected && styles.weekDayDotSelected]} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.scheduleCount}>
                    {weekSchedules.length} {weekSchedules.length === 1 ? 'task' : 'tasks'} on {selectedDate.toLocaleString('default', { weekday: 'long' })}
                </Text>

                {weekSchedules.length > 0 ? (
                    <FlatList
                        data={weekSchedules}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderScheduleCard}
                        scrollEnabled={false}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        
                        <Image
                            source={require('../../asset/calendar-outline.png')}
                            style={{
                                width: 48,
                                height: 48,
                                tintColor: "#CCC",
                            }}
                        />
                        <Text style={styles.emptyText}>No schedules for this day</Text>
                    </View>
                )}
            </View>
        );
    };

    // Render monthly view
    const renderMonthlyView = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
        const selectedDateSchedules = getScheduleForDate(selectedDate);

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: '', empty: true });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const hasJobs = hasSchedule(i, currentMonth, currentYear);
            const isTodayDate = isToday(i, currentMonth, currentYear);
            const isSelectedDate = isSelected(i, currentMonth, currentYear);
            days.push({ day: i, empty: false, hasJobs, isToday: isTodayDate, isSelected: isSelectedDate });
        }

        return (
            <View style={styles.monthView}>
                <View style={styles.monthHeader}>
                    <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
                        <Image
                            source={require('../../asset/chevron-back.png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: "#1A1A1A",
                            }}
                        />
                    </TouchableOpacity>
                    <Text style={styles.monthTitle}>{monthName} {currentYear}</Text>
                    <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
                        
                    </TouchableOpacity>
                   
                    <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
                        <Image
                            source={require('../../asset/arrow-forward.png')}
                            style={{
                                width: 24,
                                height: 24,
                                tintColor: "#1A1A1A",
                            }}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.weekDaysHeader}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <Text key={day} style={styles.weekDayText}>{day}</Text>
                    ))}
                </View>

                <View style={styles.daysGrid}>
                    {days.map((item, index) => {
                        if (item.empty) {
                            return <View key={index} style={styles.dayCell} />;
                        }
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dayCell,
                                    item.isSelected && styles.dayCellSelected,
                                    item.isToday && !item.isSelected && styles.dayCellToday,
                                ]}
                                onPress={() => {
                                    const newDate = new Date(currentYear, currentMonth, item.day);
                                    setSelectedDate(newDate);
                                }}
                            >
                                <Text style={[
                                    styles.dayText,
                                    item.isSelected && styles.dayTextSelected,
                                    item.isToday && !item.isSelected && styles.dayTextToday,
                                ]}>
                                    {item.day}
                                </Text>
                                {item.hasJobs && (
                                    <View style={[styles.dayDot, item.isSelected && styles.dayDotSelected]} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={[styles.scheduleCount, { marginTop: 16 }]}>
                    {selectedDateSchedules.length} {selectedDateSchedules.length === 1 ? 'task' : 'tasks'} on {selectedDate.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>

                {selectedDateSchedules.length > 0 ? (
                    <FlatList
                        data={selectedDateSchedules}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderScheduleCard}
                        scrollEnabled={false}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Image
                            source={require('../../asset/calendar-outline.png')}
                            style={{
                                width: 48,
                                height: 48,
                                tintColor: "#CCC",
                            }}
                        />
                        
                        <Text style={styles.emptyText}>No schedules for this day</Text>
                    </View>
                )}
            </View>
        );
    };

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
                        <Text style={styles.toolbarTitle}>My Schedule</Text>
                        <View style={styles.toolbarStatus}>
                            <View style={[styles.toolbarStatusDot, { backgroundColor: '#FFFFFF' }]} />
                            <Text style={styles.toolbarStatusText}>{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}</Text>
                        </View>
                    </View>
                   
                </View>
                {/* Curved bottom */}
                <View style={[styles.toolbarCurve, { backgroundColor: ORANGE_COLOR }]} />
            </Animated.View>

            {/* View Mode Toggle */}
            <View style={styles.viewToggleContainer}>
                <TouchableOpacity
                    style={[styles.viewToggleButton, viewMode === 'today' && styles.viewToggleActive]}
                    onPress={() => setViewMode('today')}
                >
                    <Text style={[styles.viewToggleText, viewMode === 'today' && styles.viewToggleTextActive]}>
                        Today
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.viewToggleButton, viewMode === 'weekly' && styles.viewToggleActive]}
                    onPress={() => setViewMode('weekly')}
                >
                    <Text style={[styles.viewToggleText, viewMode === 'weekly' && styles.viewToggleTextActive]}>
                        Weekly
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.viewToggleButton, viewMode === 'monthly' && styles.viewToggleActive]}
                    onPress={() => setViewMode('monthly')}
                >
                    <Text style={[styles.viewToggleText, viewMode === 'monthly' && styles.viewToggleTextActive]}>
                        Monthly
                    </Text>
                </TouchableOpacity>
            </View>

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
                {viewMode === 'today' && renderTodayView()}
                {viewMode === 'weekly' && renderWeeklyView()}
                {viewMode === 'monthly' && renderMonthlyView()}

                <View style={{ height: 20 }} />
            </Animated.ScrollView>

            {/* Task Details Modal */}
            {renderTaskModal()}
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
    toolbarFilter: {
        padding: 4,
    },
    viewToggleContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 12,
        marginBottom: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 4,
    },
    viewToggleButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: 'center',
    },
    viewToggleActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    viewToggleText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#888',
    },
    viewToggleTextActive: {
        color: '#1A1A1A',
        fontWeight: '600',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    // Today View
    todayView: {
        flex: 1,
    },
    todayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    todayTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    todayTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    todayBadge: {
        backgroundColor: '#FF8C00',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 12,
    },
    todayBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    scheduleCount: {
        fontSize: 14,
        color: '#888',
        marginBottom: 12,
    },
    // Week View
    weekView: {
        flex: 1,
    },
    weekHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    weekTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    weekDaysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    weekDayItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        marginHorizontal: 2,
    },
    weekDayItemSelected: {
        backgroundColor: '#FF8C00',
    },
    weekDayItemToday: {
        borderWidth: 2,
        borderColor: '#FF8C00',
        backgroundColor: '#FFFFFF',
    },
    weekDayName: {
        fontSize: 11,
        color: '#888',
        fontWeight: '500',
    },
    weekDayNameSelected: {
        color: '#FFFFFF',
    },
    weekDayNameToday: {
        color: '#FF8C00',
    },
    weekDayNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginTop: 2,
    },
    weekDayNumberSelected: {
        color: '#FFFFFF',
    },
    weekDayNumberToday: {
        color: '#FF8C00',
    },
    weekDayDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#FF8C00',
        marginTop: 2,
    },
    weekDayDotSelected: {
        backgroundColor: '#FFFFFF',
    },
    // Month View
    monthView: {
        flex: 1,
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    navButton: {
        padding: 8,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    weekDaysHeader: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#888',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: (width - 72) / 7,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 4,
    },
    dayCellSelected: {
        backgroundColor: '#FF8C00',
    },
    dayCellToday: {
        borderWidth: 2,
        borderColor: '#FF8C00',
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    dayTextSelected: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    dayTextToday: {
        color: '#FF8C00',
        fontWeight: '700',
    },
    dayDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#FF8C00',
        marginTop: 2,
    },
    dayDotSelected: {
        backgroundColor: '#FFFFFF',
    },
    // Schedule Card with View Button on Far Right
    scheduleCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    scheduleCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    scheduleCardStatusBar: {
        width: 4,
        height: 50,
        borderRadius: 2,
        marginRight: 12,
    },
    scheduleCardContent: {
        flex: 1,
    },
    scheduleCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    scheduleCardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
        flex: 1,
    },
    scheduleCardClient: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    scheduleCardMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    scheduleCardMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    scheduleCardMetaText: {
        fontSize: 12,
        color: '#888',
    },
    // Highlighted Map Icon for Card
    mapIconButtonCard: {
        marginLeft: 2,
        padding: 2,
    },
    mapIconHighlight: {
        backgroundColor: '#FF8C00',
        padding: 4,
        borderRadius: 6,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 6,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    // Professional View Button on Far Right
    viewDetailsButton: {
        position: 'relative',
        marginLeft: 8,
        flexShrink: 0,
    },
    viewDetailsButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF8C00',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 4,
        zIndex: 2,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    viewDetailsShadow: {
        position: 'absolute',
        top: 2,
        left: 2,
        right: -2,
        bottom: -2,
        backgroundColor: 'rgba(255, 140, 0, 0.15)',
        borderRadius: 12,
        zIndex: 1,
    },
    viewDetailsText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Modal Styles with FlatList for Descriptions
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width * 0.9,
        maxHeight: height * 0.85,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    modalInner: {
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    modalHeaderLeft: {
        flex: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 6,
    },
    modalStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        gap: 4,
    },
    modalStatusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    modalStatusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    modalClose: {
        padding: 4,
    },
    modalSection: {
        marginBottom: 14,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 14,
    },
    modalSectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    modalInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 3,
        flexWrap: 'wrap',
    },
    modalInfoLabel: {
        fontSize: 13,
        color: '#666',
        marginLeft: 8,
        width: 70,
    },
    modalInfoValue: {
        fontSize: 13,
        color: '#1A1A1A',
        fontWeight: '500',
        flex: 1,
    },
    // Highlighted Map Icon for Modal
    mapIconButtonModal: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 6,
        padding: 4,
        gap: 4,
    },
    mapIconText: {
        fontSize: 11,
        color: '#FF8C00',
        fontWeight: '600',
    },
    // Description styles
    descriptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
    },
    descriptionBullet: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#FFF8F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#FFE8DC',
    },
    descriptionBulletText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FF8C00',
    },
    descriptionText: {
        flex: 1,
        fontSize: 13,
        color: '#444',
        lineHeight: 18,
    },
    noDescriptionText: {
        fontSize: 13,
        color: '#999',
        fontStyle: 'italic',
    },
    modalAmountSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF8F3',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFE8DC',
    },
    modalAmountLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    modalAmountLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    modalAmountValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FF8C00',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 10,
    },
    modalActionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    modalActionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    modalActionButtonPrimary: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#FF8C00',
        gap: 6,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    modalActionButtonPrimaryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
        fontWeight: '500',
    },
    emptySubtext: {
        fontSize: 13,
        color: '#999',
        marginTop: 4,
    },
});

export default ScheduleScreen;