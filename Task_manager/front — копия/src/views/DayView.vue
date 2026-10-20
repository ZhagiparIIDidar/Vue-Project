<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTasks } from '../composables/useTasks.js'
import { addDays, formatDayFull } from '../utils/date.js'
import TaskForm from '../components/TaskForm.vue'
import TaskItem from '../components/TaskItem.vue'
import TaskFilters from '../components/TaskFilters.vue'
import TaskStats from '../components/TaskStats.vue'

const route = useRoute()
const router = useRouter()
const {
  filters, tasksForDate, getStats, resetFilters,
  addTask, updateTask, deleteTask, setStatus, setPriority
} = useTasks()

const date = computed(() => route.params.date)
const editingTask = ref(null)

const tasks = computed(() => tasksForDate(date.value))
const stats = computed(() => getStats(tasksForDate(date.value, { filtered: false })))

// при переходе на другой день форма редактирования сбрасывается
watch(date, () => { editingTask.value = null })

async function handleSubmit(data) {
  if (editingTask.value) {
    await updateTask(editingTask.value.id, data)
    editingTask.value = null
  } else {
    await addTask(data)
  }
}

function onDelete(id) {
  if (!confirm('Удалить задачу?')) return
  deleteTask(id)
  if (editingTask.value?.id === id) editingTask.value = null
}

const goDay = offset => router.push({ name: 'day', params: { date: addDays(date.value, offset) } })
const goWeek = () => router.push({ name: 'week', params: { date: date.value } })
</script>

<template>
  <div class="day-nav">
    <BaseButton variant="secondary" @click="goWeek">← К неделе</BaseButton>
    <BaseButton variant="secondary" @click="goDay(-1)">‹</BaseButton>
    <div class="day-nav__title">{{ formatDayFull(date) }}</div>
    <BaseButton variant="secondary" @click="goDay(1)">›</BaseButton>
  </div>

  <TaskStats :stats="stats" title="Статистика дня" />

  <TaskForm
    :editing-task="editingTask"
    :default-date="date"
    @submit="handleSubmit"
    @cancel="editingTask = null"
  />

  <TaskFilters
    v-model:search="filters.search"
    v-model:priority="filters.priority"
    v-model:status="filters.status"
    @reset="resetFilters"
  />

  <div class="list">
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      @change-status="setStatus"
      @change-priority="setPriority"
      @edit="t => (editingTask = t)"
      @delete="onDelete"
    />
    <p v-if="tasks.length === 0" class="empty">
      {{ stats.total === 0 ? 'На этот день задач нет' : 'Ничего не найдено' }}
    </p>
  </div>
</template>

<style scoped>
.day-nav { display: flex; align-items: center; gap: 8px; }
.day-nav__title { flex: 1; text-align: center; font-weight: 600; font-size: 18px; text-transform: capitalize; }
.list { display: flex; flex-direction: column; gap: 12px; }
.empty { text-align: center; color: #9ca3af; }
</style>
