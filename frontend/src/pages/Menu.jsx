import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';
import { useCartStore } from '../store/useCartStore';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const Menu = () => {
    const [products, setProducts] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [tokenIndex, setTokenIndex] = useState(0);
    const [showTokenWidget, setShowTokenWidget] = useState(true);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    
    const toggleCart = useCartStore((state) => state.toggleCart);
    const cartCount = useCartStore((state) => 
        state.cart.reduce((total, item) => total + item.quantity, 0)
    );

    const categories = ['All', 'Snacks', 'Main Meals', 'Beverages', 'Desserts'];

    const fetchProducts = useCallback(async () => {
        try {
            const res = await API.get('/api/products');
            setProducts(res.data);
        } catch (err) {
            console.error("Fetch Error");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchActiveOrders = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                const res = await API.get(`/api/orders/user/${decoded.id}`);
                setActiveOrders(res.data);
            } catch (err) {
                console.error("Recovery failed");
            }
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchActiveOrders();
        const interval = setInterval(fetchActiveOrders, 10000);
        return () => clearInterval(interval);
    }, [fetchProducts, fetchActiveOrders]);

    const handleNextToken = () => {
        setTokenIndex((prev) => (prev + 1) % activeOrders.length);
    };

    const handlePrevToken = () => {
        setTokenIndex((prev) => (prev - 1 + activeOrders.length) % activeOrders.length);
    };

    const filteredItems = activeCategory === 'All' 
        ? products 
        : products.filter(p => p.category === activeCategory);

    const userName = localStorage.getItem('userName') || 'Scholar';
    const userRole = localStorage.getItem('userRole');
    const firstName = userName.split(' ')[0];

    return (
        <div className="min-h-screen bg-nibmGray font-sans overflow-x-hidden pb-24 text-slate-900">
            <CartDrawer />
            
            <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100 px-8 py-5">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="font-black text-nibmBlue tracking-tighter text-2xl uppercase leading-none">Canteen-Zero</span>
                        <span className="text-[9px] font-bold text-nibmRed tracking-[0.3em] uppercase mt-1 ml-0.5">Academic Portal</span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        {userRole === 'admin' && (
                            <Link to="/admin/dashboard" className="hidden md:block bg-nibmRed text-white text-[10px] font-black px-5 py-2.5 rounded-full hover:bg-red-700 transition-all uppercase tracking-widest shadow-lg shadow-red-200">
                                Admin Portal
                            </Link>
                        )}

                        <button onClick={toggleCart} className="relative group p-2 bg-gray-50 rounded-full transition-all active:scale-90">
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-nibmRed text-[10px] text-white font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-110 transition-all">
                                {cartCount}
                            </span>
                            <span className="text-xl block text-nibmBlue">🛒</span>
                        </button>

                        <div className="h-10 w-10 bg-nibmGold rounded-full border-2 border-white shadow-md flex items-center justify-center text-nibmBlue font-black text-sm">
                            {firstName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </nav>

            <header className="bg-nibmBlue text-white pt-16 pb-32 px-8 relative">
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12 animate-slide-in-left">
                    <div className="w-full lg:w-1/2">
                        <p className="text-nibmGold font-black tracking-[0.4em] text-[10px] uppercase mb-4 opacity-90 underline underline-offset-8 decoration-nibmRed/50">Official Student Access</p>
                        <h1 className="text-6xl font-black tracking-tight mb-4 leading-tight">
                            Hello, {firstName}.
                        </h1>
                        <p className="text-blue-100 text-lg font-medium opacity-70 max-w-xl leading-relaxed italic">
                            Browse the live inventory and secure your meal instantly with our Zero-Queue system.
                        </p>
                    </div>

                    {activeOrders.length > 0 && showTokenWidget && (
                        <div className="relative w-full max-w-lg bg-white/10 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/20 flex items-center justify-between shadow-2xl animate-in fade-in zoom-in duration-700 group ml-auto">
                            
                            <button 
                                onClick={() => setShowTokenWidget(false)} 
                                className="absolute top-5 right-6 text-white/30 hover:text-white transition-all hover:rotate-90 p-2"
                            >
                                <X size={18} strokeWidth={3} />
                            </button>

                            <div className="flex flex-col pr-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-nibmGold mb-1">
                                    {activeOrders.length > 1 ? `Active Tokens (${activeOrders.length})` : 'Active Token Found'}
                                </p>
                                <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-4 leading-tight">Hand this to <br/> Canteen counter</h4>
                                
                                {activeOrders.length > 1 && (
                                    <div className="flex items-center gap-3 text-white/60">
                                        <button onClick={handlePrevToken} className="hover:text-nibmGold transition-colors p-1 bg-white/5 rounded-lg"><ChevronLeft size={16}/></button>
                                        <span className="text-[9px] font-black tracking-widest">{tokenIndex + 1} / {activeOrders.length}</span>
                                        <button onClick={handleNextToken} className="hover:text-nibmGold transition-colors p-1 bg-white/5 rounded-lg"><ChevronRight size={16}/></button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-nibmGold text-nibmBlue text-5xl font-black px-10 py-6 rounded-[2rem] shadow-2xl transform group-hover:scale-105 transition-transform flex-shrink-0 min-w-[140px] text-center">
                                {activeOrders[tokenIndex].tokenID}
                            </div>
                        </div>
                    )}
                </div>
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none overflow-hidden">
                   <svg viewBox="0 0 100 100" className="w-full h-full scale-150 fill-white"><circle cx="50" cy="50" r="50"/></svg>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-8 -mt-10 relative z-20">
                <div className="flex gap-4 bg-white/80 backdrop-blur-md p-4 rounded-[2.5rem] shadow-premium border border-white/50 overflow-x-auto no-scrollbar scroll-smooth">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)}
                            className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 whitespace-nowrap ${activeCategory === cat ? 'bg-nibmBlue text-white shadow-lg translate-y-[-2px]' : 'bg-white/50 text-gray-400 hover:text-nibmBlue hover:bg-white'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-8 mt-12">
                <div className="flex items-center gap-6 mb-12">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Academic Selection</h2>
                    <div className="flex-1 h-[2px] bg-gradient-to-r from-gray-200 to-transparent mt-2"></div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-14 h-14 border-4 border-nibmBlue border-t-nibmGold rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400 font-bold text-[10px] tracking-widest uppercase text-center">Syncing Inventory...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        {filteredItems.map((product, index) => (
                            <ProductCard key={product._id} product={product} index={index} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Menu;