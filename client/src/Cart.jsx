import React, { useEffect, useState } from 'react';
import { Box, VStack, Button, Text, Stack } from "@chakra-ui/react";
import CartCard from './CartCard';
import axios from "axios";
import NavBar from './NavBar';
import { baseUrl } from './App';

const Cart = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cookie, setCookie] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${baseUrl}/api/v1/user/cart`, { withCredentials: true });
                const productList = [];
                for (let i = 0; i < response.data.cart.length; i++) {
                    const res = await axios.get(`${baseUrl}/api/v1/product/${response.data.cart[i].productId}`);
                    productList.push({ ...res.data.product, quantity: response.data.cart[i].quantity });
                }
                setProducts(productList);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        };

        fetchProducts();
    }, []);

    const checkoutCartHandler = async (amount, product_id) => {
        const key = "rzp_test_aFTRo2L8JTS6Tf";

        const { data: { order } } = await axios.post(`${baseUrl}/api/v1/order/checkout/cart`,
            {},
            {
                withCredentials: true
            });

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
    };

    return (
        <Box>
            <NavBar />
            {loading ? (
                <Box h="70vh" display="flex" alignItems="center" justifyContent="center">
                    Loading...
                </Box>
            ) : (
                <Box>
                    <Stack h={"65vh"} alignItems="center" justifyContent="center" direction={["column", "row"]}>
                        {products.map((product) => (
                            <CartCard key={product._id} product_id={product._id} amount={product.cost} img={product.imageUrl} quantity={product.quantity} />
                        ))}
                    </Stack>
                    <Stack mt={4} align="center">
                        <Text fontSize="lg" fontWeight="bold" mb={0}>
                            Cart Checkout
                        </Text>
                        <Button colorScheme="teal" size="lg" onClick={() => checkoutCartHandler()}>
                            Buy Now
                        </Button>
                    </Stack>
                </Box>
            )}
        </Box>
    );
};

export default Cart;
