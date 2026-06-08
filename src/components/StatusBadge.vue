<script setup lang="ts">
import { computed } from 'vue'
import type { ElectionStatus } from '../types'

type Status =
    | ElectionStatus
    | 'ACTIVE'
    | 'BLOCKED'
    | 'CONFIRMED'
    | 'FAILED'
    | 'VALID'
    | 'INVALID'
    | 'PENDING'
    | string

const props = defineProps<{
  status?: Status | null
}>()

const normalizedStatus = computed(() => {
  return String(props.status ?? 'UNKNOWN').trim().toUpperCase()
})

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
  PENDING: 'Ожидает',
  UNKNOWN: 'Неизвестно'
}

const badgeClass = computed(() => {
  return `badge-${normalizedStatus.value.toLowerCase()}`
})
</script>

<template>
  <span class="badge" :class="badgeClass">
    {{ labels[normalizedStatus] ?? normalizedStatus }}
  </span>
</template>