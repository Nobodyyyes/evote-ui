<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Election, Id } from '../types'
import { castVote, getElectionById } from '../api/electionApi'

const route = useRoute()
const router = useRouter()
const election = ref<Election | null>(null)
const selectedOptionId = ref<Id | null>(null)
const loading = ref(false)
const sending = ref(false)
const error = ref('')
const success = ref('')

async function loadElection(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    election.value = await getElectionById(String(route.params.id))
  } catch {
    error.value = 'Не удалось загрузить голосование.'
  } finally {
    loading.value = false
  }
}

async function submitVote(): Promise<void> {
  error.value = ''
  success.value = ''

  if (!election.value) return

  if (election.value.voted) {
    error.value = 'Повторное голосование невозможно'
    return
  }

  if (selectedOptionId.value === null) {
    error.value = 'Выберите вариант ответа'
    return
  }

  const isConfirmed = window.confirm('Вы уверены, что хотите отправить голос? Изменить выбор будет нельзя.')
  if (!isConfirmed) return

  sending.value = true
  try {
    await castVote({ electionId: election.value.id, optionId: selectedOptionId.value })
    success.value = 'Голос успешно отправлен. Пользователь определён backend по JWT.'
    setTimeout(() => router.push(`/elections/${election.value?.id}/results`), 700)
  } catch {
    error.value = 'Не удалось отправить голос. Возможно, вы уже участвовали или голосование закрыто.'
  } finally {
    sending.value = false
  }
}

onMounted(loadElection)
</script>

<template>
  <p v-if="loading" class="muted">Загрузка голосования...</p>
  <p v-if="error" class="error-text">{{ error }}</p>

  <section v-if="election" class="card details-card">
    <h1>Подача голоса</h1>
    <p class="muted large-text">{{ election.name }}</p>

    <form class="form" @submit.prevent="submitVote">
      <label v-for="option in election.options" :key="option.id" class="radio-row">
        <input v-model="selectedOptionId" type="radio" :value="option.id" :disabled="election.voted || sending" />
        {{ option.text }}
      </label>

      <p v-if="success" class="success-text">{{ success }}</p>

      <button class="btn btn-primary" type="submit" :disabled="election.voted || sending">
        {{ sending ? 'Отправка...' : 'Отправить голос' }}
      </button>
    </form>
  </section>
</template>
