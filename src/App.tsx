import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BookOpen, CalendarDays, Check, ChevronRight, CircleCheck, ClipboardList, Coffee, Download, Feather, LayoutDashboard, Leaf, Menu, NotebookPen, Plus, Search, Settings, Sparkles, TrendingUp, X } from 'lucide-react'
import { loadData, STORAGE_KEY, dateKey, parseDate, summarize, weekDates, monthDates, type AppData, type Note, type Task, type View } from './data'
import { ChartLegend, DateControls, Empty, Landscape, Metric, Modal, MonthlyView, NoteCard, NoteForm, PanelHeading, ReviewEditor, StatCards, TaskForm, TaskList, TextLink, WeekChart, WeeklyView } from './components'

const navigation: { id: View; label: string; icon: typeof Leaf; caption: string }[] = [
  { id: 'overview', label: '今日总览', icon: LayoutDashboard, caption: '每一天，都是一个新的开始。' },
  { id: 'tasks', label: '待办任务', icon: CircleCheck, caption: '把想做的事，一件一件变成现实。' },
  { id: 'notes', label: '日常随心记', icon: NotebookPen, caption: '留住灵感，也留住生活的小美好。' },
  { id: 'review', label: '每日复盘', icon: BookOpen, caption: '回望今天，是为了更温柔地走向明天。' },
  { id: 'week', label: '周总看板', icon: CalendarDays, caption: '看见一周的节奏，找到属于自己的平衡。' },
  { id: 'month', label: '月总看板', icon: TrendingUp, caption: '积攒的每一个小进步，都算数。' },
]
type DialogState = { type: 'task'; task?: Task } | { type: 'note'; note?: Note } | { type: 'search' } | { type: 'settings' } | null

