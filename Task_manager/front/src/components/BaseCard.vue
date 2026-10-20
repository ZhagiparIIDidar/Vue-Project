<template>
  <div class="card">
    <header v-if="$slots.header" class="card__header">
      <slot name="header" />
    </header>

    <div class="card__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="card__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #fff; }
.card__header { font-weight: 600; margin-bottom: 8px; }
.card__footer { margin-top: 10px; display: flex; gap: 8px; }
</style>