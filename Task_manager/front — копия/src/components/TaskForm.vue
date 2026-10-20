<!--
BaseButton не объявляет type и disabled как props, поэтому они
пробрасываются на корневой <button> (fallthrough-атрибуты).
-->
<script setup>
import { reactive, computed, watch } from 'vue'
import { PRIORITIES } from '../constants.js'

const props = defineProps({
  editingTask: { type: Object, default: null },
  defaultDate: { type: String, required: true } // день, на котором открыта страница
})


const emit = defineEmits(['submit', 'cancel'])

const form = reactive({ title: '', description: '', priority: 'medium', date: props.defaultDate })

const isEditing = computed(() => props.editingTask !== null)
const submitLabel = computed(() => (isEditing.value ? 'Сохранить' : 'Добавить'))
const isValid = computed(() => form.title.trim().length > 0 && form.date !== '')

function resetForm() {
  form.title = ''
  form.description = ''
  form.priority = 'medium'
  form.date = props.defaultDate
}

watch(
  () => props.editingTask,
  task => {
    if (task) {
      form.title = task.title
      form.description = task.description
      form.priority = task.priority
      form.date = task.date
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// при смене дня на странице (не в режиме редактирования) подставляем новую дату
watch(
  () => props.defaultDate,
  d => { if (!isEditing.value) form.date = d }
)

function onSubmit() {
  if (!isValid.value) return
  emit('submit', {
    title: form.title.trim(),
    description: form.description.trim(),
    priority: form.priority,
    date: form.date
  })
  if (!isEditing.value) resetForm()
}
</script>

<template>
  <BaseCard>
    <template #header>{{ isEditing ? 'Редактирование задачи' : 'Новая задача' }}</template>

    <form class="form" @submit.prevent="onSubmit">
      <input v-model="form.title" type="text" placeholder="Название задачи *" class="form__input" />
      <textarea v-model="form.description" rows="3" placeholder="Описание" class="form__input" />

      <div class="form__row">
        <select v-model="form.priority" class="form__input">
          <option v-for="p in PRIORITIES" :key="p.value" :value="p.value">{{ p.label }} приоритет</option>
        </select>
        <input v-model="form.date" type="date" class="form__input" required />
      </div>

      <div class="form__actions">
        <BaseButton type="submit" :disabled="!isValid">{{ submitLabel }}</BaseButton>
        <BaseButton v-if="isEditing" type="button" variant="secondary" @click="emit('cancel')">
          Отмена
        </BaseButton>
      </div>
    </form>
  </BaseCard>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: 8px; }
.form__row { display: flex; gap: 8px; }
.form__row .form__input { flex: 1; }
.form__input { padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font: inherit; }
.form__actions { display: flex; gap: 8px; }
</style>
