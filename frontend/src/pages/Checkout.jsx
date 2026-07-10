import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import API from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, ShieldCheck, QrCode, Timer, Download, Utensils, ShoppingBag, Armchair } from 'lucide-react';
import html2canvas from 'html2canvas';
import { io } from 'socket.io-client';

const Checkout = () => {
    const { cart, clearCart } = useCartStore();
    const [order, setOrder] = useState(null);
    const [orderType, setOrderType] = useState(null);
    const [seatsAvailable, setSeatsAvailable] = useState(40);
    const [isProcessing, setIsProcessing] = useState(false);
    const pollingInterval = useRef(null);
    const receiptRef = useRef(null);
    const navigate = useNavigate();

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const fetchOccupancy = useCallback(async () => {
        try {
            const res = await API.get('/api/orders/occupancy');
            setSeatsAvailable(res.data.available);
        } catch (err) {
            console.error("Resource check failed");
        }
    }, []);

    useEffect(() => {
        const socket = io(process.env.REACT_APP_API_URL);
        fetchOccupancy();

        socket.on('occupancyUpdate', (data) => {
            setSeatsAvailable(data.available);
            if (data.available === 0 && orderType === 'Dine-In') {
                setOrderType(null);
                toast.error("Seating capacity reached. Switching to Takeaway.");
            }
        });

        if (cart.length === 0 && !order) navigate('/menu');
        return () => { 
            if (pollingInterval.current) clearInterval(pollingInterval.current); 
            socket.disconnect();
        };
    }, [cart, navigate, order, fetchOccupancy, orderType]);

    const downloadReceipt = async () => {
        if (receiptRef.current) {
            const canvas = await html2canvas(receiptRef.current, { backgroundColor: '#f8fafc', scale: 3 });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `NIBM-TOKEN-${order.tokenID}.png`;
            link.click();
            toast.success("Token saved to gallery");
        }
    };

    const startPolling = (orderId, loadingToast) => {
        pollingInterval.current = setInterval(async () => {
            try {
                const res = await API.get(`/api/orders/${orderId}/status`);
                if (res.data.status === 'Paid') {
                    clearInterval(pollingInterval.current);
                    setOrder((prev) => ({ ...prev, status: 'Paid', tokenID: res.data.tokenID }));
                    toast.success("Bank Confirmed Payment", { id: loadingToast });
                    clearCart();
                    setIsProcessing(false);
                }
            } catch (err) {
                console.error("Polling Error");
            }
        }, 2000);
    };

    const handleCheckout = async () => {
        if (!orderType) return toast.error("Please select a Dining Mode");
        const token = localStorage.getItem('token');
        if (!token) return toast.error("Session expired");

        setIsProcessing(true);
        const loadingToast = toast.loading("Connecting to Secure Gateway...");

        try {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const orderRes = await API.post('/api/orders/create', {
                items: cart, totalAmount: total, userId: decodedToken.id, orderType
            });

            const orderData = orderRes.data;
            setOrder(orderData);

            setTimeout(async () => {
                await API.patch(`/api/orders/${orderData._id}/pay-simulate`);
                startPolling(orderData._id, loadingToast);
            }, 1500);

        } catch (err) {
            toast.error(err.response?.data?.message || "Gateway Error", { id: loadingToast });
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-screen w-full bg-[#f8fafc] flex items-center justify-center p-10 relative overflow-hidden font-sans text-slate-900 text-left">
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-20">
                <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-[#ffc600] rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[5%] right-[5%] w-[500px] h-[500px] bg-[#0b3d91] rounded-full blur-[120px]"></div>
            </div>

            <div ref={receiptRef} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-premium border border-white p-8 z-20 transition-all duration-700 max-h-[92vh] overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => navigate('/menu')} className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-75">
                        <ArrowLeft size={20} className="text-gray-400" />
                    </button>
                    <div className="text-right leading-none">
                        <h2 className="text-lg font-black text-[#0b3d91] tracking-tighter uppercase">Canteen-Zero</h2>
                        <p className="text-[9px] font-bold text-[#d71920] tracking-widest uppercase mt-1">
                            {order ? `ID: #${order._id.slice(-6).toUpperCase()}` : "Validation Pending"}
                        </p>
                    </div>
                </div>

                {order && order.status === 'Paid' ? (
                    <div className="text-center py-2 animate-in zoom-in duration-500">
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <ShieldCheck size={28} />
                        </div>
                        <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight leading-none">Payment Verified</h3>
                        <p className="text-gray-400 text-[10px] font-bold mt-2 mb-6 uppercase tracking-widest">Transaction Successful</p>
                        <div className="bg-[#0b3d91] p-8 rounded-[3rem] text-white shadow-2xl border-4 border-white/10 ring-8 ring-blue-50/50">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#ffc600] mb-3 text-center leading-none">Pickup Token</p>
                            <span className="text-7xl font-black tracking-tighter block text-center leading-none">{order.tokenID}</span>
                        </div>
                        <div className="flex flex-col gap-3 mt-10">
                            <button onClick={downloadReceipt} className="w-full bg-slate-100 text-[#0b3d91] font-black py-4 rounded-2xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] hover:bg-slate-200 transition-all border border-slate-200"><Download size={16} /> Save E-Token</button>
                            <button onClick={() => navigate('/menu')} className="text-[#0b3d91] font-black text-[10px] uppercase tracking-[0.5em] hover:text-[#d71920] transition-colors mt-2 text-center">Back to Dashboard</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-slate-50 rounded-[2rem] p-6 mb-6 border border-gray-100 flex flex-col items-center shadow-inner">
                            <div className="p-3 bg-white rounded-3xl shadow-sm mb-4 border border-gray-50 overflow-hidden transform transition-transform hover:scale-105 duration-500">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=NIBM_PAY_${total}_${order?._id || 'new'}`} alt="QR" className={`w-36 h-36 transition-all duration-1000 animate-fade-in ${isProcessing ? 'opacity-20 scale-95 blur-sm' : 'opacity-100 scale-100'}`} />
                            </div>
                            <div className="flex items-center gap-2 text-[#0b3d91] font-black text-[11px] uppercase tracking-[0.2em] mb-1.5 leading-none"><QrCode size={14} /> Scan with Banking App</div>
                            <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center mt-2 opacity-60"><Timer size={10} /> Valid for 120s</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button 
                                disabled={seatsAvailable === 0}
                                onClick={() => setOrderType('Dine-In')} 
                                className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all relative overflow-hidden ${orderType === 'Dine-In' ? 'bg-[#0b3d91] border-[#0b3d91] text-white shadow-xl -translate-y-1' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'} ${seatsAvailable === 0 ? 'opacity-40 cursor-not-allowed bg-gray-50 grayscale' : ''}`}
                            >
                                <Utensils size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Dine-In</span>
                                <div className="flex items-center gap-1 mt-1">
                                    <Armchair size={10} className={seatsAvailable === 0 ? 'text-red-500' : 'text-green-500'} />
                                    <span className={`text-[8px] font-bold uppercase tracking-tighter ${seatsAvailable === 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {seatsAvailable === 0 ? 'Full' : `${seatsAvailable} Left`}
                                    </span>
                                </div>
                            </button>
                            <button onClick={() => setOrderType('Takeaway')} className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${orderType === 'Takeaway' ? 'bg-[#0b3d91] border-[#0b3d91] text-white shadow-xl -translate-y-1' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'}`}>
                                <ShoppingBag size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Takeaway</span>
                                <span className="text-[8px] font-bold text-blue-400 uppercase mt-1 tracking-tighter">Unlimited</span>
                            </button>
                        </div>

                        <div className="space-y-4 mb-8 text-left px-2">
                            <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Payable</span>
                                <span className="text-5xl font-black text-[#0b3d91] italic leading-none font-mono tracking-tighter">Rs.{total}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-green-600 font-bold uppercase tracking-widest bg-green-50/50 p-2 rounded-lg"><ShieldCheck size={14} /> PCI-DSS Compliant Security</div>
                        </div>

                        <button onClick={handleCheckout} disabled={isProcessing} className="w-full bg-[#d71920] text-white font-black py-5 rounded-2xl shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.25em] active:scale-95 disabled:bg-gray-50 disabled:text-gray-300 disabled:shadow-none mb-2">
                            {isProcessing ? <span className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-gray-500 rounded-full"></span> : "Confirm Payment"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Checkout;