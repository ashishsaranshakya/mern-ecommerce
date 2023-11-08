import React from 'react';
import { VStack, Image, Text, Box } from '@chakra-ui/react';

const CartCard = ({ amount, img, quantity }) => {
    return (
        <Box
            maxW="sm"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            p="4"
            transition="transform 0.3s ease"
            _hover={{ transform: 'scale(1.05)' }}
        >
            <Box borderWidth="1px" borderRadius="md" overflow="hidden" mb="4">
                <Image src={img} alt="Product Image" boxSize="200px" objectFit="cover" border="2px solid teal" />
            </Box>

            <Text fontSize="lg" fontWeight="semibold" mb="2">
                Unit cost: ₹{amount}
            </Text>

            <Text fontSize="md">
                Quantity: {quantity}
            </Text>
        </Box>
    );
};

export default CartCard;
