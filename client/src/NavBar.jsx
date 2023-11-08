import React, { useEffect, useState } from 'react';
import { Box, Flex, Link, Image, Button } from '@chakra-ui/react';
import axios from "axios";
import { baseUrl } from './App';

const NavBar = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${baseUrl}/api/v1/user/profile`, { withCredentials: true });
                if (response.data.user) {
                    setUser(response.data.user);
                    if (window.location.pathname === '/' || window.location.pathname === '/signup') {
                        window.location.href = '/home';
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
            // if (!user) {
            //     if (window.location.pathname === '/cart' || window.location.pathname === '/orders') {
            //         window.location.href = '/';
            //     }
            // }
            console.log(window.location.pathname);
        };

        fetchUserData();
    }, []);

    return (
        <Box p={4} bg="gray.200" color="blue.500">
            <Flex alignItems="center" justifyContent="space-between">
                <Box>
                    {/* Logo */}
                    <Link href="/home" fontSize="2xl" fontWeight="bold">
                        <Image src={'logo.jpg'} boxSize={"40px"} objectFit="cover" />
                    </Link>
                </Box>
                <Flex alignItems="center">
                    {/* Navigation Links */}
                    <Link mr={4} href="/home">
                        Home
                    </Link>
                    {user ?
                        (<Box>
                            <Link mr={4} href="/orders">
                                Orders
                            </Link>
                            <Link mr={4} href="/cart">
                                Cart
                            </Link>
                            <Link mr={4} href="/logout">
                                <Button colorScheme="red" variant="solid" size="sm">
                                    Logout
                                </Button>
                            </Link>
                        </Box>) :
                        (
                            <Link mr={4} href="/">
                                <Button colorScheme="yellow" variant="solid" size="sm">
                                    Login
                                </Button>
                            </Link>
                        )}
                </Flex>
            </Flex>
        </Box>
    );
};

export default NavBar;
