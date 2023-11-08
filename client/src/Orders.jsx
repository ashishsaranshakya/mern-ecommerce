import React, { useEffect, useState } from 'react';
import { Box, Stack, Button, Text } from "@chakra-ui/react";
import OrderCard from './OrderCard';
import axios from "axios";
import NavBar from './NavBar';
import { baseUrl } from './App';

const Home = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${baseUrl}/api/v1/order`,
                    { withCredentials: true });
                setOrders(response.data.orders);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        };

        fetchOrders();
    }, []);

    const paymentHandler = async (order_id) => {
        const key = "rzp_test_aFTRo2L8JTS6Tf";

        const { data: { order } } = await axios.post(`${baseUrl}/api/v1/order/checkout/order?id=${order_id}`, 
            { },
            {
                withCredentials: true
            })

        const options = {
            key,
            amount: order.amount,
            currency: "INR",
            name: "Cittaa",
            description: "Tutorial of RazorPay",
            image: "https://avatars.githubusercontent.com/u/25058652?v=4",
            order_id: order.id,
            callback_url: `${baseUrl}/api/v1/order/verify`,
            prefill: {
                name: "Gaurav Kumar",
                email: "gaurav.kumar@example.com",
                contact: "9999999999"
            },
            notes: {
                "address": "Razorpay Corporate Office"
            },
            theme: {
                "color": "#121212"
            }
        };
        const razor = new window.Razorpay(options);
        razor.open();
    }

    return (
        <Box>
            <NavBar />
            {loading ? (
                <Box h="70vh" display="flex" alignItems="center" justifyContent="center">
                    Loading...
                </Box>
            ) : (
                <Stack h={"80vh"} alignItems="center" justifyContent="center" direction={["column", "row"]}>
                    {orders.map((order) => (
                        <OrderCard key={order._id} order_id={order._id} amount={order.totalCost} paymentStatus={order.paymentStatus} deliveryStatus={order.deliveryStatus} paymentHandler={paymentHandler}/>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default Home;