<script setup>
import { useRoute } from 'vue-router'
import { today, monthKey } from './utils/date.js'

const route = useRoute()
const isActive = name => route.name === name
</script>

<template>
  <div class="app">
    <header class="app__header">
      <h1>Менеджер задач</h1>
      <nav class="app__nav">
        <RouterLink :class="{ 'is-active': isActive('week') }" :to="{ name: 'week', params: { date: today() } }">
          Неделя
        </RouterLink>
        <RouterLink :class="{ 'is-active': isActive('month') }" :to="{ name: 'month', params: { ym: monthKey(today()) } }">
          Месяцы
        </RouterLink>
        <RouterLink :class="{ 'is-active': isActive('day') }" :to="{ name: 'day', params: { date: today() } }">
          Сегодня
        </RouterLink>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
body { margin: 0; background: #f3f4f6; font-family: system-ui, sans-serif; color: #111827; }
.app { max-width: 1200px; margin: 0 auto; padding: 20px; }
.app__header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.app__header h1 { margin: 0; font-size: 28px; }
.app__nav { display: flex; gap: 8px; }
.app__nav a { padding: 6px 14px; border-radius: 6px; text-decoration: none; color: #374151; background: #fff; border: 1px solid #e5e7eb; }
.app__nav a.is-active { background: #3b82f6; border-color: #3b82f6; color: #fff; }
main > * + * { margin-top: 16px; }
</style>
