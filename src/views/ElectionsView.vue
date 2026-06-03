<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Election, ElectionStatus } from '../types'
import StatusBadge from '../components/StatusBadge.vue'
import { getElections } from '../api/election.ts'

const elections = ref<Election[]>([])
const search = ref('')
const status = ref<'ALL' | ElectionStatus>('ALL')
const loading = ref(false)
const error = ref('')

const visibleElections = computed(() => {
  return elections.value.filter(election => {
    if (election.status === 'ACTIVE') {
      return true
    }

    if (election.status === 'COMPLETED') {
      return true
    }

    return false
  })
})

const filteredElections = computed(() => {
  return visibleElections.value.filter(election => {
    const electionName = election.name ?? ''
    const matchesSearch = electionName.toLowerCase().includes(search.value.toLowerCase())
    const matchesStatus = status.value === 'ALL' || election.status === status.value

    return matchesSearch && matchesStatus
  })
})

function canVote(election: Election): boolean {
  return election.status === 'ACTIVE'
}

function canSeeResults(election: Election): boolean {
  return election.status === 'COMPLETED' && election.resultPublished === true
}

function isWaitingForResults(election: Election): boolean {
  return election.status === 'COMPLETED' && election.resultPublished !== true
}

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
    <p class="muted">
      Здесь отображаются активные голосования и завершенные голосования с результатами.
    </p>
  </section>

  <section class="card toolbar">
    <input v-model="search" type="text" placeholder="Поиск по названию" />

    <select v-model="status">
      <option value="ALL">Все доступные</option>
      <option value="ACTIVE">Активные</option>
      <option value="COMPLETED">Завершенные</option>
    </select>
  </section>

  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="loading" class="muted">Загрузка голосований...</p>

  <section class="grid grid-2">
    <article
        v-for="election in filteredElections"
        :key="election.id"
        class="card election-card"
    >
      <div class="card-topline">
        <StatusBadge :status="election.status" />
        <span class="muted">
          {{ election.startDateTime }} — {{ election.endDateTime }}
        </span>
      </div>

      <h2>{{ election.name }}</h2>
      <p class="muted">{{ election.description }}</p>

      <div v-if="canVote(election)" class="info-box info-active">
        Голосование активно. Вы можете отдать свой голос.
      </div>

      <div v-else-if="canSeeResults(election)" class="info-box info-success">
        Голосование завершено. Результаты опубликованы.
      </div>

      <div v-else-if="isWaitingForResults(election)" class="info-box info-warning">
        Голосование завершено. Результаты пока не опубликованы администратором.
      </div>

      <div class="actions">
        <RouterLink
            class="btn btn-secondary"
            :to="`/elections/${election.id}`"
        >
          Детали
        </RouterLink>

        <RouterLink
            v-if="canVote(election)"
            class="btn btn-primary"
            :to="`/elections/${election.id}/vote`"
        >
          Голосовать
        </RouterLink>

        <RouterLink
            v-if="canSeeResults(election)"
            class="btn btn-light"
            :to="`/elections/${election.id}/results`"
        >
          Результаты
        </RouterLink>

        <button
            v-else-if="isWaitingForResults(election)"
            class="btn btn-light"
            type="button"
            disabled
        >
          Результаты ожидаются
        </button>
      </div>
    </article>
  </section>

  <section
      v-if="!loading && filteredElections.length === 0"
      class="card empty-state"
  >
    <h3>Голосования не найдены</h3>
    <p class="muted">
      Сейчас нет активных голосований или опубликованных результатов.
    </p>
  </section>
</template>