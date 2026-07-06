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
} from 'react-native';


const { width, height } = Dimensions.get('window');

const EarningsScreen = ({ navigation }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('weekly');
    const [showForecast, setShowForecast] = useState(true);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('July');
    const [selectedYear, setSelectedYear] = useState('2026');
    const [selectedWeek, setSelectedWeek] = useState('Week 3');

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(1)).current;
    const headerTranslateY = useRef(new Animated.Value(0)).current;

    const ORANGE_COLOR = '#FF8C00';

    // Month options
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const years = ['2024', '2025', '2026', '2027', '2028'];
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

    // Earnings data with wallet/cash and withdrawal status
    const earningsData = {
        totalEarnings: 28450,
        todayEarnings: 1250,
        weeklyEarnings: 8450,
        monthlyEarnings: 28450,
        trend: '+12.5%',
        trendDirection: 'up',
        jobWiseBreakup: [
            { id: 1, jobType: 'Plumbing Repair', amount: 5600, count: 5, paymentMode: 'Wallet', withdrawn: true },
            { id: 2, jobType: 'Electrical Work', amount: 4800, count: 4, paymentMode: 'Cash', withdrawn: false },
            { id: 3, jobType: 'Cleaning Service', amount: 7200, count: 6, paymentMode: 'Wallet', withdrawn: false },
            { id: 4, jobType: 'AC Repair', amount: 4200, count: 3, paymentMode: 'Cash', withdrawn: false },
            { id: 5, jobType: 'Painting Work', amount: 6650, count: 4, paymentMode: 'Wallet', withdrawn: true },
        ],
        weeklyData: [
            { day: 'Mon', amount: 1200, change: 0 },
            { day: 'Tue', amount: 1800, change: 50 },
            { day: 'Wed', amount: 1500, change: -16.7 },
            { day: 'Thu', amount: 2200, change: 46.7 },
            { day: 'Fri', amount: 950, change: -56.8 },
            { day: 'Sat', amount: 800, change: -15.8 },
            { day: 'Sun', amount: 0, change: -100 },
        ],
        monthlyData: [
            { week: 'Week 1', amount: 6200, change: 0 },
            { week: 'Week 2', amount: 7800, change: 25.8 },
            { week: 'Week 3', amount: 5400, change: -30.8 },
            { week: 'Week 4', amount: 9050, change: 67.6 },
        ],
        futureForecast: [
            { id: 1, jobType: 'Plumbing Repair', date: 'Tomorrow', amount: 1200, status: 'scheduled' },
            { id: 2, jobType: 'Electrical Work', date: 'In 2 Days', amount: 850, status: 'scheduled' },
            { id: 3, jobType: 'Cleaning Service', date: 'In 3 Days', amount: 2500, status: 'scheduled' },
            { id: 4, jobType: 'AC Repair', date: 'In 4 Days', amount: 1500, status: 'scheduled' },
            { id: 5, jobType: 'Painting Work', date: 'In 5 Days', amount: 3200, status: 'scheduled' },
        ],
    };

    const getMaxAmount = () => {
        const data = selectedPeriod === 'weekly' ? earningsData.weeklyData : earningsData.monthlyData;
        return Math.max(...data.map(item => item.amount)) * 1.2 || 1000;
    };

    const maxAmount = getMaxAmount();

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

    // Handle withdraw for Wallet payments only
    const handleWithdraw = (jobType, amount) => {
        Alert.alert(
            'Withdraw Wallet Earnings',
            `Do you want to withdraw ₹${amount.toLocaleString()} from "${jobType}" to your bank account?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Withdraw',
                    onPress: () => {
                        Alert.alert('Success', `₹${amount.toLocaleString()} has been withdrawn to your bank account!`);
                    }
                }
            ]
        );
    };

    // Render bar chart with trend indicators
    const renderBarChart = () => {
        const data = selectedPeriod === 'weekly' ? earningsData.weeklyData : earningsData.monthlyData;
        const labels = data.map(item => selectedPeriod === 'weekly' ? item.day : item.week);

        return (
            <View style={styles.barChartContainer}>
                <View style={styles.barChart}>
                    {data.map((item, index) => {
                        const barHeight = (item.amount / maxAmount) * 140;
                        const isPositive = item.change >= 0;
                        const showTrend = item.change !== 0;

                        return (
                            <View key={index} style={styles.barItem}>
                                <View style={styles.barWrapper}>
                                    {showTrend && (
                                        <View style={[styles.trendIndicator, isPositive ? styles.trendUp : styles.trendDown]}>
                                            <Image
                                                source={
                                                    isPositive
                                                        ? require('../../asset/arrow-up.png')
                                                        : require('../../asset/arrow-down.png')
                                                }
                                                style={{
                                                    width: 10,
                                                    height: 10,
                                                    tintColor: isPositive ? '#4CAF50' : '#FF4444', // Remove if your PNGs are already colored
                                                    resizeMode: 'contain',
                                                }}
                                            />
                                            <Text style={[styles.trendText, isPositive ? styles.trendUpText : styles.trendDownText]}>
                                                {Math.abs(item.change)}%
                                            </Text>
                                        </View>
                                    )}
                                    <View style={[styles.bar, { height: Math.max(barHeight, 10) }]} />
                                    <Text style={styles.barAmount}>₹{item.amount}</Text>
                                </View>
                                <Text style={styles.barLabel}>{labels[index]}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    // Render earnings summary cards - All cards with consistent style (no borders)
    const renderEarningsCards = () => (
        <View style={styles.earningsGrid}>
            <View style={styles.earningCard}>
                <View style={styles.earningCardIcon}>

                    <Image
                        source={require('../../asset/money.png')}
                        style={{
                            width: 22,
                            height: 22,
                            tintColor: "#FFFFFF",

                        }}
                    />
                </View>
                <Text style={styles.earningCardLabel}>Total</Text>
                <Text style={styles.earningCardValue}>₹{earningsData.totalEarnings.toLocaleString()}</Text>
            </View>
            <View style={styles.earningCard}>
                <View style={[styles.earningCardIcon, { backgroundColor: '#2196F3' }]}>

                    <Image
                        source={require('../../asset/today.png')}
                        style={{
                            width: 22,
                            height: 22,
                            tintColor: "#FFFFFF",

                        }}
                    />
                </View>
                <Text style={styles.earningCardLabel}>Today</Text>
                <Text style={styles.earningCardValue}>₹{earningsData.todayEarnings}</Text>
            </View>
            <View style={styles.earningCard}>
                <View style={[styles.earningCardIcon, { backgroundColor: '#FF8C00' }]}>

                    <Image
                        source={require('../../asset/calendar-outline.png')}
                        style={{
                            width: 22,
                            height: 22,
                            tintColor: "#FFFFFF",

                        }}
                    />
                </View>
                <Text style={styles.earningCardLabel}>This Week</Text>
                <Text style={styles.earningCardValue}>₹{earningsData.weeklyEarnings.toLocaleString()}</Text>
            </View>
            <View style={styles.earningCard}>
                <View style={[styles.earningCardIcon, { backgroundColor: '#4CAF50' }]}>
                    <Image
                        source={require('../../asset/calendar-outline.png')}
                        style={{
                            width: 22,
                            height: 22,
                            tintColor: "#FFFFFF",
                        }}
                    />
                </View>
                <Text style={styles.earningCardLabel}>This Month</Text>
                <Text style={styles.earningCardValue}>₹{earningsData.monthlyEarnings.toLocaleString()}</Text>
            </View>
        </View>
    );

    // Render job-wise breakup with wallet/cash and withdrawal status
    const renderJobWiseBreakup = () => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Job-wise Earnings Breakup</Text>
            {earningsData.jobWiseBreakup.map((job, index) => (
                <View key={job.id} style={styles.jobBreakupItem}>
                    <View style={styles.jobBreakupLeft}>
                        <View style={styles.jobBreakupIcon}>
                            <Text style={styles.jobBreakupIconText}>{['🔧', '⚡', '🧹', '❄️', '🎨'][index]}</Text>
                        </View>
                        <View style={styles.jobBreakupInfo}>
                            <Text style={styles.jobBreakupName}>{job.jobType}</Text>
                            <Text style={styles.jobBreakupCount}>{job.count} jobs</Text>
                        </View>
                    </View>
                    <View style={styles.jobBreakupRight}>
                        <Text style={styles.jobBreakupAmount}>₹{job.amount.toLocaleString()}</Text>
                        <View style={styles.jobBreakupBottom}>
                            {/* Payment Mode Badge */}
                            <View style={[styles.paymentModeBadge, job.paymentMode === 'Wallet' ? styles.paymentWallet : styles.paymentCash]}>
                                <Image
                                    source={
                                        job.paymentMode === 'Wallet'
                                            ? require('../../asset/wallet.png')
                                            : require('../../asset/money.png')
                                    }
                                    style={{
                                        width: 12,
                                        height: 12,
                                        tintColor: job.paymentMode === 'Wallet' ? '#4CAF50' : '#FF8C00', // Remove if your PNGs are already colored
                                        resizeMode: 'contain',
                                    }}
                                />
                                <Text style={[styles.paymentModeText, job.paymentMode === 'Wallet' ? styles.paymentWalletText : styles.paymentCashText]}>
                                    {job.paymentMode}
                                </Text>
                            </View>

                            {/* Withdrawal Status - Only for Wallet payments */}
                            {job.paymentMode === 'Wallet' && (
                                job.withdrawn ? (
                                    <View style={styles.withdrawnBadge}>

                                        <Image
                                            source={require('../../asset/checked.png')}
                                            style={{
                                                width: 14,
                                                height: 14,
                                                tintColor: "#4CAF50",

                                            }}
                                        />
                                        <Text style={styles.withdrawnText}>Withdrawn</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.withdrawButton}
                                        onPress={() => handleWithdraw(job.jobType, job.amount)}
                                    >

                                        <Image
                                            source={require('../../asset/arrow-up.png')}
                                            style={{
                                                width: 14,
                                                height: 14,
                                                tintColor: "#FFFFFF",

                                            }}
                                        />
                                        <Text style={styles.withdrawText}>Withdraw</Text>
                                    </TouchableOpacity>
                                )
                            )}
                            {/* For Cash payments - show Cash Received status */}
                            {job.paymentMode === 'Cash' && (
                                <View style={styles.cashReceivedBadge}>

                                    <Image
                                        source={require('../../asset/checked.png')}
                                        style={{
                                            width: 14,
                                            height: 14,
                                            tintColor: "#FF8C00",

                                        }}
                                    />
                                    <Text style={styles.cashReceivedText}>Cash Received</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );

    // Render future forecast
    const renderFutureForecast = () => (
        <View style={styles.card}>
            <View style={styles.forecastHeader}>
                <Text style={styles.cardTitle}>Future Earnings Forecast</Text>
                <TouchableOpacity onPress={() => setShowForecast(!showForecast)}>
                    <Image
                        source={
                            showForecast
                                ? require('../../asset/chevron-up.png')
                                : require('../../asset/chevron-down.png')
                        }
                        style={{
                            width: 20,
                            height: 20,
                            tintColor: '#666', // Remove if your PNGs are already colored
                            resizeMode: 'contain',
                        }}
                    />
                </TouchableOpacity>
            </View>
            {showForecast && (
                <>
                    <View style={styles.forecastTotal}>
                        <Text style={styles.forecastTotalLabel}>Projected Earnings</Text>
                        <Text style={styles.forecastTotalValue}>
                            ₹{earningsData.futureForecast.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                        </Text>
                    </View>
                    {earningsData.futureForecast.map((item) => (
                        <View key={item.id} style={styles.forecastItem}>
                            <View style={styles.forecastItemLeft}>
                                <Text style={styles.forecastItemIcon}>{item.jobType === 'Plumbing Repair' ? '🔧' :
                                    item.jobType === 'Electrical Work' ? '⚡' :
                                        item.jobType === 'Cleaning Service' ? '🧹' :
                                            item.jobType === 'AC Repair' ? '❄️' : '🎨'}</Text>
                                <View>
                                    <Text style={styles.forecastItemName}>{item.jobType}</Text>
                                    <Text style={styles.forecastItemDate}>📅 {item.date}</Text>
                                </View>
                            </View>
                            <Text style={styles.forecastItemAmount}>₹{item.amount.toLocaleString()}</Text>
                        </View>
                    ))}
                </>
            )}
        </View>
    );

    // Filter Modal with Week option
    const renderFilterModal = () => (
        <Modal
            visible={showFilterModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowFilterModal(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowFilterModal(false)}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filter Earnings</Text>
                        <TouchableOpacity onPress={() => setShowFilterModal(false)}>

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

                    <Text style={styles.modalLabel}>Month</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalOptions}>
                        {months.map((month) => (
                            <TouchableOpacity
                                key={month}
                                style={[styles.modalOption, selectedMonth === month && styles.modalOptionActive]}
                                onPress={() => setSelectedMonth(month)}
                            >
                                <Text style={[styles.modalOptionText, selectedMonth === month && styles.modalOptionTextActive]}>
                                    {month.substring(0, 3)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={[styles.modalLabel, { marginTop: 16 }]}>Year</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalOptions}>
                        {years.map((year) => (
                            <TouchableOpacity
                                key={year}
                                style={[styles.modalOption, selectedYear === year && styles.modalOptionActive]}
                                onPress={() => setSelectedYear(year)}
                            >
                                <Text style={[styles.modalOptionText, selectedYear === year && styles.modalOptionTextActive]}>
                                    {year}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={[styles.modalLabel, { marginTop: 16 }]}>Week (for weekly view)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalOptions}>
                        {weeks.map((week) => (
                            <TouchableOpacity
                                key={week}
                                style={[styles.modalOption, selectedWeek === week && styles.modalOptionActive]}
                                onPress={() => setSelectedWeek(week)}
                            >
                                <Text style={[styles.modalOptionText, selectedWeek === week && styles.modalOptionTextActive]}>
                                    {week}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <TouchableOpacity
                        style={styles.modalApplyButton}
                        onPress={() => {
                            setShowFilterModal(false);
                            Alert.alert('Filter Applied', `Showing earnings for ${selectedWeek}, ${selectedMonth} ${selectedYear}`);
                        }}
                    >
                        <Text style={styles.modalApplyText}>Apply Filter</Text>
                    </TouchableOpacity>
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
                        <Text style={styles.toolbarTitle}>Earnings</Text>
                        <View style={styles.toolbarStatus}>
                            <View style={[styles.toolbarStatusDot, { backgroundColor: '#FFFFFF' }]} />
                            <Text style={styles.toolbarStatusText}>{selectedWeek}, {selectedMonth} {selectedYear}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.toolbarFilter}
                        onPress={() => setShowFilterModal(true)}
                    >

                        <Image
                            source={require('../../asset/filter.png')}
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
                {/* Earnings Summary Cards - All consistent, no top borders */}
                <Animated.View style={[styles.earningsSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    {renderEarningsCards()}
                </Animated.View>

                {/* Period Selector */}
                <Animated.View style={[styles.periodSelector, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={[styles.periodButton, selectedPeriod === 'weekly' && styles.periodButtonActive]}
                        onPress={() => setSelectedPeriod('weekly')}
                    >
                        <Text style={[styles.periodText, selectedPeriod === 'weekly' && styles.periodTextActive]}>
                            Weekly
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.periodButton, selectedPeriod === 'monthly' && styles.periodButtonActive]}
                        onPress={() => setSelectedPeriod('monthly')}
                    >
                        <Text style={[styles.periodText, selectedPeriod === 'monthly' && styles.periodTextActive]}>
                            Monthly
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Bar Chart with Trend Indicators */}
                <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.cardTitle}>
                            {selectedPeriod === 'weekly' ? 'Weekly Earnings' : 'Monthly Earnings'}
                        </Text>
                        <View style={styles.chartLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                                <Text style={styles.legendText}>Increase</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#FF4444' }]} />
                                <Text style={styles.legendText}>Decrease</Text>
                            </View>
                        </View>
                    </View>
                    {renderBarChart()}
                </Animated.View>

                {/* Job-wise Breakup with Wallet/Cash & Withdrawal Status */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    {renderJobWiseBreakup()}
                </Animated.View>

                {/* Future Forecast */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    {renderFutureForecast()}
                </Animated.View>

                <View style={{ height: 20 }} />
            </Animated.ScrollView>

            {/* Filter Modal */}
            {renderFilterModal()}
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
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    earningsSection: {
        marginTop: 20,
    },
    // Earnings Cards - All consistent, no top borders
    earningsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 16,
    },
    earningCard: {
        flex: 1,
        minWidth: (width - 60) / 2 - 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    earningCardIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FF8C00',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    earningCardLabel: {
        fontSize: 11,
        color: '#888',
        fontWeight: '500',
    },
    earningCardValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginTop: 2,
    },
    // Period Selector
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    periodButtonActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    periodText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#888',
    },
    periodTextActive: {
        color: '#1A1A1A',
        fontWeight: '600',
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
    // Chart Header
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    chartLegend: {
        flexDirection: 'row',
        gap: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 10,
        color: '#888',
        fontWeight: '500',
    },
    // Bar Chart
    barChartContainer: {
        paddingVertical: 10,
    },
    barChart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 200,
        paddingBottom: 20,
    },
    barItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    barWrapper: {
        alignItems: 'center',
        gap: 4,
    },
    bar: {
        width: 28,
        backgroundColor: '#FF8C00',
        borderRadius: 6,
        minHeight: 10,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    barAmount: {
        fontSize: 10,
        color: '#888',
        fontWeight: '500',
    },
    barLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
    },
    trendIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 2,
    },
    trendUp: {
        backgroundColor: '#E8F5E9',
    },
    trendDown: {
        backgroundColor: '#FFEBEE',
    },
    trendText: {
        fontSize: 8,
        fontWeight: '600',
    },
    trendUpText: {
        color: '#4CAF50',
    },
    trendDownText: {
        color: '#FF4444',
    },
    // Job Breakup with Wallet/Cash & Withdrawal
    jobBreakupItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    jobBreakupLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    jobBreakupIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FFF8F3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    jobBreakupIconText: {
        fontSize: 16,
    },
    jobBreakupInfo: {
        flex: 1,
    },
    jobBreakupName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    jobBreakupCount: {
        fontSize: 11,
        color: '#888',
    },
    jobBreakupRight: {
        alignItems: 'flex-end',
    },
    jobBreakupAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF8C00',
        marginBottom: 4,
    },
    jobBreakupBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    paymentModeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 3,
    },
    paymentWallet: {
        backgroundColor: '#E8F5E9',
    },
    paymentCash: {
        backgroundColor: '#FFF8F3',
    },
    paymentModeText: {
        fontSize: 9,
        fontWeight: '600',
    },
    paymentWalletText: {
        color: '#4CAF50',
    },
    paymentCashText: {
        color: '#FF8C00',
    },
    withdrawnBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    withdrawnText: {
        fontSize: 11,
        color: '#4CAF50',
        fontWeight: '500',
    },
    cashReceivedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    cashReceivedText: {
        fontSize: 11,
        color: '#FF8C00',
        fontWeight: '500',
    },
    withdrawButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF8C00',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    withdrawText: {
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    // Forecast
    forecastHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    forecastTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF8F3',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#FFE8DC',
    },
    forecastTotalLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    forecastTotalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FF8C00',
    },
    forecastItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    forecastItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    forecastItemIcon: {
        fontSize: 18,
    },
    forecastItemName: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    forecastItemDate: {
        fontSize: 11,
        color: '#888',
    },
    forecastItemAmount: {
        fontSize: 14,
        fontWeight: '600',
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
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
        marginBottom: 8,
    },
    modalOptions: {
        flexDirection: 'row',
        maxHeight: 40,
    },
    modalOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#F8F9FA',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    modalOptionActive: {
        backgroundColor: '#FF8C00',
        borderColor: '#FF8C00',
    },
    modalOptionText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    modalOptionTextActive: {
        color: '#FFFFFF',
    },
    modalApplyButton: {
        backgroundColor: '#FF8C00',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    modalApplyText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default EarningsScreen;