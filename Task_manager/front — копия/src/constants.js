export const PRIORITIES = [
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' }
]

export const STATUSES = [
  { value: 'todo', label: 'К выполнению' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'done', label: 'Выполнена' }
]

export const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }
export const STATUS_VALUES = STATUSES.map(s => s.value)
export const PRIORITY_VALUES = PRIORITIES.map(p => p.value)
