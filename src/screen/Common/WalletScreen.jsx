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
    TextInput,
    Alert,
    ImageBackground,
} from 'react-native';


const { width, height } = Dimensions.get('window');

const WalletScreen = ({ navigation }) => {
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [showBankDetails, setShowBankDetails] = useState(false);
    const [selectedBank, setSelectedBank] = useState('HDFC Bank');

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(1)).current;
    const headerTranslateY = useRef(new Animated.Value(0)).current;
    const balanceScaleAnim = useRef(new Animated.Value(0.8)).current;
    const balanceFadeAnim = useRef(new Animated.Value(0)).current;

    const ORANGE_COLOR = '#FF8C00';

    // Wallet data
    const walletData = {
        currentBalance: 16850,
        totalWithdrawn: 28450,
        pendingWithdrawal: 0,
        bankAccounts: [
            { id: 1, bankName: 'HDFC Bank', accountNumber: 'XXXX-XXXX-1234', accountHolder: 'Rajesh Kumar', ifsc: 'HDFC0001234' },
            { id: 2, bankName: 'ICICI Bank', accountNumber: 'XXXX-XXXX-5678', accountHolder: 'Rajesh Kumar', ifsc: 'ICIC0005678' },
        ],
        withdrawalHistory: [
            { id: 1, date: '05 Jul 2026', amount: 2500, status: 'completed', method: 'Bank Transfer' },
            { id: 2, date: '28 Jun 2026', amount: 1800, status: 'completed', method: 'Bank Transfer' },
            { id: 3, date: '20 Jun 2026', amount: 3200, status: 'completed', method: 'Bank Transfer' },
            { id: 4, date: '15 Jun 2026', amount: 1500, status: 'pending', method: 'Bank Transfer' },
            { id: 5, date: '10 Jun 2026', amount: 2100, status: 'completed', method: 'Bank Transfer' },
        ],
    };

    // Calculate total withdrawn
    const totalWithdrawn = walletData.withdrawalHistory
        .filter(item => item.status === 'completed')
        .reduce((sum, item) => sum + item.amount, 0);

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
            Animated.spring(balanceScaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(balanceFadeAnim, {
                toValue: 1,
                duration: 800,
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

    // Handle withdraw
    const handleWithdraw = () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount');
            return;
        }
        if (amount > walletData.currentBalance) {
            Alert.alert('Insufficient Balance', 'You cannot withdraw more than your current balance');
            return;
        }
        if (amount < 100) {
            Alert.alert('Minimum Amount', 'Minimum withdrawal amount is ₹100');
            return;
        }

        Alert.alert(
            'Confirm Withdrawal',
            `Do you want to withdraw ₹${amount.toLocaleString()} to ${selectedBank}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => {
                        Alert.alert('Success', `₹${amount.toLocaleString()} has been initiated for withdrawal!`);
                        setShowWithdrawModal(false);
                        setWithdrawAmount('');
                    }
                }
            ]
        );
    };

    // Render bank account with masking
    const renderBankAccount = () => (
        <View style={styles.bankCard}>
            <View style={styles.bankCardHeader}>
                <View style={styles.bankCardIcon}>

                    <Image
                        source={require('../../asset/building.png')}
                        style={{
                            width: 20,
                            height: 20,
                            tintColor: "#FF8C00",

                        }}
                    />
                </View>
                <Text style={styles.bankCardTitle}>{selectedBank}</Text>
                <TouchableOpacity
                    style={styles.changeBankButton}
                    onPress={() => setShowBankDetails(!showBankDetails)}
                >
                    <Text style={styles.changeBankText}>{showBankDetails ? 'Hide' : 'Change'}</Text>
                </TouchableOpacity>
            </View>

            {showBankDetails && (
                <View style={styles.bankDetails}>
                    <View style={styles.bankDetailRow}>
                        <Text style={styles.bankDetailLabel}>Account Holder</Text>
                        <Text style={styles.bankDetailValue}>Rajesh Kumar</Text>
                    </View>
                    <View style={styles.bankDetailRow}>
                        <Text style={styles.bankDetailLabel}>Account Number</Text>
                        <Text style={styles.bankDetailValue}>XXXX-XXXX-1234</Text>
                    </View>
                    <View style={styles.bankDetailRow}>
                        <Text style={styles.bankDetailLabel}>IFSC Code</Text>
                        <Text style={styles.bankDetailValue}>HDFC0001234</Text>
                    </View>
                    <View style={styles.bankDetailRow}>
                        <Text style={styles.bankDetailLabel}>Bank Name</Text>
                        <Text style={styles.bankDetailValue}>HDFC Bank</Text>
                    </View>
                </View>
            )}

            {!showBankDetails && (
                <View style={styles.bankMaskedInfo}>
                    <Text style={styles.bankMaskedText}>•••• •••• 1234</Text>
                    <Text style={styles.bankMaskedSubtext}>Tap "Change" to view full details</Text>
                </View>
            )}
        </View>
    );

    // Render withdrawal history item
    const renderWithdrawalItem = ({ item }) => (
        <View style={styles.withdrawalItem}>
            <View style={styles.withdrawalLeft}>
                <View style={[styles.withdrawalIcon,
                item.status === 'completed' ? styles.withdrawalIconCompleted : styles.withdrawalIconPending
                ]}>
                    <Image
                        source={
                            item.status === 'completed'
                                ? require('../../asset/checked.png')
                                : require('../../asset/time-outline.png')
                        }
                        style={{
                            width: 20,
                            height: 20,
                            tintColor: item.status === 'completed' ? '#4CAF50' : '#FF8C00', // Remove if your PNGs are already colored
                            resizeMode: 'contain',
                        }}
                    />
                </View>
                <View>
                    <Text style={styles.withdrawalDate}>{item.date}</Text>
                    <Text style={styles.withdrawalMethod}>{item.method}</Text>
                </View>
            </View>
            <View style={styles.withdrawalRight}>
                <Text style={styles.withdrawalAmount}>₹{item.amount.toLocaleString()}</Text>
                <View style={[
                    styles.withdrawalStatus,
                    item.status === 'completed' ? styles.withdrawalStatusCompleted : styles.withdrawalStatusPending
                ]}>
                    <Text style={[
                        styles.withdrawalStatusText,
                        item.status === 'completed' ? styles.withdrawalStatusTextCompleted : styles.withdrawalStatusTextPending
                    ]}>
                        {item.status === 'completed' ? 'Completed' : 'Pending'}
                    </Text>
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
                        <Text style={styles.toolbarTitle}>Wallet</Text>
                        <View style={styles.toolbarStatus}>
                            <View style={[styles.toolbarStatusDot, { backgroundColor: '#FFFFFF' }]} />
                            <Text style={styles.toolbarStatusText}>Balance: ₹{walletData.currentBalance.toLocaleString()}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.toolbarHistory}>

                        <Image
                            source={require('../../asset/time-outline.png')}
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
                {/* Wallet Style Balance Card */}
                <Animated.View
                    style={[
                        styles.walletCard,
                        {
                            opacity: balanceFadeAnim,
                            transform: [{ scale: balanceScaleAnim }],
                        }
                    ]}
                >
                    <ImageBackground
                        source={{ uri: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop' }}
                        style={styles.walletBackground}
                        imageStyle={styles.walletImageStyle}
                    >
                        <View style={styles.walletOverlay}>
                            {/* Wallet Header with Brand */}
                            <View style={styles.walletHeader}>
                                <View style={styles.walletBrand}>
                                    <View style={styles.walletIconContainer}>

                                        <Image
                                            source={require('../../asset/wallet.png')}
                                            style={{
                                                width: 22,
                                                height: 22,
                                                tintColor: "#FFFFFF",

                                            }}
                                        />
                                    </View>
                                    <Text style={styles.walletBrandText}>HomeHelp</Text>
                                </View>
                                <View style={styles.walletChip}>
                                    <View style={styles.walletChipLine} />
                                    <View style={styles.walletChipLine2} />
                                </View>
                            </View>

                            {/* Balance Section */}
                            <View style={styles.walletBalanceSection}>
                                <Text style={styles.walletBalanceLabel}>Current Balance</Text>
                                <Text style={styles.walletBalanceAmount}>₹{walletData.currentBalance.toLocaleString()}</Text>
                            </View>

                            {/* Wallet Stats */}
                            <View style={styles.walletStats}>
                                <View style={styles.walletStat}>
                                    <Text style={styles.walletStatLabel}>Withdrawn</Text>
                                    <Text style={styles.walletStatValue}>₹{totalWithdrawn.toLocaleString()}</Text>
                                </View>
                                <View style={styles.walletStatDivider} />
                                <View style={styles.walletStat}>
                                    <Text style={styles.walletStatLabel}>Pending</Text>
                                    <Text style={styles.walletStatValue}>₹{walletData.pendingWithdrawal}</Text>
                                </View>
                                <View style={styles.walletStatDivider} />
                                <View style={styles.walletStat}>
                                    <Text style={styles.walletStatLabel}>Transactions</Text>
                                    <Text style={styles.walletStatValue}>{walletData.withdrawalHistory.length}</Text>
                                </View>
                            </View>

                            {/* Wallet Footer with Stitching Detail */}
                            <View style={styles.walletFooter}>
                                <View style={styles.walletStitching} />
                            </View>
                        </View>
                    </ImageBackground>
                </Animated.View>

                {/* Withdraw Button */}
                <TouchableOpacity
                    style={styles.withdrawButton}
                    onPress={() => setShowWithdrawModal(true)}
                >

                    <Image
                        source={require('../../asset/arrow-up.png')}
                        style={{
                            width: 22,
                            height: 22,
                            tintColor: "#FFFFFF",

                        }}
                    />
                    <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
                </TouchableOpacity>

                {/* Bank Account Section */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Linked Bank Account</Text>
                    {renderBankAccount()}
                </View>

                {/* Withdrawal Summary */}
                <View style={styles.card}>
                    <View style={styles.summaryHeader}>
                        <Text style={styles.cardTitle}>Withdrawal Summary</Text>
                        <Text style={styles.summaryCount}>{walletData.withdrawalHistory.length} transactions</Text>
                    </View>

                    <View style={styles.summaryStats}>
                        <View style={styles.summaryStat}>
                            <Text style={styles.summaryStatLabel}>Total Withdrawn</Text>
                            <Text style={styles.summaryStatValue}>₹{totalWithdrawn.toLocaleString()}</Text>
                        </View>
                        <View style={styles.summaryStat}>
                            <Text style={styles.summaryStatLabel}>This Month</Text>
                            <Text style={styles.summaryStatValue}>₹{walletData.withdrawalHistory
                                .filter(item => item.status === 'completed')
                                .reduce((sum, item) => sum + item.amount, 0)
                                .toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Withdrawal History */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Withdrawal History</Text>
                    {walletData.withdrawalHistory.length > 0 ? (
                        <FlatList
                            data={walletData.withdrawalHistory}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderWithdrawalItem}
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
                            <Text style={styles.emptyText}>No withdrawal history</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 20 }} />
            </Animated.ScrollView>

            {/* Withdraw Modal */}
            <Modal
                visible={showWithdrawModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowWithdrawModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowWithdrawModal(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Withdraw Funds</Text>
                            <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>

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

                        <View style={styles.modalBalance}>
                            <Text style={styles.modalBalanceLabel}>Available Balance</Text>
                            <Text style={styles.modalBalanceValue}>₹{walletData.currentBalance.toLocaleString()}</Text>
                        </View>

                        <Text style={styles.modalLabel}>Enter Amount</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="₹0.00"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={withdrawAmount}
                            onChangeText={setWithdrawAmount}
                            autoFocus
                        />

                        <View style={styles.modalQuickAmounts}>
                            {[100, 500, 1000, 2000].map((amount) => (
                                <TouchableOpacity
                                    key={amount}
                                    style={styles.modalQuickAmount}
                                    onPress={() => setWithdrawAmount(amount.toString())}
                                >
                                    <Text style={styles.modalQuickAmountText}>₹{amount}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalBankInfo}>
                            <Image
                                source={require('../../asset/building.png')}
                                style={{
                                    width: 16,
                                    height: 16,
                                    tintColor: "#FF8C00",
                                }}
                            />
                            <Text style={styles.modalBankText}>Transfer to: {selectedBank} (XXXX-1234)</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.modalWithdrawButton}
                            onPress={handleWithdraw}
                        >
                            <Text style={styles.modalWithdrawText}>Withdraw Now</Text>
                        </TouchableOpacity>

                        <Text style={styles.modalNote}>
                            Minimum withdrawal: ₹100 • Processing time: 24-48 hours
                        </Text>
                    </View>
                </TouchableOpacity>
            </Modal>
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
    toolbarHistory: {
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
    // Wallet Style Balance Card
    walletCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    walletBackground: {
        width: '100%',
        height: 200,
    },
    walletImageStyle: {
        borderRadius: 16,
    },
    walletOverlay: {
        flex: 1,
        backgroundColor: 'rgba(255, 140, 0, 0.88)',
        padding: 16,
        justifyContent: 'space-between',
    },
    walletHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    walletBrand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    walletIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    walletBrandText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    walletChip: {
        width: 36,
        height: 26,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    walletChipLine: {
        width: 16,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 1,
        marginBottom: 2,
    },
    walletChipLine2: {
        width: 10,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 1,
    },
    walletBalanceSection: {
        alignItems: 'center',
        paddingVertical: 4,
    },
    walletBalanceLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    walletBalanceAmount: {
        fontSize: 34,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 2,
        letterSpacing: 1,
    },
    walletStats: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 10,
        padding: 10,
    },
    walletStat: {
        flex: 1,
        alignItems: 'center',
    },
    walletStatLabel: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    walletStatValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        marginTop: 1,
    },
    walletStatDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    walletFooter: {
        paddingTop: 6,
    },
    walletStitching: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 1,
        marginTop: 2,
    },
    // Withdraw Button
    withdrawButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF8C00',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        marginBottom: 16,
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    withdrawButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
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
    // Bank Account
    bankCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    bankCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    bankCardIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#FFF8F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    bankCardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        flex: 1,
    },
    changeBankButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: '#FFF8F3',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFE8DC',
    },
    changeBankText: {
        fontSize: 12,
        color: '#FF8C00',
        fontWeight: '500',
    },
    bankMaskedInfo: {
        paddingVertical: 4,
    },
    bankMaskedText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        letterSpacing: 2,
    },
    bankMaskedSubtext: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    bankDetails: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
    },
    bankDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    bankDetailLabel: {
        fontSize: 12,
        color: '#888',
    },
    bankDetailValue: {
        fontSize: 12,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    // Withdrawal Summary
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryCount: {
        fontSize: 12,
        color: '#888',
    },
    summaryStats: {
        flexDirection: 'row',
        gap: 12,
    },
    summaryStat: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    summaryStatLabel: {
        fontSize: 11,
        color: '#888',
    },
    summaryStatValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginTop: 2,
    },
    // Withdrawal History
    withdrawalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    withdrawalLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    withdrawalIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    withdrawalIconCompleted: {
        backgroundColor: '#E8F5E9',
    },
    withdrawalIconPending: {
        backgroundColor: '#FFF8F3',
    },
    withdrawalDate: {
        fontSize: 13,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    withdrawalMethod: {
        fontSize: 11,
        color: '#888',
    },
    withdrawalRight: {
        alignItems: 'flex-end',
    },
    withdrawalAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    withdrawalStatus: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginTop: 2,
    },
    withdrawalStatusCompleted: {
        backgroundColor: '#E8F5E9',
    },
    withdrawalStatusPending: {
        backgroundColor: '#FFF8F3',
    },
    withdrawalStatusText: {
        fontSize: 10,
        fontWeight: '500',
    },
    withdrawalStatusTextCompleted: {
        color: '#4CAF50',
    },
    withdrawalStatusTextPending: {
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
    modalBalance: {
        backgroundColor: '#FFF8F3',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFE8DC',
    },
    modalBalanceLabel: {
        fontSize: 12,
        color: '#888',
    },
    modalBalanceValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FF8C00',
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
        marginBottom: 8,
    },
    modalInput: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 18,
        color: '#1A1A1A',
        borderWidth: 1.5,
        borderColor: '#E8E8E8',
        marginBottom: 12,
    },
    modalQuickAmounts: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    modalQuickAmount: {
        flex: 1,
        backgroundColor: '#FFF8F3',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFE8DC',
    },
    modalQuickAmountText: {
        fontSize: 13,
        color: '#FF8C00',
        fontWeight: '500',
    },
    modalBankInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F8F9FA',
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
    },
    modalBankText: {
        fontSize: 12,
        color: '#666',
    },
    modalWithdrawButton: {
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
    modalWithdrawText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    modalNote: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
        marginTop: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
});

export default WalletScreen;