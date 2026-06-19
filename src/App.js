import { BrowserRouter, Routes, Route } from "react-router";
import NavBar from "./components/NavBar";
import PhoneListPage from "./pages/PhoneListPage";
import PhoneDetailPage from "./pages/PhoneDetailPage";
import CartPage from "./pages/CartPage";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<PhoneListPage />} />
          <Route path="/phone/:id" element={<PhoneDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
