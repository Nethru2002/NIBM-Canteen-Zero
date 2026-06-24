import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
    PackagePlus, Clock, BadgeDollarSign, Flame, Utensils, 
    ArrowLeft, Upload, CheckCircle2, Eye, ClipboardCheck, 
    Power, Search, CalendarDays, RotateCcw, Edit3, Trash2, X, ShoppingBag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const AdminDashboard = () => {
    const [inventory, setInventory] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [searchTerm, setSearchBar] = useState('');
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ 
        name: '', description: '', price: '', category: 'Snacks', 
        prepTime: '', spiceLevel: 0, isVeg: false 
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSpiceClick = (level) => {
        setFormData(prev => ({ ...prev, spiceLevel: prev.spiceLevel === level ? 0 : level }));
    };

    const fetchInventory = useCallback(async () => {
        try {
            const res = await API.get('/api/products/admin-list');
            setInventory(res.data);
        } catch (err) { 
            toast.error("Inventory sync failed"); 
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await API.get('/api/orders/admin/active');
            setPendingOrders(res.data);
        } catch (err) {
            console.error("Order sync failed");
        }
    }, []);

    useEffect(() => { 
        fetchInventory(); 
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [fetchInventory, fetchOrders]);

    const handleCollect = async (id) => {
        try {
            await API.patch(`/api/orders/${id}/collect`);
            toast.success("Order Handed Over");
            fetchOrders();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const handleEditClick = (item) => {
        setIsEditing(true);
        setEditId(item._id);
        setFormData({
            name: item.name, description: item.description, price: item.price,
            category: item.category, prepTime: item.prepTime, spiceLevel: item.spiceLevel, isVeg: item.isVeg
        });
        setPreviewUrl(item.image);
        setImageFile(null);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({ name: '', description: '', price: '', category: 'Snacks', prepTime: '', spiceLevel: 0, isVeg: false });
        setPreviewUrl(null);
        setImageFile(null);
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Delete ${name}?`)) {
            try {
                await API.delete(`/api/products/${id}`);
                fetchInventory();
                toast.success("Removed");
            } catch (err) { toast.error("Fail"); }
        }
    };

    const handleToggle = async (id) => {
        try {
            await API.patch(`/api/products/${id}/toggle`);
            fetchInventory();
        } catch (err) { toast.error("Fail"); }
    };

    const handleGlobalReset = async () => {
        if(window.confirm("Restore all items to Available?")) {
            await API.post('/api/products/daily-reset');
            fetchInventory();
            toast.success("Reset Complete");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile && !isEditing) return toast.error("Image required");
        setLoading(true);
        const data = new FormData();
        if (imageFile) data.append('image', imageFile);
        data.append('data', JSON.stringify(formData));
        try {
            if (isEditing) await API.put(`/api/products/${editId}`, data);
            else await API.post('/api/products', data);
            fetchInventory();
            cancelEdit();
        } catch (err) { toast.error("Error"); }
        finally { setLoading(false); }
    };

    return (
        <div className="h-screen w-full bg-[#f1f5f9] flex flex-col md:flex-row font-sans text-slate-900 overflow-hidden">
            <div className="w-full md:w-[60%] flex flex-col bg-[#f8fafc]">
                <div className="bg-nibmBlue p-8 text-white flex justify-between items-center shadow-lg z-10">
                    <div className="flex items-center gap-4">
                        <Link to="/menu" className="p-2 hover:bg-white/10 rounded-full transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">Canteen Switchboard</h1>
                            <p className="text-blue-200 text-[9px] font-bold tracking-[0.3em] uppercase mt-1 opacity-70">Admin Terminal</p>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" size={14} />
                        <input type="text" placeholder="Search..." className="bg-blue-900/40 border border-blue-400/30 rounded-full pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-nibmGold w-48 transition-all" onChange={(e) => setSearchBar(e.target.value)}/>
                    </div>
                </div>

                <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center px-8 shadow-sm">
                    <div className="flex items-center gap-3">
                        <CalendarDays size={16} className="text-nibmBlue" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            Session: {new Date().toLocaleDateString('en-GB')}
                        </span>
                    </div>
                    <button onClick={handleGlobalReset} className="flex items-center gap-2 bg-slate-100 text-nibmBlue px-4 py-2 rounded-xl hover:bg-nibmGold transition-all font-black text-[9px] uppercase tracking-widest border border-slate-200"><RotateCcw size={12} /> Global Reset</button>
                </div>

                <div className="p-8 overflow-y-auto no-scrollbar flex-1 space-y-8 pb-24">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-black text-nibmBlue uppercase tracking-widest flex items-center gap-2"><ShoppingBag size={16}/> Pending Pickups</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {pendingOrders.map(order => (
                                <div key={order._id} className="bg-nibmGold p-5 rounded-[2rem] flex justify-between items-center shadow-lg shadow-yellow-100 border border-white/50 animate-in fade-in zoom-in duration-300">
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl font-black text-nibmBlue leading-none">{order.tokenID}</span>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-nibmBlue/50 uppercase tracking-widest leading-none">{order.status}</span>
                                            <span className="text-[10px] font-bold text-nibmRed uppercase mt-1">{order.items.length} Items</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleCollect(order._id)} className="bg-nibmBlue text-white p-3 rounded-2xl hover:bg-slate-900 transition-all"><CheckCircle2 size={20}/></button>
                                </div>
                            ))}
                            {pendingOrders.length === 0 && <p className="col-span-full text-center py-10 text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">No pending orders</p>}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-black text-nibmBlue uppercase tracking-widest mb-6">Master Inventory</h2>
                        <div className="space-y-4">
                            {inventory.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                                <div key={item._id} className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all ${item.isAvailable ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-100 border-dashed border-gray-300 opacity-60'}`}>
                                    <div className="flex items-center gap-5">
                                        <img src={item.image} className="w-14 h-14 rounded-2xl object-cover shadow-inner bg-gray-50" alt="" />
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">{item.category}</span>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter font-mono italic">LKR {item.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleEditClick(item)} className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={16}/></button>
                                        <button onClick={() => handleDelete(item._id, item.name)} className="p-2.5 text-nibmRed hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16}/></button>
                                        <button onClick={() => handleToggle(item._id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${item.isAvailable ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}><Power size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`w-full md:w-[40%] bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.03)] flex flex-col z-20 transition-all ${isEditing ? 'border-l-4 border-nibmGold' : ''}`}>
                <div className="p-10 text-center border-b border-gray-50 relative">
                    {isEditing && <button onClick={cancelEdit} className="absolute left-6 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all"><X size={18}/></button>}
                    <PackagePlus size={32} className={`mx-auto mb-2 ${isEditing ? 'text-nibmGold' : 'text-blue-200'}`} />
                    <h2 className="text-xl font-black text-nibmBlue tracking-widest uppercase leading-none">{isEditing ? 'Update Entry' : 'Catalog Entry'}</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-hidden flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Name</label>
                            <input type="text" name="name" required className="w-full bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-nibmBlue text-sm font-medium" value={formData.name} onChange={handleChange} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1"><Utensils size={12}/> Category</label>
                            <select name="category" className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold text-nibmBlue text-sm appearance-none" value={formData.category} onChange={handleChange}>
                                <option value="Snacks">Snacks</option>
                                <option value="Main Meals">Main Meals</option>
                                <option value="Beverages">Beverages</option>
                                <option value="Desserts">Desserts</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Description</label>
                        <textarea name="description" rows="2" required className="w-full bg-gray-50 p-4 rounded-2xl outline-none text-sm resize-none font-medium text-gray-600" value={formData.description} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1"><BadgeDollarSign size={12}/> Price</label>
                            <input type="number" name="price" className="w-full bg-gray-50 p-4 rounded-2xl text-center font-black text-nibmBlue" value={formData.price} onChange={handleChange} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1"><Clock size={12}/> Prep</label>
                            <input type="number" name="prepTime" className="w-full bg-gray-50 p-4 rounded-2xl text-center font-black text-nibmBlue" value={formData.prepTime} onChange={handleChange} />
                        </div>
                        <div className="space-y-1.5 flex flex-col items-center">
                            <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider"><Flame size={12}/> Spice</label>
                            <div className="flex gap-1.5 mt-3">
                                {[1, 2, 3].map(i => <button key={i} type="button" onClick={() => handleSpiceClick(i)} className={`text-sm transition-all ${formData.spiceLevel >= i ? 'scale-125' : 'opacity-10 grayscale'}`}>🌶️</button>)}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Media</label>
                            <button type="button" onClick={() => fileInputRef.current.click()} className={`w-full border-2 border-dashed p-4 rounded-2xl font-bold text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 transition-all ${imageFile ? 'bg-blue-600 border-blue-600 text-white' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                                <Upload size={14} /> {imageFile ? 'Attached' : isEditing ? 'Update' : 'Upload'}
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <div className="space-y-1.5 text-center">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Type</label>
                            <button type="button" onClick={() => setFormData(prev => ({...prev, isVeg: !prev.isVeg}))} className={`h-[52px] px-6 rounded-2xl font-black text-[10px] tracking-widest uppercase border-2 transition-all flex items-center gap-2 ${formData.isVeg ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-100 text-gray-400'}`}>
                                Veg
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className={`w-full text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest ${isEditing ? 'bg-nibmGold hover:bg-yellow-500' : 'bg-nibmRed hover:bg-red-700'}`}>
                        {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : <><ClipboardCheck size={20} /> {isEditing ? 'Save' : 'Commit'}</>}
                    </button>

                    {previewUrl && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-[2rem] border border-gray-100 flex flex-col items-center">
                            <div className="flex items-center gap-2 text-gray-300 mb-3">
                                <Eye size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Visual Check</span>
                            </div>
                            <img src={previewUrl} className="w-full h-32 object-cover rounded-2xl shadow-sm border border-white" alt="" />
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;