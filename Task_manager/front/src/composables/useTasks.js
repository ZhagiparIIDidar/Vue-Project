// Общее состояние задач на уровне модуля: все страницы видят одни и те же данные
// (замена Pinia, пока используем только Vue Router).
import { ref, reactive } from 'vue'
import * as api from '../api/storage.js'
import { PRIORITY_ORDER } from '../constants.js'

const tasks = ref([])
const loading = ref(false)
const error = ref(null)

// общие фильтры: работают на неделе, в дне и в месяце
const filters = reactive({ search: '', priority: 'all', status: 'all' })

let initPromise = null

export function initTasks() {
  if (!initPromise) {
    loading.value = true
    initPromise = api
      .getTasks()
      .then(list => { tasks.value = list })
      .catch(e => { error.value = e })
      .finally(() => { loading.value = false })

    api.subscribe(async source => {
      if (source === 'tasks') tasks.value = await api.getTasks()
    })
  }
  return initPromise
}

// ---------- чистые функции ----------
function matches(task) {
  const q = filters.search.trim().toLowerCase()
  return (
    (!q || task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q)) &&
    (filters.priority === 'all' || task.priority === filters.priority) &&
    (filters.status === 'all' || task.status === filters.status)
  )
}

const sortTasks = list =>
  [...list].sort(
    (a, b) =>
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
      a.createdAt.localeCompare(b.createdAt)
  )

// Вызывать можно внутри computed — зависимость от tasks/filters отслеживается
function tasksForDate(date, { filtered = true } = {}) {
  const list = tasks.value.filter(t => t.date === date)
  return sortTasks(filtered ? list.filter(matches) : list)
}

function tasksForDates(dates, opts) {
  return Object.fromEntries(dates.map(d => [d, tasksForDate(d, opts)]))
}

function getStats(list) {
  const total = list.length
  const done = list.filter(t => t.status === 'done').length
  const inProgress = list.filter(t => t.status === 'in_progress').length
  return {
    total,
    done,
    inProgress,
    todo: total - done - inProgress,
    progress: total === 0 ? 0 : Math.round((done / total) * 100)
  }
}

function resetFilters() {
  filters.search = ''
  filters.priority = 'all'
  filters.status = 'all'
}

// ---------- CRUD ----------
async function run(fn) {
  error.value = null
  try {
    return await fn()
  } catch (e) {
    error.value = e
    throw e
  }
}

const replace = updated => {
  const i = tasks.value.findIndex(t => t.id === updated.id)
  if (i !== -1) tasks.value[i] = updated
}

const addTask = data =>
  run(async () => {
    const created = await api.createTask(data)
    tasks.value.unshift(created)
    return created
  })

const updateTask = (id, patch) =>
  run(async () => {
    const updated = await api.updateTask(id, patch)
    replace(updated)
    return updated
  })

const deleteTask = id =>
  run(async () => {
    await api.deleteTask(id)
    tasks.value = tasks.value.filter(t => t.id !== id)
  })

const setStatus = (id, status) => updateTask(id, { status })
const setPriority = (id, priority) => updateTask(id, { priority })
const moveToDate = (id, date) => updateTask(id, { date })

export function useTasks() {
  return {
    tasks, loading, error, filters,
    tasksForDate, tasksForDates, getStats, resetFilters,
    addTask, updateTask, deleteTask, setStatus, setPriority, moveToDate
  }
}
