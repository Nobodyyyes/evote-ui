<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Election, Id } from '../../types'
import {
  calculateElectionResults,
  deleteElectionApi,
  getElections,
  publishElection,
  publishElectionResults
} from '../../api/electionApi'
import StatusBadge from '../../components/StatusBadge.vue'

const elections = ref<Election[]>([])
const loading = ref(false)
const error = ref('')
const message = ref('')

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

async function publish(electionId: Id): Promise<void> {
  if (!window.confirm('Опубликовать голосование? После публикации варианты ответа нельзя будет менять.')) return

  try {
    await publishElection(electionId)
    message.value = 'Голосование опубликовано. Backend перевел его в статус SCHEDULED.'
    await loadElections()
  } catch {
    error.value = 'Не удалось опубликовать голосование.'
  }
}

async function calculateResults(electionId: Id): Promise<void> {
  if (!window.confirm('Рассчитать результаты голосования?')) return

  try {
    await calculateElectionResults(electionId)
    message.value = 'Результаты рассчитаны.'
  } catch {
    error.value = 'Не удалось рассчитать результаты. Голосование должно быть завершено backend-ом.'
  }
}

async function publishResults(electionId: Id): Promise<void> {
  if (!window.confirm('Опубликовать результаты голосования?')) return

  try {
    await publishElectionResults(electionId)
    message.value = 'Результаты опубликованы.'
    await loadElections()
  } catch {
    error.value = 'Не удалось опубликовать результаты.'
  }
}

async function deleteElection(electionId: string): Promise<void> {
  if (!window.confirm('Вы действительно хотите удалить голосование?')) return

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
      <p class="muted">Создание, публикация, расчет и публикация результатов.</p>
    </div>
    <RouterLink class="btn btn-primary" to="/admin/elections/create">Создать</RouterLink>
  </section>

  <p v-if="message" class="success-text">{{ message }}</p>
  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="loading" class="muted">Загрузка голосований...</p>

  <section class="card table-card">
    <table>
      <thead>
        <tr>
          <th>Название</th>
          <th>Статус</th>
          <th>Даты</th>
          <th>Тип доступа</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="election in elections" :key="election.id">
          <td>{{ election.name }}</td>
          <td><StatusBadge :status="election.status" /></td>
          <td>{{ election.startDateTime }} — {{ election.endDateTime }}</td>
          <td>{{ election.accessElectionType }}</td>
          <td class="table-actions">
            <RouterLink class="btn btn-small btn-light" :to="`/elections/${election.id}`">Просмотр</RouterLink>
            <button v-if="election.status === 'DRAFT'" class="btn btn-small btn-secondary" @click="publish(election.id)">Опубликовать</button>
            <button v-if="election.status === 'COMPLETED'" class="btn btn-small btn-secondary" @click="calculateResults(election.id)">Рассчитать</button>
            <button v-if="election.status === 'COMPLETED'" class="btn btn-small btn-secondary" @click="publishResults(election.id)">Опубликовать результаты</button>
            <button class="btn btn-small btn-secondary" @click="deleteElection(election.id)">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
