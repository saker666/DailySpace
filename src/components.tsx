import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, CircleCheck, Ellipsis, Leaf, Plus, X } from 'lucide-react'
import { categories, dateKey, moods, monthDates, parseDate, shiftDate, summarize, uid, weekDates, type AppData, type Category, type Mood, type Note, type Priority, type Review, type Task } from './data'

export function PanelHeading({ title, icon, subtitle, action }: { title: string; icon?: ReactNode; subtitle?: string; action?: ReactNode }) {
  return <div className="panel-heading"><div><h2>{icon}<span>{title}</span></h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>
}
export function Empty({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><Leaf size={30} strokeWidth={1.3} /><h3>{title}</h3><p>{description}</p>{action}</div>
}
export function DateControls({ date, onDate, unit = 'day' }: { date: string; onDate: (date: string) => void; unit?: 'day' | 'week' | 'month' }) {
  const change = (direction: number) => {
    if (unit !== 'month') return onDate(shiftDate(date, direction * (unit === 'week' ? 7 : 1)))
    const d = parseDate(date)
    onDate(dateKey(new Date(d.getFullYear(), d.getMonth() + direction, 1)))
  }
  return <div className="date-controls"><button className="icon-button" title="上一周期" onClick={() => change(-1)}><ChevronLeft size={16} /></button><label><input aria-label="选择日期" type="date" value={date} onChange={e => { if (e.target.value) onDate(e.target.value) }} /></label><button className="icon-button" title="下一周期" onClick={() => change(1)}><ChevronRight size={16} /></button><button className="today-button" onClick={() => onDate(dateKey(new Date()))}>今天</button></div>
}
export function TaskList({ tasks, onToggle, onEdit, onAdd, compact = false }: { tasks: Task[]; onToggle: (id: string) => void; onEdit: (task: Task) => void; onAdd: () => void; compact?: boolean }) {
  const [filter, setFilter] = useState('all')
  const [category, setCategory] = useState('all')
  const stats = summarize(tasks)
  const visible = tasks.filter(t => (filter === 'all' || (filter === 'done' ? t.completed : !t.completed)) && (category === 'all' || t.category === category))
  return <>
    <div className="task-filters"><div className="filter-tabs">{[['all', '全部', stats.total], ['pending', '待完成', stats.pending], ['done', '已完成', stats.completed]].map(([id, label, count]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(String(id))}>{label}<span>{count}</span></button>)}</div>{!compact && <select aria-label="筛选任务分类" value={category} onChange={e => setCategory(e.target.value)}><option value="all">全部分类</option>{categories.map(c => <option key={c}>{c}</option>)}</select>}</div>
    <div className="task-list">{visible.length === 0 ? <Empty title={stats.total ? '这里已经清空啦' : '为今天留一点期待'} description={stats.total ? '换个筛选条件看看，或添加一个新任务。' : '从一件小事开始，慢慢靠近理想的生活。'} /> : visible.map(task => <div className={`task-row ${task.completed ? 'is-done' : ''}`} key={task.id}><button className="task-check" aria-label={`${task.completed ? '取消完成' : '完成'}：${task.title}`} aria-pressed={task.completed} onClick={() => onToggle(task.id)}>{task.completed && <svg className="check-mark" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M4.9 12.8l4.3 4.3L19.1 7.3" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}</button><div className="task-info"><button className="task-title" onClick={() => onEdit(task)}>{task.title}</button><div className="task-meta"><span className={`category category-${categories.indexOf(task.category)}`}>{task.category}</span>{task.priority !== '普通' && <span className={`priority ${task.priority === '紧急' ? 'urgent' : ''}`}><i />{task.priority}</span>}<span className="task-time">{task.time || '时间不限'}</span></div></div><button className="icon-button row-menu" title={`编辑：${task.title}`} onClick={() => onEdit(task)}><Ellipsis size={18} /></button></div>)}</div>
    <button className="add-task" onClick={onAdd}><Plus size={17} />添加一个小目标</button>
  </>
}
export function NoteCard({ note, onEdit }: { note: Note; onEdit: (note: Note) => void }) {
  return <button className={`note-card note-${note.color}`} onClick={() => onEdit(note)}><div className="note-card-top"><span className="note-tag">{note.tag}</span><ArrowUpRight size={16} /></div><h3>{note.title}</h3><p>{note.content}</p><div className="note-card-footer"><span>{parseDate(note.date).getMonth() + 1} 月 {parseDate(note.date).getDate()} 日</span><span>{note.time}</span></div></button>
}
export function Landscape() {
  return <svg className="landscape" viewBox="0 0 430 210" fill="none" aria-hidden="true"><defs><linearGradient id="hill" x1="30" y1="70" x2="410" y2="230" gradientUnits="userSpaceOnUse"><stop stopColor="#a5ba9c" /><stop offset="1" stopColor="#587960" /></linearGradient></defs><circle cx="313" cy="61" r="30" fill="#eadab2"/><path d="M35 170C90 170 105 95 169 103C242 111 240 157 300 139C350 124 350 128 423 140V210H35Z" fill="#d1ddc9"/><path d="M-10 192C51 180 64 146 115 153C184 163 161 181 218 177C285 173 275 111 351 119C393 124 407 161 446 166V218H-10Z" fill="url(#hill)"/><path d="M230 210C265 190 294 182 320 181C342 180 356 172 357 158" stroke="#e9eadb" strokeWidth="3" strokeLinecap="round"/><path d="M72 148V75M72 122L57 109M72 113L91 96" stroke="#668565" strokeWidth="3" strokeLinecap="round"/><ellipse cx="73" cy="79" rx="23" ry="37" fill="#94ad83"/><ellipse cx="87" cy="103" rx="14" ry="21" fill="#94ad83"/><ellipse cx="58" cy="104" rx="13" ry="22" fill="#94ad83"/><path d="M73 127V81M73 107L61 95M73 101L85 88" stroke="#6d8d69" strokeWidth="2" strokeLinecap="round"/><path d="M376 169V116" stroke="#4f6f54" strokeWidth="2.5"/><ellipse cx="376" cy="118" rx="13" ry="27" fill="#5e805d"/><path d="M201 63Q207 56 213 63M219 53Q226 47 232 53" stroke="#899984" strokeWidth="1.5" strokeLinecap="round"/><circle cx="146" cy="179" r="3" fill="#e3d6a0"/><circle cx="161" cy="182" r="2" fill="#e3d6a0"/><path d="M110 184l3-8 3 8M391 181l3-8 3 8" stroke="#456c51" strokeWidth="1.5"/></svg>
}
export function StatCards({ tasks, noteCount }: { tasks: Task[]; noteCount: number }) {
  const stats = summarize(tasks)
  return <div className="stats-grid">{[
    { label: '今日任务', value: stats.total, suffix: '个', hint: `${stats.pending} 个小目标等待完成`, icon: '○', color: 'sage' },
    { label: '已完成', value: stats.completed, suffix: '个', hint: '每一步，都值得肯定', icon: '✓', color: 'blue' },
    { label: '随心记录', value: noteCount, suffix: '篇', hint: '收藏生活的微小闪光', icon: '✎', color: 'peach' },
    { label: '完成率', value: stats.rate, suffix: '%', hint: stats.rate === 100 ? '太棒了，今天的目标已达成！' : '不着急，按自己的节奏来', icon: '↗', color: 'violet' },
  ].map(stat => <div className="stat-card" key={stat.label}><div className="stat-top"><span>{stat.label}</span><span className={`stat-icon ${stat.color}`}>{stat.icon}</span></div><div className="stat-value">{stat.value}<small>{stat.suffix}</small></div><p>{stat.hint}</p></div>)}</div>
}
export function WeekChart({ tasks, date, compact = false, onDate }: { tasks: Task[]; date: string; compact?: boolean; onDate?: (date: string) => void }) {
  const days = weekDates(date)
  const values = days.map(day => summarize(tasks.filter(t => t.date === day)))
  const max = Math.max(8, ...values.map(v => v.total))
  return <div className={`week-chart ${compact ? 'compact' : ''}`}><div className="chart-y">{[max, Math.round(max / 2), 0].map((v, i) => <span key={i}>{v}</span>)}</div><div className="chart-plot"><div className="chart-grid"><i /><i /><i /></div><div className="chart-bars">{days.map((day, i) => <button key={day} className={`bar-column ${day === date ? 'selected' : ''}`} onClick={() => onDate?.(day)} disabled={!onDate} aria-label={`${day}：完成 ${values[i].completed}，待完成 ${values[i].pending}`}><div className="bar-stack" title={`完成 ${values[i].completed} / ${values[i].total} 个任务`}><div className="bar-pending" style={{ height: `${values[i].pending / max * 100}%` }} /><div className="bar-done" style={{ height: `${values[i].completed / max * 100}%` }} /></div><span>{['一', '二', '三', '四', '五', '六', '日'][i]}</span><small>{parseDate(day).getDate()}</small></button>)}</div></div></div>
}
export function ChartLegend() { return <div className="chart-legend"><span><i />已完成</span><span><i />待完成</span></div> }
export function WeeklyView({ data, date, onDate, onOpenDay }: { data: AppData; date: string; onDate: (date: string) => void; onOpenDay: (date: string) => void }) {
  const days = weekDates(date)
  const tasks = data.tasks.filter(t => days.includes(t.date))
  const stats = summarize(tasks)
  const previous = summarize(data.tasks.filter(t => weekDates(shiftDate(date, -7)).includes(t.date)))
  const diff = stats.rate - previous.rate
  const notes = data.notes.filter(n => days.includes(n.date))
  return <><div className="period-banner"><div><span className="eyebrow">WEEKLY OVERVIEW</span><h2>小小的坚持，会有大大的回响。</h2><p>{days[0].replaceAll('-', '.')} — {days[6].replaceAll('-', '.')}</p></div><div className="period-badge">第 {Math.ceil((parseDate(days[0]).getTime() - new Date(parseDate(days[0]).getFullYear(), 0, 1).getTime()) / 86400000 / 7) + 1} 周<Leaf size={24} /></div></div><div className="period-stats"><Metric label="本周完成" value={`${stats.completed} / ${stats.total}`} hint="完成任务 / 计划任务" /><Metric label="周完成率" value={`${stats.rate}%`} hint={`${diff >= 0 ? '↑' : '↓'} 较上周${diff >= 0 ? '提升' : '下降'} ${Math.abs(diff)}%`} /><Metric label="本周随心记" value={String(notes.length)} hint="篇值得收藏的日常" /><Metric label="复盘天数" value={String(days.filter(d => data.reviews[d]).length)} hint="次与自己的对话" /></div><div className="analytics-grid"><section className="panel"><PanelHeading title="一周任务节奏" action={<ChartLegend />} /><WeekChart tasks={data.tasks} date={date} onDate={onDate} /><p className="chart-footnote">点击柱状图选择日期 · 每一次完成，都是一点进步</p></section><CategoryPanel tasks={tasks} /></div><section className="panel"><PanelHeading title="这一周的每一天" subtitle="点击某一天，回到当天的任务与记录" /><div className="week-day-grid">{days.map((day, i) => { const s = summarize(data.tasks.filter(t => t.date === day)); return <button className={`day-summary ${day === date ? 'selected' : ''}`} key={day} onClick={() => onOpenDay(day)}><span>周{['一', '二', '三', '四', '五', '六', '日'][i]}</span><strong>{parseDate(day).getDate()}<small>日</small></strong><div className="mini-track"><i style={{ width: `${s.rate}%` }} /></div><span>{s.completed} / {s.total} 已完成</span><small>{data.reviews[day] ? '✓ 已复盘' : '尚未复盘'}</small></button> })}</div></section>{notes.length > 0 && <section className="panel"><PanelHeading title="本周的生活碎片" /><div className="note-gallery">{notes.map(n => <article className={`note-card note-${n.color}`} key={n.id}><span className="note-tag">{n.tag}</span><h3>{n.title}</h3><p>{n.content}</p><small>{n.date}</small></article>)}</div></section>}</>
}
export function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <div className="period-metric"><span>{label}</span><strong>{value}</strong><small>{hint}</small></div>
}
export function CategoryPanel({ tasks }: { tasks: Task[] }) {
  return <section className="panel"><PanelHeading title="给生活留出平衡" subtitle="不同类型任务的完成情况" /><div className="category-breakdown">{categories.map((category, i) => { const s = summarize(tasks.filter(t => t.category === category)); return <div key={category}><div><span><i className={`category-dot dot-${i}`} />{category}</span><span>{s.completed}<small> / {s.total}</small></span></div><div className={`category-track track-${i}`}><i style={{ width: `${s.rate}%` }} /></div></div> })}</div><p className="gentle-tip"><Leaf size={16} />努力工作，也别忘记认真生活。</p></section>
}
export function MonthlyView({ data, date, onOpenDay }: { data: AppData; date: string; onOpenDay: (date: string) => void }) {
  const days = monthDates(date)
  const tasks = data.tasks.filter(t => days.includes(t.date))
  const stats = summarize(tasks)
  const activeDays = days.filter(d => tasks.some(t => t.date === d && t.completed)).length
  const offset = (parseDate(days[0]).getDay() + 6) % 7
  return <><div className="period-banner month-banner"><div><span className="eyebrow">MONTHLY OVERVIEW</span><h2>把平凡的日子，积攒成喜欢的生活。</h2><p>{parseDate(date).getFullYear()} 年 {parseDate(date).getMonth() + 1} 月 · 你的成长足迹</p></div><div className="period-badge">{parseDate(date).getMonth() + 1}<small>月</small><Leaf size={24} /></div></div><div className="period-stats"><Metric label="累计完成" value={String(stats.completed)} hint={`本月共安排 ${stats.total} 个任务`} /><Metric label="月完成率" value={`${stats.rate}%`} hint="让每个小目标落地" /><Metric label="行动天数" value={String(activeDays)} hint="天，迈出了小小的一步" /><Metric label="记录与复盘" value={String(data.notes.filter(n => days.includes(n.date)).length + days.filter(d => data.reviews[d]).length)} hint="次，认真看见自己的成长" /></div><div className="monthly-grid"><section className="panel calendar-panel"><PanelHeading title="日常足迹" subtitle="色彩越深，完成的任务越多；点击查看当天" action={<div className="calendar-legend"><span>少</span>{[0, 1, 2, 3, 4].map(n => <i key={n} className={`level-${n}`} />)}<span>多</span></div>} /><div className="month-calendar">{['一', '二', '三', '四', '五', '六', '日'].map(d => <div className="weekday" key={d}>周{d}</div>)}{Array.from({ length: offset }, (_, i) => <div key={`blank-${i}`} />)}{days.map(day => { const s = summarize(tasks.filter(t => t.date === day)); const level = Math.min(4, s.completed); return <button key={day} className={`calendar-day level-${level} ${day === dateKey(new Date()) ? 'is-today' : ''} ${day === date ? 'is-selected' : ''}`} onClick={() => onOpenDay(day)} aria-label={`${day}，完成 ${s.completed} 个任务`}><span>{parseDate(day).getDate()}{day === dateKey(new Date()) && <em>今</em>}</span><small>{s.total ? `${s.completed} / ${s.total}` : '—'}</small>{data.reviews[day] && <i title="已复盘" />}</button> })}</div></section><div className="monthly-aside"><CategoryPanel tasks={tasks} /><section className="monthly-message"><span>✦ 给自己的话</span><h3>不必每一天都闪闪发光，<br />平凡的日子也很珍贵。</h3><p>你已经在认真生活了。<br />下一步，继续按自己的节奏走。</p><Leaf size={28} /></section></div></div></>
}
export function ReviewEditor({ date, review, onSave, onDirty }: { date: string; review?: Review; onSave: (review: Review) => void; onDirty?: (dirty: boolean) => void }) {
  const [mood, setMood] = useState<Mood>(review?.mood || '平静满足')
  const [wins, setWins] = useState(review?.wins || '')
  const [learnings, setLearnings] = useState(review?.learnings || '')
  const [tomorrow, setTomorrow] = useState(review?.tomorrow || '')
  const dirty = mood !== (review?.mood || '平静满足') || wins !== (review?.wins || '') || learnings !== (review?.learnings || '') || tomorrow !== (review?.tomorrow || '')
  useEffect(() => {
    onDirty?.(dirty)
    if (!dirty) return
    const prevent = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', prevent)
    return () => window.removeEventListener('beforeunload', prevent)
  }, [dirty, onDirty])
  return <form className="review-editor panel" onSubmit={e => { e.preventDefault(); onSave({ date, mood, wins: wins.trim(), learnings: learnings.trim(), tomorrow: tomorrow.trim(), savedAt: new Date().toISOString() }) }}><PanelHeading title="和今天的自己聊一聊" subtitle="不评判，不苛责，只是温柔地回望。" /><div className="review-mood"><label>今天的心情怎么样？</label><div>{moods.map(m => <button type="button" key={m.value} className={mood === m.value ? 'selected' : ''} onClick={() => setMood(m.value)}><span>{m.emoji}</span>{m.value}</button>)}</div></div>{[
    { value: wins, set: setWins, title: '今天，哪些事情让你感到开心？', placeholder: '一个完成的小目标、一顿好吃的饭，或是一句温暖的话…', icon: '✦' },
    { value: learnings, set: setLearnings, title: '有什么新的收获，或想改进的地方？', placeholder: '看见自己的进步，也接纳那些不够完美的部分…', icon: '↗' },
    { value: tomorrow, set: setTomorrow, title: '给明天的自己，一个小小的期待', placeholder: '明天，最想完成的一件事是什么？', icon: '☀' },
  ].map(field => <label className="review-field" key={field.title}><span><i>{field.icon}</i>{field.title}</span><textarea value={field.value} onChange={e => field.set(e.target.value)} placeholder={field.placeholder} maxLength={5000} rows={3} /></label>)}<div className="review-save"><span>{review && !dirty ? <><CircleCheck size={15} />已保存 · {new Date(review.savedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</> : '只属于你的记录，不必写得完美。'}</span><button className="primary-button" type="submit"><Check size={16} />{review ? '更新复盘' : '保存今日复盘'}</button></div></form>
}
export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => { if (dialog?.open) dialog.close() }
  }, [])
  return <dialog ref={ref} className={`modal ${wide ? 'wide' : ''}`} onCancel={e => { e.preventDefault(); onClose() }} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose() } }} aria-labelledby="modal-title"><div className="modal-header"><h2 id="modal-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="关闭弹窗"><X size={20} /></button></div>{children}</dialog>
}
export function TaskForm({ task, date, onSave, onDelete }: { task?: Task; date: string; onSave: (task: Task) => void; onDelete: (id: string) => void }) {
  const [title, setTitle] = useState(task?.title || '')
  const [category, setCategory] = useState<Category>(task?.category || '工作')
  const [priority, setPriority] = useState<Priority>(task?.priority || '普通')
  const [taskDate, setTaskDate] = useState(task?.date || date)
  const [time, setTime] = useState(task?.time || '')
  return <form className="editor-form" onSubmit={e => { e.preventDefault(); if (title.trim()) onSave({ id: task?.id || uid(), title: title.trim(), category, priority, date: taskDate, time, completed: task?.completed || false }) }}><label>想完成什么？<input autoFocus required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="从一个小小的目标开始…" /></label><div className="form-row"><label>分类<select value={category} onChange={e => setCategory(e.target.value as Category)}>{categories.map(c => <option key={c}>{c}</option>)}</select></label><label>优先级<select value={priority} onChange={e => setPriority(e.target.value as Priority)}>{['普通', '重要', '紧急'].map(p => <option key={p}>{p}</option>)}</select></label></div><div className="form-row"><label>日期<input type="date" required value={taskDate} onChange={e => setTaskDate(e.target.value)} /></label><label>时间（可选）<input type="time" value={time} onChange={e => setTime(e.target.value)} /></label></div><div className="form-footer">{task && <button type="button" className="danger-button" onClick={() => { if (window.confirm(`删除任务「${task.title}」？`)) onDelete(task.id) }}>删除任务</button>}<button type="submit" className="primary-button" disabled={!title.trim()}><Check size={16} />{task ? '保存修改' : '添加任务'}</button></div></form>
}
export function NoteForm({ note, date, onSave, onDelete }: { note?: Note; date: string; onSave: (note: Note) => void; onDelete: (id: string) => void }) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [tag, setTag] = useState(note?.tag || '随心记')
  const [color, setColor] = useState<Note['color']>(note?.color || 'yellow')
  return <form className="editor-form" onSubmit={e => { e.preventDefault(); if (title.trim() && content.trim()) onSave({ id: note?.id || uid(), title: title.trim(), content: content.trim(), tag: tag.trim() || '随心记', color, date: note?.date || date, time: note?.time || new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }) }}><label>给这段日常起个名字<input autoFocus required maxLength={80} value={title} onChange={e => setTitle(e.target.value)} placeholder="此刻，在想什么？" /></label><label>记录下来<textarea rows={7} required maxLength={10000} value={content} onChange={e => setContent(e.target.value)} placeholder="灵感、心情、生活里的小事，都可以留在这里…" /></label><div className="form-row"><label>标签<input value={tag} maxLength={16} onChange={e => setTag(e.target.value)} /></label><div className="color-field"><span>便签颜色</span><div>{(['yellow', 'green', 'pink', 'blue'] as const).map(c => <button key={c} type="button" className={`color-swatch note-${c} ${color === c ? 'selected' : ''}`} aria-label={`${c}色便签`} aria-pressed={color === c} onClick={() => setColor(c)}>{color === c && <Check size={15} />}</button>)}</div></div></div><div className="form-footer">{note && <button type="button" className="danger-button" onClick={() => { if (window.confirm(`删除随心记「${note.title}」？`)) onDelete(note.id) }}>删除记录</button>}<button type="submit" className="primary-button" disabled={!title.trim() || !content.trim()}><Check size={16} />{note ? '保存修改' : '留住这一刻'}</button></div></form>
}
export function Trend({ value }: { value: number }) { return <span className={`trend ${value < 0 ? 'negative' : ''}`}>{value < 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{Math.abs(value)}%</span> }
export function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) { return <button className="text-link" onClick={onClick}>{children}<ArrowRight size={14} /></button> }
