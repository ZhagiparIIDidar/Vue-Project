// Демо-данные на 3 месяца для проверки навигации. Вызвать один раз из консоли:
//   import('/src/seed.js').then(m => m.seedDemoData())   (в dev-режиме Vite)
import * as api from './api/storage.js'
import { addMonths, addDays, getMonthGrid } from './utils/date.js'

const TITLES = ['Созвон с командой', 'Написать отчёт', 'Тренировка', 'Прочитать главу', 'Разобрать почту', 'Купить продукты']
const PRIORITIES = ['low', 'medium', 'high']
const STATUSES = ['todo', 'in_progress', 'done']

export async function seedDemoData(startMonth = '2026-10', months = 3) {
  if ((await api.getTasks()).length > 0) return console.warn('Данные уже есть, seed пропущен')
  let n = 0
  for (let m = 0; m < months; m++) {
    const ym = addMonths(startMonth, m)
    for (const week of getMonthGrid(ym)) {
      for (const { date, inMonth } of week) {
        if (!inMonth) continue
        const count = n % 4 // 0..3 задачи в день
        for (let i = 0; i < count; i++, n++) {
          await api.createTask({
            title: TITLES[(n + i) % TITLES.length],
            description: '',
            date,
            priority: PRIORITIES[n % 3],
            status: STATUSES[(n + i) % 3]
          })
        }
        n++
      }
    }
    await api.saveGoal('months', ym, `Цель на ${ym}`)
  }
  await api.saveGoal('years', startMonth.slice(0, 4), 'Цель на год')
  console.log('Демо-данные добавлены')
}
