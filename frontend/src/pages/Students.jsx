import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { ListSkeleton } from '../components/Skeleton';
import { 
  Plus, Search, Edit2, Trash2, Eye, X, 
  User, Calendar, Info, HeartPulse, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Students = () => {
  const { user } = useAuth();
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [status, setStatus] = useState('');
  const [gender, setGender] = useState('');

  // Selected student for detailed modal view
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'A+',
    address: '',
    classId: '',
    emergencyNotes: '',
    medicalConditions: '',
    emergencyProcedures: '',
    healthNotes: '',
    allergies: []
  });

  const [allergyInput, setAllergyInput] = useState({
    allergen: '',
    severity: 'Low',
    reaction: '',
    treatment: ''
  });

  // Dynamic list of classes from API
  const [classesList, setClassesList] = useState([]);

  useEffect(() => {
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
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedClass) params.classId = selectedClass;
      if (status) params.status = status;
      if (gender) params.gender = gender;

      const res = await axios.get('/students', { params });
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, selectedClass, status, gender]);

  const handleOpenDetailModal = async (studentId) => {
    try {
      const res = await axios.get(`/students/${studentId}`);
      if (res.data.success) {
        setSelectedStudent(res.data.data);
        setActiveTab('general');
        setDetailModalOpen(true);
      }
    } catch (err) {
      console.error('Error loading student profile:', err.message);
    }
  };

  const handleEditClick = (student) => {
    setEditingId(student.id);
    setFormData({
      fullName: student.fullName,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      bloodGroup: student.bloodGroup || '',
      address: student.address || '',
      classId: student.classId || '',
      emergencyNotes: student.emergencyNotes || '',
      medicalConditions: student.medicalRecord?.medicalConditions || '',
      emergencyProcedures: student.medicalRecord?.emergencyProcedures || '',
      healthNotes: student.medicalRecord?.healthNotes || '',
      allergies: student.medicalRecord?.allergies || []
    });
    setFormOpen(true);
  };

  const handleCreateClick = () => {
    setEditingId(null);
    setFormData({
      fullName: '',
      dateOfBirth: '',
      gender: 'Male',
      bloodGroup: 'A+',
      address: '',
      classId: '',
      emergencyNotes: '',
      medicalConditions: '',
      emergencyProcedures: '',
      healthNotes: '',
      allergies: []
    });
    setFormOpen(true);
  };

  const handleAddAllergy = () => {
    if (!allergyInput.allergen) return;
    setFormData({
      ...formData,
      allergies: [...formData.allergies, allergyInput]
    });
    setAllergyInput({ allergen: '', severity: 'Low', reaction: '', treatment: '' });
  };

  const handleRemoveAllergy = (idx) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter((_, i) => i !== idx)
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Edit student
        const res = await axios.put(`/students/${editingId}`, formData);
        if (res.data.success) {
          setFormOpen(false);
          fetchStudents();
        }
      } else {
        // Create student
        const res = await axios.post('/students', formData);
        if (res.data.success) {
          setFormOpen(false);
          fetchStudents();
        }
      }
    } catch (err) {
      console.error('Form submit error:', err.message);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student profile?')) return;
    try {
      const res = await axios.delete(`/students/${id}`);
      if (res.data.success) {
        fetchStudents();
        if (selectedStudent?.id === id) {
          setDetailModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Error deleting student:', err.message);
    }
  };

  const canWrite = user?.role !== 'Parent';
  const isAdmin = user?.role === 'Super Admin' || user?.role === 'School Admin';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Student Roster</h2>
          <p className="text-xs text-slate-400">Search, manage, and inspect student folders.</p>
        </div>
        {canWrite && (
          <button onClick={handleCreateClick} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Student
          </button>
        )}
      </div>

      {/* Filters Card */}
      <GlassCard className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input pl-10" 
            placeholder="Search by full name..."
          />
        </div>

        {/* Class Filter */}
        <select 
          value={selectedClass} 
          onChange={(e) => setSelectedClass(e.target.value)}
          className="glass-select"
        >
          <option value="">All Classes</option>
          {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {/* Gender Filter */}
        <select 
          value={gender} 
          onChange={(e) => setGender(e.target.value)}
          className="glass-select"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        {/* Status Filter */}
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          className="glass-select"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </GlassCard>

      {/* Students List */}
      {loading ? (
        <ListSkeleton />
      ) : students.length === 0 ? (
        <GlassCard className="text-center py-12 text-slate-500 text-sm">
          No students match the current filters.
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <GlassCard key={student.id} className="relative overflow-hidden flex flex-col justify-between group">
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-full font-bold border border-brand-purple/20">
                    {student.studentId}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    student.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {student.status}
                  </span>
                </div>

                {/* Profile row */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-purple/20 to-brand-blue/20 flex items-center justify-center font-bold text-brand-purple text-lg shadow-glass-inset">
                    {student.fullName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-brand-purple transition-colors text-sm">{student.fullName}</h3>
                    <p className="text-xs text-slate-400">Class: {student.Class ? student.Class.name : 'Unassigned'}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-900/60">
                <button 
                  onClick={() => handleOpenDetailModal(student.id)} 
                  className="flex-1 bg-slate-950/40 border border-slate-800/40 hover:bg-slate-900/40 text-slate-300 hover:text-slate-100 font-semibold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View File
                </button>
                {canWrite && (
                  <button 
                    onClick={() => handleEditClick(student)}
                    className="p-1.5 rounded-lg border border-slate-850 bg-slate-950/20 hover:bg-brand-blue/10 hover:text-brand-blue hover:border-brand-blue/20 text-slate-400 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {isAdmin && (
                  <button 
                    onClick={() => handleDeleteStudent(student.id)}
                    className="p-1.5 rounded-lg border border-slate-850 bg-slate-950/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-slate-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {detailModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />
            {/* Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative z-10 max-h-[85vh] flex flex-col"
            >
              {/* Top gradient bar */}
              <div className="h-[3px] bg-gradient-to-r from-brand-purple to-brand-blue shrink-0" />
              
              {/* Header */}
              <div className="p-6 border-b border-slate-900/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-purple/20 to-brand-blue/20 flex items-center justify-center font-bold text-brand-purple text-lg">
                    {selectedStudent.fullName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-none">{selectedStudent.fullName}</h3>
                    <p className="text-xs text-slate-500 mt-1">Student ID: {selectedStudent.studentId} | Class: {selectedStudent.Class ? selectedStudent.Class.name : 'Unassigned'}</p>
                  </div>
                </div>
                <button onClick={() => setDetailModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-900 text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs list */}
              <div className="px-6 border-b border-slate-900/60 flex gap-4 text-xs font-bold uppercase tracking-wider shrink-0 bg-slate-900/10">
                <button 
                  onClick={() => setActiveTab('general')}
                  className={`py-3.5 border-b-[2px] transition-all flex items-center gap-1.5 ${
                    activeTab === 'general' ? 'border-brand-purple text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  General
                </button>
                <button 
                  onClick={() => setActiveTab('medical')}
                  className={`py-3.5 border-b-[2px] transition-all flex items-center gap-1.5 ${
                    activeTab === 'medical' ? 'border-brand-purple text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <HeartPulse className="w-4 h-4" />
                  Medical
                </button>
                <button 
                  onClick={() => setActiveTab('pickup')}
                  className={`py-3.5 border-b-[2px] transition-all flex items-center gap-1.5 ${
                    activeTab === 'pickup' ? 'border-brand-purple text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Pickup Authorization
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
                {activeTab === 'general' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs border-b border-slate-900/60 pb-1">Personal Details</h4>
                      <div className="space-y-2.5 text-xs">
                        <p className="flex justify-between"><span className="text-slate-400">Date of Birth:</span> <span className="font-semibold text-slate-200">{selectedStudent.dateOfBirth}</span></p>
                        <p className="flex justify-between"><span className="text-slate-400">Gender:</span> <span className="font-semibold text-slate-200">{selectedStudent.gender}</span></p>
                        <p className="flex justify-between"><span className="text-slate-400">Blood Group:</span> <span className="font-semibold text-slate-200">{selectedStudent.bloodGroup || 'Not set'}</span></p>
                        <p className="flex justify-between"><span className="text-slate-400">Admission Date:</span> <span className="font-semibold text-slate-200">{selectedStudent.admissionDate}</span></p>
                        <p className="flex justify-between flex-col gap-1"><span className="text-slate-400">Home Address:</span> <span className="font-semibold text-slate-200">{selectedStudent.address || 'N/A'}</span></p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs border-b border-slate-900/60 pb-1">Parent Contacts</h4>
                      <div className="space-y-4 text-xs">
                        {selectedStudent.parents?.map((parent) => (
                          <div key={parent.id} className="p-3 rounded-xl bg-slate-900/40 border border-slate-850/60 space-y-1">
                            <p className="font-bold text-slate-200">{parent.name} ({parent.relationType})</p>
                            <p className="text-slate-400">Mobile: {parent.mobileNumber}</p>
                            {parent.email && <p className="text-slate-400">Email: {parent.email}</p>}
                            {parent.occupation && <p className="text-slate-400">Occupation: {parent.occupation}</p>}
                          </div>
                        ))}
                        {selectedStudent.parents?.length === 0 && (
                          <p className="text-slate-500 italic">No associated parents linked.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'medical' && (
                  <div className="space-y-6">
                    {/* Allergies list */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs border-b border-slate-900/60 pb-1">Known Allergies</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedStudent.medicalRecord?.allergies?.map((allergy) => (
                          <div key={allergy.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-850/60 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200 text-xs">{allergy.allergen}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                allergy.severity === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : allergy.severity === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}>{allergy.severity} Severity</span>
                            </div>
                            {allergy.reaction && <p className="text-xs text-slate-400"><strong className="text-slate-300">Reaction:</strong> {allergy.reaction}</p>}
                            {allergy.treatment && <p className="text-xs text-slate-400"><strong className="text-slate-300">Action/Treatment:</strong> {allergy.treatment}</p>}
                          </div>
                        ))}
                        {(!selectedStudent.medicalRecord || selectedStudent.medicalRecord.allergies?.length === 0) && (
                          <p className="text-xs text-slate-500 italic col-span-2">No allergies declared.</p>
                        )}
                      </div>
                    </div>

                    {/* Medical conditions and notes */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs border-b border-slate-900/60 pb-1">Medical Dossier</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1 p-3.5 bg-slate-900/30 rounded-xl border border-slate-900">
                          <p className="font-bold text-slate-400">Medical Conditions</p>
                          <p className="text-slate-200 font-semibold">{selectedStudent.medicalRecord?.medicalConditions || 'None specified'}</p>
                        </div>
                        <div className="space-y-1 p-3.5 bg-slate-900/30 rounded-xl border border-slate-900">
                          <p className="font-bold text-slate-400">Emergency Procedures</p>
                          <p className="text-slate-200 font-semibold">{selectedStudent.medicalRecord?.emergencyProcedures || 'Standard First Aid'}</p>
                        </div>
                      </div>
                      <div className="space-y-1 p-3.5 bg-slate-900/30 rounded-xl border border-slate-900 text-xs">
                        <p className="font-bold text-slate-400">Emergency / Locker Notes</p>
                        <p className="text-slate-200 font-semibold">{selectedStudent.emergencyNotes || 'None'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'pickup' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs border-b border-slate-900/60 pb-1">Authorized Pickups</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedStudent.pickupAuthorizations?.map((auth) => (
                        <div key={auth.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-850/60 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-200 text-xs">{auth.name}</p>
                            <p className="text-[10px] text-slate-400">Relationship: {auth.relationship}</p>
                            <p className="text-[10px] text-slate-400">Contact: {auth.contactNumber}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                              Verified
                            </span>
                            {auth.pinCode && (
                              <p className="text-xs font-bold text-brand-cyan tracking-wider mt-1.5">PIN: {auth.pinCode}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {selectedStudent.pickupAuthorizations?.length === 0 && (
                        <p className="text-xs text-slate-500 italic col-span-2">No authorized pickup guardians listed.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFormOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="h-[3px] bg-gradient-to-r from-brand-purple to-brand-blue shrink-0" />
              
              <div className="p-6 border-b border-slate-900/60 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-white text-base">{editingId ? 'Edit Student Profile' : 'Add New Student'}</h3>
                <button onClick={() => setFormOpen(false)} className="p-1 rounded-lg hover:bg-slate-900 text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {/* Full name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="glass-input" 
                    required 
                    placeholder="Enter full name"
                  />
                </div>

                {/* DOB & Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Date of Birth</label>
                    <input 
                      type="date" 
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="glass-input" 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="glass-select"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Blood Group & Class */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Blood Group</label>
                    <input 
                      type="text" 
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="glass-input" 
                      placeholder="e.g. O+"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Class Assignment</label>
                    <select 
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      className="glass-select"
                    >
                      <option value="">Select Class</option>
                      {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Home Address</label>
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="glass-input h-16" 
                    placeholder="Enter complete home address"
                  />
                </div>

                {/* Medical summaries */}
                <div className="border-t border-slate-900 pt-4 space-y-4">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">Health Details</h4>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Medical Conditions</label>
                    <input 
                      type="text" 
                      value={formData.medicalConditions}
                      onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                      className="glass-input" 
                      placeholder="e.g. Asthma, Eczema, None"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Emergency Actions/Procedures</label>
                    <input 
                      type="text" 
                      value={formData.emergencyProcedures}
                      onChange={(e) => setFormData({ ...formData, emergencyProcedures: e.target.value })}
                      className="glass-input" 
                      placeholder="Instructions for staff during emergencies"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Emergency Locker Notes</label>
                    <input 
                      type="text" 
                      value={formData.emergencyNotes}
                      onChange={(e) => setFormData({ ...formData, emergencyNotes: e.target.value })}
                      className="glass-input" 
                      placeholder="e.g. Keep warm water, special lunch instructions"
                    />
                  </div>
                </div>

                {/* Submit row */}
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-900 shrink-0">
                  <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Save Profile</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Students;
