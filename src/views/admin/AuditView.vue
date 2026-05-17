<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { AuditEvent } from '../../types'
import { getAuditEvents } from '../../api/auditApi'

const auditEvents = ref<AuditEvent[]>([])
const search = ref('')
const loading = ref(false)
const error = ref('')

const filteredEvents = computed(() => auditEvents.value.filter(event => {
  const text = `${event.actor} ${event.action} ${event.description}`.toLowerCase()
  return text.includes(search.value.toLowerCase())
}))

async function loadAuditEvents(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    auditEvents.value = await getAuditEvents()
  } catch {
    error.value = 'Не удалось загрузить журнал аудита.'
  } finally {
    loading.value = false
  }
}

onMounted(loadAuditEvents)
</script>

<template>
  <section class="page-title">
    <h1>Журнал аудита</h1>
    <p class="muted">События системы: пользователь, действие, дата и описание.</p>
  </section>

  <section class="card toolbar">
    <input v-model="search" type="text" placeholder="Фильтр по пользователю, событию или описанию" />
  </section>

  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="loading" class="muted">Загрузка аудита...</p>

  <section class="card table-card">
    <table>
      <thead>
        <tr>
          <th>Дата</th>
          <th>Пользователь</th>
          <th>Действие</th>
          <th>Описание</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="event in filteredEvents" :key="event.id">
          <td>{{ event.createdAt }}</td>
          <td>{{ event.actor }}</td>
          <td>{{ event.action }}</td>
          <td>{{ event.description }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
