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
    TouchableWithoutFeedback
} from 'react-native';


const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
    // Profile state
    const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop');
    const [firstName, setFirstName] = useState('Rajesh');
    const [lastName, setLastName] = useState('Kumar');
    const [mobileNumber, setMobileNumber] = useState('+91 98765 43210');
    const [email, setEmail] = useState('rajesh.kumar@email.com');
    const [location, setLocation] = useState('Andheri East, Mumbai');
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [experience, setExperience] = useState('5 years');
    const [experienceYears, setExperienceYears] = useState('5');
    const [showExperienceModal, setShowExperienceModal] = useState(false);
    const [skills, setSkills] = useState(['Plumbing', 'Electrical', 'Cleaning']);
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
    const calculateCompletion = () => {
        let completed = 0;
        const total = 7;
        if (firstName) completed++;
        if (lastName) completed++;
        if (mobileNumber) completed++;
        if (email) completed++;
        if (location) completed++;
        if (experience) completed++;
        if (skills.length > 0) completed++;
        return Math.round((completed / total) * 100);
    };

    const starImages = {
        full: require('../../asset/star-fill.png'),
        half: require('../../asset/star-half.png'),
        empty: require('../../asset/star-outline.png'),
    };

    const completionPercentage = calculateCompletion();

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


    const handleOpenSkillBottomSheet = () => {
        setSelectedSkills([...skills]);
        setIsEditingSkills(false);
        setShowSkillBottomSheet(true);
        setTimeout(() => animateBottomSheetIn(), 100);
    };

    const handleEditSkills = () => {
        setSelectedSkills([...skills]);
        setIsEditingSkills(true);
        setShowSkillBottomSheet(true);
        setTimeout(() => animateBottomSheetIn(), 100);
    };

    const toggleSkillSelection = (skill) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter(s => s !== skill));
        } else {
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    const handleSaveSkills = () => {
        if (selectedSkills.length === 0) {
            Alert.alert('Required', 'Please select at least one skill');
            return;
        }
        setSkills([...selectedSkills]);
        setShowSkillBottomSheet(false);
        setIsEditingSkills(false);
        Alert.alert('Success', 'Skills updated successfully!');
    };

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
        setIsEditingLocation(true);
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
        Alert.alert(
            'Upload Document',
            'Choose upload option',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Camera',
                    onPress: () => {
                        Alert.alert(
                            'Camera',
                            'Take a photo of your document',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Capture',
                                    onPress: () => {
                                        const updatedDocs = uploadedDocuments.map(doc =>
                                            doc.id === docId ? {
                                                ...doc,
                                                uploaded: true,
                                                documentImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=150&fit=crop',
                                                uploadDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                                                documentNumber: doc.refNumber
                                            } : doc
                                        );
                                        setUploadedDocuments(updatedDocs);
                                        Alert.alert('Success', 'Document uploaded successfully!');
                                    }
                                }
                            ]
                        );
                    }
                },
                {
                    text: 'Gallery',
                    onPress: () => {
                        Alert.alert(
                            'Gallery',
                            'Choose document from gallery',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Select',
                                    onPress: () => {
                                        const updatedDocs = uploadedDocuments.map(doc =>
                                            doc.id === docId ? {
                                                ...doc,
                                                uploaded: true,
                                                documentImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=150&fit=crop',
                                                uploadDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                                                documentNumber: doc.refNumber
                                            } : doc
                                        );
                                        setUploadedDocuments(updatedDocs);
                                        Alert.alert('Success', 'Document uploaded successfully!');
                                    }
                                }
                            ]
                        );
                    }
                },
            ]
        );
    };

    const handleSaveRefNumber = () => {
        if (!tempRefNumber.trim()) {
            Alert.alert('Required', 'Please enter a reference number');
            return;
        }

        const updatedDocs = uploadedDocuments.map(doc =>
            doc.id === tempDocId ? { ...doc, refNumber: tempRefNumber.trim() } : doc
        );
        setUploadedDocuments(updatedDocs);
        setShowRefNumberModal(false);

        // Show upload options after saving ref number
        setTimeout(() => showUploadOptions(tempDocId), 300);
    };

    const handleEditDocument = (docId) => {
        Alert.alert(
            'Edit Document',
            'Enter document number',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Save',
                    onPress: () => {
                        const updatedDocs = uploadedDocuments.map(doc =>
                            doc.id === docId ? { ...doc, documentNumber: 'Updated Number' } : doc
                        );
                        setUploadedDocuments(updatedDocs);
                        Alert.alert('Success', 'Document updated successfully!');
                    }
                }
            ]
        );
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

    const renderSkillBottomSheet = () => (
        <Modal
            transparent={true}
            visible={showSkillBottomSheet}
            animationType="none"
            onRequestClose={() => {
                animateBottomSheetOut(() => setShowSkillBottomSheet(false));
            }}
        >
            <TouchableOpacity
                style={styles.bottomSheetOverlay}
                activeOpacity={1}
                onPress={() => {
                    animateBottomSheetOut(() => setShowSkillBottomSheet(false));
                }}
            >
                <TouchableWithoutFeedback>
                    <Animated.View
                        style={[
                            styles.bottomSheetContent,
                            { transform: [{ translateY: bottomSheetAnim }] }
                        ]}
                    >
                        <View style={styles.bottomSheetHandle} />

                        <View style={styles.bottomSheetHeader}>
                            <Text style={styles.bottomSheetTitle}>
                                {isEditingSkills ? 'Edit Skills' : 'Select Skills'}
                            </Text>
                            <Text style={styles.bottomSheetSubtitle}>
                                {isEditingSkills
                                    ? 'Modify your skills (select/deselect)'
                                    : 'Select skills you want to add'}
                            </Text>
                            <View style={styles.bottomSheetCount}>
                                <Text style={styles.bottomSheetCountText}>
                                    {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
                                </Text>
                            </View>
                        </View>

                        <ScrollView
                            style={styles.bottomSheetScroll}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Selected Skills Tags */}
                            {selectedSkills.length > 0 && (
                                <View style={styles.bottomSheetSelectedTags}>
                                    {selectedSkills.map((skill) => (
                                        <View key={skill} style={styles.bottomSheetTag}>
                                            <Text style={styles.bottomSheetTagText}>{skill}</Text>
                                            <TouchableOpacity
                                                onPress={() => toggleSkillSelection(skill)}
                                            >
                                                <Image
                                                    source={require('../../asset/close.png')}
                                                    style={{
                                                        width: 14,
                                                        height: 14,
                                                        tintColor: '#FF8C00',
                                                        resizeMode: 'contain',
                                                    }}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Skills Grid */}
                            <View style={styles.bottomSheetGrid}>
                                {availableSkillsList.map((skill) => {
                                    const isSelected = selectedSkills.includes(skill);
                                    return (
                                        <TouchableOpacity
                                            key={skill}
                                            style={[
                                                styles.bottomSheetSkillItem,
                                                isSelected && styles.bottomSheetSkillItemSelected,
                                            ]}
                                            onPress={() => toggleSkillSelection(skill)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.bottomSheetSkillLeft}>
                                                <Text style={styles.bottomSheetSkillIcon}>🔧</Text>
                                                <Text style={[
                                                    styles.bottomSheetSkillText,
                                                    isSelected && styles.bottomSheetSkillTextSelected,
                                                ]}>
                                                    {skill}
                                                </Text>
                                            </View>
                                            <View style={[
                                                styles.bottomSheetCheckbox,
                                                isSelected && styles.bottomSheetCheckboxSelected,
                                            ]}>
                                                {isSelected && (
                                                    <Image
                                                        source={require('../../asset/check.png')}
                                                        style={{
                                                            width: 12,
                                                            height: 12,
                                                            tintColor: '#FFFFFF',
                                                            resizeMode: 'contain',
                                                        }}
                                                    />
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>

                        <View style={styles.bottomSheetActions}>
                            <TouchableOpacity
                                style={[styles.bottomSheetButton, styles.bottomSheetCancelButton]}
                                onPress={() => {
                                    animateBottomSheetOut(() => setShowSkillBottomSheet(false));
                                }}
                            >
                                <Text style={styles.bottomSheetCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.bottomSheetButton, styles.bottomSheetSaveButton]}
                                onPress={handleSaveSkills}
                            >
                                <Text style={styles.bottomSheetSaveText}>
                                    {isEditingSkills ? 'Update Skills' : 'Add Skills'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );

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
            onRequestClose={() => setShowRefNumberModal(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowRefNumberModal(false)}
            >
                <View style={styles.refModalContent}>
                    <View style={styles.refModalHeader}>
                        <Text style={styles.refModalTitle}>Enter Reference Number</Text>
                        <Text style={styles.refModalSubtitle}>
                            Please enter the document reference number before uploading
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
                    />

                    <View style={styles.refModalActions}>
                        <TouchableOpacity
                            style={[styles.refModalButton, styles.refCancelButton]}
                            onPress={() => setShowRefNumberModal(false)}
                        >
                            <Text style={styles.refCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.refModalButton, styles.refSaveButton]}
                            onPress={handleSaveRefNumber}
                        >
                            <Text style={styles.refSaveText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
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
                                                setTimeout(() => handleEditDocument(selectedDocument.id), 300);
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
                                            <Text style={styles.documentModalActionText}>Edit</Text>
                                        </TouchableOpacity>
                                    )}
                                    {selectedDocument.uploaded && (
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
                                    )}
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

                    {/* Location - Editable Item */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.fieldHeader}>
                            <Text style={styles.fieldLabel}>Location</Text>
                            {!isEditingLocation && (
                                <TouchableOpacity onPress={handleEditLocation}>
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
                            )}
                        </View>
                        {isEditingLocation ? (
                            <View style={styles.editFieldRow}>
                                <TextInput
                                    style={[styles.fieldInput, { flex: 1 }]}
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholder="Enter location"
                                    placeholderTextColor="#999"
                                    autoFocus
                                />
                                <TouchableOpacity
                                    style={styles.saveEditButton}
                                    onPress={handleSaveLocation}
                                >
                                    <Text style={styles.saveEditText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text style={styles.fieldValue}>{location}</Text>
                        )}
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
                                <TouchableOpacity
                                    style={styles.skillRemoveButton}
                                    onPress={() => handleRemoveSkill(skill)}
                                >
                                    <Image
                                        source={require('../../asset/close.png')}
                                        style={{
                                            width: 16,
                                            height: 16,
                                            tintColor: '#FF4444',
                                            resizeMode: 'contain',
                                        }}
                                    />
                                </TouchableOpacity>
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
                            onPress={() => handleViewDocument(doc)}
                            activeOpacity={0.7}
                        >
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
                                        {doc.verified ? '✅ Verified' : doc.uploaded ? '⏳ Pending Verification' : doc.refNumber ? '📤 Ready to Upload' : '📝 Not uploaded yet'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.documentRight}>
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
                                <Image
                                    source={require('../../asset/arrow-forward.png')}
                                    style={{
                                        width: 16,
                                        height: 16,
                                        tintColor: '#999',
                                        resizeMode: 'contain',
                                    }}
                                />
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
                                            setExperienceYears(year);
                                            setExperience(year === '10+' ? '10+ years' : `${year} years`);
                                            setShowExperienceModal(false);
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
                </Modal>

                {/* Document Modal */}
                {renderDocumentModal()}
                {renderRefNumberModal()}
                {renderSkillBottomSheet()}

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
});

export default ProfileScreen;