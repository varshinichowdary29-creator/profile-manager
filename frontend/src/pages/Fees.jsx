import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { ListSkeleton } from '../components/Skeleton';
import { 
  Receipt, Landmark, CreditCard, Calendar, 
  ArrowRight, Download, Plus, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Fees = () => {
  const { user } = useAuth();
  
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Payment states
  const [payingFee, setPayingFee] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [amountToPay, setAmountToPay] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);

  // Fee Creation states (Admin Only)
  const [createOpen, setCreateOpen] = useState(false);
  const [newFee, setNewFee] = useState({
    title: '',
    amount: '',
    dueDate: '',
    studentId: '',
    classId: ''
  });

  const [classesList, setClassesList] = useState([]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/fees');
      if (res.data.success) {
        setFees(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching fees:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
    const fetchClasses = async () => {
      try {
        const res = await axios.get('/classes');
        if (res.data.success) {
          setClassesList(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching classes:', err.message);
      }
    };
    if (user?.role === 'Super Admin' || user?.role === 'School Admin') {
      fetchClasses();
    }
  }, [user]);

  const handleOpenCheckout = (fee) => {
    setPayingFee(fee);
    setAmountToPay((parseFloat(fee.amount) - parseFloat(fee.paidAmount)).toFixed(2));
    setSuccessReceipt(null);
    setCheckoutOpen(true);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await axios.post(`/fees/${payingFee.id}/pay`, {
        amountPaid: amountToPay,
        paymentMethod
      });
      if (res.data.success) {
        setSuccessReceipt(res.data.data.payment);
        fetchFees();
      }
    } catch (err) {
      console.error('Payment error:', err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateFee = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/fees', newFee);
      if (res.data.success) {
        setCreateOpen(false);
        setNewFee({ title: '', amount: '', dueDate: '', studentId: '', classId: '' });
        fetchFees();
      }
    } catch (err) {
      console.error('Error creating fee:', err.message);
    }
  };

  // Mock Receipt Download Action
  const handlePrintReceipt = (receipt) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${receipt.receiptNumber}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
            .receipt-box { max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .header h2 { margin: 0; color: #7c3aed; }
            .details { margin: 20px 0; font-size: 14px; line-height: 1.6; }
            .details table { width: 100%; border-collapse: collapse; }
            .details th { text-align: left; border-bottom: 1px solid #eee; padding: 10px 0; }
            .details td { padding: 10px 0; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 35px; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <h2>FIRSTCRY INTELLITOTS</h2>
              <p>Preschool & Daycare Receipt</p>
            </div>
            <div class="details">
              <p><strong>Receipt Number:</strong> ${receipt.receiptNumber}</p>
              <p><strong>Date:</strong> ${new Date(receipt.paymentDate || receipt.createdAt).toLocaleString()}</p>
              <p><strong>Payment Method:</strong> ${receipt.paymentMethod}</p>
              <p><strong>Transaction ID:</strong> ${receipt.transactionId}</p>
              <hr />
              <table>
                <thead>
                  <tr>
                    <th>Particulars</th>
                    <th style="text-align: right;">Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Pre-school Tuition & Session Invoice Charges</td>
                    <td style="text-align: right;">₹${parseFloat(receipt.amountPaid).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="footer">
              <p>Thank you for your payment!</p>
              <p>This is a computer generated invoice and requires no physical signature.</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const isParent = user?.role === 'Parent';
  const isAdmin = user?.role === 'Super Admin' || user?.role === 'School Admin';

  // Calculate stats
  let totalDues = 0;
  fees.forEach(f => {
    if (f.status === 'Unpaid') totalDues += parseFloat(f.amount);
    if (f.status === 'Partially Paid') totalDues += (parseFloat(f.amount) - parseFloat(f.paidAmount));
  });

  const filteredFees = fees.filter(f => {
    if (activeTab === 'all') return true;
    if (activeTab === 'paid') return f.status === 'Paid';
    if (activeTab === 'unpaid') return f.status === 'Unpaid' || f.status === 'Partially Paid';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Billing & Fees</h2>
          <p className="text-xs text-slate-400">Review class billing invoices, outstanding dues, and generate payment receipts.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Assign Fee
          </button>
        )}
      </div>

      {/* Dues Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="md:col-span-2 flex items-center justify-between relative overflow-hidden bg-gradient-to-r from-slate-900/60 to-slate-900/40">
          <div className="absolute right-0 top-0 w-32 h-32 bg-brand-purple/10 rounded-full blur-2xl" />
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Outstanding Balance</span>
            <h3 className="text-3xl font-display font-black text-white">₹{totalDues.toLocaleString()}</h3>
            <p className="text-xs text-slate-400">Total accumulated unpaid fees across listed child profiles.</p>
          </div>
          <div className="p-4 rounded-xl bg-brand-purple/20 text-brand-purple border border-brand-purple/35 shadow-glow-purple">
            <Landmark className="w-7 h-7" />
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 bg-slate-900/20">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-300">Fast Online Checkouts</p>
            <p className="text-slate-500 mt-0.5 leading-tight">Pay securely using credit cards, net banking, or immediate wire transfers.</p>
          </div>
        </GlassCard>
      </div>

      {/* Tabs and Grid list */}
      <GlassCard>
        {/* Tab filters */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-6 flex-wrap gap-2">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all' ? 'bg-brand-purple/15 text-brand-purple' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Invoices
            </button>
            <button 
              onClick={() => setActiveTab('unpaid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'unpaid' ? 'bg-amber-500/15 text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Outstanding
            </button>
            <button 
              onClick={() => setActiveTab('paid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'paid' ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Settled
            </button>
          </div>
          <span className="text-xs text-slate-500 font-medium">{filteredFees.length} invoices found</span>
        </div>

        {loading ? (
          <ListSkeleton rows={3} />
        ) : filteredFees.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-6 text-center">No fee statements found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice Title</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40">
                {filteredFees.map((fee) => {
                  const outstanding = parseFloat(fee.amount) - parseFloat(fee.paidAmount);
                  return (
                    <tr key={fee.id} className="hover:bg-slate-900/10 text-slate-200">
                      <td className="py-3.5 px-4 font-bold text-slate-100">{fee.title}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold">{fee.Student?.fullName}</span>
                        <p className="text-[10px] text-slate-500">{fee.Student?.Class?.name || 'Unassigned'}</p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold">₹{parseFloat(fee.amount).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-semibold">₹{parseFloat(fee.paidAmount).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-slate-400">{fee.dueDate}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          fee.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : fee.status === 'Partially Paid' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {fee.status !== 'Paid' && isParent && (
                          <button 
                            onClick={() => handleOpenCheckout(fee)}
                            className="bg-brand-purple/20 hover:bg-brand-purple/35 text-brand-purple font-semibold py-1 px-3.5 rounded-lg text-[10px] transition-colors border border-brand-purple/30"
                          >
                            Pay Dues
                          </button>
                        )}
                        {fee.Payments && fee.Payments.length > 0 && (
                          <button 
                            onClick={() => handlePrintReceipt(fee.Payments[0])}
                            className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 py-1 px-3 rounded-lg text-[10px] inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Pay Fee Modal */}
      <AnimatePresence>
        {checkoutOpen && payingFee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <h3 className="font-bold text-white text-base">Simulated Online Payment</h3>
                <button onClick={() => setCheckoutOpen(false)} className="p-1 rounded-lg hover:bg-slate-900 text-slate-400">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {!successReceipt ? (
                /* Payment input form */
                <form onSubmit={handlePaySubmit} className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-900/40 border border-slate-850 rounded-xl space-y-1">
                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Invoice Particulars</p>
                    <p className="text-slate-100 font-bold text-sm">{payingFee.title}</p>
                    <p className="text-slate-500">Student: {payingFee.Student?.fullName}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Payment Amount (₹)</label>
                    <input 
                      type="number" 
                      value={amountToPay}
                      onChange={(e) => setAmountToPay(e.target.value)}
                      className="glass-input text-sm font-bold text-white"
                      max={(parseFloat(payingFee.amount) - parseFloat(payingFee.paidAmount)).toFixed(2)}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Payment Source</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Online', 'Card', 'Bank Transfer'].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-2 rounded-lg border font-bold text-center transition-all ${
                            paymentMethod === m 
                              ? 'border-brand-purple bg-brand-purple/10 text-brand-purple' 
                              : 'border-slate-850 bg-slate-950/20 text-slate-400 hover:border-slate-800'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={processing}
                    className="btn-primary w-full flex items-center justify-center gap-2 mt-4 py-3"
                  >
                    {processing ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Authorize payment of ₹{parseFloat(amountToPay).toLocaleString()}
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Success screen */
                <div className="text-center space-y-4 py-4 text-xs">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Payment Authorized Successfully!</h4>
                    <p className="text-slate-400 mt-1">Receipt reference: {successReceipt.receiptNumber}</p>
                  </div>
                  <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-1.5 text-left text-[11px]">
                    <p className="flex justify-between"><span className="text-slate-500">Transaction ID:</span> <span className="font-semibold text-slate-300">{successReceipt.transactionId}</span></p>
                    <p className="flex justify-between"><span className="text-slate-500">Amount Paid:</span> <span className="font-semibold text-emerald-400">₹{parseFloat(successReceipt.amountPaid).toFixed(2)}</span></p>
                    <p className="flex justify-between"><span className="text-slate-500">Source Channel:</span> <span className="font-semibold text-slate-300">{successReceipt.paymentMethod}</span></p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => handlePrintReceipt(successReceipt)}
                      className="btn-primary w-1/2 flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      Get Receipt
                    </button>
                    <button onClick={() => setCheckoutOpen(false)} className="btn-secondary w-1/2">Close</button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Fee Modal */}
      <AnimatePresence>
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <h3 className="font-bold text-white text-base">Assign New Invoice Statement</h3>
                <button onClick={() => setCreateOpen(false)} className="p-1 rounded-lg hover:bg-slate-900 text-slate-400">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateFee} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Fee Particular Title</label>
                  <input 
                    type="text" 
                    value={newFee.title}
                    onChange={(e) => setNewFee({ ...newFee, title: e.target.value })}
                    className="glass-input" 
                    required 
                    placeholder="e.g. Q2 Session Activity Fee"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Invoice Amount (₹)</label>
                  <input 
                    type="number" 
                    value={newFee.amount}
                    onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                    className="glass-input" 
                    required 
                    placeholder="e.g. 5000"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Due Date</label>
                  <input 
                    type="date" 
                    value={newFee.dueDate}
                    onChange={(e) => setNewFee({ ...newFee, dueDate: e.target.value })}
                    className="glass-input" 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Class Target (Assign to all students in class)</label>
                  <select 
                    value={newFee.classId}
                    onChange={(e) => setNewFee({ ...newFee, classId: e.target.value })}
                    className="glass-select"
                  >
                    <option value="">Select Class</option>
                    {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                  <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Generate Statements</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Fees;
