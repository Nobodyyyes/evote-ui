<script setup lang="ts">
import {onMounted, ref} from 'vue'
import type {Election, Id} from '../../types'
import {deleteElectionApi, getElections, updateElectionStatus} from '../../api/electionApi'
import StatusBadge from '../../components/StatusBadge.vue'

const elections = ref<Election[]>([])
const loading = ref(false)
const error = ref('')

async function loadElections(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    elections.value = await getElections()
  } catch {
    error.value = 'Не удалось загрузить голосования.'
  } finally {
    loading.value = false
  }
}

async function updateStatus(electionId: Id, status: 'ACTIVE' | 'FINISHED'): Promise<void> {
  const message = status === 'ACTIVE' ? 'Запустить голосование?' : 'Завершить голосование?'
  if (!window.confirm(message)) return

  try {
    await updateElectionStatus(electionId, status)
    await loadElections()
  } catch {
    error.value = 'Не удалось изменить статус голосования.'
  }
}

async function deleteElection(electionId: string): Promise<void> {
  const confirmed = window.confirm('Вы действительно хотите удалить голосование?')

  if (!confirmed) {
    return
  }

  try {
    await deleteElectionApi(electionId)
    await loadElections()
  } catch {
    error.value = 'Не удалось удалить голосование.'
  }
}

onMounted(loadElections)
</script>

<template>
  <section class="page-title row-title">
    <div>
      <h1>Управление голосованиями</h1>
      <p class="muted">Просмотр, запуск, завершение и публикация результатов.</p>
    </div>
    <RouterLink class="btn btn-primary" to="/admin/elections/create">Создать</RouterLink>
  </section>

  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="loading" class="muted">Загрузка голосований...</p>

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
        <td>{{ election.name }}</td>
        <td>
          <StatusBadge :status="election.status"/>
        </td>
        <td>{{ election.startDateTime }} — {{ election.endDateTime }}</td>
        <td>{{ election.participants }}</td>
        <td class="table-actions">
          <RouterLink class="btn btn-small btn-light" :to="`/elections/${election.id}`">Просмотр</RouterLink>
          <button class="btn btn-small btn-secondary" @click="updateStatus(election.id, 'ACTIVE')">Запуск</button>
          <button class="btn btn-small btn-secondary" @click="updateStatus(election.id, 'FINISHED')">Завершить</button>
          <button class="btn btn-small btn-secondary" @click="deleteElection(election.id)">Удалить</button>
        </td>
      </tr>
      </tbody>
    </table>
  </section>
</template>
