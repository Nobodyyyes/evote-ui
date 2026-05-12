<script setup lang="ts">
import { computed, ref } from 'vue'
import { elections } from '../data/mock'
import type { ElectionStatus } from '../types'
import StatusBadge from '../components/StatusBadge.vue'

const search = ref('')
const status = ref<'ALL' | ElectionStatus>('ALL')

const filteredElections = computed(() => {
  return elections.filter(election => {
    const matchesSearch = election.title.toLowerCase().includes(search.value.toLowerCase())
    const matchesStatus = status.value === 'ALL' || election.status === status.value
    return matchesSearch && matchesStatus
  })
})
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
      <option value="FINISHED">Завершено</option>
    </select>
  </section>

  <section class="grid grid-2">
    <article v-for="election in filteredElections" :key="election.id" class="card election-card">
      <div class="card-topline">
        <StatusBadge :status="election.status" />
        <span class="muted">{{ election.startsAt }} — {{ election.endsAt }}</span>
      </div>
      <h2>{{ election.title }}</h2>
      <p class="muted">{{ election.description }}</p>
      <div class="actions">
        <RouterLink class="btn btn-secondary" :to="`/elections/${election.id}`">Детали</RouterLink>
        <RouterLink v-if="election.status === 'ACTIVE'" class="btn btn-primary" :to="`/elections/${election.id}/vote`">Голосовать</RouterLink>
        <RouterLink class="btn btn-light" :to="`/elections/${election.id}/results`">Результаты</RouterLink>
      </div>
    </article>
  </section>
</template>
