import React, { useEffect } from 'react';
import axios from 'axios';

const Logout = () => {
  useEffect(() => {
    const fetchProducts = async () => {
        try {
          const response = await axios.post("http://localhost:3000/api/v1/auth/logout", {}, { withCredentials: true });
          window.location.href = '/home';
        } catch (error) {
          console.log(error);
          window.location.href = '/home';
        }
    };

    fetchProducts();
  }, []);

  return (
    <div>
    </div>
  );
};

export default Logout;