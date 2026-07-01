import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import API from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, ShieldCheck, QrCode, Timer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

const Checkout = () => {
    const { cart, clearCart } = useCartStore();
    const [order, setOrder] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const pollingInterval = useRef(null);
    const receiptRef = useRef(null);
    const navigate = useNavigate();

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    useEffect(() => {
        if (cart.length === 0 && !order) navigate('/menu');
        return () => { if (pollingInterval.current) clearInterval(pollingInterval.current); };
    }, [cart, navigate, order]);

    const downloadReceipt = async () => {
        if (receiptRef.current) {
            const canvas = await html2canvas(receiptRef.current, { backgroundColor: '#f1f5f9', scale: 3 });
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
                console.error("Status check failed");
            }
        }, 3000);
    };

    const handleCheckout = async () => {
        const token = localStorage.getItem('token');
        if (!token) return toast.error("Session expired");

        setIsProcessing(true);
        const loadingToast = toast.loading("Connecting to Secure Gateway...");
        
        try {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const orderRes = await API.post('/api/orders/create', {
                items: cart,
                totalAmount: total,
                userId: decodedToken.id 
            });

            const orderData = orderRes.data;
            setOrder(orderData);

            await API.patch(`/api/orders/${orderData._id}/pay-simulate`);
            startPolling(orderData._id, loadingToast);

        } catch (err) {
            toast.error("Gateway Timeout", { id: loadingToast });
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-screen w-full bg-nibmGray flex items-center justify-center p-6 relative overflow-hidden font-sans text-slate-900">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-20">
                <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-nibmGold rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[5%] right-[5%] w-[500px] h-[500px] bg-nibmBlue rounded-full blur-[120px]"></div>
            </div>

            <div ref={receiptRef} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-premium border border-white p-10 z-20">
                
                <div className="flex justify-between items-center mb-8">
                    <button onClick={() => navigate('/menu')} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                        <ArrowLeft size={20} className="text-gray-400" />
                    </button>
                    <div className="text-right">
                        <h2 className="text-lg font-black text-nibmBlue tracking-tighter uppercase leading-none">Canteen-Zero</h2>
                        <p className="text-[9px] font-bold text-nibmRed tracking-widest uppercase mt-1">
                            {order ? `ID: #${order._id.slice(-6).toUpperCase()}` : "Validation Pending"}
                        </p>
                    </div>
                </div>

                {order && order.status === 'Paid' ? (
                    <div className="text-center py-4 animate-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight leading-none">Payment Verified</h3>
                        <p className="text-gray-400 text-[10px] font-bold mt-2 mb-8 uppercase tracking-widest">Transaction Successful</p>
                        
                        <div className="bg-nibmBlue p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-900/40 border-4 border-white/10 ring-8 ring-blue-50/50">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-nibmGold mb-4 text-center">Pickup Token</p>
                            <span className="text-8xl font-black tracking-tighter block text-center leading-none">
                                {order.tokenID}
                            </span>
                        </div>

                        <div className="flex flex-col gap-4 mt-12">
                            <button onClick={downloadReceipt} className="w-full bg-slate-100 text-nibmBlue font-black py-4 rounded-2xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] hover:bg-slate-200 transition-all border border-slate-200">
                                <Download size={16} /> Save E-Token
                            </button>
                            <button onClick={() => navigate('/menu')} className="text-nibmBlue font-black text-[10px] uppercase tracking-[0.5em] hover:text-nibmRed transition-colors mt-2">
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-slate-50 rounded-[2rem] p-8 mb-8 border border-gray-100 flex flex-col items-center shadow-inner">
                            <div className="p-4 bg-white rounded-3xl shadow-sm mb-5 border border-gray-50">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=NIBM_PAY_${total}_${order?._id || 'new'}`} alt="" className={`w-40 h-40 transition-all duration-700 ${isProcessing ? 'opacity-20 scale-95 blur-sm' : 'opacity-100 scale-100'}`} />
                            </div>
                            <div className="flex items-center gap-2 text-nibmBlue font-black text-[11px] uppercase tracking-[0.2em] mb-1.5 leading-none">
                                <QrCode size={14} /> Scan with Banking App
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center mt-2">
                                <Timer size={10} /> Valid for 120s
                            </div>
                        </div>

                        <div className="space-y-4 mb-10">
                            <div className="flex justify-between items-end border-b border-gray-100 pb-5">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Payable</span>
                                <span className="text-5xl font-black text-nibmBlue italic leading-none font-mono">Rs.{total}</span>
                            </div>
                        </div>

                        <button onClick={handleCheckout} disabled={isProcessing} className="w-full bg-nibmRed text-white font-black py-5 rounded-2xl shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.25em] active:scale-95 disabled:bg-gray-100 disabled:text-gray-400">
                            {isProcessing ? <span className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-gray-600 rounded-full"></span> : "Confirm Payment"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Checkout;