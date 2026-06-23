import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Menu = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Snacks', 'Main Meals', 'Beverages', 'Desserts'];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`);
                setProducts(res.data);
            } catch (err) {
                console.error("Critical: Inventory API Connection Failed");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredItems = activeCategory === 'All' 
        ? products 
        : products.filter(p => p.category === activeCategory);

    const userName = localStorage.getItem('userName') || 'Scholar';
    const userRole = localStorage.getItem('userRole');
    const firstName = userName.split(' ')[0];

    return (
        <div className="min-h-screen bg-nibmGray font-sans overflow-x-hidden pb-24">
            
            <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100 px-8 py-5">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="font-black text-nibmBlue tracking-tighter text-2xl uppercase leading-none">Canteen-Zero</span>
                        <span className="text-[9px] font-bold text-nibmRed tracking-[0.3em] uppercase mt-1 ml-0.5">Academic Portal</span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        {userRole === 'admin' && (
                            <Link to="/admin/dashboard" className="hidden md:block bg-nibmRed text-white text-[10px] font-black px-5 py-2.5 rounded-full hover:bg-red-700 transition-all uppercase tracking-widest shadow-lg shadow-red-200">
                                Switch to Admin
                            </Link>
                        )}

                        <button className="relative group p-2 bg-gray-50 rounded-full">
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-nibmRed text-[10px] text-white font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-110 transition-all">0</span>
                            <span className="text-xl block">🛒</span>
                        </button>

                        <div className="h-10 w-10 bg-nibmGold rounded-full border-2 border-white shadow-md flex items-center justify-center text-nibmBlue font-black text-sm">
                            {firstName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </nav>

            <header className="bg-nibmBlue text-white pt-16 pb-28 px-8 relative">
                <div className="max-w-7xl mx-auto relative z-10 animate-slide-in-left">
                    <p className="text-nibmGold font-black tracking-[0.4em] text-[10px] uppercase mb-4 opacity-90 underline underline-offset-8 decoration-nibmRed/50">Official Student Access</p>
                    <h1 className="text-6xl font-black tracking-tight mb-4 leading-tight">
                        Hello, {firstName}.
                    </h1>
                    <p className="text-blue-100 text-lg font-medium opacity-70 max-w-xl leading-relaxed italic">
                        "The Place To Be" — Browse the live inventory and secure your meal instantly with our Zero-Queue system.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none overflow-hidden">
                   <svg viewBox="0 0 100 100" className="w-full h-full scale-150 fill-white"><circle cx="50" cy="50" r="50"/></svg>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-8 -mt-10 relative z-20">
                <div className="flex gap-4 bg-white/80 backdrop-blur-md p-4 rounded-[2.5rem] shadow-premium border border-white/50 overflow-x-auto no-scrollbar scroll-smooth">
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setActiveCategory(cat)}
                            className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 whitespace-nowrap ${
                                activeCategory === cat 
                                ? 'bg-nibmBlue text-white shadow-lg translate-y-[-2px]' 
                                : 'bg-white/50 text-gray-400 hover:text-nibmBlue hover:bg-white'
                            }`}
                        >
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
                        <p className="text-gray-400 font-bold text-[10px] tracking-widest uppercase">Syncing Inventory...</p>
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