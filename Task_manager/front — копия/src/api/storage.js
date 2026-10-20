// Репозиторий данных. Сейчас — localStorage, позже заменяется на fetch к бэкенду.
// Контракт (async-функции) менять не нужно: composables зависят только от него.
import { toISO } from '../utils/date.js'
import { STATUS_VALUES, PRIORITY_VALUES } from '../constants.js'

const TASKS_KEY = 'task-manager:tasks'      // тот же ключ, что и раньше
const GOALS_KEY = 'task-manager:goals'
const SCHEMA_KEY = 'task-manager:schema'
const SCHEMA_VERSION = 2

// ---------- низкоуровневые помощники ----------
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value))

// ---------- нормализация и миграция ----------
export function normalizeTask(t) {
  const created = new Date(t.createdAt)
  const createdAt = isNaN(created) ? new Date().toISOString() : created.toISOString()
  return {
    id: String(t.id ?? crypto.randomUUID()),
    title: String(t.title ?? ''),
    description: String(t.description ?? ''),
    priority: PRIORITY_VALUES.includes(t.priority) ? t.priority : 'medium',
    // v1: completed (boolean) -> v2: status
    status: STATUS_VALUES.includes(t.status) ? t.status : t.completed ? 'done' : 'todo',
    // v1 не знала про дату задачи: берём дату создания
    date: t.date || toISO(new Date(createdAt)),
    createdAt,
    updatedAt: t.updatedAt || createdAt
  }
}

function migrate() {
  const version = Number(localStorage.getItem(SCHEMA_KEY) || 1)
  if (version >= SCHEMA_VERSION) return
  const oldTasks = read(TASKS_KEY, [])
  write(TASKS_KEY, Array.isArray(oldTasks) ? oldTasks.map(normalizeTask) : [])
  localStorage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION))
}

migrate()

// ---------- задачи ----------
export async function getTasks() {
  return read(TASKS_KEY, [])
}

export async function createTask(data) {
  const now = new Date().toISOString()
  const task = normalizeTask({
    ...data,
    id: crypto.randomUUID(),
    status: data.status ?? 'todo',
    createdAt: now,
    updatedAt: now
  })
  write(TASKS_KEY, [task, ...read(TASKS_KEY, [])])
  return task
}

export async function updateTask(id, patch) {
  const list = read(TASKS_KEY, [])
  const index = list.findIndex(t => t.id === id)
  if (index === -1) throw new Error(`Задача ${id} не найдена`)
  const updated = normalizeTask({
    ...list[index],
    ...patch,
    id: list[index].id,
    createdAt: list[index].createdAt,
    updatedAt: new Date().toISOString()
  })
  list[index] = updated
  write(TASKS_KEY, list)
  return updated
}

export async function deleteTask(id) {
  write(TASKS_KEY, read(TASKS_KEY, []).filter(t => t.id !== id))
}

// ---------- цели ----------
// { months: { '2026-10': 'текст' }, years: { '2026': 'текст' } }
export async function getGoals() {
  const g = read(GOALS_KEY, {})
  return { months: g.months ?? {}, years: g.years ?? {} }
}

// type: 'months' | 'years'; пустой текст удаляет цель
export async function saveGoal(type, key, text) {
  const goals = await getGoals()
  const value = text.trim()
  if (value) goals[type][key] = value
  else delete goals[type][key]
  write(GOALS_KEY, goals)
  return goals
}

// ---------- синхронизация между вкладками ----------
export function subscribe(onChange) {
  const handler = e => {
    if (e.key === TASKS_KEY || e.key === GOALS_KEY) onChange(e.key === TASKS_KEY ? 'tasks' : 'goals')
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}
