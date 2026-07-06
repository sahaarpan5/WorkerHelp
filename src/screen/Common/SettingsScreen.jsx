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
    Switch,
    Modal,
    Alert,
    PanResponder,
    Image,
} from 'react-native';


const { width, height } = Dimensions.get('window');

const SettingsScreen = ({ navigation }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [selectedTheme, setSelectedTheme] = useState('Light');
    const [maxTravelDistance, setMaxTravelDistance] = useState('10 km');
    const [acceptEmergencyJobs, setAcceptEmergencyJobs] = useState(true);
    const [acceptNightShiftJobs, setAcceptNightShiftJobs] = useState(false);
    const [dailyEarningsGoal, setDailyEarningsGoal] = useState(1500);
    const [weeklyEarningsGoal, setWeeklyEarningsGoal] = useState(10500);
    const [voiceAssistance, setVoiceAssistance] = useState(true);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [showDistanceModal, setShowDistanceModal] = useState(false);
    const [showDailyGoalModal, setShowDailyGoalModal] = useState(false);
    const [showWeeklyGoalModal, setShowWeeklyGoalModal] = useState(false);
    const [tempDailyGoal, setTempDailyGoal] = useState(1500);
    const [tempWeeklyGoal, setTempWeeklyGoal] = useState(10500);
    const [sliderWidth, setSliderWidth] = useState(0);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(1)).current;
    const headerTranslateY = useRef(new Animated.Value(0)).current;

    const ORANGE_COLOR = '#FF8C00';

    // Language options
    const languages = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Bengali'];

    // Theme options
    const themes = ['Light', 'Dark', 'System'];

    // Distance options
    const distances = ['5 km', '10 km', '15 km', '20 km', '25 km', '50 km'];

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

    // Custom Slider PanResponder
    const createSliderPanResponder = (value, setValue, min, max, step) => {
        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                // Calculate initial position
                const { locationX } = evt.nativeEvent;
                const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
                const newValue = Math.round((min + percentage * (max - min)) / step) * step;
                setValue(Math.max(min, Math.min(max, newValue)));
            },
            onPanResponderMove: (evt, gestureState) => {
                const { locationX } = evt.nativeEvent;
                const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
                const newValue = Math.round((min + percentage * (max - min)) / step) * step;
                setValue(Math.max(min, Math.min(max, newValue)));
            },
        });
    };

    // Create pan responders for both sliders
    const dailyPanResponder = createSliderPanResponder(tempDailyGoal, setTempDailyGoal, 500, 5000, 100);
    const weeklyPanResponder = createSliderPanResponder(tempWeeklyGoal, setTempWeeklyGoal, 5000, 25000, 500);

    // Render settings item
    const renderSettingsItem = (icon, label, value, onPress, type = 'navigate', showValue = true) => (
        <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
            <View style={styles.settingsItemLeft}>
                <View style={styles.settingsIconContainer}>
                    <Image
                        source={icon}
                        style={{
                            width: 20,
                            height: 20,
                            tintColor: ORANGE_COLOR, // Remove if your PNG is already colored
                            resizeMode: 'contain',
                        }}
                    />
                </View>
                <Text style={styles.settingsLabel}>{label}</Text>
            </View>
            <View style={styles.settingsItemRight}>
                {type === 'switch' ? (
                    <Switch
                        value={value}
                        onValueChange={onPress}
                        trackColor={{ false: '#E8E8E8', true: '#FFE8DC' }}
                        thumbColor={value ? ORANGE_COLOR : '#F5F5F5'}
                    />
                ) : (
                    <>
                        {showValue && <Text style={styles.settingsValue}>{value}</Text>}

                        <Image
                            source={require('../../asset/arrow-forward.png')}
                            style={{
                                width: 18,
                                height: 18,
                                tintColor: "#CCC",

                            }}
                        />
                    </>
                )}
            </View>
        </TouchableOpacity>
    );

    // Custom Slider Component
    const CustomSlider = ({ value, setValue, min, max, step, prefix = '₹', panResponder }) => {
        const percentage = ((value - min) / (max - min)) * 100;
        const displayValue = value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toString();

        return (
            <View style={styles.customSliderContainer}>
                <View style={styles.customSliderTrack}>
                    <View
                        style={[
                            styles.customSliderFill,
                            { width: `${Math.max(0, Math.min(100, percentage))}%` }
                        ]}
                    />
                    <View
                        style={[
                            styles.customSliderThumb,
                            { left: `${Math.max(0, Math.min(100, percentage))}%` }
                        ]}
                        {...panResponder.panHandlers}
                    >
                        <View style={styles.customSliderThumbInner} />
                    </View>
                </View>
                <View style={styles.customSliderLabels}>
                    <Text style={styles.customSliderLabel}>{prefix}{min.toLocaleString()}</Text>
                    <Text style={styles.customSliderValue}>{prefix}{displayValue}</Text>
                    <Text style={styles.customSliderLabel}>{prefix}{max.toLocaleString()}</Text>
                </View>
            </View>
        );
    };

    // Render Modal with Custom Slider
    const renderSliderModal = (visible, setVisible, title, value, setValue, tempValue, setTempValue, min, max, step, prefix = '₹', panResponder) => (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => setVisible(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setVisible(false)}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={() => setVisible(false)}>

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

                    <View style={styles.sliderContainer}>
                        <View style={styles.sliderValueContainer}>
                            <Text style={styles.sliderValueLabel}>Current Goal</Text>
                            <Text style={styles.sliderValue}>{prefix}{tempValue.toLocaleString()}</Text>
                        </View>

                        <View
                            style={styles.sliderWrapper}
                            onLayout={(event) => {
                                const { width: layoutWidth } = event.nativeEvent.layout;
                                setSliderWidth(layoutWidth - 20);
                            }}
                        >
                            <CustomSlider
                                value={tempValue}
                                setValue={setTempValue}
                                min={min}
                                max={max}
                                step={step}
                                prefix={prefix}
                                panResponder={panResponder}
                            />
                        </View>

                        <View style={styles.sliderQuickAmounts}>
                            {[min, Math.round((min + max) / 4), Math.round((min + max) / 2), Math.round(3 * (min + max) / 4), max].map((amount) => (
                                <TouchableOpacity
                                    key={amount}
                                    style={[styles.sliderQuickAmount, tempValue === amount && styles.sliderQuickAmountActive]}
                                    onPress={() => setTempValue(amount)}
                                >
                                    <Text style={[styles.sliderQuickAmountText, tempValue === amount && styles.sliderQuickAmountTextActive]}>
                                        {prefix}{amount >= 1000 ? `${(amount / 1000).toFixed(0)}K` : amount}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.modalCancelButton]}
                            onPress={() => setVisible(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.modalApplyButton]}
                            onPress={() => {
                                setValue(tempValue);
                                setVisible(false);
                            }}
                        >
                            <Text style={styles.modalApplyText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    // Render Modal with options
    const renderOptionsModal = (visible, setVisible, title, options, selectedValue, setSelectedValue) => (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => setVisible(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setVisible(false)}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select {title}</Text>
                        <TouchableOpacity onPress={() => setVisible(false)}>

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
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[styles.modalOptionItem, selectedValue === option && styles.modalOptionItemActive]}
                            onPress={() => {
                                setSelectedValue(option);
                                setVisible(false);
                            }}
                        >
                            <Text style={[styles.modalOptionItemText, selectedValue === option && styles.modalOptionItemTextActive]}>
                                {option}
                            </Text>
                            {selectedValue === option && (
                                <Image
                                    source={require('../../asset/check-mark.png')}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        tintColor: ORANGE_COLOR,
                                    }}
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
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
                        <Text style={styles.toolbarTitle}>Settings</Text>
                        <View style={styles.toolbarStatus}>
                            <View style={[styles.toolbarStatusDot, { backgroundColor: '#FFFFFF' }]} />
                            <Text style={styles.toolbarStatusText}>Preferences</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.toolbarReset}>
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
                {/* General Settings */}
                <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.sectionTitle}>General</Text>
                    <View style={styles.sectionCard}>
                        {renderSettingsItem(
                            require('../../asset/language.png'),
                            'Language',
                            selectedLanguage,
                            () => setShowLanguageModal(true)
                        )}
                        {renderSettingsItem(
                            require('../../asset/art.png'),
                            'Theme',
                            selectedTheme,
                            () => setShowThemeModal(true)
                        )}
                       
                    </View>
                </Animated.View>

                {/* Work Preferences */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <Text style={styles.sectionTitle}>Work Preferences</Text>
                    <View style={styles.sectionCard}>
                        {renderSettingsItem(
                            require('../../asset/location-outline.png'),
                            'Maximum Travel Distance',
                            maxTravelDistance,
                            () => setShowDistanceModal(true)
                        )}
                        {renderSettingsItem(
                            require('../../asset/emergency.png'),
                            'Accept Emergency Jobs',
                            acceptEmergencyJobs,
                            () => setAcceptEmergencyJobs(!acceptEmergencyJobs),
                            'switch'
                        )}
                        {renderSettingsItem(
                            require('../../asset/moon.png'),
                            'Accept Night Shift Jobs',
                            acceptNightShiftJobs,
                            () => setAcceptNightShiftJobs(!acceptNightShiftJobs),
                            'switch'
                        )}
                    </View>
                </Animated.View>

                {/* Earnings Goals with Custom Slider */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <Text style={styles.sectionTitle}>Earnings Goals</Text>
                    <View style={styles.sectionCard}>
                        {renderSettingsItem(
                            require('../../asset/money.png'),
                            'Daily Earnings Goal',
                            `₹${dailyEarningsGoal.toLocaleString()}`,
                            () => {
                                setTempDailyGoal(dailyEarningsGoal);
                                setShowDailyGoalModal(true);
                            }
                        )}
                        {renderSettingsItem(
                            require('../../asset/calendar-outline.png'),
                            'Weekly Earnings Goal',
                            `₹${weeklyEarningsGoal.toLocaleString()}`,
                            () => {
                                setTempWeeklyGoal(weeklyEarningsGoal);
                                setShowWeeklyGoalModal(true);
                            }
                        )}
                    </View>
                </Animated.View>

                {/* Accessibility */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <Text style={styles.sectionTitle}>Accessibility</Text>
                    <View style={styles.sectionCard}>
                        {renderSettingsItem(
                           require('../../asset/mic.png'),
                            'Voice Assistance',
                            voiceAssistance,
                            () => setVoiceAssistance(!voiceAssistance),
                            'switch'
                        )}
                    </View>
                </Animated.View>

                {/* About Section */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <View style={styles.sectionCard}>
                        <TouchableOpacity style={styles.settingsItem}>
                            <View style={styles.settingsItemLeft}>
                                <View style={styles.settingsIconContainer}>

                                    <Image
                                        source={require('../../asset/information.png')}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            tintColor: ORANGE_COLOR,
                                        }}
                                    />
                                </View>
                                <Text style={styles.settingsLabel}>Version</Text>
                            </View>
                            <View style={styles.settingsItemRight}>
                                <Text style={styles.settingsValue}>2.4.0</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.settingsItem}>
                            <View style={styles.settingsItemLeft}>
                                <View style={styles.settingsIconContainer}>
                                    <Image
                                        source={require('../../asset/terms-and-conditions.png')}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            tintColor: ORANGE_COLOR,
                                        }}
                                    />
                                </View>
                                <Text style={styles.settingsLabel}>Terms & Conditions</Text>
                            </View>
                            <View style={styles.settingsItemRight}>

                                <Image
                                    source={require('../../asset/arrow-forward.png')}
                                    style={{
                                        width: 18,
                                        height: 18,
                                        tintColor: "#CCC",
                                    }}
                                />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.settingsItem}>
                            <View style={styles.settingsItemLeft}>
                                <View style={styles.settingsIconContainer}>

                                    <Image
                                        source={require('../../asset/verified.png')}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            tintColor: ORANGE_COLOR,
                                        }}
                                    />
                                </View>
                                <Text style={styles.settingsLabel}>Privacy Policy</Text>
                            </View>
                            <View style={styles.settingsItemRight}>
                                <Image
                                    source={require('../../asset/arrow-forward.png')}
                                    style={{
                                        width: 18,
                                        height: 18,
                                        tintColor: "#CCC",
                                    }}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Logout Button */}
                <Animated.View style={[styles.logoutContainer, { opacity: fadeAnim }]}>
                    <TouchableOpacity style={styles.logoutButton}>

                        <Image
                            source={require('../../asset/log-out.png')}
                            style={{
                                width: 20,
                                height: 20,
                                tintColor: "#FF4444",
                            }}
                        />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </Animated.View>

                <View style={{ height: 20 }} />
            </Animated.ScrollView>

            {/* Modals */}
            {renderOptionsModal(showLanguageModal, setShowLanguageModal, 'Language', languages, selectedLanguage, setSelectedLanguage)}
            {renderOptionsModal(showThemeModal, setShowThemeModal, 'Theme', themes, selectedTheme, setSelectedTheme)}
            {renderOptionsModal(showDistanceModal, setShowDistanceModal, 'Distance', distances, maxTravelDistance, setMaxTravelDistance)}

            {/* Daily Goal Slider Modal */}
            {renderSliderModal(
                showDailyGoalModal,
                setShowDailyGoalModal,
                'Set Daily Earnings Goal',
                dailyEarningsGoal,
                setDailyEarningsGoal,
                tempDailyGoal,
                setTempDailyGoal,
                500,
                5000,
                100,
                '₹',
                dailyPanResponder
            )}

            {/* Weekly Goal Slider Modal */}
            {renderSliderModal(
                showWeeklyGoalModal,
                setShowWeeklyGoalModal,
                'Set Weekly Earnings Goal',
                weeklyEarningsGoal,
                setWeeklyEarningsGoal,
                tempWeeklyGoal,
                setTempWeeklyGoal,
                5000,
                25000,
                500,
                '₹',
                weeklyPanResponder
            )}
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
    toolbarReset: {
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
    // Section
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 10,
        marginLeft: 4,
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    // Settings Item
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    settingsItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingsIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#FFF8F3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsLabel: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    settingsItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    settingsValue: {
        fontSize: 14,
        color: '#888',
    },
    // Custom Slider
    customSliderContainer: {
        width: '100%',
        paddingVertical: 8,
    },
    customSliderTrack: {
        width: '100%',
        height: 6,
        backgroundColor: '#E8E8E8',
        borderRadius: 3,
        position: 'relative',
        justifyContent: 'center',
    },
    customSliderFill: {
        height: '100%',
        backgroundColor: '#FF8C00',
        borderRadius: 3,
        position: 'absolute',
        left: 0,
        top: 0,
    },
    customSliderThumb: {
        position: 'absolute',
        top: -10,
        width: 26,
        height: 26,
        marginLeft: -13,
        backgroundColor: '#FFFFFF',
        borderRadius: 13,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    customSliderThumbInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF8C00',
    },
    customSliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 4,
    },
    customSliderLabel: {
        fontSize: 11,
        color: '#999',
    },
    customSliderValue: {
        fontSize: 13,
        color: '#FF8C00',
        fontWeight: '600',
    },
    // Slider Modal
    sliderContainer: {
        paddingVertical: 8,
    },
    sliderValueContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sliderValueLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    sliderValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FF8C00',
    },
    sliderWrapper: {
        paddingHorizontal: 10,
    },
    sliderQuickAmounts: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 16,
        justifyContent: 'center',
    },
    sliderQuickAmount: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    sliderQuickAmountActive: {
        backgroundColor: '#FFF8F3',
        borderColor: '#FF8C00',
    },
    sliderQuickAmountText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    sliderQuickAmountTextActive: {
        color: '#FF8C00',
    },
    // Modal
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
        width: width * 0.9,
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
    modalOptionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    modalOptionItemActive: {
        backgroundColor: '#FFF8F3',
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    modalOptionItemText: {
        fontSize: 15,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    modalOptionItemTextActive: {
        color: '#FF8C00',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
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
    modalApplyButton: {
        backgroundColor: '#FF8C00',
    },
    modalApplyText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    // Logout
    logoutContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: '#FFEBEE',
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FF4444',
    },
});

export default SettingsScreen;