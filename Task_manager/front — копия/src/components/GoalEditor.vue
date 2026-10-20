<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },   // текущий текст цели
  label: { type: String, required: true },
  placeholder: { type: String, default: 'Цель не задана' }
})
const emit = defineEmits(['save'])

const editing = ref(false)
const draft = ref('')

function start() {
  draft.value = props.modelValue
  editing.value = true
}
function save() {
  emit('save', draft.value) // пустой текст = удалить цель
  editing.value = false
}
function cancel() {
  editing.value = false
}
</script>

<template>
  <div class="goal">
    <div class="goal__label">{{ label }}</div>

    <template v-if="!editing">
      <p class="goal__text" :class="{ 'goal__text--empty': !modelValue }">
        {{ modelValue || placeholder }}
      </p>
      <BaseButton variant="secondary" @click="start">
        {{ modelValue ? 'Изменить' : 'Задать' }}
      </BaseButton>
    </template>

    <template v-else>
      <textarea
        v-model="draft"
        rows="2"
        class="goal__input"
        @keydown.ctrl.enter="save"
        @keydown.esc="cancel"
      />
      <div class="goal__actions">
        <BaseButton @click="save">Сохранить</BaseButton>
        <BaseButton variant="secondary" @click="cancel">Отмена</BaseButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.goal { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
.goal__label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; }
.goal__text { margin: 0; overflow-wrap: anywhere; }
.goal__text--empty { color: #9ca3af; }
.goal__input { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font: inherit; }
.goal__actions { display: flex; gap: 8px; }
</style>
