<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Election, ElectionStatus } from '../types'
import StatusBadge from '../components/StatusBadge.vue'
import { getElections } from '../api/electionApi'

const elections = ref<Election[]>([])
const search = ref('')
const status = ref<'ALL' | ElectionStatus>('ALL')
const loading = ref(false)
const error = ref('')

const filteredElections = computed(() => {
  return elections.value.filter(election => {
    const matchesSearch = election.name.toLowerCase().includes(search.value.toLowerCase())
    const matchesStatus = status.value === 'ALL' || election.status === status.value
    return matchesSearch && matchesStatus
  })
})

async function loadElections(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    elections.value = await getElections()
  } catch {
    error.value = 'Не удалось загрузить список голосований.'
  } finally {
    loading.value = false
  }
}

onMounted(loadElections)
</script>

<template>
  <section class="page-title">
    <h1>Голосования</h1>
    <p class="muted">Список голосований с поиском и фильтрацией по статусу.</p>
  </section>

  <section class="card toolbar">
    <input v-model="search" type="text" placeholder="Поиск по названию" />
    <select v-model="status">
      <option value="ALL">Все статусы</option>
      <option value="DRAFT">Черновик</option>
      <option value="SCHEDULED">Запланировано</option>
      <option value="ACTIVE">Активно</option>
      <option value="COMPLETED">Завершено</option>
      <option value="CANCELED">Отменено</option>
    </select>
  </section>

  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="loading" class="muted">Загрузка голосований...</p>

  <section class="grid grid-2">
    <article v-for="election in filteredElections" :key="election.id" class="card election-card">
      <div class="card-topline">
        <StatusBadge :status="election.status" />
        <span class="muted">{{ election.startDateTime }} — {{ election.endDateTime }}</span>
      </div>
      <h2>{{ election.name }}</h2>
      <p class="muted">{{ election.description }}</p>
      <div class="actions">
        <RouterLink class="btn btn-secondary" :to="`/elections/${election.id}`">Детали</RouterLink>
        <RouterLink v-if="election.status === 'ACTIVE'" class="btn btn-primary" :to="`/elections/${election.id}/vote`">Голосовать</RouterLink>
        <RouterLink class="btn btn-light" :to="`/elections/${election.id}/results`">Результаты</RouterLink>
      </div>
    </article>
  </section>
</template>
