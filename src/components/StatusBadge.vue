<script setup lang="ts">
import type { ElectionStatus } from '../types'

defineProps<{
  status: ElectionStatus | 'ACTIVE' | 'BLOCKED' | 'VALID' | 'INVALID' | 'PENDING'
}>()

const labels: Record<string, string> = {
  DRAFT: 'Черновик',
  SCHEDULED: 'Запланировано',
  ACTIVE: 'Активно',
  FINISHED: 'Завершено',
  BLOCKED: 'Заблокирован',
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
