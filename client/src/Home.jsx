import React, { useEffect, useState } from 'react';
import { Box, Stack } from "@chakra-ui/react";
import Card from './Card';
import axios from "axios";
import NavBar from './NavBar';
import { baseUrl } from './App';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/v1/product/`);
        setProducts(response.data.products);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, []);

  const checkoutHandler = async (amount, product_id) => {
    try {
      const key = "rzp_test_aFTRo2L8JTS6Tf";

      const { data: { order } } = await axios.post(`${baseUrl}/api/v1/order/checkout/product?id=${product_id}`,
        {
              
        },
        {
          withCredentials: true
        })

      const options = {
        key,
        amount: order.amount,
        currency: "INR",
        name: "Cittaa",
        description: "Test Transaction",
        image: "https://cittaa.in/assets/img/logo-big.png",
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
      const some = razor.open();
    }
    catch (err) {
      alert("Please login to checkout")
      window.location.href = "/"
    }
  }

  const addToCartHandler = async (product_id) => {
    try {
      const res = await axios.post(`${baseUrl}/api/v1/user/cart?id=${product_id}`,
      {
            
      },
      {
        withCredentials: true
      });
      alert("Added to cart")
    }
    catch (err) {
      alert("Please login to add to cart")
      window.location.href = "/"
    }
  }

  return (
    <Box>
      <NavBar />
      {loading ? (
        <Box>Loading...</Box>
      ) : (
        <Box>
          <Stack h={"80vh"} alignItems="center" justifyContent="center" direction={["column", "row"]}>
            {products.map((product) => (
              <Card key={product._id} name={product.name} product_id={product._id} amount={product.cost} img={product.imageUrl} checkoutHandler={checkoutHandler} addToCartHandler={addToCartHandler}/>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Home;
