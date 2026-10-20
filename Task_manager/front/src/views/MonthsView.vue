<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTasks } from '../composables/useTasks.js'
import { useGoals } from '../composables/useGoals.js'
import { addMonths, getMonthGrid, monthKey, today } from '../utils/date.js'
import MonthCalendar from '../components/MonthCalendar.vue'
import GoalEditor from '../components/GoalEditor.vue'
import TaskFilters from '../components/TaskFilters.vue'

const route = useRoute()
const router = useRouter()
const { filters, tasksForDates, resetFilters } = useTasks()
const { getYearGoal, setYearGoal } = useGoals()

const todayISO = today()
const ym = computed(() => route.params.ym)               // центральный месяц
const year = computed(() => ym.value.slice(0, 4))        // цель года — для года центрального месяца

// предыдущий, текущий, следующий
const months = computed(() => [addMonths(ym.value, -1), ym.value, addMonths(ym.value, 1)])

// задачи всех дней трёх месяцев (с учётом фильтров), одним объектом { date: [tasks] }
const byDate = computed(() => {
  const dates = months.value.flatMap(m =>
    getMonthGrid(m).flat().filter(c => c.inMonth).map(c => c.date)
  )
  return tasksForDates(dates)
})

const goMonth = offset => router.push({ name: 'month', params: { ym: addMonths(ym.value, offset) } })
const goToday = () => router.push({ name: 'month', params: { ym: monthKey(todayISO) } })
const openDay = d => router.push({ name: 'day', params: { date: d } })
</script>

<template>
  <div class="months-nav">
    <BaseButton variant="secondary" @click="goMonth(-1)">← Пред.</BaseButton>
    <div class="months-nav__title">Три месяца</div>
    <BaseButton variant="secondary" @click="goMonth(1)">След. →</BaseButton>
    <BaseButton @click="goToday">Сегодня</BaseButton>
  </div>

  <BaseCard>
    <GoalEditor
      :label="`Цель на ${year} год`"
      :model-value="getYearGoal(year)"
      @save="text => setYearGoal(year, text)"
    />
  </BaseCard>

  <TaskFilters
    v-model:search="filters.search"
    v-model:priority="filters.priority"
    v-model:status="filters.status"
    @reset="resetFilters"
  />

  <div class="months-grid">
    <MonthCalendar
      v-for="m in months"
      :key="m"
      :ym="m"
      :tasks-by-date="byDate"
      :today-iso="todayISO"
      :is-current="m === ym"
      @open="openDay"
    />
  </div>
</template>

<style scoped>
.months-nav { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.months-nav__title { flex: 1; text-align: center; font-weight: 600; font-size: 18px; min-width: 120px; }
.months-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; align-items: start; }
@media (max-width: 1000px) {
  .months-grid { grid-template-columns: 1fr; }
}
</style>
