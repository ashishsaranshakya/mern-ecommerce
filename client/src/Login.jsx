import React, { useState } from 'react';
import axios from 'axios';
import { Box, Stack, Button, Text, Input } from "@chakra-ui/react";
import NavBar from './NavBar';
import { baseUrl } from './App';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${baseUrl}/api/v1/auth/login`, { email, password },
      {
          withCredentials: true
        });
      
      console.log(res);
      if(res.status === 200){
        window.location.href = '/home';
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box p={4}>
      <NavBar />
      <Box maxW="md" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="base">
        <Text fontSize="xl" mb={4}>Login</Text>
        <form onSubmit={handleLogin}>
          <Stack spacing={3}>
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button colorScheme="teal" type="submit">Login</Button>
          </Stack>
        </form>
        <Text mt={4}>Don't have an account? <Button variant="link" onClick={()=>window.location.href = '/signup'}>Sign up here</Button></Text>
      </Box>
    </Box>
  );
};

export default Login;
