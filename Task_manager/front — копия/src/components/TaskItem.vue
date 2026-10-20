<script setup>
import { computed } from 'vue'
import { PRIORITIES, STATUSES } from '../constants.js'

const props = defineProps({
  task: { type: Object, required: true }
})

const emit = defineEmits(['delete', 'edit', 'change-status', 'change-priority'])

const isDone = computed(() => props.task.status === 'done')
const statusText = computed(() => STATUSES.find(s => s.value === props.task.status)?.label)

const createdText = computed(() =>
  new Date(props.task.createdAt).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
)
</script>

<template>
  <BaseCard :class="['task', `task--${task.priority}`, { 'task--done': isDone }]">
    <template #header>
      <div class="task__head">
        <span class="task__title">{{ task.title }}</span>
        <span class="task__status" :class="`task__status--${task.status}`">{{ statusText }}</span>
      </div>
    </template>

    <p class="task__desc">{{ task.description || 'Без описания' }}</p>

    <div class="task__meta">
      <span>Создана: {{ createdText }}</span>
      <div class="task__selects">
        <label>
          Статус:
          <select :value="task.status" @change="emit('change-status', task.id, $event.target.value)">
            <option v-for="s in STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </label>
        <label>
          Приоритет:
          <select :value="task.priority" @change="emit('change-priority', task.id, $event.target.value)">
            <option v-for="p in PRIORITIES" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </label>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="success" @click="emit('change-status', task.id, isDone ? 'todo' : 'done')">
        {{ isDone ? 'Вернуть' : 'Выполнить' }}
      </BaseButton>
      <BaseButton variant="secondary" @click="emit('edit', task)">Изменить</BaseButton>
      <BaseButton variant="danger" @click="emit('delete', task.id)">Удалить</BaseButton>
    </template>
  </BaseCard>
</template>

<style scoped>
.task { border-left: 5px solid #9ca3af; }
.task--low { border-left-color: #22c55e; }
.task--medium { border-left-color: #f59e0b; }
.task--high { border-left-color: #ef4444; }
.task--done .task__title { text-decoration: line-through; color: #9ca3af; }

.task__head { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.task__status { font-size: 12px; padding: 2px 8px; border-radius: 10px; background: #e5e7eb; color: #374151; white-space: nowrap; }
.task__status--in_progress { background: #dbeafe; color: #1d4ed8; }
.task__status--done { background: #dcfce7; color: #15803d; }
.task__desc { margin: 0 0 8px; color: #4b5563; }
.task__meta { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-size: 13px; color: #6b7280; }
.task__selects { display: flex; gap: 12px; flex-wrap: wrap; }
</style>
