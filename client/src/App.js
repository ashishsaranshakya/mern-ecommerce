import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import PaymentSuccess from "./PaymentSuccess";
import PaymentFailure from './PaymentFailure';
import Orders from './Orders';
import Cart from './Cart';
import Logout from './Logout';
import SignUp from './SignUp';

export const baseUrl = "https://mern-ecommerce-uw3n.onrender.com";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/logout" element={<Logout/>} />
        <Route path="/home" element={<Home />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/paymentsuccess" element={<PaymentSuccess />} />
        <Route path="/paymentfailure" element={<PaymentFailure />} />
      </Routes>
    </Router>
  );
}

export default App;
