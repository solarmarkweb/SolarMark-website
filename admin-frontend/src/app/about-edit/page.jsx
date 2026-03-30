'use client';

import React, { useState, useEffect } from 'react';
import { 
    Save, 
    Loader2, 
    CheckCircle, 
    AlertCircle, 
    Info, 
    Plus, 
    Trash2, 
    MoveUp, 
    MoveDown,
    Activity,
    Shield,
    Zap,
    Users,
    ChevronRight,
    Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AboutEditPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [data, setData] = useState(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin-backend-591983072009.asia-south1.run.app/api';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/');
            return;
        }
        fetchAboutContent();
    }, []);

    const fetchAboutContent = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/about/`);
            if (!response.ok) throw new Error('Failed to fetch About content');
            const result = await response.json();
            setData(result);
        } catch (err) {
            console.error('Error fetching about content:', err);
            setStatus({ type: 'error', message: 'Failed to load About page content.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus({ type: 'info', message: 'Saving changes...' });

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/about/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save content');
            
            setStatus({ type: 'success', message: 'About page updated successfully!' });
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const updateField = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const updateListItem = (listField, index, field, value) => {
        const newList = [...data[listField]];
        newList[index] = { ...newList[index], [field]: value };
        setData(prev => ({ ...prev, [listField]: newList }));
    };

    const addListItem = (listField, defaultValue) => {
        setData(prev => ({ ...prev, [listField]: [...prev[listField], defaultValue] }));
    };

    const removeListItem = (listField, index) => {
        const newList = data[listField].filter((_, i) => i !== index);
        setData(prev => ({ ...prev, [listField]: newList }));
    };

    const moveItem = (listField, index, direction) => {
        const newList = [...data[listField]];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newList.length) return;
        [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
        setData(prev => ({ ...prev, [listField]: newList }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Initializing Editor...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-24">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                            <Info size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">Modify About Page</h1>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Real-time CMS Editor</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleSave}
                        disabled={submitting}
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                        {submitting ? 'Updating...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-10">
                {status.message && (
                    <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 font-bold text-sm ${
                        status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        status.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-blue-50 text-blue-700 border-blue-100 shadow-sm'
                    }`}>
                        {status.type === 'success' ? <CheckCircle size={20} /> : 
                         status.type === 'error' ? <AlertCircle size={20} /> :
                         <Loader2 className="animate-spin" size={20} />}
                        {status.message}
                    </div>
                )}

                <div className="space-y-8">
                    {/* Hero Section */}
                    <Section title="Hero Section" icon={<Zap className="text-orange-500" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField 
                                label="Main Title" 
                                value={data.hero_title} 
                                onChange={(v) => updateField('hero_title', v)} 
                            />
                            <InputField 
                                label="Highlighted Subtitle" 
                                value={data.hero_subtitle} 
                                onChange={(v) => updateField('hero_subtitle', v)} 
                            />
                            <div className="md:col-span-2">
                                <TextAreaField 
                                    label="Hero Description" 
                                    value={data.hero_description} 
                                    onChange={(v) => updateField('hero_description', v)} 
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Mission Section */}
                    <Section title="Our Mission" icon={<Shield className="text-blue-500" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField 
                                label="Mission Tagline" 
                                value={data.mission_title} 
                                onChange={(v) => updateField('mission_title', v)} 
                            />
                            <InputField 
                                label="Mission Header" 
                                value={data.mission_subtitle} 
                                onChange={(v) => updateField('mission_subtitle', v)} 
                            />
                            <div className="md:col-span-2">
                                <TextAreaField 
                                    label="Full Mission Statement" 
                                    value={data.mission_description} 
                                    onChange={(v) => updateField('mission_description', v)} 
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Stats Section */}
                    <ListSection 
                        title="Key Statistics" 
                        icon={<Activity className="text-emerald-500" />}
                        items={data.stats}
                        onAdd={() => addListItem('stats', { label: 'New Stat', value: '100+', prefix: '', suffix: '%' })}
                        renderItem={(item, index) => (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl relative group">
                                <div className="absolute -left-2 -top-2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                    {index + 1}
                                </div>
                                <InputField label="Label" value={item.label} onChange={(v) => updateListItem('stats', index, 'label', v)} />
                                <InputField label="Value" value={item.value} onChange={(v) => updateListItem('stats', index, 'value', v)} />
                                <InputField label="Prefix" value={item.prefix || ''} onChange={(v) => updateListItem('stats', index, 'prefix', v)} />
                                <InputField label="Suffix" value={item.suffix || ''} onChange={(v) => updateListItem('stats', index, 'suffix', v)} />
                                
                                <ItemControls 
                                    onRemove={() => removeListItem('stats', index)} 
                                    onMoveUp={() => moveItem('stats', index, -1)}
                                    onMoveDown={() => moveItem('stats', index, 1)}
                                />
                            </div>
                        )}
                    />

                    {/* Process Section */}
                    <ListSection 
                        title="Deployment Process" 
                        icon={<ChevronRight className="text-purple-500" />}
                        items={data.process}
                        onAdd={() => addListItem('process', { title: 'Step', description: 'Detail', icon: 'ShieldCheck' })}
                        renderItem={(item, index) => (
                            <div className="space-y-4 bg-slate-50 p-6 rounded-xl relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="Step Title" value={item.title} onChange={(v) => updateListItem('process', index, 'title', v)} />
                                    <InputField label="Icon Name (Lucide)" value={item.icon} onChange={(v) => updateListItem('process', index, 'icon', v)} />
                                </div>
                                <TextAreaField label="Description" value={item.description} onChange={(v) => updateListItem('process', index, 'description', v)} />
                                
                                <ItemControls 
                                    onRemove={() => removeListItem('process', index)} 
                                    onMoveUp={() => moveItem('process', index, -1)}
                                    onMoveDown={() => moveItem('process', index, 1)}
                                />
                            </div>
                        )}
                    />

                    {/* Core Values */}
                    <ListSection 
                        title="Core Values" 
                        icon={<Users className="text-rose-500" />}
                        items={data.values}
                        onAdd={() => addListItem('values', { title: 'Value', description: 'Description' })}
                        renderItem={(item, index) => (
                            <div className="space-y-4 bg-slate-50 p-6 rounded-xl relative">
                                <InputField label="Value Name" value={item.title} onChange={(v) => updateListItem('values', index, 'title', v)} />
                                <TextAreaField label="Philosophy" value={item.description} onChange={(v) => updateListItem('values', index, 'description', v)} />
                                
                                <ItemControls 
                                    onRemove={() => removeListItem('values', index)} 
                                    onMoveUp={() => moveItem('values', index, -1)}
                                    onMoveDown={() => moveItem('values', index, 1)}
                                />
                            </div>
                        )}
                    />
                </div>
            </main>
        </div>
    );
}

