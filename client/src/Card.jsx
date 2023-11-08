import { Box, Button, Image, Text, VStack } from '@chakra-ui/react';
import React from 'react';

const Card = ({ amount, img, checkoutHandler, product_id, addToCartHandler, name }) => {
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

            <Text fontSize="xl" fontWeight="semibold" mb="2">
                ₹{name}
            </Text>

            <Text fontSize="xl" fontWeight="semibold" mb="2">
                ₹{amount}
            </Text>

            <VStack spacing="4">
                <Button
                    colorScheme="teal"
                    variant="outline"
                    onClick={() => addToCartHandler(product_id)}
                    w="full"
                >
                    Add to Cart
                </Button>

                <Button colorScheme="teal" onClick={() => checkoutHandler(amount, product_id)} w="full">
                    Buy Now
                </Button>
            </VStack>
        </Box>
    );
};

export default Card;
