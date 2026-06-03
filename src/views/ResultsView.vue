<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useRoute} from 'vue-router'
import type {ElectionResult, ElectionResultOption} from '../types'
import {getElectionResults} from '../api/election.ts'

const route = useRoute()
const result = ref<ElectionResult | null>(null)
const loading = ref(false)
const error = ref('')

const totalVotes = computed(() => result.value?.totalVotes ?? 0)

function percent(option: ElectionResultOption): number {
  if (option.percentage > 0) return Math.round(option.percentage)
  if (totalVotes.value === 0) return 0
  return Math.round((option.votesCount / totalVotes.value) * 100)
}

async function loadResults(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    result.value = await getElectionResults(String(route.params.id))
  } catch {
    error.value = 'Не удалось загрузить результаты. Возможно, голосование еще не завершено или результаты не рассчитаны.'
  } finally {
    loading.value = false
  }
}

onMounted(loadResults)
</script>

<template>
  <p v-if="loading" class="muted">Подсчет результатов...</p>
  <p v-if="error" class="error-text">{{ error }}</p>

  <section v-if="result" class="card details-card">
    <h1>Результаты</h1>
    <p class="muted large-text">{{ result.electionTitle }}</p>
    <p><strong>Количество участников:</strong> {{ result.totalVotes }}</p>
    <p><strong>Дата расчета:</strong> {{ result.calculatedAt || '-' }}</p>

    <div class="result-list">
      <div v-for="option in result.optionResults" :key="option.optionId" class="result-row">
        <div class="result-header">
          <strong>{{ option.optionText }}</strong>
          <span>{{ option.votesCount }} голосов / {{ percent(option) }}%</span>
        </div>
        <div class="progress">
          <div class="progress-fill" :style="{ width: `${percent(option)}%` }"></div>
        </div>
      </div>
    </div>
  </section>
</template>
