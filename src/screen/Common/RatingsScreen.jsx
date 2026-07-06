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

const RatingsScreen = ({ navigation }) => {
    const [selectedTab, setSelectedTab] = useState('all'); // 'all' | '5' | '4' | '3' | '2' | '1'
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('July');
    const [selectedYear, setSelectedYear] = useState('2026');

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

    const starImages = {
        full: require('../../asset/star-fill.png'),
        half: require('../../asset/star-half.png'),
        empty: require('../../asset/star-outline.png'),
    };

    // Ratings data
    const ratingsData = {
        overallRating: 4.8,
        totalJobs: 342,
        totalReviews: 189,
        ratingDistribution: {
            5: 120,
            4: 45,
            3: 15,
            2: 6,
            1: 3,
        },
        recentFeedbacks: [
            {
                id: 1,
                customerName: 'Mr. Sharma',
                jobType: 'Plumbing Repair',
                date: '05 Jul 2026',
                rating: 5,
                feedback: 'Excellent work! Very professional and quick service. Fixed all issues perfectly.',
                location: 'Andheri East',
            },
            {
                id: 2,
                customerName: 'Mrs. Patel',
                jobType: 'Electrical Work',
                date: '03 Jul 2026',
                rating: 4,
                feedback: 'Good work, but could have been faster. Overall satisfied with the service.',
                location: 'Bandra West',
            },
            {
                id: 3,
                customerName: 'Mr. Singh',
                jobType: 'Cleaning Service',
                date: '01 Jul 2026',
                rating: 5,
                feedback: 'Amazing cleaning service! House looks spotless. Highly recommended.',
                location: 'Juhu',
            },
            {
                id: 4,
                customerName: 'Ms. Reddy',
                jobType: 'AC Repair',
                date: '28 Jun 2026',
                rating: 3,
                feedback: 'AC is working now but took longer than expected. Decent service.',
                location: 'Powai',
            },
            {
                id: 5,
                customerName: 'Mr. Gupta',
                jobType: 'Painting Work',
                date: '25 Jun 2026',
                rating: 5,
                feedback: 'Excellent painting job! Very neat and clean work. Will hire again.',
                location: 'Malad',
            },
            {
                id: 6,
                customerName: 'Mr. Kumar',
                jobType: 'Plumbing Repair',
                date: '22 Jun 2026',
                rating: 4,
                feedback: 'Good plumbing work. Fixed all leaks quickly. Reasonable pricing.',
                location: 'Andheri West',
            },
            {
                id: 7,
                customerName: 'Mrs. Shah',
                jobType: 'Electrical Work',
                date: '20 Jun 2026',
                rating: 2,
                feedback: 'Not satisfied with the wiring work. Had to call again for fixes.',
                location: 'Bandra East',
            },
        ],
    };

    // Filter feedbacks based on rating
    const getFilteredFeedbacks = () => {
        if (selectedTab === 'all') {
            return ratingsData.recentFeedbacks;
        }
        return ratingsData.recentFeedbacks.filter(item => item.rating === parseInt(selectedTab));
    };

    const filteredFeedbacks = getFilteredFeedbacks();

    // Calculate percentage for rating bars
    const getPercentage = (count) => {
        return Math.round((count / ratingsData.totalReviews) * 100) || 0;
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

    // Render stars horizontally
    const renderStars = (rating, size = 16) => {
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

    // Render feedback item
    const renderFeedbackItem = ({ item }) => (
        <View style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
                <View style={styles.feedbackCustomer}>
                    <View style={styles.feedbackAvatar}>
                        <Text style={styles.feedbackAvatarText}>👤</Text>
                    </View>
                    <View>
                        <Text style={styles.feedbackCustomerName}>{item.customerName}</Text>
                        <Text style={styles.feedbackJobType}>{item.jobType}</Text>
                    </View>
                </View>
                <View style={styles.feedbackRating}>
                    <Text style={styles.feedbackRatingText}>{item.rating}</Text>
                    <View style={styles.starsRow}>
                        {renderStars(item.rating, 12)}
                    </View>
                </View>
            </View>

            <Text style={styles.feedbackText}>"{item.feedback}"</Text>

            <View style={styles.feedbackFooter}>
                <View style={styles.feedbackMeta}>

                    <Image
                        source={require('../../asset/location-outline.png')}
                        style={{
                            width: 12,
                            height: 12,
                            tintColor: "#888",

                        }}
                    />
                    <Text style={styles.feedbackMetaText}>{item.location}</Text>
                </View>
                <View style={styles.feedbackMeta}>

                    <Image
                        source={require('../../asset/calendar-outline.png')}
                        style={{
                            width: 12,
                            height: 12,
                            tintColor: "#888",

                        }}
                    />
                    <Text style={styles.feedbackMetaText}>{item.date}</Text>
                </View>
            </View>
        </View>
    );

    // Filter Modal
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
                        <Text style={styles.modalTitle}>Filter Reviews</Text>
                        <TouchableOpacity onPress={() => setShowFilterModal(false)}>

                            <Image
                                source={require('../../asset/close.png')}
                                style={{
                                    width: 24,
                                    height: 24,
                                    tintColor: "#888",

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

                    <TouchableOpacity
                        style={styles.modalApplyButton}
                        onPress={() => {
                            setShowFilterModal(false);
                            Alert.alert('Filter Applied', `Showing reviews for ${selectedMonth} ${selectedYear}`);
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
                                tintColor: "#ffffff",

                            }}
                        />
                    </TouchableOpacity>
                    <View style={styles.toolbarCenter}>
                        <Text style={styles.toolbarTitle}>Ratings</Text>
                        <View style={styles.toolbarStatus}>
                            <View style={[styles.toolbarStatusDot, { backgroundColor: '#FFFFFF' }]} />
                            <Text style={styles.toolbarStatusText}>{selectedMonth} {selectedYear}</Text>
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
                {/* Overall Rating Section */}
                <Animated.View style={[styles.overallCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.overallTitle}>Overall Rating</Text>
                    <View style={styles.overallRatingContainer}>
                        <Text style={styles.overallRatingNumber}>{ratingsData.overallRating}</Text>
                        <View style={styles.overallRatingStarsHorizontal}>
                            {renderStars(ratingsData.overallRating, 24)}
                        </View>
                    </View>
                    <View style={styles.overallStats}>
                        <View style={styles.overallStat}>
                            <Text style={styles.overallStatValue}>{ratingsData.totalJobs}</Text>
                            <Text style={styles.overallStatLabel}>Total Jobs</Text>
                        </View>
                        <View style={styles.overallStatDivider} />
                        <View style={styles.overallStat}>
                            <Text style={styles.overallStatValue}>{ratingsData.totalReviews}</Text>
                            <Text style={styles.overallStatLabel}>Total Reviews</Text>
                        </View>
                        <View style={styles.overallStatDivider} />
                        <View style={styles.overallStat}>
                            <Text style={styles.overallStatValue}>95%</Text>
                            <Text style={styles.overallStatLabel}>Positive Rate</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Rating Distribution */}
                <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                    <Text style={styles.cardTitle}>Rating Distribution</Text>
                    {[5, 4, 3, 2, 1].map((star) => (
                        <View key={star} style={styles.distributionRow}>
                            <Text style={styles.distributionStar}>{star} ⭐</Text>
                            <View style={styles.distributionBar}>
                                <View
                                    style={[
                                        styles.distributionBarFill,
                                        { width: `${getPercentage(ratingsData.ratingDistribution[star])}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.distributionCount}>{ratingsData.ratingDistribution[star]}</Text>
                        </View>
                    ))}
                </Animated.View>

                {/* Rating Filter Tabs */}
                <Animated.View style={[styles.filterTabs, { opacity: fadeAnim }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {['All', '5', '4', '3', '2', '1'].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.filterTab, selectedTab === tab && styles.filterTabActive]}
                                onPress={() => setSelectedTab(tab)}
                            >
                                <Text style={[styles.filterTabText, selectedTab === tab && styles.filterTabTextActive]}>
                                    {tab} {tab !== 'All' && '⭐'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* Feedbacks List */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={styles.sectionTitle}>
                        {filteredFeedbacks.length} {filteredFeedbacks.length === 1 ? 'Review' : 'Reviews'}
                    </Text>
                    {filteredFeedbacks.length > 0 ? (
                        <FlatList
                            data={filteredFeedbacks}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderFeedbackItem}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>

                            <Image
                                source={require('../../asset/star.png')}
                                style={{
                                    width: 48,
                                    height: 48,
                                    tintColor: "#CCC",

                                }}
                            />
                            <Text style={styles.emptyText}>No reviews for this rating</Text>
                        </View>
                    )}
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
    // Overall Rating
    overallCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginTop: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        alignItems: 'center',
    },
    overallTitle: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    overallRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 12,
    },
    overallRatingNumber: {
        fontSize: 48,
        fontWeight: '700',
        color: '#1A1A1A',
        marginRight: 16,
    },
    overallRatingStarsHorizontal: {
        flexDirection: 'row',
        gap: 4,
    },
    overallStats: {
        flexDirection: 'row',
        width: '100%',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    overallStat: {
        flex: 1,
        alignItems: 'center',
    },
    overallStatValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    overallStatLabel: {
        fontSize: 11,
        color: '#888',
        marginTop: 2,
    },
    overallStatDivider: {
        width: 1,
        backgroundColor: '#F0F0F0',
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
    // Distribution
    distributionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
    },
    distributionStar: {
        fontSize: 13,
        color: '#444',
        fontWeight: '500',
        width: 50,
    },
    distributionBar: {
        flex: 1,
        height: 6,
        backgroundColor: '#F0F0F0',
        borderRadius: 3,
        marginHorizontal: 10,
        overflow: 'hidden',
    },
    distributionBarFill: {
        height: '100%',
        backgroundColor: '#FF8C00',
        borderRadius: 3,
    },
    distributionCount: {
        fontSize: 13,
        color: '#888',
        width: 30,
        textAlign: 'right',
    },
    // Filter Tabs
    filterTabs: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    filterTabActive: {
        backgroundColor: '#FF8C00',
        borderColor: '#FF8C00',
    },
    filterTabText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    filterTabTextActive: {
        color: '#FFFFFF',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    // Feedback Card
    feedbackCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    feedbackHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    feedbackCustomer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    feedbackAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFF8F3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    feedbackAvatarText: {
        fontSize: 16,
    },
    feedbackCustomerName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    feedbackJobType: {
        fontSize: 12,
        color: '#888',
    },
    feedbackRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    feedbackRatingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        marginRight: 4,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
    },
    feedbackText: {
        fontSize: 13,
        color: '#555',
        lineHeight: 18,
        marginBottom: 10,
        fontStyle: 'italic',
    },
    feedbackFooter: {
        flexDirection: 'row',
        gap: 16,
    },
    feedbackMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    feedbackMetaText: {
        fontSize: 11,
        color: '#888',
    },
    // Empty State
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
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

export default RatingsScreen;