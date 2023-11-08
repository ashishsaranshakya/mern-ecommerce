import { Button, Box, Text, VStack, HStack } from '@chakra-ui/react'
import React from 'react'

const OrderCard = ({ order_id, amount, paymentStatus, deliveryStatus, paymentHandler }) => {
    return (
        <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" width="300px">
            <VStack spacing={3}>
                <Text fontSize="lg" fontWeight="bold">Order ID: #{order_id}</Text>
                <Text fontSize="md">Amount: ₹{amount}</Text>
                <Text fontSize="md">Payment Status: {paymentStatus}</Text>
                {paymentStatus === 'Confirmed' ? (
                    <HStack spacing={2}>
                        <Text fontSize="md">Delivery Status: {deliveryStatus}</Text>
                        <Button colorScheme="red" variant="outline">Cancel</Button>
                    </HStack>
                ) : (
                    <HStack spacing={2}>
                        <Button colorScheme="teal" variant="solid" onClick={() => paymentHandler(order_id)}>Pay Now</Button>
                        <Button colorScheme="red" variant="outline">Cancel</Button>
                    </HStack>
                )}
            </VStack>
        </Box>
    )
}

export default OrderCard
