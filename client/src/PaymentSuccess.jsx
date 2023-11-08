import { Box, Heading, Text, VStack, Button } from '@chakra-ui/react'
import React from 'react'
import NavBar from './NavBar';
import { useSearchParams } from "react-router-dom"
const PaymentSuccess = () => {

    const seachQuery = useSearchParams()[0]

    const referenceNum = seachQuery.get("reference")
    return (
        <Box>
            <NavBar />
            <VStack h="80vh" justifyContent={"center"}>

                <Heading textTransform={"uppercase"}> Order Successfull</Heading>

                <Text>
                    Reference No.{referenceNum}
                </Text>

                <Button onClick={() => window.location.href = '/orders'}>Go to all orders</Button>

            </VStack>
        </Box>
    )
}

export default PaymentSuccess