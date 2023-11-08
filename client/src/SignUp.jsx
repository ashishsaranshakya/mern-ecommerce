import React, { useState } from 'react';
import axios from 'axios';
import { Box, Stack, Button, Text, Input } from "@chakra-ui/react";
import NavBar from './NavBar';
import { baseUrl } from './App';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [address, setAddress] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
        const res = await axios.post(`${baseUrl}/api/v1/auth/register`,
            {
                firstName: fname,
                lastName: lname,
                email,
                password,
                address
            },
        {
          withCredentials: true
        });
      
        console.log(res);
        if(res.data.success){
            window.location.href = '/';
        }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box p={4}>
      <NavBar />
      <Box maxW="md" mx="auto" p={6} bg="white" borderRadius="md" boxShadow="base">
        <Text fontSize="xl" mb={4}>Register</Text>
        <form onSubmit={handleRegister}>
          <Stack spacing={3}>
            <Input type="text" placeholder="First Name" value={fname} onChange={(e) => setFname(e.target.value)} required />
            <Input type="text" placeholder="Last Name" value={lname} onChange={(e) => setLname(e.target.value)} required />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            <Button colorScheme="teal" type="submit">Register</Button>
          </Stack>
        </form>
        <Text mt={4}>Already have an account? <Button variant="link" onClick={()=>window.location.href = '/login'}>Log in here</Button></Text>
      </Box>
    </Box>
  );
};

export default SignUp;
