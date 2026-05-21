import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import MDEditor from '@uiw/react-md-editor';
import { useAuth } from '../../context/AuthContext';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  authorId: string;
  status: string | number;
  isBlocked?: boolean;
}

interface Material {
  id: string;
  title: string;
  type: string;
  contentUrl: string;
  orderIndex: number;
  order?: number; // Czasami z API wraca jako 'order'
  content?: string;
}

export default function CompanyDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', price: '' as any, imageUrl: '' });
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [newMaterial, setNewMaterial] = useState({ title: '', type: 'Text', orderIndex: 1, content: '' });
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'courses' | 'sales'>('courses');

  const { user, isLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    
    if (!user || user.role !== 'Company') {
      window.location.href = '/';
      return;
    }
    
    fetchData();
  }, [user, isLoading]);

  const fetchData = async () => {
    try {
      const cRes = await api.get('/catalog/courses');
      const allCourses = Array.isArray(cRes.data) ? cRes.data : (cRes.data?.rows || []);
      const myCourses = allCourses.filter((c: any) => c.authorId?.toLowerCase() === user?.id?.toLowerCase());
      setCourses(myCourses);

      fetchReports();
    } catch (err) {
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports/course-sales?startDate=2020-01-01&endDate=2030-01-01');
      setReports(res.data.rows || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const priceNum = parseFloat(newCourse.price as any) || 0;
      const res = await api.post('/catalog/courses', { ...newCourse, price: priceNum, status: 0 });
      setCourses([...courses, res.data]);
      setNewCourse({ title: '', description: '', price: '' as any, imageUrl: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCourse = async (course: Course) => {
    setSelectedCourse(course);
    try {
      const res = await api.get(`/catalog/courses/${course.id}/materials`);
      setMaterials(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const res = await api.post(`/catalog/courses/${selectedCourse.id}/materials`, {
        title: `[${newMaterial.type}] ${newMaterial.title}`,
        contentUrl: newMaterial.type === 'Text' ? newMaterial.content : '',
        order: newMaterial.orderIndex
      });

      const createdMaterial = res.data;

      if (newMaterial.type !== 'Text' && fileToUpload) {
        const formData = new FormData();
        const extension = fileToUpload.name.split('.').pop()?.toLowerCase();
        let finalFile = fileToUpload;
        if (newMaterial.type === 'Document' && extension !== 'pdf') {
             finalFile = new File([fileToUpload], 'document.pdf', { type: 'application/pdf' });
        }

        formData.append('file', finalFile);
        formData.append('lessonId', createdMaterial.id);

        await api.post('/file-storage/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        createdMaterial.contentUrl = `[File Upload Processing]`;
      }

      setMaterials([...materials, createdMaterial]);
      setNewMaterial({ title: '', type: 'Text', orderIndex: materials.length + 1, content: '' });
      setFileToUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      const priceNum = parseFloat(editingCourse.price as any) || 0;
      await api.put(`/catalog/courses/${editingCourse.id}`, {
        title: editingCourse.title,
        description: editingCourse.description,
        price: priceNum,
        imageUrl: editingCourse.imageUrl,
        status: (editingCourse.status === 0 || editingCourse.status === 'Active' || editingCourse.status === '0') ? 0 : 1
      });
      setCourses(courses.map(c => c.id === editingCourse.id ? { ...editingCourse, price: priceNum } : c));
      if (selectedCourse?.id === editingCourse.id) {
        setSelectedCourse({ ...editingCourse, price: priceNum });
      }
      setEditingCourse(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !editingMaterial) return;

    try {
      const updatedTitle = `[${editingMaterial.type}] ${editingMaterial.title}`;
      const updatedContentUrl = editingMaterial.type === 'Text' ? editingMaterial.content : '';

      await api.put(`/catalog/courses/${selectedCourse.id}/materials/${editingMaterial.id}`, {
        title: updatedTitle,
        contentUrl: updatedContentUrl,
        order: editingMaterial.orderIndex
      });

      if (editingMaterial.type !== 'Text' && fileToUpload) {
        const formData = new FormData();
        const extension = fileToUpload.name.split('.').pop()?.toLowerCase();
        let finalFile = fileToUpload;
        if (editingMaterial.type === 'Document' && extension !== 'pdf') {
          finalFile = new File([fileToUpload], 'document.pdf', { type: 'application/pdf' });
        }

        formData.append('file', finalFile);
        formData.append('lessonId', editingMaterial.id);

        await api.post('/file-storage/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      const res = await api.get(`/catalog/courses/${selectedCourse.id}/materials`);
      setMaterials(res.data || []);

      setEditingMaterial(null);
      setFileToUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!selectedCourse || !window.confirm("Czy na pewno chcesz usunąć tę lekcję?")) return;
    try {
      await api.delete(`/catalog/courses/${selectedCourse.id}/materials/${materialId}`);
      setMaterials(materials.filter(m => m.id !== materialId));
      if (editingMaterial?.id === materialId) {
        setEditingMaterial(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const moveMaterial = async (materialId: string, direction: number) => {
    if (!selectedCourse) return;
    const currentIndex = materials.findIndex(m => m.id === materialId);
    if (currentIndex < 0) return;
    
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= materials.length) return;

    const currentMaterial = materials[currentIndex];
    const swapMaterial = materials[newIndex];

    const currentOrder = currentMaterial.order !== undefined ? currentMaterial.order : currentMaterial.orderIndex;
    const swapOrder = swapMaterial.order !== undefined ? swapMaterial.order : swapMaterial.orderIndex;

    try {
      // Aktualizacja w locie
      const newMaterials = [...materials];
      newMaterials[currentIndex] = { ...currentMaterial, order: swapOrder, orderIndex: swapOrder };
      newMaterials[newIndex] = { ...swapMaterial, order: currentOrder, orderIndex: currentOrder };
      newMaterials.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : a.orderIndex;
        const orderB = b.order !== undefined ? b.order : b.orderIndex;
        return orderA - orderB;
      });
      setMaterials(newMaterials);

      await api.put(`/catalog/courses/${selectedCourse.id}/materials/${currentMaterial.id}`, {
        title: currentMaterial.title,
        contentUrl: currentMaterial.contentUrl || '',
        order: swapOrder
      });

      await api.put(`/catalog/courses/${selectedCourse.id}/materials/${swapMaterial.id}`, {
        title: swapMaterial.title,
        contentUrl: swapMaterial.contentUrl || '',
        order: currentOrder
      });
    } catch (err) {
      console.error("Failed to move material:", err);
      // Rollback na wypadek błędu
      const res = await api.get(`/catalog/courses/${selectedCourse.id}/materials`);
      setMaterials(res.data || []);
    }
  };

  const toggleCourseStatus = async (course: Course) => {
    try {
      const newStatus = (course.status === 0 || course.status === 'Active' || course.status === '0') ? 1 : 0;
      await api.put(`/catalog/courses/${course.id}`, {
        title: course.title,
        description: course.description,
        price: course.price,
        imageUrl: course.imageUrl,
        status: newStatus
      });
      setCourses(courses.map(c => c.id === course.id ? { ...c, status: newStatus } : c));
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || dataLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a' }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid rgba(255,255,255,0.1)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f1f5f9', paddingTop: '100px', paddingBottom: '4rem' }}>
      <div className="container">
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, background: 'linear-gradient(90deg, #f59e0b, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 0.5rem 0' }}>
              Panel Twórcy
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0 }}>Zarządzaj swoimi kursami, lekcjami i analizuj sprzedaż.</p>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '0' }}>
          {(['courses', 'sales'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '10px 10px 0 0',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '1rem',
                transition: 'all 0.2s',
                background: activeTab === tab ? 'rgba(245,158,11,0.15)' : 'transparent',
                color: activeTab === tab ? '#f59e0b' : '#94a3b8',
                borderBottom: activeTab === tab ? '2px solid #f59e0b' : '2px solid transparent',
              }}
            >
              {tab === 'courses' ? '📚 Kursy i Lekcje' : '📊 Sprzedaż'}
            </button>
          ))}
        </div>

        {activeTab === 'courses' && <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row', flexWrap: 'wrap' }}>
          
          {/* LEWA KOLUMNA: Lista Kursów */}
          <div style={{ flex: '1', minWidth: '350px', backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '2rem', borderRadius: '20px', border: '1px solid #334155', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#f1f5f9', fontSize: '1.8rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>Twoje Kursy</h2>
            
            <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '1.5rem', borderRadius: '15px', border: '1px solid #1e293b' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#cbd5e1' }}>Stwórz Nowy Kurs</h3>
              <input className="input" placeholder="Tytuł" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required style={{ padding: '0.8rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#f1f5f9' }}/>
              <textarea className="input" placeholder="Opis" value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} required style={{ padding: '0.8rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#f1f5f9', minHeight: '80px' }}/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>Cena kursu</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    className="input" 
                    type="text" 
                    inputMode="decimal"
                    placeholder="0.00" 
                    value={newCourse.price} 
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || /^\d*[.,]?\d*$/.test(val)) {
                        const normalized = val.replace(',', '.');
                        setNewCourse({...newCourse, price: normalized});
                      }
                    }} 
                    required 
                    style={{ 
                      width: '100%',
                      padding: '0.8rem 3rem 0.8rem 1rem', 
                      borderRadius: '8px', 
                      backgroundColor: '#0f172a', 
                      border: '1px solid #475569', 
                      color: '#f1f5f9',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                  />
                  <span style={{ position: 'absolute', right: '12px', color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', pointerEvents: 'none' }}>
                    PLN
                  </span>
                </div>
              </div>
              <input className="input" placeholder="URL Miniaturki" value={newCourse.imageUrl} onChange={e => setNewCourse({...newCourse, imageUrl: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#f1f5f9' }}/>
              <button type="submit" style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                Dodaj Kurs
              </button>
            </form>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
              {courses.map(course => (
                <li 
                  key={course.id} 
                  style={{ 
                    padding: '1.5rem', 
                    borderRadius: '15px', 
                    border: selectedCourse?.id === course.id ? '2px solid #f59e0b' : '1px solid #334155', 
                    backgroundColor: selectedCourse?.id === course.id ? 'rgba(245, 158, 11, 0.05)' : 'rgba(15, 23, 42, 0.5)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectCourse(course)}
                  onMouseOver={e => { if (selectedCourse?.id !== course.id) e.currentTarget.style.borderColor = '#475569'; }}
                  onMouseOut={e => { if (selectedCourse?.id !== course.id) e.currentTarget.style.borderColor = '#334155'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#f1f5f9' }}>{course.title} {course.isBlocked && <span style={{ color: '#ef4444', fontSize: '0.8rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: '10px' }}>Zablokowany</span>}</h3>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#94a3b8' }}>
                        <span>💰 {course.price} PLN</span>
                        <span>•</span>
                        <span style={{ color: (course.status === 0 || course.status === '0' || course.status === 'Active') ? '#10b981' : '#ef4444' }}>
                          {(course.status === 0 || course.status === '0' || course.status === 'Active') ? 'Aktywny' : 'Nieaktywny'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '1rem' }}>
                    {user.role === 'Company' && course.authorId?.toLowerCase() === user.id?.toLowerCase() && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingCourse(course); setEditingMaterial(null); }} 
                          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #38bdf8', color: '#38bdf8', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem' }}
                          onMouseOver={e => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          ✏️ Edytuj
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleCourseStatus(course); }} 
                          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#cbd5e1', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem' }}
                          onMouseOver={e => { e.currentTarget.style.background = 'rgba(203, 213, 225, 0.1)'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          👁️ Zmień Status
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* PRAWA KOLUMNA: Lekcje dla wybranego kursu */}
          <div style={{ flex: '1.5', minWidth: '400px', backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '2rem', borderRadius: '20px', border: '1px solid #334155', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            {selectedCourse ? (
              <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <h2 style={{ margin: '0 0 1.5rem 0', color: '#f1f5f9', fontSize: '1.8rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
                  Lekcje: <span style={{ color: '#f59e0b' }}>{selectedCourse.title}</span>
                </h2>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {materials.map(m => {
                    const type = m.title.match(/\[(.*?)\]/)?.[1] || 'Text';
                    const title = m.title.replace(/\[(.*?)\] /, '');
                    const order = m.order !== undefined ? m.order : m.orderIndex;
                    return (
                      <li key={m.id} style={{ padding: '1rem 1.5rem', borderRadius: '12px', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {order}
                          </div>
                          <div>
                            <strong style={{ display: 'block', fontSize: '1.1rem', color: '#f1f5f9' }}>{title}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{type}</span>
                          </div>
                        </div>
                        
                        {user.role === 'Company' && selectedCourse.authorId?.toLowerCase() === user.id?.toLowerCase() && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => moveMaterial(m.id, -1)}
                              style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }}
                              onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.3)'}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.15)'}
                              title="Przesuń w górę"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveMaterial(m.id, 1)}
                              style={{ padding: '6px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }}
                              onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.3)'}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.15)'}
                              title="Przesuń w dół"
                            >
                              ↓
                            </button>
                            <button 
                              onClick={() => {
                                setEditingMaterial({
                                  id: m.id,
                                  title: title,
                                  type: type,
                                  orderIndex: order,
                                  contentUrl: m.contentUrl || '',
                                  content: m.contentUrl || ''
                                });
                              }} 
                              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }}
                              onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.3)'}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.15)'}
                            >
                              Edytuj
                            </button>
                            <button 
                              onClick={() => handleDeleteMaterial(m.id)} 
                              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }}
                              onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
                            >
                              Usuń
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                  {materials.length === 0 && (
                    <li style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Ten kurs nie ma jeszcze żadnych lekcji.</li>
                  )}
                </ul>

                {user.role === 'Company' && selectedCourse.authorId?.toLowerCase() === user.id?.toLowerCase() && (
                  <div style={{ marginTop: '2.5rem', backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: '2rem', borderRadius: '15px', border: '1px solid #1e293b' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: '#f1f5f9', fontSize: '1.4rem' }}>✨ Dodaj Nową Lekcję</h3>
                    <form onSubmit={handleCreateMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <input className="input" placeholder="Tytuł lekcji" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} required style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#f1f5f9' }}/>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <select value={newMaterial.type} onChange={e => setNewMaterial({...newMaterial, type: e.target.value})} style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#f1f5f9', flex: '2' }}>
                          <option value="Text">Tekst (Markdown)</option>
                          <option value="Video">Wideo (MP4)</option>
                          <option value="Document">Dokument (PDF)</option>
                        </select>
                        <input className="input" type="number" placeholder="Kolejność" value={newMaterial.orderIndex} onChange={e => setNewMaterial({...newMaterial, orderIndex: parseInt(e.target.value)})} required style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#f1f5f9', flex: '1' }}/>
                      </div>

                      {newMaterial.type === 'Text' ? (
                        <div data-color-mode="light" style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #475569' }}>
                          <MDEditor
                            value={newMaterial.content}
                            onChange={(val) => setNewMaterial({...newMaterial, content: val || ''})}
                            height={350}
                          />
                        </div>
                      ) : (
                        <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', borderRadius: '10px', border: '1px dashed #64748b' }}>
                          <label style={{ display: 'block', marginBottom: '10px', color: '#cbd5e1' }}>Wybierz plik ({newMaterial.type === 'Video' ? 'Wideo .mp4' : 'Dokument .pdf'}):</label>
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            accept={newMaterial.type === 'Video' ? 'video/*' : 'application/pdf'}
                            onChange={e => setFileToUpload(e.target.files?.[0] || null)}
                            required
                            style={{ width: '100%', color: '#94a3b8' }}
                          />
                        </div>
                      )}

                      <button type="submit" style={{ padding: '1rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        + Dodaj Lekcję
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', opacity: 0.7 }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👈</div>
                <h3 style={{ margin: 0, color: '#94a3b8' }}>Wybierz kurs z listy</h3>
                <p style={{ color: '#64748b' }}>aby zarządzać jego lekcjami i materiałami</p>
              </div>
            )}
          </div>
        </div>}

        {activeTab === 'sales' && (
        <section style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '2rem', borderRadius: '20px', border: '1px solid #334155', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#f1f5f9', fontSize: '1.8rem' }}>📊 Sprzedaż Twoich Kursów (Cały Okres)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #334155' }}>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Tytuł Kursu</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>Sprzedane Dostępy</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>Przychód</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr><td colSpan={3} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Brak danych sprzedażowych.</td></tr>
                ) : (
                  reports.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1rem', color: '#f1f5f9', fontWeight: 500 }}>{r.courseTitle}</td>
                      <td style={{ padding: '1rem', color: '#38bdf8', textAlign: 'center', fontWeight: 600 }}>{r.accessesSold}</td>
                      <td style={{ padding: '1rem', color: '#10b981', textAlign: 'right', fontWeight: 600 }}>{r.totalRevenue.toFixed(2)} PLN</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
        )}

      </div> {/* ZAMKNIĘCIE .container */}

      {/* EDIT COURSE MODAL */}
      {editingCourse && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingCourse(null);
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{
              position: 'relative',
              backgroundColor: 'rgba(31, 41, 55, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(246, 173, 85, 0.5)',
              boxShadow: '0 0 30px rgba(246, 173, 85, 0.25)',
              padding: '2.5rem',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '550px',
              color: 'white',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <button 
              onClick={() => setEditingCourse(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                fontSize: '1.5rem',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
            >
              &times;
            </button>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#f6ad55', fontSize: '1.75rem', fontWeight: 700 }}>Edytuj Kurs</h3>
            <form onSubmit={handleUpdateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Tytuł kursu</label>
                <input className="input" placeholder="Tytuł" value={editingCourse.title} onChange={e => setEditingCourse({...editingCourse, title: e.target.value})} required style={{ padding: '0.8rem', borderRadius: '8px' }}/>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Opis kursu</label>
                <textarea className="input" placeholder="Opis" value={editingCourse.description} onChange={e => setEditingCourse({...editingCourse, description: e.target.value})} required style={{ padding: '0.8rem', borderRadius: '8px', minHeight: '100px' }}/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>Cena</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input 
                      className="input" 
                      type="text" 
                      inputMode="decimal"
                      placeholder="0.00" 
                      value={editingCourse.price} 
                      onChange={e => {
                        const val = e.target.value;
                        if (val === '' || /^\d*[.,]?\d*$/.test(val)) {
                          const normalized = val.replace(',', '.');
                          setEditingCourse({...editingCourse, price: normalized as any});
                        }
                      }} 
                      required 
                      style={{ 
                        width: '100%',
                        padding: '0.8rem 3rem 0.8rem 1rem', 
                        borderRadius: '8px',
                        backgroundColor: '#0f172a',
                        border: '1px solid #475569',
                        color: '#f1f5f9',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                    <span style={{ position: 'absolute', right: '12px', color: '#cbd5e1', fontWeight: 600, fontSize: '0.9rem', pointerEvents: 'none' }}>
                      PLN
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Status</label>
                  <select 
                    value={(editingCourse.status === 0 || editingCourse.status === 'Active' || editingCourse.status === '0') ? 'Active' : 'Inactive'} 
                    onChange={e => setEditingCourse({...editingCourse, status: e.target.value === 'Active' ? 0 : 1})}
                    style={{ padding: '0.8rem', borderRadius: '8px', backgroundColor: '#374151', color: 'white', border: '1px solid #4b5563' }}
                  >
                    <option value="Active">Aktywny</option>
                    <option value="Inactive">Nieaktywny</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>URL Miniaturki</label>
                <input className="input" placeholder="URL Miniaturki" value={editingCourse.imageUrl} onChange={e => setEditingCourse({...editingCourse, imageUrl: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px' }}/>
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '1rem' }}>
                <button className="btn btn-primary" type="submit" style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', fontSize: '1rem' }}>Zapisz</button>
                <button className="btn btn-login" type="button" onClick={() => setEditingCourse(null)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', fontSize: '1rem' }}>Anuluj</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LESSON MODAL */}
      {editingMaterial && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingMaterial(null);
              setFileToUpload(null);
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            style={{
              position: 'relative',
              backgroundColor: 'rgba(31, 41, 55, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(168, 85, 247, 0.5)',
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.25)',
              padding: '2.5rem',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '800px',
              color: 'white',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <button 
              onClick={() => { setEditingMaterial(null); setFileToUpload(null); }}
              style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                fontSize: '1.5rem',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
            >
              &times;
            </button>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#a855f7', fontSize: '1.75rem', fontWeight: 700 }}>Edytuj Lekcję: {editingMaterial.title}</h3>
            <form onSubmit={handleUpdateMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Tytuł lekcji</label>
                <input className="input" placeholder="Tytuł lekcji" value={editingMaterial.title} onChange={e => setEditingMaterial({...editingMaterial, title: e.target.value})} required style={{ padding: '0.8rem', borderRadius: '8px' }}/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Typ lekcji</label>
                  <select 
                    value={editingMaterial.type} 
                    onChange={e => setEditingMaterial({...editingMaterial, type: e.target.value})} 
                    style={{ padding: '0.8rem', borderRadius: '8px', backgroundColor: '#374151', color: 'white', border: '1px solid #4b5563' }}
                  >
                    <option value="Text">Tekst (Markdown)</option>
                    <option value="Video">Wideo (MP4)</option>
                    <option value="Document">Dokument (PDF)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Kolejność</label>
                  <input className="input" type="number" placeholder="Kolejność" value={editingMaterial.orderIndex} onChange={e => setEditingMaterial({...editingMaterial, orderIndex: parseInt(e.target.value)})} required style={{ padding: '0.8rem', borderRadius: '8px' }}/>
                </div>
              </div>

              {editingMaterial.type === 'Text' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Treść lekcji (Markdown)</label>
                  <div data-color-mode="light">
                    <MDEditor
                      value={editingMaterial.content}
                      onChange={(val) => setEditingMaterial({...editingMaterial, content: val || ''})}
                      height={300}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Wybierz plik (opcjonalnie, {editingMaterial.type === 'Video' ? 'Wideo' : 'PDF'}):</label>
                  <input 
                    type="file" 
                    ref={editFileInputRef}
                    accept={editingMaterial.type === 'Video' ? 'video/*' : 'application/pdf'}
                    onChange={e => setFileToUpload(e.target.files?.[0] || null)}
                    style={{ padding: '10px', backgroundColor: '#374151', borderRadius: '8px', width: '100%', color: '#9ca3af' }}
                  />
                  <small style={{ color: '#9ca3af' }}>Pozostaw puste, aby zachować dotychczasowy plik.</small>
                </div>
              )}

              <div style={{ display: 'flex', gap: '15px', marginTop: '1rem' }}>
                <button className="btn btn-primary" type="submit" style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', fontSize: '1rem' }}>Zapisz Zmiany</button>
                <button className="btn btn-login" type="button" onClick={() => { setEditingMaterial(null); setFileToUpload(null); }} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', fontSize: '1rem' }}>Anuluj</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
