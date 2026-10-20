import { ref } from 'vue'
import * as api from '../api/storage.js'

const goals = ref({ months: {}, years: {} })
let initPromise = null

export function initGoals() {
  if (!initPromise) {
    initPromise = api.getGoals().then(g => { goals.value = g })
    api.subscribe(async source => {
      if (source === 'goals') goals.value = await api.getGoals()
    })
  }
  return initPromise
}

export function useGoals() {
  return {
    goals,
    getMonthGoal: ym => goals.value.months[ym] ?? '',   // ym = '2026-10'
    getYearGoal: year => goals.value.years[String(year)] ?? '',
    setMonthGoal: async (ym, text) => { goals.value = await api.saveGoal('months', ym, text) },
    setYearGoal: async (year, text) => { goals.value = await api.saveGoal('years', String(year), text) }
  }
}
