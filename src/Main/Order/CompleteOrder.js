import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, TextInput, Alert, FlatList, RefreshControl, Modal } from 'react-native';
import { Card } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
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

export const Complete_Order = ({ navigation }) => {
    const [productData, setProductData] = useState([{}]);
    const [isLoading, setIsLoading] = useState(false);
    const [filteredProductData, setFilteredProductData] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [refresh, setRefresh] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);


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
            const filteredOrderList = response?.data?.OrderList.filter(ele => ele?.status === "completed") || [];

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


    const pullMe = () => {
        setRefresh(true);
        setTimeout(() => {
            GetProduct();
            setRefresh(false);
        }, 800)
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

                    <View style={{
                        flexDirection: 'column',
                        // justifyContent: 'space-between',
                        marginLeft: calculateWidthPercentage(1),
                    }}>
                        <Text style={{
                            color: 'black',
                            fontSize: calculateFontSizePercentage(3),
                            // fontWeight: '700',
                            marginLeft: calculateWidthPercentage(13)
                        }} numberOfLines={3}>
                            Date: {moment(item?.createdAt).format('DD-MM-YYYY')}
                        </Text>

                        <Text style={{
                            color: 'black',
                            fontSize: calculateFontSizePercentage(3),
                            marginLeft: calculateWidthPercentage(13.5)
                        }} numberOfLines={3}>
                            OrderId: {item?.orderNo?.toUpperCase()}
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{
                                color: 'black',
                                marginTop: calculateHeightPercentage(7.5),
                                fontSize: calculateFontSizePercentage(3),
                                fontWeight: '700',
                                marginLeft: calculateWidthPercentage(10)
                            }} numberOfLines={3}>
                                Status:
                            </Text>
                            <Text style={{
                                color: 'red',
                                marginTop: calculateHeightPercentage(7.7),
                                fontSize: calculateFontSizePercentage(2.7),
                                fontWeight: '700',
                                marginLeft: calculateWidthPercentage(1),
                                alignItems: 'center'
                            }} numberOfLines={3}>
                                {item?.status?.toUpperCase()}
                            </Text>
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
        paddingHorizontal: calculateWidthPercentage(0.5),
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
        width: calculateWidthPercentage(50),

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
    footer: {
        position: 'absolute',
        height: "10%",
        alignItems: "center",
        top: calculateHeightPercentage(88)
    },
});

export default Complete_Order;