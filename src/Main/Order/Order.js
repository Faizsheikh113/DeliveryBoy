import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, TextInput, Alert, FlatList, RefreshControl, Modal, Image, Linking } from 'react-native';
import { Card } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Table, Row } from "react-native-table-component";
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CustomerBaseUrl } from '../../../Config/BaseUtil';
import moment from 'moment';
import Footer from './footer';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const calculateHeightPercentage = (percentage) => (windowHeight * percentage) / 100;
const calculateWidthPercentage = (percentage) => (windowWidth * percentage) / 100;
const calculateFontSizePercentage = (percentage) => {
    const baseDimension = Math.min(windowWidth, windowHeight);
    return (baseDimension * percentage) / 100;
};

export const Product = ({ navigation }) => {
    const [productData, setProductData] = useState([{}]);
    const [isLoading, setIsLoading] = useState(false);
    const [filteredProductData, setFilteredProductData] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [refresh, setRefresh] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);

    // Otp
    const [isOTPModalVisible, setOTPModalVisible] = useState(false);
    const [OTP, setOTP] = useState('');
    const [OTPError, setOTPError] = useState('');

    // Deliver
    const [isDeliverModalVisible, setDeliverModalVisible] = useState(false);
    const [image, setImage] = useState(null);
    const [bilty, setBilty] = useState(null);
    const [OTP2, setOTP2] = useState('');
    const [OTPError2, setOTPError2] = useState('');

    // Data for cancle
    const [selectedItem, setSelectedItem] = useState(null);

    const GetProduct = useCallback(async () => {
        try {
            const FullLoginData = await AsyncStorage.getItem('LoginData');
            const LoginData = JSON.parse(FullLoginData);
            console.log("LoginData ;- ", LoginData);
            console.log("id ;- ", LoginData?._id);
            console.log("database ;- ", LoginData?.database);

            setIsLoading(true);

            const response = await axios.get(`${CustomerBaseUrl}good-dispatch/view-order-list/${LoginData?._id}/${LoginData?.database}`);

            // Filter the OrderList to only include orders with status "Pending for Delivery"
            const filteredOrderList = response?.data?.OrderList.filter(ele => ele?.status === "Pending for Delivery") || [];

            console.log("Filtered Order List :- ", filteredOrderList);

            // Set the filtered data in both states
            setProductData(filteredOrderList);
            setFilteredProductData(filteredOrderList);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }, [setProductData, setFilteredProductData, setIsLoading]);


    useEffect(() => {
        GetProduct();
    }, [GetProduct]);

    const toggleProductExpansion = (index) => {
        setExpandedIndex(prevIndex => prevIndex === index ? null : index);
    };

    const DeliverProduct = async (item) => {
        console.log("Cancel :- ", item?.partyId.assignTransporter);
        setSelectedItem(item);
        try {
            await axios.post(`${CustomerBaseUrl}good-dispatch/send-otp/${item?._id}`, {
                type: 'completed'
            })
                .then((res) => {
                    console.log(res.data);
                    Alert.alert("Successfull...", res?.data?.message,
                        [
                            {
                                text: "OK",
                                onPress: () => setDeliverModalVisible(true),
                            }
                        ]
                    );
                })
                .catch((err) => {
                    console.log(err?.response?.data)
                    Alert.alert(err?.response?.data);
                })
            console.log(response.data);
        } catch (error) {
            console.log(error?.response?.data?.message)
        }
    }

    const handleDeliver = async () => {
        console.log("OTP @@@ :- ", OTP2);
        console.log("partyId :- ", selectedItem?.partyId?._id);
        console.log("Order Id :- ", selectedItem?._id);
        console.log("paymentMode :- ", selectedItem?.partyId?.paymentTerm);
        console.log("image :- ", image);
        console.log("bilty :- ", bilty);

        if (!OTP2.trim()) {
            setOTPError('Please enter your OTP.')
        }
        else {
            console.log("first :- ", selectedItem?.partyId?.assignTransporter)
            const formData = new FormData();
            formData.append('otp', OTP2);
            formData.append('partyId', selectedItem?.partyId?._id);
            formData.append('orderId', selectedItem?._id);
            formData.append('paymentMode', selectedItem?.partyId?.paymentTerm);
            formData.append('file', image);
            formData.append('CNDetails', bilty);
            formData.append('status', 'completed');

            try {
                await axios.post(`${CustomerBaseUrl}good-dispatch/verify-authentication/${selectedItem?.partyId?._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                    .then((res) => {
                        console.log(res?.data);
                        Alert.alert("Successfull...", res?.data?.message)
                        GetProduct();
                        setDeliverModalVisible(false);
                    })
                    .catch((err) => {
                        console.log(err?.response?.data)
                    })
            } catch (error) {
                console.log(error?.response?.data?.error);
                setOTPError(error?.response?.data?.error);
            }
        }
        setOTP2('');
        setBilty('');
    }

    const handleImagePick = () => {
        launchImageLibrary({}, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorCode);
            } else {
                console.log(response.assets[0].uri)
                setImage(response.assets[0].uri);
            }
        });
    };

    const CancelDelivery = async (item) => {
        console.log("Cancel :- ", item?.userId?._id);
        setSelectedItem(item);
        try {
            await axios.post(`${CustomerBaseUrl}good-dispatch/send-otp/${item?._id}`, {
                type: 'Cancelled'
            })
                .then((res) => {
                    console.log(res.data);
                    Alert.alert("Successfull...", res?.data?.message,
                        [
                            {
                                text: "OK",
                                onPress: () => setOTPModalVisible(true),
                            }
                        ]
                    );
                })
                .catch((err) => {
                    console.log(err?.response?.data)
                    Alert.alert(err?.response?.data);
                })
            console.log(response.data);
        } catch (error) {
            console.log(error?.response?.data?.message)
        }
    }

    const handleOTP = async () => {
        console.log("OTP @@@ :- ", OTP);
        // console.log("OTP @@@ :- ", selectedItem);
        console.log("partyId :- ", selectedItem?.partyId?._id);
        console.log("Order Id :- ", selectedItem?.orderId?._id);

        if (!OTP.trim()) setOTPError('Please enter your OTP.');

        else {
            const formData = new FormData();
            formData.append('otp', OTP);
            formData.append('partyId', selectedItem?.partyId?._id);
            formData.append('orderId', selectedItem?._id);
            formData.append('status', 'Cancel in process');

            try {
                await axios.post(`${CustomerBaseUrl}good-dispatch/verify-authentication/${selectedItem?.partyId?._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                    .then((res) => {
                        console.log(res?.data);
                        Alert.alert("Successfull...", res?.data?.message,
                            [{
                                text: "OK",
                                onPress: () => setOTPModalVisible(false),
                            }]
                        )
                        GetProduct();
                    })
                    .catch((err) => {
                        console.log(err?.response?.data)
                    })
            } catch (error) {
                console.log(error?.response?.data?.error);
                setOTPError(error?.response?.data?.error);
            }
        }
        setOTP('');
    }

    const pullMe = () => {
        setRefresh(true);
        setTimeout(() => {
            GetProduct()
            setRefresh(false);
        }, 1000)
    }

    const handleLogout = async () => {
        await AsyncStorage.removeItem('LoginData')
            .then((res) => {
                navigation.navigate('Login')
            })
            .catch((err) => { console.log(err?.response?.data) })
    }

    const handleSearch = useCallback((text) => {
        const keywords = text.trim().toUpperCase().split(/\s+/);
        const matchesSearch = (product, keywords) => {
            const title = product.partyId?.firstName.toUpperCase();
            return keywords.every(keyword => {
                return title.includes(keyword);
            });
        };
        const filtered = productData.filter(item => {
            return matchesSearch(item, keywords) &&
                (selectedCategory === 'All' || item.category.to() === selectedCategory.toLowerCase());

        });

        setFilteredProductData(filtered);
    }, [productData, selectedCategory]);

    const renderProductItem = useCallback((item, index) => {
        // Prepare the table data from orderItems
        const tableHead = ['Product Name', 'Quantity', 'Price', 'Taxable', 'GST', 'Total'];
        const tableData = item?.orderItems?.map(ele => [
            ele?.productId?.Product_Title?.toUpperCase() || 'N/A',
            ele?.qty || 'N/A',
            ele?.price.toFixed(2) || 'N/A',
            ele?.taxableAmount.toFixed(2) || 'N/A',
            ele?.igstRate ? ele?.igstRate : ele?.sgstRate ? ele?.sgstRate : ele?.cgstRate || 'N/A',
            ele?.grandTotal.toFixed(2) || 'N/A',
        ]) || [];

        return (
            <Card key={item.id} style={styles.card}>
                <Card.Content style={styles.content}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.title} numberOfLines={3}>
                            {item?.partyId?.firstName?.toUpperCase()}
                        </Text>
                        <Text style={styles.quantity} numberOfLines={3}>
                            Address: {item?.partyId?.address}
                        </Text>
                        <Text style={{
                            color: 'black',
                            fontSize: calculateFontSizePercentage(3),
                            marginVertical: calculateHeightPercentage(0.1),
                        }} numberOfLines={3}>
                            Contact: {item?.partyId?.mobileNumber}
                        </Text>
                        <Text style={{
                            color: 'black',
                            fontSize: calculateFontSizePercentage(3),
                            marginVertical: calculateHeightPercentage(0.1),
                        }} numberOfLines={3}>
                            Payment Mode: {item?.partyId?.paymentTerm}
                        </Text>
                        <Text style={{
                            color: 'black',
                            fontSize: calculateFontSizePercentage(3),
                            marginVertical: calculateHeightPercentage(0.1),
                        }} numberOfLines={3}>
                            Total Reciviable: {item?.grandTotal}
                        </Text>
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => toggleProductExpansion(index)}
                        >
                            <Text style={styles.toggleButtonText}>
                                {expandedIndex === index ? 'Hide Products' : 'View Products'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.priceContainer}>
                        <Text style={{
                            color: 'black',
                            fontSize: calculateFontSizePercentage(3),
                            // fontWeight: '700',
                            marginLeft: calculateWidthPercentage(12)
                        }} numberOfLines={3}>
                            Date: {moment(item?.createdAt).format('DD-MM-YYYY')}
                        </Text>

                        <Text style={{
                            color: 'black',
                            marginTop: calculateHeightPercentage(-1.5),
                            fontSize: calculateFontSizePercentage(3),
                            // fontWeight: '700',
                            marginLeft: calculateWidthPercentage(12.5)
                        }} numberOfLines={3}>
                            OrderId: {item?.orderNo?.toUpperCase()}
                        </Text>
                        {item?.challanNo ? (<Text style={{
                            color: 'black',
                            marginTop: calculateHeightPercentage(-1.5),
                            fontSize: calculateFontSizePercentage(3),
                            // fontWeight: '700',
                            marginLeft: calculateWidthPercentage(2)
                        }} numberOfLines={3}>
                            Invoice Id: {item?.challanNo?.toUpperCase()}
                        </Text>) : null}

                        {item?.ARN ? (<Text style={{
                            color: 'black',
                            marginTop: calculateHeightPercentage(-1),
                            fontSize: calculateFontSizePercentage(3),
                            // fontWeight: '700',
                            width: calculateWidthPercentage(36),
                            marginLeft: calculateWidthPercentage(2)
                        }} numberOfLines={3}>
                            ARN: {item?.ARN?.toUpperCase()}
                        </Text>) : null}

                        {/* Buttons */}
                        <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <TouchableOpacity
                                style={{ paddingVertical: calculateHeightPercentage(0.5), backgroundColor: 'blue', width: calculateWidthPercentage(15), marginLeft: calculateWidthPercentage(4), borderRadius: calculateFontSizePercentage(1), marginBottom: calculateHeightPercentage(1) }}
                                onPress={() => DeliverProduct(item)}

                            >
                                <Text style={{ fontSize: calculateFontSizePercentage(3.5), color: 'white', textAlign: 'center' }}>
                                    Deliver
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ paddingVertical: calculateHeightPercentage(0.5), backgroundColor: 'blue', width: calculateWidthPercentage(15), marginLeft: calculateWidthPercentage(2), borderRadius: calculateFontSizePercentage(1), marginBottom: calculateHeightPercentage(1) }}
                                onPress={() => { CancelDelivery(item) }}

                            >
                                <Text style={{ fontSize: calculateFontSizePercentage(3.5), color: 'white', textAlign: 'center' }}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {expandedIndex === index && (
                        <View style={styles.tableContainer}>
                            <Table borderStyle={{ borderWidth: 1, borderColor: 'black' }}>
                                <Row data={tableHead}
                                    style={{ backgroundColor: 'lightgrey', height: calculateHeightPercentage(4) }}
                                    textStyle={styles.tableText}
                                    widthArr={[calculateWidthPercentage(25), calculateWidthPercentage(15), calculateWidthPercentage(12), calculateWidthPercentage(15), calculateWidthPercentage(12), calculateWidthPercentage(15)]}
                                />
                                {tableData.map((rowData, index) => (
                                    <Row key={index} data={rowData} textStyle={styles.text}
                                        style={{ backgroundColor: 'white' }}
                                        widthArr={[calculateWidthPercentage(25), calculateWidthPercentage(15), calculateWidthPercentage(12), calculateWidthPercentage(15), calculateWidthPercentage(12), calculateWidthPercentage(15)]}
                                    />
                                ))}
                            </Table>
                        </View>
                    )}
                </Card.Content>
            </Card>
        );
    }, [expandedIndex]);


    return (
        <GestureHandlerRootView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Panding Order</Text>
                <TouchableOpacity onPress={() => { handleLogout() }}
                    style={{ alignItems: 'center', paddingLeft: calculateWidthPercentage(45) }}
                >

                    <MaterialIcons name={'logout'} size={23} color={'black'} style={styles.backIcon} />
                </TouchableOpacity>
            </View>

            <View style={styles.filters}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search Customer..."
                    value={filteredProductData}
                    onChangeText={(text) => handleSearch(text)}
                    autoCapitalize='characters'
                />
            </View>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <FlatList
                    refreshControl={
                        <RefreshControl
                            refreshing={refresh}
                            onRefresh={() => { pullMe() }}
                        />
                    }
                    data={filteredProductData}
                    renderItem={({ item, index }) => (
                        <View style={styles.column}>
                            {renderProductItem(item, index)}
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{
                        paddingHorizontal: calculateWidthPercentage(4),
                        paddingTop: calculateHeightPercentage(-2),
                        paddingBottom: calculateHeightPercentage(10),
                    }}
                />
            )}

            {/* Modal for Cancle order */}
            <Modal
                animationType='none'
                transparent={true}
                visible={isOTPModalVisible}
                onRequestClose={() => setOTPModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: calculateHeightPercentage(-3), marginBottom: calculateHeightPercentage(1) }}>
                            <Text style={{ fontSize: calculateFontSizePercentage(4), color: 'black' }}>Verify otp</Text>
                            <TouchableOpacity
                                onPress={() => setOTPModalVisible(false)}
                                style={styles.modalCloseButton}
                            >
                                <Icon name='close' size={20} color={'gray'} />
                            </TouchableOpacity>
                        </View>
                        {/* Customize the modal content with the customer details */}
                        {/* LockPassword input */}
                        <View style={{ flexDirection: 'row', marginBottom: calculateHeightPercentage(0.5) }}>
                            <Text style={{ color: 'black', fontSize: calculateFontSizePercentage(3), fontWeight: '600' }}>Sales person:- </Text>
                            <Text style={{ color: 'black', fontSize: calculateFontSizePercentage(3) }}>{selectedItem?.userId?.firstName}</Text>
                        </View>

                        <TouchableOpacity
                            style={{ marginBottom: calculateHeightPercentage(1) }}
                            onPress={() => {
                                Linking.openURL(`tel:${selectedItem?.userId?.mobileNumber}`);
                            }}
                        >
                            <View style={{ flexDirection: 'row', marginBottom: calculateHeightPercentage(0.5) }}>
                                <Text style={{ color: 'black', fontSize: calculateFontSizePercentage(3), fontWeight: '600' }}>Contact:- </Text>
                                <Text style={{ color: 'blue', fontSize: calculateFontSizePercentage(3) }}>{selectedItem?.userId?.mobileNumber}</Text>
                            </View>
                        </TouchableOpacity>
                        <Text style={{ color: 'black' }}>OTP</Text>
                        <View style={[styles.modalinput, { borderColor: OTPError ? 'red' : 'gray' }]}>
                            <TextInput
                                style={{ padding: calculateFontSizePercentage(3) }}
                                placeholder="enter your OTP"
                                value={OTP}
                                onChangeText={text => {
                                    setOTP(text);
                                    setOTPError('');
                                }
                                }
                                keyboardType='numeric'
                                onFocus={() => setOTPError('')}
                            />
                        </View>
                        {OTPError ? <Text style={styles.errorText}>{OTPError}</Text> : null}


                        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: calculateHeightPercentage(3) }}>
                            <TouchableOpacity
                                onPress={handleOTP}
                                style={{ height: calculateHeightPercentage(5), width: calculateWidthPercentage(30), backgroundColor: 'blue', borderRadius: calculateFontSizePercentage(1), marginTop: calculateHeightPercentage(-3.2), }}
                            >
                                <Text style={{ textAlign: 'center', paddingVertical: calculateHeightPercentage(1.2), color: 'white' }}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Add other customer details here */}
                    </View>
                </View>
            </Modal>

            {/* Modal for Deliver order */}
            <Modal
                animationType='none'
                transparent={true}
                visible={isDeliverModalVisible}
                onRequestClose={() => setDeliverModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={selectedItem?.partyId?.assignTransporter?.length > 0 ? styles.modalContent2 : styles.modalContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: calculateHeightPercentage(-2), marginBottom: calculateHeightPercentage(1) }}>
                            <Text>Deliver Order</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setDeliverModalVisible(false)
                                    setImage(null);
                                }}
                                style={styles.modalCloseButton}
                            >
                                <Icon name='close' size={20} color={'gray'} />
                            </TouchableOpacity>
                        </View>
                        {/* Customize the modal content with the customer details */}
                        {selectedItem?.partyId?.assignTransporter?.length > 0
                            ? (
                                <>
                                    <Text style={{ color: 'gray', marginBottom: calculateHeightPercentage(1) }}>Intercity Delivery</Text>
                                    <Text style={{ color: 'gray' }}>OTP</Text>
                                    <View style={[styles.modalinput, { borderColor: OTPError2 ? 'red' : 'gray' }]}>
                                        <TextInput
                                            style={{ padding: calculateFontSizePercentage(3) }}
                                            placeholder="enter your OTP"
                                            value={OTP2}
                                            onChangeText={text => {
                                                setOTP2(text);
                                                setOTPError2('');
                                            }
                                            }
                                            keyboardType='numeric'
                                            onFocus={() => setOTPError('')}
                                        />
                                    </View>
                                    {OTPError ? <Text style={styles.errorText}>{OTPError}</Text> : null}

                                    <Text style={{ color: 'gray', marginTop: calculateHeightPercentage(-1) }}>Bilty No.</Text>
                                    <View style={[styles.modalinput, { borderColor: OTPError2 ? 'red' : 'gray' }]}>
                                        <TextInput
                                            style={{ padding: calculateFontSizePercentage(3) }}
                                            placeholder="enter your bilty nnumber"
                                            value={bilty}
                                            onChangeText={text => {
                                                setBilty(text);
                                            }
                                            }
                                            keyboardType='numeric'
                                            onFocus={() => setOTPError('')}
                                        />
                                    </View>

                                    {/* Document Picker */}
                                    <View style={[styles.modalinput, { borderColor: OTPError ? 'red' : 'gray' }]}>
                                        <TouchableOpacity style={{ alignSelf: 'center' }}
                                            onPress={handleImagePick}
                                        >
                                            <Text style={{ color: 'gray', padding: calculateFontSizePercentage(3.3) }}>Upload Document</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {image && (
                                        <View style={{ borderWidth: calculateHeightPercentage(0.1), height: calculateHeightPercentage(12.8), width: calculateWidthPercentage(22.8), marginTop: calculateHeightPercentage(-2) }}>
                                            <Image source={{ uri: image }} style={{ width: 80, height: 90 }} resizeMode='stretch' />
                                        </View>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Text style={{ color: 'gray', marginBottom: calculateHeightPercentage(1) }}>Local Delivery</Text>
                                    <Text style={{ color: 'gray' }}>OTP</Text>
                                    <View style={[styles.modalinput, { borderColor: OTPError2 ? 'red' : 'gray' }]}>
                                        <TextInput
                                            style={{ padding: calculateFontSizePercentage(3) }}
                                            placeholder="enter your OTP"
                                            value={OTP2}
                                            onChangeText={text => {
                                                setOTP2(text);
                                                setOTPError2('');
                                            }
                                            }
                                            keyboardType='numeric'
                                            onFocus={() => setOTPError('')}
                                        />
                                    </View>
                                    {OTPError ? <Text style={styles.errorText}>{OTPError}</Text> : null}
                                </>
                            )}

                        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: calculateHeightPercentage(5) }}>
                            <TouchableOpacity
                                onPress={handleDeliver}
                                style={{ height: calculateHeightPercentage(5), width: calculateWidthPercentage(30), backgroundColor: 'blue', borderRadius: calculateFontSizePercentage(1), marginTop: calculateHeightPercentage(-3.2), }}
                            >
                                <Text style={{ textAlign: 'center', paddingVertical: calculateHeightPercentage(1.2), color: 'white' }}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Add other customer details here */}
                    </View>
                </View>
            </Modal>
            <View style={styles.footer}>
                <Footer navigation={navigation} />
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexWrap: 'wrap',
        backgroundColor: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        height: calculateHeightPercentage(8),
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: calculateWidthPercentage(5),
        borderBottomWidth: calculateWidthPercentage(0.06),
        elevation: 3
    },
    backIcon: {
        paddingRight: calculateWidthPercentage(5),
    },
    headerTitle: {
        fontSize: calculateFontSizePercentage(5.5),
        color: 'black',
    },
    card: {
        width: calculateWidthPercentage(93),
        padding: calculateFontSizePercentage(0.01),
        backgroundColor: '#484A59',
    },
    content: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        backgroundColor: '#f5f8fa',
        borderWidth: calculateHeightPercentage(0.1),
        borderColor: 'black',
        paddingVertical: calculateHeightPercentage(0.5),
        paddingHorizontal: calculateWidthPercentage(1),
        borderRadius: calculateFontSizePercentage(1.5)
    },
    footer: {
        position: 'absolute',
        height: "10%",
        alignItems: "center",
        top: calculateHeightPercentage(88)
    },
    // Search
    searchInput: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        padding: 10,
        marginTop: calculateHeightPercentage(2),
        marginBottom: calculateHeightPercentage(1),
        width: '100%',
        alignSelf: 'center'
    },
    filters: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: calculateWidthPercentage(3.5),
        paddingVertical: calculateHeightPercentage(0.5),
    },
    // table
    tableContainer: {
        borderRadius: calculateFontSizePercentage(2),
        overflow: 'hidden',
    },
    head: {
        height: calculateHeightPercentage(4),
        backgroundColor: '#f1f8ff',
    },
    column: {
        marginBottom: calculateHeightPercentage(2),
    },
    text: {
        padding: calculateFontSizePercentage(1),
        fontSize: calculateFontSizePercentage(2.5),
        textAlign: 'center',
        color: 'black',
    },
    tableText: {
        fontSize: calculateFontSizePercentage(3),
        textAlign: 'center',
        color: 'black',
    },
    title: {
        color: 'black',
        fontSize: calculateFontSizePercentage(3),
        fontWeight: '700',
        width: calculateWidthPercentage(50),
    },
    quantity: {
        color: 'black',
        fontSize: calculateFontSizePercentage(3),
        marginTop: calculateHeightPercentage(0.1),
        width: calculateWidthPercentage(50)
    },
    priceContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginLeft: calculateWidthPercentage(1),
    },
    price: {
        marginTop: calculateHeightPercentage(0.1),
        marginBottom: calculateHeightPercentage(-2),
        fontSize: calculateFontSizePercentage(4),
        color: '#EAA132',
        fontWeight: 'bold',
    },
    toggleButton: {
        paddingVertical: calculateHeightPercentage(0.5),
    },
    toggleButtonText: {
        fontSize: calculateFontSizePercentage(3.5),
        color: 'blue',
    },
    // modal
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        // alignItems: 'center',
        // width: calculateHeightPercentage(40),
        paddingHorizontal: calculateWidthPercentage(5),
    },
    modalContent: {
        paddingHorizontal: calculateWidthPercentage(5),
        height: calculateHeightPercentage(32),
        backgroundColor: 'white',
        opacity: 1,
        padding: calculateFontSizePercentage(10),
        borderRadius: 10,
        elevation: 5,
    },
    modalContent2: {
        paddingHorizontal: calculateWidthPercentage(5),
        height: calculateHeightPercentage(60),
        backgroundColor: 'white',
        opacity: 1,
        padding: calculateFontSizePercentage(10),
        borderRadius: 10,
        elevation: 5,
    },
    modalinput: {
        height: calculateHeightPercentage(6),
        width: calculateWidthPercentage(80),
        borderWidth: calculateWidthPercentage(0.2),
        marginBottom: calculateHeightPercentage(3),
        // padding: calculateFontSizePercentage(3),
        borderRadius: calculateFontSizePercentage(1),
    },
    modalCloseButton: {
        marginTop: calculateHeightPercentage(-4),
        // marginRight: calculateWidthPercentage(0),
        borderRadius: 5,
        alignSelf: 'flex-end',
    },
    errorText: {
        color: 'red',
        marginTop: calculateHeightPercentage(-2),
        marginBottom: calculateHeightPercentage(2),
        alignSelf: 'flex-start',
        paddingHorizontal: calculateWidthPercentage(1),
    },
    footer: {
        position: 'absolute',
        height: "10%",
        alignItems: "center",
        top: calculateHeightPercentage(88)
    },
});

export default Product;