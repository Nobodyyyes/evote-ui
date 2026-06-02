<script setup lang="ts">
import type { ElectionStatus } from '../types'

defineProps<{
  status: ElectionStatus | 'ACTIVE' | 'BLOCKED' | 'CONFIRMED' | 'FAILED' | 'VALID' | 'INVALID' | 'PENDING'
}>()

const labels: Record<string, string> = {
  DRAFT: 'Черновик',
  SCHEDULED: 'Запланировано',
  ACTIVE: 'Активно',
  COMPLETED: 'Завершено',
  CANCELED: 'Отменено',
  FINISHED: 'Завершено',
  BLOCKED: 'Заблокирован',
  CONFIRMED: 'Подтверждено',
  FAILED: 'Ошибка',
  VALID: 'Проверено',
  INVALID: 'Ошибка',
  PENDING: 'Ожидает'
}
</script>

<template>
  <span class="badge" :class="`badge-${status.toLowerCase()}`">
    {{ labels[status] ?? status }}
  </span>
</template>
