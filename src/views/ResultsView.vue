<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Election } from '../types'
import { getElectionResults } from '../api/electionApi'

const route = useRoute()
const election = ref<Election | null>(null)
const loading = ref(false)
const error = ref('')
const totalVotes = computed(() => election.value?.options.reduce((sum, option) => sum + option.votes, 0) ?? 0)

function percent(votes: number): number {
  if (totalVotes.value === 0) return 0
  return Math.round((votes / totalVotes.value) * 100)
}

async function loadResults(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    election.value = await getElectionResults(String(route.params.id))
  } catch {
    error.value = 'Не удалось загрузить результаты.'
  } finally {
    loading.value = false
  }
}

onMounted(loadResults)
</script>

<template>
  <p v-if="loading" class="muted">Загрузка результатов...</p>
  <p v-if="error" class="error-text">{{ error }}</p>

  <section v-if="election" class="card details-card">
    <h1>Результаты</h1>
    <p class="muted large-text">{{ election.title }}</p>
    <p><strong>Количество участников:</strong> {{ election.participants }}</p>
    <p><strong>Дата завершения:</strong> {{ election.endsAt }}</p>

    <div class="result-list">
      <div v-for="option in election.options" :key="option.id" class="result-row">
        <div class="result-header">
          <strong>{{ option.text }}</strong>
          <span>{{ option.votes }} голосов / {{ percent(option.votes) }}%</span>
        </div>
        <div class="progress">
          <div class="progress-fill" :style="{ width: `${percent(option.votes)}%` }"></div>
        </div>
      </div>
    </div>

    <div class="info-box">
      <p><strong>resultHash:</strong> {{ election.resultHash }}</p>
      <p><strong>voteHash:</strong> {{ election.voteHash }}</p>
    </div>

    <RouterLink class="btn btn-secondary" to="/admin/integrity">Перейти к проверке целостности</RouterLink>
  </section>
</template>
