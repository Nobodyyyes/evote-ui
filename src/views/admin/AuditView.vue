<script setup lang="ts">
import { computed, ref } from 'vue'
import { auditEvents } from '../../data/mock'

const search = ref('')

const filteredEvents = computed(() => auditEvents.filter(event => {
  const text = `${event.actor} ${event.action} ${event.description}`.toLowerCase()
  return text.includes(search.value.toLowerCase())
}))
</script>

<template>
  <section class="page-title">
    <h1>Журнал аудита</h1>
    <p class="muted">События системы: пользователь, действие, дата и описание.</p>
  </section>

  <section class="card toolbar">
    <input v-model="search" type="text" placeholder="Фильтр по пользователю, событию или описанию" />
  </section>

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
