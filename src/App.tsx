import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AppProvider } from './AppContext';
import Header from './components/Header';
import BookDetailPage from './pages/BookDetail';
import Cart from './pages/Cart';
import Catalog from './pages/Catalog';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Header />
        <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Catalog />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="*"
              element={
                <p className="py-12 text-center">
                  Page not found. <Link to="/" className="text-sky-400 underline">Go home</Link>
                </p>
              }
            />
          </Routes>
        </main>
        <footer className="mt-8 border-t border-neutral-800 px-4 py-6 text-center text-sm text-neutral-400">
          © {new Date().getFullYear()} Book Worm · Orders can be cancelled within 48 hours
        </footer>
      </AppProvider>
    </BrowserRouter>
  );
}
