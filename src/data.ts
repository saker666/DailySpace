export type Category = '工作' | '生活' | '成长'
export type Priority = '普通' | '重要' | '紧急'
export type View = 'overview' | 'tasks' | 'notes' | 'review' | 'week' | 'month'
export type Mood = '充满能量' | '平静满足' | '有点疲惫' | '需要抱抱'
export interface Task {
  id: string
  title: string
  category: Category
  priority: Priority
  date: string
  time: string
  completed: boolean
}
export interface Note {
  id: string
  title: string
  content: string
  date: string
  time: string
  color: 'yellow' | 'green' | 'pink' | 'blue'
  tag: string
}
export interface Review {
  date: string
  mood: Mood
  wins: string
  learnings: string
  tomorrow: string
  savedAt: string
}
export interface AppData {
  version: 1
  tasks: Task[]
  notes: Note[]
  reviews: Record<string, Review>
}

export const STORAGE_KEY = 'daily-space-v1'
export const categories: Category[] = ['工作', '生活', '成长']
export const moods: { value: Mood; emoji: string }[] = [
  { value: '充满能量', emoji: '🤩' },
  { value: '平静满足', emoji: '🙂' },
  { value: '有点疲惫', emoji: '😴' },
  { value: '需要抱抱', emoji: '🥺' },
]

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function parseDate(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}
export function shiftDate(key: string, amount: number): string {
  const date = parseDate(key)
  date.setDate(date.getDate() + amount)
  return dateKey(date)
}
export function weekDates(key: string): string[] {
  const day = parseDate(key).getDay()
  const monday = shiftDate(key, -(day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, index) => shiftDate(monday, index))
}
export function monthDates(key: string): string[] {
  const date = parseDate(key)
  const count = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return Array.from({ length: count }, (_, i) => dateKey(new Date(date.getFullYear(), date.getMonth(), i + 1)))
}
export function summarize(tasks: Task[]) {
  const completed = tasks.filter(task => task.completed).length
  return { total: tasks.length, completed, pending: tasks.length - completed, rate: tasks.length ? Math.round(completed / tasks.length * 100) : 0 }
}
export function uid(): string {
  return crypto.randomUUID()
}
export function createMockData(today = dateKey(new Date())): AppData {
  const tasks: Task[] = [
    { id: 'today-1', title: '完成个人作品集首页设计', category: '工作', priority: '重要', time: '10:00', completed: false, date: today },
    { id: 'today-2', title: '读 20 页《原子习惯》', category: '成长', priority: '普通', time: '08:30', completed: true, date: today },
    { id: 'today-3', title: '去公园散步，感受一下秋天', category: '生活', priority: '普通', time: '17:30', completed: false, date: today },
    { id: 'today-4', title: '整理本周的项目进度', category: '工作', priority: '紧急', time: '14:00', completed: false, date: today },
    { id: 'today-5', title: '给自己做一顿好吃的晚餐', category: '生活', priority: '普通', time: '18:30', completed: false, date: today },
    { id: 'today-6', title: '晨间冥想 10 分钟', category: '成长', priority: '普通', time: '07:30', completed: true, date: today },
  ]
  const samples = [
    ['整理项目资料', '工作'], ['散步 30 分钟', '生活'], ['阅读与记录', '成长'],
    ['完成今日设计任务', '工作'], ['喝水与拉伸', '生活'], ['学习一个新知识', '成长'],
  ] as const
  for (let ago = 1; ago <= 90; ago++) {
    const date = shiftDate(today, -ago)
    const count = 3 + ((ago * 13) % 4)
    for (let i = 0; i < count; i++) {
      tasks.push({ id: `history-${ago}-${i}`, title: samples[i][0], category: samples[i][1], priority: '普通', date, time: `${String(9 + i * 2).padStart(2, '0')}:00`, completed: (ago + i * 3) % 5 !== 0 })
    }
  }
  for (let ahead = 1; ahead <= 5; ahead++) {
    tasks.push({ id: `future-${ahead}`, title: ahead % 2 ? '安排一段专注学习时间' : '推进作品集设计', category: ahead % 2 ? '成长' : '工作', priority: '普通', date: shiftDate(today, ahead), time: '10:00', completed: false })
  }
  const notes: Note[] = [
    { id: 'note-1', title: '慢一点，也没关系', content: '早上散步时发现路边的桂花开了。\n原来美好的事情，一直都在身边。\n记得偶尔停下来，看一看。', date: today, time: '09:12', color: 'yellow', tag: '生活碎片' },
    { id: 'note-2', title: '一个小小的灵感 💡', content: '把待办清单变成「想做的事」清单，\n会不会让每一天更有期待？\n试着用喜欢的方式，做必须做的事。', date: today, time: '11:36', color: 'green', tag: '灵感一刻' },
    { id: 'note-3', title: '今天值得记住的事', content: '终于完成了拖延很久的整理。\n开始比完美更重要，迈出第一步就好。', date: shiftDate(today, -1), time: '20:18', color: 'pink', tag: '小小成就' },
    { id: 'note-4', title: '给未来的自己', content: '保持好奇，也保持耐心。\n那些不太起眼的小进步，终会连成一条路。', date: shiftDate(today, -2), time: '15:40', color: 'blue', tag: '随心记' },
  ]
  const yesterday = shiftDate(today, -1)
  return { version: 1, tasks, notes, reviews: { [yesterday]: { date: yesterday, mood: '平静满足', wins: '完成了设计任务，也留出时间好好吃饭。', learnings: '把大任务拆成小步骤，开始会更容易。', tomorrow: '先做最重要的一件事，记得出门走走。', savedAt: `${yesterday}T21:00:00` } } }
}

declare global {
  interface Window {
    dailySpace?: { loadSync: () => string; save: (json: string) => void }
  }
}

function parseStored(raw: string | null): AppData | null {
  try {
    const stored: unknown = JSON.parse(raw || 'null')
    if (stored && typeof stored === 'object' && 'version' in stored && stored.version === 1 && 'tasks' in stored && Array.isArray(stored.tasks) && 'notes' in stored && Array.isArray(stored.notes) && 'reviews' in stored && stored.reviews && typeof stored.reviews === 'object') {
      const data = stored as AppData
      if (data.tasks.every(t => typeof t.title === 'string' && typeof t.date === 'string' && typeof t.completed === 'boolean') && data.notes.every(n => typeof n.title === 'string' && typeof n.content === 'string')) return data
    }
  } catch { /* Unavailable or invalid storage: use demo data. */ }
  return null
}

export function loadData(): AppData {
  const raw = window.dailySpace ? window.dailySpace.loadSync() : localStorage.getItem(STORAGE_KEY)
  return parseStored(raw) ?? createMockData()
}
