<script setup lang="ts">
import { elections } from '../../data/mock'
import StatusBadge from '../../components/StatusBadge.vue'

function updateStatus(id: number, status: 'ACTIVE' | 'FINISHED'): void {
  const election = elections.find(item => item.id === id)
  if (!election) return

  const message = status === 'ACTIVE' ? 'Запустить голосование?' : 'Завершить голосование?'
  if (window.confirm(message)) {
    election.status = status
  }
}
</script>

<template>
  <section class="page-title row-title">
    <div>
      <h1>Управление голосованиями</h1>
      <p class="muted">Просмотр, запуск, завершение и публикация результатов.</p>
    </div>
    <RouterLink class="btn btn-primary" to="/admin/elections/create">Создать</RouterLink>
  </section>

  <section class="card table-card">
    <table>
      <thead>
        <tr>
          <th>Название</th>
          <th>Статус</th>
          <th>Даты</th>
          <th>Участники</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="election in elections" :key="election.id">
          <td>{{ election.title }}</td>
          <td><StatusBadge :status="election.status" /></td>
          <td>{{ election.startsAt }} — {{ election.endsAt }}</td>
          <td>{{ election.participants }}</td>
          <td class="table-actions">
            <RouterLink class="btn btn-small btn-light" :to="`/elections/${election.id}`">Просмотр</RouterLink>
            <button class="btn btn-small btn-secondary" @click="updateStatus(election.id, 'ACTIVE')">Запуск</button>
            <button class="btn btn-small btn-secondary" @click="updateStatus(election.id, 'FINISHED')">Завершить</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
