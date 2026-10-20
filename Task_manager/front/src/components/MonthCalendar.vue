<script setup>
import { computed } from 'vue'
import { getMonthGrid, formatMonth } from '../utils/date.js'
import { useGoals } from '../composables/useGoals.js'
import { PRIORITY_ORDER } from '../constants.js'
import GoalEditor from './GoalEditor.vue'

const props = defineProps({
  ym: { type: String, required: true },                    // '2026-10'
  tasksByDate: { type: Object, default: () => ({}) },      // { '2026-10-19': [task, ...] }
  todayISO: { type: String, required: true },
  isCurrent: { type: Boolean, default: false }             // центральный месяц окна
})
const emit = defineEmits(['open'])

const { getMonthGoal, setMonthGoal } = useGoals()
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// самый высокий приоритет среди задач дня
const topPriority = list =>
  list.reduce((best, t) => (PRIORITY_ORDER[t.priority] < PRIORITY_ORDER[best] ? t.priority : best), list[0].priority)

const weeks = computed(() =>
  getMonthGrid(props.ym).map(week =>
    week.map(cell => {
      const list = props.tasksByDate[cell.date] ?? []
      return {
        ...cell,
        day: Number(cell.date.slice(8)),
        count: list.length,
        priority: list.length ? topPriority(list) : null,
        allDone: list.length > 0 && list.every(t => t.status === 'done')
      }
    })
  )
)
</script>

<template>
  <BaseCard class="month" :class="{ 'month--current': isCurrent }">
    <template #header>
      <span class="month__title">{{ formatMonth(ym) }}</span>
    </template>

    <GoalEditor
      label="Цель месяца"
      :model-value="getMonthGoal(ym)"
      @save="text => setMonthGoal(ym, text)"
    />

    <div class="grid">
      <div v-for="w in WEEKDAYS" :key="w" class="grid__weekday">{{ w }}</div>

      <template v-for="(week, wi) in weeks" :key="wi">
        <template v-for="cell in week" :key="cell.date">
          <div v-if="!cell.inMonth" class="cell cell--empty" />
          <button
            v-else
            type="button"
            class="cell"
            :class="[
              cell.priority && `cell--${cell.priority}`,
              { 'cell--today': cell.date === todayISO, 'cell--alldone': cell.allDone }
            ]"
            :aria-label="`${cell.day}: задач ${cell.count}`"
            @click="emit('open', cell.date)"
          >
            <span class="cell__day">{{ cell.day }}</span>
            <span v-if="cell.count" class="cell__badge">{{ cell.count }}</span>
          </button>
        </template>
      </template>
    </div>
  </BaseCard>
</template>

<style scoped>
.month--current { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
.month__title { text-transform: capitalize; }

.grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 3px; margin-top: 12px; }
.grid__weekday { text-align: center; font-size: 12px; color: #9ca3af; padding-bottom: 2px; }

.cell { position: relative; aspect-ratio: 1; border: 1px solid #e5e7eb; border-radius: 6px; background: #fff; padding: 0; cursor: pointer; font: inherit; color: inherit; text-align: left; }
.cell--empty { border: none; background: transparent; cursor: default; }
.cell:not(.cell--empty):hover, .cell:focus-visible { border-color: #3b82f6; outline: none; }
.cell__day { position: absolute; top: 3px; left: 5px; font-size: 12px; }
.cell__badge { position: absolute; right: 3px; bottom: 3px; min-width: 16px; height: 16px; border-radius: 8px; padding: 0 4px; box-sizing: border-box; font-size: 11px; line-height: 16px; text-align: center; color: #fff; background: #9ca3af; }

.cell--low { background: #f0fdf4; }
.cell--low .cell__badge { background: #22c55e; }
.cell--medium { background: #fffbeb; }
.cell--medium .cell__badge { background: #f59e0b; }
.cell--high { background: #fef2f2; }
.cell--high .cell__badge { background: #ef4444; }
.cell--alldone { opacity: 0.55; }
.cell--today { border: 2px solid #3b82f6; }
</style>
