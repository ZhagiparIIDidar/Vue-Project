<script setup>
defineProps({
  variant: { type: String, default: 'primary' } // primary | danger | success | secondary
})
</script>

<template>
  <button class="btn" :class="`btn--${variant}`">
    <slot />
  </button>
</template>

<style scoped>
.btn { padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; color: #fff; font: inherit; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--primary { background: #3b82f6; }
.btn--danger { background: #ef4444; }
.btn--success { background: #22c55e; }
.btn--secondary { background: #6b7280; }
</style>