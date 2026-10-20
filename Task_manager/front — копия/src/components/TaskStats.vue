<script setup>
defineProps({
  // { total, todo, inProgress, done, progress } — см. getStats() в useTasks
  stats: { type: Object, required: true },
  title: { type: String, default: 'Статистика' }
})
</script>

<template>
  <BaseCard>
    <template #header>{{ title }}</template>

    <div class="stats">
      <div class="stats__item">
        <span class="stats__value">{{ stats.total }}</span>
        <span class="stats__label">Всего</span>
      </div>
      <div class="stats__item">
        <span class="stats__value">{{ stats.todo }}</span>
        <span class="stats__label">К выполнению</span>
      </div>
      <div class="stats__item">
        <span class="stats__value stats__value--active">{{ stats.inProgress }}</span>
        <span class="stats__label">В работе</span>
      </div>
      <div class="stats__item">
        <span class="stats__value stats__value--done">{{ stats.done }}</span>
        <span class="stats__label">Выполнено</span>
      </div>
    </div>

    <div class="progress">
      <div class="progress__bar" :style="{ width: stats.progress + '%' }" />
    </div>
    <div class="progress__text">Выполнено: {{ stats.progress }}%</div>
  </BaseCard>
</template>

<style scoped>
.stats { display: flex; justify-content: space-around; text-align: center; flex-wrap: wrap; gap: 8px; }
.stats__item { display: flex; flex-direction: column; }
.stats__value { font-size: 28px; font-weight: 700; }
.stats__value--active { color: #3b82f6; }
.stats__value--done { color: #22c55e; }
.stats__label { font-size: 13px; color: #6b7280; }

.progress { height: 8px; background: #e5e7eb; border-radius: 4px; margin-top: 12px; overflow: hidden; }
.progress__bar { height: 100%; background: #22c55e; transition: width 0.3s; }
.progress__text { font-size: 12px; color: #6b7280; margin-top: 4px; text-align: right; }
</style>
