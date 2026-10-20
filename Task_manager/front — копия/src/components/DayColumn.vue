<script setup>
import { computed } from 'vue'
import { formatDay } from '../utils/date.js'
import { STATUSES } from '../constants.js'

const props = defineProps({
  date: { type: String, required: true },
  tasks: { type: Array, default: () => [] },
  isToday: { type: Boolean, default: false }
})
const emit = defineEmits(['open'])

const doneCount = computed(() => props.tasks.filter(t => t.status === 'done').length)
const statusLabel = value => STATUSES.find(s => s.value === value)?.label ?? value
</script>

<template>
  <div
    class="day"
    :class="{ 'day--today': isToday }"
    role="button"
    tabindex="0"
    @click="emit('open', date)"
    @keydown.enter="emit('open', date)"
  >
    <header class="day__head">
      <span class="day__name">{{ formatDay(date) }}</span>
      <span class="day__count" v-if="tasks.length">{{ doneCount }}/{{ tasks.length }}</span>
    </header>

    <ul class="day__tasks">
      <li
        v-for="t in tasks"
        :key="t.id"
        class="day__task"
        :class="[`day__task--${t.priority}`, { 'day__task--done': t.status === 'done' }]"
        :title="statusLabel(t.status)"
      >
        <span class="day__title">{{ t.title }}</span>
        <span class="day__badge" :class="`day__badge--${t.status}`">{{ statusLabel(t.status) }}</span>
      </li>
    </ul>

    <p v-if="tasks.length === 0" class="day__empty">Нет задач</p>
  </div>
</template>

<style scoped>
.day { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; min-height: 160px; cursor: pointer; display: flex; flex-direction: column; gap: 8px; }
.day:hover, .day:focus-visible { border-color: #3b82f6; outline: none; }
.day--today { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25); }
.day__head { display: flex; justify-content: space-between; align-items: baseline; font-weight: 600; text-transform: capitalize; }
.day__count { font-size: 12px; color: #6b7280; font-weight: 400; }
.day__tasks { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.day__task { border-left: 4px solid #9ca3af; background: #f9fafb; border-radius: 4px; padding: 4px 6px; font-size: 13px; display: flex; flex-direction: column; gap: 2px; }
.day__task--low { border-left-color: #22c55e; }
.day__task--medium { border-left-color: #f59e0b; }
.day__task--high { border-left-color: #ef4444; }
.day__task--done .day__title { text-decoration: line-through; color: #9ca3af; }
.day__title { overflow-wrap: anywhere; }
.day__badge { align-self: flex-start; font-size: 11px; padding: 1px 6px; border-radius: 8px; background: #e5e7eb; color: #374151; }
.day__badge--in_progress { background: #dbeafe; color: #1d4ed8; }
.day__badge--done { background: #dcfce7; color: #15803d; }
.day__empty { margin: 0; color: #9ca3af; font-size: 13px; }
</style>