export default function App() {
  const [data, setData] = useState<AppData>(loadData)
  const [view, setView] = useState<View>('overview')
  const [date, setDate] = useState(dateKey(new Date()))
  const [dialog, setDialog] = useState<DialogState>(null)
  const [toast, setToast] = useState('')
  const [storageError, setStorageError] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reviewDirty, setReviewDirty] = useState(false)
  const importInput = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setStorageError(false)
    } catch { setStorageError(true) }
    window.dailySpace?.save(JSON.stringify(data))
  }, [data])
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  const notify = (message: string) => { setToast(message); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setToast(''), 3200) }
  const mayLeave = () => !reviewDirty || window.confirm('复盘还有未保存的内容，确定离开吗？')
  const navigate = (next: View) => { if (next !== view && !mayLeave()) return; if (next !== view) setReviewDirty(false); setView(next); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const changeDate = (next: string) => { if (next !== date && !mayLeave()) return; if (next !== date) setReviewDirty(false); setDate(next) }
  const openDay = (next: string) => { if (!mayLeave()) return; setReviewDirty(false); setDate(next); setView('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const saveTask = (task: Task) => {
    setData(prev => ({ ...prev, tasks: prev.tasks.some(t => t.id === task.id) ? prev.tasks.map(t => t.id === task.id ? task : t) : [...prev.tasks, task] }))
    setDialog(null); notify('小目标已保存，按自己的节奏来。')
  }
  const saveNote = (note: Note) => {
    setData(prev => ({ ...prev, notes: prev.notes.some(n => n.id === note.id) ? prev.notes.map(n => n.id === note.id ? note : n) : [note, ...prev.notes] }))
    setDialog(null); notify('这一刻，已经被好好收藏。')
  }
  const toggleTask = (id: string) => setData(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) }))
  const todayTasks = data.tasks.filter(t => t.date === date)
  const todayNotes = data.notes.filter(n => n.date === date)
  const dayStats = summarize(todayTasks)
  const current = navigation.find(n => n.id === view)!
  const taskListProps = { tasks: todayTasks, onToggle: toggleTask, onEdit: (task: Task) => setDialog({ type: 'task' as const, task }), onAdd: () => setDialog({ type: 'task' as const }) }
  const selectedDate = parseDate(date)
  const dateText = `${selectedDate.getMonth() + 1} 月 ${selectedDate.getDate()} 日 · ${selectedDate.toLocaleDateString('zh-CN', { weekday: 'long' })}`
  const weekTasks = data.tasks.filter(t => weekDates(date).includes(t.date))
  const weekStats = summarize(weekTasks)
  const monthStats = summarize(data.tasks.filter(t => monthDates(date).includes(t.date)))
  const exportData = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `日常备份-${dateKey(new Date())}.json`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); notify('数据已导出到 JSON 文件。')
  }
  const importData = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const candidate: unknown = JSON.parse(String(reader.result))
        if (!candidate || typeof candidate !== 'object' || !('version' in candidate) || candidate.version !== 1 || !('tasks' in candidate) || !Array.isArray(candidate.tasks) || !('notes' in candidate) || !Array.isArray(candidate.notes) || !('reviews' in candidate) || !candidate.reviews || typeof candidate.reviews !== 'object') throw new Error('invalid backup')
        if (!window.confirm('导入备份会覆盖当前浏览器里的日常记录，确定继续吗？')) return
        setData(candidate as AppData)
        setDialog(null)
        notify('备份已导入，日常记录恢复完成。')
      } catch { window.alert('这个文件不是有效的日常看板备份。请导入网页导出的 JSON 文件。') }
      if (importInput.current) importInput.current.value = ''
    }
    reader.readAsText(file)
  }
  return <div className="app-shell">
    {menuOpen && <button className="sidebar-backdrop" aria-label="收起导航" onClick={() => setMenuOpen(false)} />}
    <aside className={`sidebar ${menuOpen ? 'mobile-open' : ''}`}><a className="brand" href="#" onClick={e => { e.preventDefault(); navigate('overview') }}><span className="brand-mark"><Leaf size={25} strokeWidth={1.6} /></span><span><strong>日常<span> · </span></strong><small>DAILY SPACE</small></span></a><div className="workspace"><span className="workspace-icon">🌱</span><div><strong>我的日常空间</strong><span>一点一滴，慢慢生长</span></div><span className="workspace-dot" /></div><div className="nav-caption">我的日常 <span>MY EVERYDAY</span></div><nav aria-label="主导航">{navigation.map((n, index) => <button key={n.id} className={`nav-item ${view === n.id ? 'active' : ''} ${index === 4 ? 'nav-separated' : ''}`} onClick={() => navigate(n.id)}><n.icon size={19} strokeWidth={1.7} /><span>{n.label}</span>{view === n.id && <span className="active-dot" />}{n.id === 'tasks' && dayStats.pending > 0 && <span className="nav-count">{dayStats.pending}</span>}</button>)}</nav><div className="sidebar-bottom"><div className="sidebar-note"><Sparkles size={19} /><p>不必匆忙，<br />你正在慢慢变好。</p><span>ONE DAY AT A TIME</span></div><button className="settings-button" onClick={() => setDialog({ type: 'settings' })}><Settings size={18} /><span>空间与数据</span></button><div className="user"><div className="avatar">禾</div><div><strong>日常的记录者</strong><span><i />本地演示模式</span></div><Leaf size={16} /></div></div></aside>
    <div className="main-shell"><header className="topbar"><div className="breadcrumbs"><button className="icon-button mobile-menu" aria-label="展开导航" onClick={() => setMenuOpen(true)}><Menu size={21} /></button><span>我的空间</span><ChevronRight size={13} /><strong>{current.label}</strong></div><div className="topbar-actions"><button className="search-trigger" onClick={() => setDialog({ type: 'search' })}><Search size={16} /><span>搜索任务、随心记</span></button><span className="header-separator" /><span className="topbar-date"><CalendarDays size={15} />{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</span><span className="top-avatar">禾</span></div></header>
      <main className="main-content"><div className="page-heading"><div><div className="page-eyebrow">{view === 'overview' ? 'YOUR DAY, YOUR PACE' : 'A LITTLE BETTER, EVERY DAY'}</div><h1>{current.label}<span className="heading-dot">.</span></h1><p>{current.caption}</p></div><button className="primary-button new-button" onClick={() => setDialog(view === 'notes' ? { type: 'note' } : { type: 'task' })}><Plus size={17} />{view === 'notes' ? '写随心记' : '新建任务'}</button></div>
      {storageError && <div className="storage-warning" role="alert">浏览器存储不可用。当前修改仅保留在本次会话，请在「空间与数据」中导出备份。</div>}
      <div className="view-toolbar"><div className="view-date"><CalendarDays size={16} /><span>{view === 'month' ? `${selectedDate.getFullYear()} 年 ${selectedDate.getMonth() + 1} 月` : view === 'week' ? '这一周的日常' : dateText}</span>{date === dateKey(new Date()) && view !== 'month' && view !== 'week' && <small>今天</small>}</div><DateControls date={date} onDate={changeDate} unit={view === 'week' ? 'week' : view === 'month' ? 'month' : 'day'} /></div>
      {view === 'overview' && <>
        <section className="welcome-banner"><div><div className="welcome-greeting"><span>☀</span>{date === dateKey(new Date()) ? '你好，日常的记录者' : '回到这一天的日常'}</div><h2>把日子，过成喜欢的样子。</h2><p>做一点想做的事，记一点值得记的瞬间。<br />今天，也要好好生活。</p><span className="welcome-tag"><i />小步前行，也是前行</span></div><Landscape /></section>
        <StatCards tasks={todayTasks} noteCount={todayNotes.length} />
        <div className="overview-grid"><section className="panel task-panel"><PanelHeading title="今日待办" icon={<CircleCheck size={19} />} action={<TextLink onClick={() => navigate('tasks')}>全部任务</TextLink>} /><TaskList {...taskListProps} compact /></section><section className="panel notes-panel"><PanelHeading title="日常随心记" icon={<Feather size={19} />} action={<button className="icon-button soft-button" title="写一篇随心记" onClick={() => setDialog({ type: 'note' })}><Plus size={18} /></button>} />{todayNotes.length ? <div className="overview-notes">{todayNotes.slice(0, 2).map(note => <NoteCard key={note.id} note={note} onEdit={note => setDialog({ type: 'note', note })} />)}</div> : <Empty title="让这一刻有迹可循" description="此刻的心情，突然的灵感，都值得被记录。" action={<button className="secondary-button" onClick={() => setDialog({ type: 'note' })}>写一篇随心记</button>} />}<div className="notes-bottom"><span>生活的细碎，都是温柔的证据。</span><TextLink onClick={() => navigate('notes')}>所有记录</TextLink></div></section></div>
        <div className="overview-grid lower-grid"><section className="panel week-preview"><PanelHeading title="本周的小进步" icon={<CalendarDays size={18} />} action={<TextLink onClick={() => navigate('week')}>周总看板</TextLink>} /><div className="week-preview-summary"><div><strong>{weekStats.completed}<small> / {weekStats.total}</small></strong><span>个任务已完成</span></div><ChartLegend /></div><WeekChart tasks={data.tasks} date={date} compact onDate={openDay} /></section><section className="panel review-preview"><PanelHeading title="每日复盘" icon={<BookOpen size={18} />} action={<span className={`review-status ${data.reviews[date] ? 'saved' : ''}`}><i />{data.reviews[date] ? '已完成' : '待记录'}</span>} /><div className="review-preview-content"><div className="review-illustration"><Coffee size={30} strokeWidth={1.3} /><span>✦</span></div><h3>{data.reviews[date] ? '今天的故事，已被温柔收藏。' : '给今天一个温柔的收尾。'}</h3><p>{data.reviews[date] ? data.reviews[date].wins || '认真回望的你，已经很棒了。' : '今天有什么小收获？哪些瞬间值得记住？\n花几分钟，和今天的自己聊一聊。'}</p><button className="secondary-button" onClick={() => navigate('review')}>{data.reviews[date] ? '回看今日复盘' : '开始今日复盘'}<ArrowRight size={15} /></button></div></section></div>
        <section className="panel month-preview"><div><span className="month-preview-icon"><TrendingUp size={23} /></span><div><h2>{selectedDate.getMonth() + 1} 月的成长足迹</h2><p>平凡的每一天，正在汇成不平凡的你。</p></div></div><div className="month-preview-number"><strong>{monthStats.completed}</strong><span>累计完成</span></div><div className="month-preview-number"><strong>{monthStats.rate}<small>%</small></strong><span>月完成率</span></div><TextLink onClick={() => navigate('month')}>查看月总看板</TextLink></section>
      </>}
      {view === 'tasks' && <><StatCards tasks={todayTasks} noteCount={todayNotes.length} /><section className="panel full-task-panel"><PanelHeading title="今天想做的事" subtitle="重要的事认真做，喜欢的事慢慢做。" icon={<ClipboardList size={20} />} /><TaskList {...taskListProps} /></section></>}
      {view === 'notes' && <NotesView notes={data.notes} date={date} onEdit={note => setDialog({ type: 'note', note })} onAdd={() => setDialog({ type: 'note' })} />}
      {view === 'review' && <div className="review-layout"><ReviewEditor key={date} date={date} review={data.reviews[date]} onDirty={setReviewDirty} onSave={review => { setData(prev => ({ ...prev, reviews: { ...prev.reviews, [date]: review } })); setReviewDirty(false); notify('今日复盘已保存。谢谢你认真对待每一天。') }} /><aside className="review-aside"><section className="panel"><PanelHeading title="今天的小结" /><div className="review-day-stats"><Metric label="完成任务" value={`${dayStats.completed} / ${dayStats.total}`} hint="每一个完成，都值得肯定" /><Metric label="留下记录" value={String(todayNotes.length)} hint="篇日常的微小闪光" /></div></section><section className="panel"><PanelHeading title="之前的复盘" />{Object.keys(data.reviews).length ? <div className="past-reviews">{Object.values(data.reviews).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map(r => <button key={r.date} onClick={() => changeDate(r.date)} className={r.date === date ? 'active' : ''}><span>{r.date.replaceAll('-', '.')}</span><small>{r.mood}</small><ChevronRight size={14} /></button>)}</div> : <p className="muted">还没有复盘，今天就是一个好开始。</p>}</section><div className="review-quote">“ 复盘不是找自己的不足，<br />而是看见自己走过的路。 ”<Leaf size={24} /></div></aside></div>}
      {view === 'week' && <WeeklyView data={data} date={date} onDate={changeDate} onOpenDay={openDay} />}
      {view === 'month' && <MonthlyView data={data} date={date} onOpenDay={openDay} />}
      <footer className="page-footer"><span><Leaf size={13} />日常不是一场竞赛，是一段属于你的旅程。</span><span>MADE FOR YOUR EVERYDAY</span></footer></main>
    </div>
    {dialog?.type === 'task' && <Modal title={dialog.task ? '编辑这个小目标' : '添加一个小目标'} onClose={() => setDialog(null)}><TaskForm task={dialog.task} date={date} onSave={saveTask} onDelete={id => { setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) })); setDialog(null); notify('任务已删除。') }} /></Modal>}
    {dialog?.type === 'note' && <Modal title={dialog.note ? '编辑日常随心记' : '留住生活的一小片'} onClose={() => setDialog(null)}><NoteForm note={dialog.note} date={date} onSave={saveNote} onDelete={id => { setData(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) })); setDialog(null); notify('记录已删除。') }} /></Modal>}
    {dialog?.type === 'search' && <Modal title="找一找日常里的片段" onClose={() => setDialog(null)} wide><SearchView data={data} onTask={task => setDialog({ type: 'task', task })} onNote={note => setDialog({ type: 'note', note })} /></Modal>}
    {dialog?.type === 'settings' && <Modal title="我的日常空间" onClose={() => setDialog(null)}><div className="settings-content"><span className="settings-leaf"><Leaf size={32} /></span><h3>一个只属于你的日常角落。</h3><p>当前为纯前端演示，初始内容使用 mock 数据。任务、随心记和复盘保存在当前浏览器的 localStorage 中，不会发送到服务器。</p><div className="storage-info"><span><i className={storageError ? 'error' : ''} />{storageError ? '本地保存不可用' : '浏览器本地自动保存已开启'}</span><small>建议定期导出备份；清除浏览器数据可能删除记录。</small></div><div className="settings-actions"><button className="secondary-button" onClick={exportData}><Download size={16} />导出 JSON 备份</button><input ref={importInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={e => importData(e.target.files?.[0])} /><button className="secondary-button" onClick={() => importInput.current?.click()}><NotebookPen size={16} />导入 JSON 备份</button></div><div className="settings-version">日常 · Daily Space <span>v1.0 / React</span></div></div></Modal>}
    {toast && <div className="toast" role="status"><Check size={17} /><span>{toast}</span><button aria-label="关闭提示" onClick={() => setToast('')}><X size={15} /></button></div>}
  </div>
}

