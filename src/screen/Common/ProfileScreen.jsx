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
} from 'react-native';


const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
    // Profile state
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop');
    const [firstName, setFirstName] = useState('Rajesh');
    const [lastName, setLastName] = useState('Kumar');
    const [mobileNumber, setMobileNumber] = useState('+91 98765 43210');
    const [email, setEmail] = useState('rajesh.kumar@email.com');
    const [location, setLocation] = useState('Andheri East');
    const [city, setCity] = useState('Mumbai');
    const [skills, setSkills] = useState(['Plumbing', 'Electrical', 'Cleaning']);
    const [newSkill, setNewSkill] = useState('');
    const [showAddSkill, setShowAddSkill] = useState(false);
    const [rating, setRating] = useState(4.8);
    const [uploadedDocuments, setUploadedDocuments] = useState([
        {
            id: 1,
            name: 'Aadhar Card',
            image: require('../../asset/aadhaar.png'),
            verified: true,
        },
        {
            id: 2,
            name: 'PAN Card',
            image: require('../../asset/pan.png'),
            verified: true,
        },
        {
            id: 3,
            name: 'Driving License',
            image: require('../../asset/driving-license.png'),
            verified: false,
        },
        {
            id: 4,
            name: 'Course Certificate',
            image: require('../../asset/certificate.png'),
            verified: false,
        },
    ]);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(1)).current;
    const headerTranslateY = useRef(new Animated.Value(0)).current;

    const ORANGE_COLOR = '#FF8C00';

    // Calculate profile completion
    const calculateCompletion = () => {
        let completed = 0;
        const total = 7;
        if (firstName) completed++;
        if (lastName) completed++;
        if (mobileNumber) completed++;
        if (email) completed++;
        if (location) completed++;
        if (city) completed++;
        if (skills.length > 0) completed++;
        return Math.round((completed / total) * 100);
    };

    const starImages = {
        full: require('../../asset/star-fill.png'),
        half: require('../../asset/star-half.png'),
        empty: require('../../asset/star-outline.png'),
    };

    const completionPercentage = calculateCompletion();

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

    // Handle image picker - Design only
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

    // Handle save profile
    const handleSaveProfile = () => {
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
    };

    // Handle add skill
    const handleAddSkill = () => {
        if (newSkill.trim()) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
            setShowAddSkill(false);
        }
    };

    // Handle remove skill
    const handleRemoveSkill = (index) => {
        Alert.alert(
            'Remove Skill',
            'Are you sure you want to remove this skill?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        const updatedSkills = skills.filter((_, i) => i !== index);
                        setSkills(updatedSkills);
                    }
                }
            ]
        );
    };

    // Handle document upload - Design only
    const handleDocumentUpload = (docId) => {
        Alert.alert(
            'Upload Document',
            'Would you like to upload this document?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Upload',
                    onPress: () => {
                        const updatedDocs = uploadedDocuments.map(doc =>
                            doc.id === docId ? { ...doc, verified: true } : doc
                        );
                        setUploadedDocuments(updatedDocs);
                        Alert.alert('Success', 'Document uploaded successfully!');
                    }
                }
            ]
        );
    };

    // Render stars
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

    // Render editable field
    const renderEditableField = (label, value, setValue, keyboardType = 'default', multiline = false) => (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {isEditing ? (
                <TextInput
                    style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
                    value={value}
                    onChangeText={setValue}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    numberOfLines={multiline ? 3 : 1}
                    placeholder={`Enter ${label}`}
                    placeholderTextColor="#999"
                />
            ) : (
                <Text style={styles.fieldValue}>{value || 'Not provided'}</Text>
            )}
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
                        <Text style={styles.toolbarTitle}>My Profile</Text>
                        <View style={styles.toolbarStatus}>
                            <View style={[styles.toolbarStatusDot, { backgroundColor: '#FFFFFF' }]} />
                            <Text style={styles.toolbarStatusText}>
                                {isEditing ? 'Editing' : 'Viewing'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.toolbarEdit, isEditing && styles.toolbarEditActive]}
                        onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    >
                        <Text style={[styles.toolbarEditText, isEditing && styles.toolbarEditTextActive]}>
                            {isEditing ? 'Save' : 'Edit'}
                        </Text>
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
                            <Image source={{ uri: profileImage }} style={styles.profileImage} />
                            <View style={styles.profileImageOverlay} />
                        </View>
                        <TouchableOpacity
                            style={styles.editImageButton}
                            onPress={handleImagePicker}
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
                    </View>
                    <Text style={styles.profileName}>{firstName} {lastName}</Text>
                    <View style={styles.ratingContainer}>
                        {renderStars(rating)}
                        <Text style={styles.ratingText}>{rating}</Text>
                    </View>
                </Animated.View>

                {/* Profile Completion */}
                <Animated.View style={[styles.completionCard, { opacity: fadeAnim }]}>
                    <View style={styles.completionHeader}>
                        <Text style={styles.completionTitle}>Profile Completion</Text>
                        <Text style={styles.completionPercentage}>{completionPercentage}%</Text>
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
                                }
                            ]}
                        />
                    </View>
                    <Text style={styles.completionSubtext}>
                        {completionPercentage < 100 ? 'Complete your profile to get more job opportunities' : 'Profile complete!'}
                    </Text>
                </Animated.View>

                {/* Personal Information */}
                <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                    <Text style={styles.cardTitle}>Personal Information</Text>
                    {renderEditableField('First Name', firstName, setFirstName)}
                    {renderEditableField('Last Name', lastName, setLastName)}
                    {renderEditableField('Mobile Number', mobileNumber, setMobileNumber, 'phone-pad')}
                    {renderEditableField('Email ID', email, setEmail, 'email-address')}
                    {renderEditableField('Location', location, setLocation)}
                    {renderEditableField('City', city, setCity)}
                </Animated.View>

                {/* Skills Section */}
                <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                    <View style={styles.skillsHeader}>
                        <Text style={styles.cardTitle}>Skills</Text>
                        {isEditing && (
                            <TouchableOpacity
                                style={styles.addSkillButton}
                                onPress={() => setShowAddSkill(true)}
                            >

                                <Image
                                    source={require('../../asset/add.png')}
                                    style={{
                                        width: 24,
                                        height: 24,
                                        tintColor: "#FF8C00",

                                    }}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.skillsContainer}>
                        {skills.map((skill, index) => (
                            <View key={index} style={styles.skillItem}>
                                <Text style={styles.skillText}>{skill}</Text>
                                {isEditing && (
                                    <TouchableOpacity
                                        style={styles.removeSkillButton}
                                        onPress={() => handleRemoveSkill(index)}
                                    >

                                        <Image
                                            source={require('../../asset/close.png')}
                                            style={{
                                                width: 18,
                                                height: 18,
                                                tintColor: "#FF4444",

                                            }}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Uploaded Documents */}
                <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                    <Text style={styles.cardTitle}>Uploaded Documents</Text>
                    {uploadedDocuments.map((doc) => (
                        <View key={doc.id} style={styles.documentItem}>
                            <View style={styles.documentLeft}>
                                <View style={styles.documentIcon}>
                                    
                                    <Image
                                        source={doc.image}
                                        style={{
                                            width: 22,
                                            height: 22,
                                            resizeMode: 'contain',
                                            tintColor: "#FF8C00",
                                        }}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.documentName}>{doc.name}</Text>
                                    <Text style={styles.documentStatus}>
                                        {doc.verified ? '✅ Verified' : '⏳ Pending Verification'}
                                    </Text>
                                </View>
                            </View>
                            {!doc.verified && isEditing && (
                                <TouchableOpacity
                                    style={styles.uploadDocumentButton}
                                    onPress={() => handleDocumentUpload(doc.id)}
                                >
                                    <Text style={styles.uploadDocumentText}>Upload</Text>
                                </TouchableOpacity>
                            )}
                            {doc.verified && (
                                <View style={styles.verifiedBadge}>

                                    <Image
                                        source={require('../../asset/checked.png')}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            tintColor: "#4CAF50",

                                        }}
                                    />
                                </View>
                            )}
                        </View>
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

                <View style={{ height: 20 }} />
            </Animated.ScrollView>
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
    toolbarEdit: {
        padding: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    toolbarEditActive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
    },
    toolbarEditText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    toolbarEditTextActive: {
        color: '#FF8C00',
    },
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        marginTop:20
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
    fieldLabel: {
        fontSize: 13,
        color: '#888',
        fontWeight: '500',
        marginBottom: 4,
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
    fieldInputMultiline: {
        minHeight: 80,
        textAlignVertical: 'top',
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
    skillItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F3',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFE8DC',
        gap: 6,
    },
    skillText: {
        fontSize: 13,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    removeSkillButton: {
        padding: 2,
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
    uploadDocumentButton: {
        backgroundColor: '#FF8C00',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
    },
    uploadDocumentText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    verifiedBadge: {
        padding: 4,
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
        width: width * 0.85,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 16,
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
});

export default ProfileScreen;