// Internal UI Components
function Section({ title, icon, children }) {
    return (
        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
                <div className="p-2.5 bg-slate-50 rounded-xl">{icon}</div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function ListSection({ title, icon, items, renderItem, onAdd }) {
    return (
        <Section title={title} icon={icon}>
            <div className="space-y-6 mb-8">
                {items.map((item, idx) => (
                    <div key={idx}>{renderItem(item, idx)}</div>
                ))}
            </div>
            <button 
                onClick={onAdd}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-bold text-sm hover:bg-slate-50 hover:border-orange-200 hover:text-orange-500 transition-all"
            >
                <Plus size={18} /> Add New Entry
            </button>
        </Section>
    );
}

function InputField({ label, value, onChange }) {
    return (
        <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1 transition-colors group-focus-within:text-orange-500">{label}</label>
            <input 
                type="text" 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-semibold text-slate-800"
            />
        </div>
    );
}

function TextAreaField({ label, value, onChange }) {
    return (
        <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1 transition-colors group-focus-within:text-orange-500">{label}</label>
            <textarea 
                rows="3" 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-semibold text-slate-800 resize-none"
            />
        </div>
    );
}

function ItemControls({ onRemove, onMoveUp, onMoveDown }) {
    return (
        <div className="flex gap-2 mt-4 justify-end">
            <button onClick={onMoveUp} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-100 shadow-sm"><MoveUp size={14}/></button>
            <button onClick={onMoveDown} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-100 shadow-sm"><MoveDown size={14}/></button>
            <div className="w-px h-8 bg-slate-200 mx-1"></div>
            <button onClick={onRemove} className="p-2 hover:bg-rose-50 rounded-lg text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={16}/></button>
        </div>
    );
}