function NotesView({ notes, date, onEdit, onAdd }: { notes: Note[]; date: string; onEdit: (note: Note) => void; onAdd: () => void }) {
  const [period, setPeriod] = useState('all')
  const [query, setQuery] = useState('')
  const visible = notes.filter(n => (period === 'all' || (period === 'day' ? n.date === date : weekDates(date).includes(n.date))) && `${n.title} ${n.content} ${n.tag}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
  return <><div className="notes-intro"><Feather size={28} strokeWidth={1.4} /><div><h2>不止记录事情，也记录心情。</h2><p>那些稍纵即逝的念头，生活里微不足道的美好，都值得被留住。</p></div><span>{notes.length} 篇日常</span></div><div className="notes-view-toolbar"><div className="filter-tabs">{[['all', '全部记录'], ['day', '当天记录'], ['week', '本周记录']].map(([id, title]) => <button key={id} className={period === id ? 'active' : ''} onClick={() => setPeriod(id)}>{title}</button>)}</div><label className="inline-search"><Search size={16} /><input aria-label="搜索随心记" placeholder="搜索记录…" value={query} onChange={e => setQuery(e.target.value)} /></label></div>{visible.length ? <div className="notes-gallery">{visible.map(n => <NoteCard key={n.id} note={n} onEdit={onEdit} />)}{!query && <button className="blank-note" onClick={onAdd}><Plus size={28} strokeWidth={1.2} /><strong>留住新的瞬间</strong><span>心情、灵感，或者一件小事</span></button>}</div> : <section className="panel"><Empty title={query ? '还没有找到这个片段' : '这一页，等你来写'} description={query ? '换个关键词，或看看其他时间的记录。' : '把今天的小美好，轻轻放在这里。'} action={<button className="secondary-button" onClick={onAdd}><Plus size={15} />写随心记</button>} /></section>}</>
}
function SearchView({ data, onTask, onNote }: { data: AppData; onTask: (task: Task) => void; onNote: (note: Note) => void }) {
  const [query, setQuery] = useState('')
  const normalized = query.trim().toLowerCase()
  const tasks = normalized ? data.tasks.filter(t => t.title.toLowerCase().includes(normalized)).sort((a, b) => b.date.localeCompare(a.date)) : []
  const notes = normalized ? data.notes.filter(n => `${n.title} ${n.content} ${n.tag}`.toLowerCase().includes(normalized)) : []
  return <div className="search-content"><label className="search-input"><Search size={19} /><input autoFocus placeholder="搜索所有日期的任务、标题或记录内容…" value={query} onChange={e => setQuery(e.target.value)} /></label>{!normalized ? <Empty title="日常里，总有值得找回的片段" description="输入关键词，搜索任务和随心记。" /> : !tasks.length && !notes.length ? <Empty title="没有找到相关记录" description="试试更短的关键词，或换一个说法。" /> : <div className="search-results">{tasks.length > 0 && <><h3>任务 <span>{tasks.length}</span></h3>{tasks.slice(0, 15).map(t => <button key={t.id} onClick={() => onTask(t)}><CircleCheck size={17} /><span><strong>{t.title}</strong><small>{t.date} · {t.category} · {t.completed ? '已完成' : '待完成'}</small></span><ChevronRight size={16} /></button>)}{tasks.length > 15 && <p className="muted">仅显示最近 15 条任务，请细化关键词。</p>}</>}{notes.length > 0 && <><h3>随心记 <span>{notes.length}</span></h3>{notes.map(n => <button key={n.id} onClick={() => onNote(n)}><NotebookPen size={17} /><span><strong>{n.title}</strong><small>{n.date} · {n.tag}</small></span><ChevronRight size={16} /></button>)}</>}</div>}</div>
}
