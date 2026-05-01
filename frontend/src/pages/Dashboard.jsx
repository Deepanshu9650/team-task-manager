import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const isAdmin = user?.role === 'Admin';

    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('tasks');
    const [loading, setLoading] = useState(true);
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [projectForm, setProjectForm] = useState({ name: '', description: '' });
    const [taskForm, setTaskForm] = useState({
        title: '', description: '', project_id: '', assigned_to: '', due_date: ''
    });
    const [addUserForm, setAddUserForm] = useState({
        email: '', password: '', role: 'Member'
    });
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchData = async () => {
        try {
            const [projectsRes, tasksRes, usersRes] = await Promise.all([
                api.get('/projects'),
                api.get('/tasks'),
                api.get('/users')
            ]);
            setProjects(projectsRes.data);
            setTasks(tasksRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateProject = async () => {
        if (!projectForm.name) return showToast('Project name is required!', 'error');
        try {
            await api.post('/projects', projectForm);
            setProjectForm({ name: '', description: '' });
            setShowProjectForm(false);
            fetchData();
            showToast('Project created successfully! 🚀');
        } catch (err) {
            showToast(err.response?.data?.detail || 'Failed to create project', 'error');
        }
    };

    const handleCreateTask = async () => {
        if (!taskForm.title || !taskForm.project_id || !taskForm.assigned_to) {
            return showToast('Title, Project and Assigned User are required!', 'error');
        }
        try {
            await api.post('/tasks', {
                ...taskForm,
                project_id: parseInt(taskForm.project_id),
                assigned_to: parseInt(taskForm.assigned_to),
                due_date: taskForm.due_date || null
            });
            setTaskForm({ title: '', description: '', project_id: '', assigned_to: '', due_date: '' });
            setShowTaskForm(false);
            fetchData();
            showToast('Task created successfully! ✨');
        } catch (err) {
            showToast(err.response?.data?.detail || 'Failed to create task', 'error');
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
            fetchData();
            showToast('Status updated! 🔥');
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleAddUser = async () => {
        if (!addUserForm.email || !addUserForm.password) {
            return showToast('Email and password are required!', 'error');
        }
        try {
            await api.post('/users/add', addUserForm);
            setAddUserForm({ email: '', password: '', role: 'Member' });
            setShowAddUserForm(false);
            fetchData();
            showToast('Team member added! 🎉');
        } catch (err) {
            showToast(err.response?.data?.detail || 'Failed to add user', 'error');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        try {
            await api.delete(`/users/${userId}`);
            fetchData();
            showToast('Member removed successfully 👋');
        } catch (err) {
            showToast(err.response?.data?.detail || 'Failed to remove member', 'error');
        }
    };

    const isOverdue = (dueDate, status) => {
        if (!dueDate || status === 'Done') return false;
        return new Date(dueDate) < new Date();
    };

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'Done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In-Progress').length;
    const overdueTasks = tasks.filter(t => isOverdue(t.due_date, t.status)).length;

    const getStatusLabel = (status, dueDate) => {
        if (isOverdue(dueDate, status)) return '🔥 Overdue';
        if (status === 'Done') return '✅ Done';
        if (status === 'In-Progress') return '⚡ In Progress';
        return '📋 To-Do';
    };

    const getProjectEmoji = (index) => {
        const emojis = ['🚀', '💎', '🎯', '⚡', '🔥', '🌟', '💡', '🎨'];
        return emojis[index % emojis.length];
    };

    const inputStyle = {
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '10px', padding: '12px 16px',
        color: 'white', fontSize: '0.9rem', outline: 'none',
        width: '100%', boxSizing: 'border-box'
    };

    if (loading) return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚡</div>
                <p style={{ fontSize: '1.5rem', fontWeight: '600', letterSpacing: '0.1em' }}>Loading...</p>
            </div>
        </div>
    );

    const tabs = isAdmin
        ? ['tasks', 'projects', 'team']
        : ['tasks', 'projects'];

    const tabLabel = (tab) => {
        if (tab === 'tasks') return '⚡ Tasks';
        if (tab === 'projects') return '📁 Projects';
        return '👥 Team';
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            fontFamily: "'Inter', -apple-system, sans-serif",
            color: 'white'
        }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                    background: toast.type === 'error'
                        ? 'linear-gradient(135deg, #ff416c, #ff4b2b)'
                        : 'linear-gradient(135deg, #11998e, #38ef7d)',
                    padding: '12px 24px', borderRadius: '12px',
                    fontWeight: '600', fontSize: '0.9rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                }}>
                    {toast.message}
                </div>
            )}

            {/* Navbar */}
            <nav style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                padding: '0 2rem', height: '70px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.8rem' }}>🗂️</span>
                    <div>
                        <h1 style={{
                            fontSize: '1.2rem', fontWeight: '800', margin: 0,
                            background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>TaskFlow</h1>
                        <p style={{ fontSize: '0.7rem', margin: 0, color: 'rgba(255,255,255,0.5)' }}>
                            Team Task Manager
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        background: isAdmin
                            ? 'linear-gradient(135deg, #f093fb, #f5576c)'
                            : 'linear-gradient(135deg, #4facfe, #00f2fe)',
                        padding: '6px 16px', borderRadius: '20px',
                        fontSize: '0.8rem', fontWeight: '700'
                    }}>
                        {isAdmin ? '👑 Admin' : '👤 Member'}
                    </div>
                    <button onClick={logout} style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white', padding: '8px 20px',
                        borderRadius: '10px', cursor: 'pointer',
                        fontSize: '0.85rem', fontWeight: '600'
                    }}
                        onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        Logout 👋
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

                {/* Welcome Banner */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '20px', padding: '1.5rem 2rem',
                    marginBottom: '2rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800' }}>
                            Hey {isAdmin ? '👑' : '👋'} Welcome back!
                        </h2>
                        <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                            {isAdmin ? "You're in control. Let's build something great today." : "Here's what's on your plate today."}
                        </p>
                    </div>
                    <div style={{ fontSize: '3rem' }}>{isAdmin ? '🚀' : '💪'}</div>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem', marginBottom: '2rem'
                }}>
                    {[
                        { label: 'Total Tasks', value: totalTasks, emoji: '📋', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
                        { label: 'In Progress', value: inProgressTasks, emoji: '⚡', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
                        { label: 'Completed', value: doneTasks, emoji: '✅', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)' },
                        { label: 'Overdue', value: overdueTasks, emoji: '🔥', gradient: 'linear-gradient(135deg, #fc4a1a, #f7b733)' },
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '16px', padding: '1.5rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            textAlign: 'center', transition: 'transform 0.2s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.emoji}</div>
                            <div style={{
                                fontSize: '2.5rem', fontWeight: '900',
                                background: stat.gradient,
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                            }}>{stat.value}</div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex', gap: '8px', marginBottom: '1.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '6px', borderRadius: '14px',
                    width: 'fit-content',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                            padding: '10px 28px', borderRadius: '10px',
                            border: 'none', cursor: 'pointer',
                            fontWeight: '700', fontSize: '0.9rem',
                            transition: 'all 0.2s',
                            background: activeTab === tab
                                ? 'linear-gradient(135deg, #a78bfa, #60a5fa)'
                                : 'transparent',
                            color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.5)'
                        }}>
                            {tabLabel(tab)}
                        </button>
                    ))}
                </div>

                {/* ==================== TASKS TAB ==================== */}
                {activeTab === 'tasks' && (
                    <div>
                        {isAdmin && (
                            <button onClick={() => setShowTaskForm(!showTaskForm)} style={{
                                background: showTaskForm
                                    ? 'rgba(255,255,255,0.1)'
                                    : 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                                border: 'none', color: 'white',
                                padding: '12px 24px', borderRadius: '12px',
                                cursor: 'pointer', fontWeight: '700',
                                fontSize: '0.9rem', marginBottom: '1.5rem'
                            }}>
                                {showTaskForm ? '✕ Cancel' : '+ Create Task'}
                            </button>
                        )}

                        {showTaskForm && isAdmin && (
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '20px', padding: '2rem',
                                marginBottom: '2rem',
                                border: '1px solid rgba(167,139,250,0.3)',
                                boxShadow: '0 0 40px rgba(167,139,250,0.1)'
                            }}>
                                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>
                                    ✨ Create New Task
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input
                                        placeholder="Task title *"
                                        value={taskForm.title}
                                        onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                                        style={inputStyle}
                                    />
                                    <input
                                        placeholder="Description"
                                        value={taskForm.description}
                                        onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                                        style={inputStyle}
                                    />
                                    <select
                                        value={taskForm.project_id}
                                        onChange={e => setTaskForm({ ...taskForm, project_id: e.target.value })}
                                        style={inputStyle}
                                    >
                                        <option value="" style={{ background: '#302b63' }}>Select Project *</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id} style={{ background: '#302b63' }}>{p.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={taskForm.assigned_to}
                                        onChange={e => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                                        style={inputStyle}
                                    >
                                        <option value="" style={{ background: '#302b63' }}>Assign To *</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id} style={{ background: '#302b63' }}>{u.email}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="datetime-local"
                                        value={taskForm.due_date}
                                        onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                                        style={{ ...inputStyle, colorScheme: 'dark' }}
                                    />
                                </div>
                                <button onClick={handleCreateTask} style={{
                                    marginTop: '1.5rem',
                                    background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                                    border: 'none', color: 'white',
                                    padding: '12px 32px', borderRadius: '12px',
                                    cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem'
                                }}>
                                    Create Task 🚀
                                </button>
                            </div>
                        )}

                        {tasks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem', color: 'rgba(255,255,255,0.3)' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                                <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>No tasks yet</p>
                                <p style={{ fontSize: '0.9rem' }}>
                                    {isAdmin ? 'Create a project first, then add tasks.' : 'No tasks assigned to you yet.'}
                                </p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                gap: '1rem'
                            }}>
                                {tasks.map(task => (
                                    <div key={task.id} style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '16px', padding: '1.5rem',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                    }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{
                                            height: '4px', borderRadius: '4px', marginBottom: '1rem',
                                            background: isOverdue(task.due_date, task.status)
                                                ? 'linear-gradient(135deg, #ff416c, #ff4b2b)'
                                                : task.status === 'Done'
                                                    ? 'linear-gradient(135deg, #11998e, #38ef7d)'
                                                    : task.status === 'In-Progress'
                                                        ? 'linear-gradient(135deg, #f7971e, #ffd200)'
                                                        : 'linear-gradient(135deg, #667eea, #764ba2)'
                                        }} />

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{task.title}</h3>
                                            <span style={{
                                                fontSize: '0.75rem', fontWeight: '700',
                                                padding: '4px 10px', borderRadius: '20px',
                                                whiteSpace: 'nowrap', marginLeft: '8px',
                                                background: isOverdue(task.due_date, task.status)
                                                    ? 'rgba(255,65,108,0.2)'
                                                    : task.status === 'Done'
                                                        ? 'rgba(56,239,125,0.2)'
                                                        : task.status === 'In-Progress'
                                                            ? 'rgba(247,151,30,0.2)'
                                                            : 'rgba(102,126,234,0.2)',
                                                color: isOverdue(task.due_date, task.status)
                                                    ? '#ff416c'
                                                    : task.status === 'Done'
                                                        ? '#38ef7d'
                                                        : task.status === 'In-Progress'
                                                            ? '#ffd200'
                                                            : '#a78bfa'
                                            }}>
                                                {getStatusLabel(task.status, task.due_date)}
                                            </span>
                                        </div>

                                        {task.description && (
                                            <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                                                {task.description}
                                            </p>
                                        )}
                                        {task.due_date && (
                                            <p style={{ margin: '0 0 1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                                                📅 Due: {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        )}

                                        <select
                                            value={task.status}
                                            onChange={e => handleStatusChange(task.id, e.target.value)}
                                            style={{
                                                width: '100%',
                                                background: 'rgba(255,255,255,0.08)',
                                                border: '1px solid rgba(255,255,255,0.15)',
                                                borderRadius: '8px', padding: '8px 12px',
                                                color: 'white', fontSize: '0.85rem',
                                                cursor: 'pointer', outline: 'none'
                                            }}
                                        >
                                            <option value="To-Do" style={{ background: '#302b63' }}>📋 To-Do</option>
                                            <option value="In-Progress" style={{ background: '#302b63' }}>⚡ In-Progress</option>
                                            <option value="Done" style={{ background: '#302b63' }}>✅ Done</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ==================== PROJECTS TAB ==================== */}
                {activeTab === 'projects' && (
                    <div>
                        {isAdmin && (
                            <button onClick={() => setShowProjectForm(!showProjectForm)} style={{
                                background: showProjectForm
                                    ? 'rgba(255,255,255,0.1)'
                                    : 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                                border: 'none', color: 'white',
                                padding: '12px 24px', borderRadius: '12px',
                                cursor: 'pointer', fontWeight: '700',
                                fontSize: '0.9rem', marginBottom: '1.5rem'
                            }}>
                                {showProjectForm ? '✕ Cancel' : '+ Create Project'}
                            </button>
                        )}

                        {showProjectForm && isAdmin && (
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '20px', padding: '2rem',
                                marginBottom: '2rem',
                                border: '1px solid rgba(96,165,250,0.3)',
                                boxShadow: '0 0 40px rgba(96,165,250,0.1)'
                            }}>
                                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>
                                    🚀 Create New Project
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input
                                        placeholder="Project name *"
                                        value={projectForm.name}
                                        onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                                        style={inputStyle}
                                    />
                                    <input
                                        placeholder="Description"
                                        value={projectForm.description}
                                        onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <button onClick={handleCreateProject} style={{
                                    marginTop: '1.5rem',
                                    background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                                    border: 'none', color: 'white',
                                    padding: '12px 32px', borderRadius: '12px',
                                    cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem'
                                }}>
                                    Create Project 💎
                                </button>
                            </div>
                        )}

                        {projects.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem', color: 'rgba(255,255,255,0.3)' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📁</div>
                                <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>No projects yet</p>
                                {isAdmin && <p style={{ fontSize: '0.9rem' }}>Click "Create Project" to get started.</p>}
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '1rem'
                            }}>
                                {projects.map((project, index) => {
                                    const projectTasks = tasks.filter(t => t.project_id === project.id);
                                    const done = projectTasks.filter(t => t.status === 'Done').length;
                                    const percent = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;
                                    return (
                                        <div key={project.id} style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '16px', padding: '1.5rem',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            transition: 'transform 0.2s, box-shadow 0.2s'
                                        }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                                <div style={{
                                                    width: '48px', height: '48px', borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1.5rem'
                                                }}>
                                                    {getProjectEmoji(index)}
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{project.name}</h3>
                                                    {project.description && (
                                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                                                            {project.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{projectTasks.length} tasks</span>
                                                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#a78bfa' }}>{percent}% done</span>
                                            </div>
                                            <div style={{
                                                width: '100%', height: '6px',
                                                background: 'rgba(255,255,255,0.1)',
                                                borderRadius: '6px', overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${percent}%`, height: '100%',
                                                    background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                                                    borderRadius: '6px', transition: 'width 0.5s ease'
                                                }} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(102,126,234,0.2)', color: '#a78bfa' }}>
                                                    📋 {projectTasks.filter(t => t.status === 'To-Do').length} To-Do
                                                </span>
                                                <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(247,151,30,0.2)', color: '#ffd200' }}>
                                                    ⚡ {projectTasks.filter(t => t.status === 'In-Progress').length} Active
                                                </span>
                                                <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(56,239,125,0.2)', color: '#38ef7d' }}>
                                                    ✅ {done} Done
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ==================== TEAM TAB (Admin Only) ==================== */}
                {activeTab === 'team' && isAdmin && (
                    <div>
                        {/* Stats Row */}
                        <div style={{
                            display: 'flex', gap: '1rem', marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '16px', padding: '1rem 1.5rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', gap: '12px'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>👥</span>
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#a78bfa' }}>{users.length}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Total Members</div>
                                </div>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '16px', padding: '1rem 1.5rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', gap: '12px'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>👑</span>
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f093fb' }}>
                                        {users.filter(u => u.role === 'Admin').length}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Admins</div>
                                </div>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '16px', padding: '1rem 1.5rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', gap: '12px'
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>👤</span>
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#4facfe' }}>
                                        {users.filter(u => u.role === 'Member').length}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Members</div>
                                </div>
                            </div>
                        </div>

                        {/* Add Member Button */}
                        <button onClick={() => setShowAddUserForm(!showAddUserForm)} style={{
                            background: showAddUserForm
                                ? 'rgba(255,255,255,0.1)'
                                : 'linear-gradient(135deg, #11998e, #38ef7d)',
                            border: 'none', color: 'white',
                            padding: '12px 24px', borderRadius: '12px',
                            cursor: 'pointer', fontWeight: '700',
                            fontSize: '0.9rem', marginBottom: '1.5rem'
                        }}>
                            {showAddUserForm ? '✕ Cancel' : '+ Add Member'}
                        </button>

                        {/* Add Member Form */}
                        {showAddUserForm && (
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '20px', padding: '2rem',
                                marginBottom: '2rem',
                                border: '1px solid rgba(56,239,125,0.3)',
                                boxShadow: '0 0 40px rgba(56,239,125,0.05)'
                            }}>
                                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>
                                    👤 Add New Team Member
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input
                                        placeholder="Email address *"
                                        type="email"
                                        value={addUserForm.email}
                                        onChange={e => setAddUserForm({ ...addUserForm, email: e.target.value })}
                                        style={inputStyle}
                                    />
                                    <input
                                        placeholder="Password *"
                                        type="password"
                                        value={addUserForm.password}
                                        onChange={e => setAddUserForm({ ...addUserForm, password: e.target.value })}
                                        style={inputStyle}
                                    />
                                    <select
                                        value={addUserForm.role}
                                        onChange={e => setAddUserForm({ ...addUserForm, role: e.target.value })}
                                        style={inputStyle}
                                    >
                                        <option value="Member" style={{ background: '#302b63' }}>👤 Member</option>
                                        <option value="Admin" style={{ background: '#302b63' }}>👑 Admin</option>
                                    </select>
                                </div>
                                <button onClick={handleAddUser} style={{
                                    marginTop: '1.5rem',
                                    background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                                    border: 'none', color: 'white',
                                    padding: '12px 32px', borderRadius: '12px',
                                    cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem'
                                }}>
                                    Add Member 🎉
                                </button>
                            </div>
                        )}

                        {/* Users List */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '1rem'
                        }}>
                            {users.map((u) => (
                                <div key={u.id} style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '16px', padding: '1.5rem',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '50%',
                                            background: u.role === 'Admin'
                                                ? 'linear-gradient(135deg, #f093fb, #f5576c)'
                                                : 'linear-gradient(135deg, #4facfe, #00f2fe)',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontSize: '1.3rem'
                                        }}>
                                            {u.role === 'Admin' ? '👑' : '👤'}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>
                                                {u.email}
                                            </p>
                                            <span style={{
                                                fontSize: '0.75rem', padding: '3px 10px',
                                                borderRadius: '20px', fontWeight: '600',
                                                background: u.role === 'Admin'
                                                    ? 'rgba(240,147,251,0.2)'
                                                    : 'rgba(79,172,254,0.2)',
                                                color: u.role === 'Admin' ? '#f093fb' : '#4facfe'
                                            }}>
                                                {u.role === 'Admin' ? '👑 Admin' : '👤 Member'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        style={{
                                            background: 'rgba(255,65,108,0.15)',
                                            border: '1px solid rgba(255,65,108,0.3)',
                                            color: '#ff416c', padding: '8px 14px',
                                            borderRadius: '10px', cursor: 'pointer',
                                            fontWeight: '700', fontSize: '0.8rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,65,108,0.3)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,65,108,0.15)'}
                                    >
                                        🗑️ Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}