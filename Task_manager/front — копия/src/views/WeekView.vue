<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTasks } from '../composables/useTasks.js'
import { getWeekDays, addWeeks, formatWeekRange, today } from '../utils/date.js'
import DayColumn from '../components/DayColumn.vue'
import TaskFilters from '../components/TaskFilters.vue'
import TaskStats from '../components/TaskStats.vue'

const route = useRoute()
const router = useRouter()
const { filters, tasksForDate, tasksForDates, getStats, resetFilters } = useTasks()

const todayISO = today()
const date = computed(() => route.params.date)
const days = computed(() => getWeekDays(date.value))
const byDay = computed(() => tasksForDates(days.value)) // с учётом фильтров
// статистика недели не зависит от фильтров
const stats = computed(() =>
  getStats(days.value.flatMap(d => tasksForDate(d, { filtered: false })))
)

const goWeek = offset =>
  router.push({ name: 'week', params: { date: addWeeks(date.value, offset) } })
const goToday = () => router.push({ name: 'week', params: { date: todayISO } })
const openDay = d => router.push({ name: 'day', params: { date: d } })
</script>

<template>
  <div class="week-nav">
    <BaseButton variant="secondary" @click="goWeek(-1)">← Пред.</BaseButton>
    <div class="week-nav__title">{{ formatWeekRange(date) }}</div>
    <BaseButton variant="secondary" @click="goWeek(1)">След. →</BaseButton>
    <BaseButton @click="goToday">Сегодня</BaseButton>
  </div>

  <TaskStats :stats="stats" title="Статистика недели" />

  <TaskFilters
    v-model:search="filters.search"
    v-model:priority="filters.priority"
    v-model:status="filters.status"
    @reset="resetFilters"
  />

  <div class="week-grid">
    <DayColumn
      v-for="d in days"
      :key="d"
      :date="d"
      :tasks="byDay[d]"
      :is-today="d === todayISO"
      @open="openDay"
    />
  </div>
</template>

<style scoped>
.week-nav { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.week-nav__title { flex: 1; text-align: center; font-weight: 600; font-size: 18px; min-width: 160px; }
.week-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; }
@media (max-width: 1000px) {
  .week-grid { grid-template-columns: 1fr; }
}
</style>
