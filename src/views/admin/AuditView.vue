<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AuditEvent } from '../../types'
import { getAuditEvents } from '../../api/auditApi'

const auditEvents = ref<AuditEvent[]>([])
const search = ref('')
const objectType = ref('ELECTION')
const objectId = ref('')
const loading = ref(false)
const error = ref('')

const filteredEvents = computed(() => auditEvents.value.filter(event => {
  const text = `${event.actor} ${event.action} ${event.description}`.toLowerCase()
  return text.includes(search.value.toLowerCase())
}))

async function loadAuditEvents(): Promise<void> {
  if (!objectType.value.trim() || !objectId.value.trim()) {
    error.value = 'Укажите objectType и objectId. Текущий backend отдает аудит только по конкретному объекту.'
    auditEvents.value = []
    return
  }

  loading.value = true
  error.value = ''

  try {
    auditEvents.value = await getAuditEvents({ objectType: objectType.value.trim(), objectId: objectId.value.trim() })
  } catch {
    error.value = 'Не удалось загрузить журнал аудита.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="page-title">
    <h1>Журнал аудита</h1>
    <p class="muted">Backend ищет аудит по objectType и objectId.</p>
  </section>

  <section class="card toolbar audit-toolbar">
    <select v-model="objectType">
      <option value="ELECTION">ELECTION</option>
      <option value="USER">USER</option>
      <option value="RESULT">RESULT</option>
      <option value="BLOCKCHAIN_RECORD">BLOCKCHAIN_RECORD</option>
    </select>
    <input v-model="objectId" type="text" placeholder="UUID объекта" />
    <input v-model="search" type="text" placeholder="Фильтр по пользователю, событию или описанию" />
    <button class="btn btn-primary" type="button" @click="loadAuditEvents">Загрузить</button>
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
