import React from 'react';
import { useCartStore } from '../store/useCartStore';

const ProductCard = ({ product, index }) => {
    const addToCart = useCartStore((state) => state.addToCart);
    const toggleCart = useCartStore((state) => state.toggleCart);

    const fallbackImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400";

    const handleAdd = () => {
        addToCart(product);
        toggleCart();
    };

    return (
        <div 
            className="group bg-white rounded-[2.5rem] p-3 shadow-premium border border-gray-100 hover:-translate-y-2 transition-all duration-500 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="relative h-52 w-full overflow-hidden rounded-[2rem] bg-gray-50">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110" 
                    onError={(e) => {
                        e.target.src = fallbackImage;
                    }}
                />
                
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-md text-nibmBlue text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-sm border border-white/50">
                        {product.category}
                    </span>
                    {product.isVeg && (
                        <span className="bg-green-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase shadow-sm">
                            VEG
                        </span>
                    )}
                </div>

                <div className="absolute bottom-4 right-4 bg-nibmBlue/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 shadow-lg border border-white/10">
                    ⏱️ {product.prepTime} MIN
                </div>
            </div>
            
            <div className="px-3 py-5">
                <div className="flex justify-between items-start mb-2">
                    <h1 className="text-lg font-bold text-gray-800 tracking-tight leading-tight w-2/3">
                        {product.name}
                    </h1>
                    <div className="text-right">
                        <span className="text-lg font-black text-nibmBlue italic">
                            Rs.{product.price}
                        </span>
                    </div>
                </div>
                
                <div className="flex gap-0.5 mb-3">
                    {[...Array(3)].map((_, i) => (
                        <span 
                            key={i} 
                            className={`text-xs transition-opacity duration-300 ${i < product.spiceLevel ? 'opacity-100' : 'opacity-10 grayscale'}`}
                        >
                            🌶️
                        </span>
                    ))}
                </div>
                
                <p className="text-slate-600 text-sm font-medium mb-6 line-clamp-2 leading-relaxed min-h-[40px]">
                    {product.description}
                </p>
                
                <button 
                    onClick={handleAdd}
                    className="w-full bg-nibmBlue text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-900/20 group-hover:bg-nibmRed transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <span className="text-[10px] tracking-[0.2em] uppercase">
                        Add to Basket
                    </span>
                </button>
            </div>
        </div>
    );
};

export default ProductCard;