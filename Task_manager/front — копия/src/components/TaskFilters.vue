<script setup>
import { computed } from 'vue'
import { PRIORITIES, STATUSES } from '../constants.js'

const props = defineProps({
  search: { type: String, default: '' },
  priority: { type: String, default: 'all' }, // all | low | medium | high
  status: { type: String, default: 'all' }    // all | todo | in_progress | done
})

const emit = defineEmits(['update:search', 'update:priority', 'update:status', 'reset'])

const hasActiveFilters = computed(
  () => props.search !== '' || props.priority !== 'all' || props.status !== 'all'
)
</script>

<template>
  <BaseCard>
    <template #header>Поиск и фильтры</template>

    <div class="filters">
      <input
        type="search"
        class="filters__input"
        placeholder="Поиск по названию и описанию..."
        :value="search"
        @input="emit('update:search', $event.target.value)"
      />

      <select class="filters__input" :value="priority" @change="emit('update:priority', $event.target.value)">
        <option value="all">Все приоритеты</option>
        <option v-for="p in PRIORITIES" :key="p.value" :value="p.value">{{ p.label }}</option>
      </select>

      <select class="filters__input" :value="status" @change="emit('update:status', $event.target.value)">
        <option value="all">Все статусы</option>
        <option v-for="s in STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>

      <BaseButton v-if="hasActiveFilters" type="button" variant="secondary" @click="emit('reset')">
        Сбросить
      </BaseButton>
    </div>
  </BaseCard>
</template>

<style scoped>
.filters { display: flex; flex-wrap: wrap; gap: 8px; }
.filters__input { padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font: inherit; }
.filters__input[type='search'] { flex: 1 1 200px; }
</style>
