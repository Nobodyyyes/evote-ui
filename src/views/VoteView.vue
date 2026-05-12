<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { elections } from '../data/mock'

const route = useRoute()
const router = useRouter()
const election = computed(() => elections.find(item => item.id === Number(route.params.id)))
const selectedOptionId = ref<number | null>(null)
const error = ref('')
const success = ref('')

function submitVote(): void {
  error.value = ''
  success.value = ''

  if (!election.value) return

  if (election.value.voted) {
    error.value = 'Повторное голосование невозможно'
    return
  }

  if (!selectedOptionId.value) {
    error.value = 'Выберите вариант ответа'
    return
  }

  const isConfirmed = window.confirm('Вы уверены, что хотите отправить голос? Изменить выбор будет нельзя.')
  if (!isConfirmed) return

  const option = election.value.options.find(item => item.id === selectedOptionId.value)
  if (option) option.votes += 1

  election.value.voted = true
  election.value.participants += 1
  success.value = 'Голос успешно отправлен. Сформирован контрольный voteHash.'

  setTimeout(() => router.push(`/elections/${election.value?.id}/results`), 700)
}
</script>

<template>
  <section v-if="election" class="card details-card">
    <h1>Подача голоса</h1>
    <p class="muted large-text">{{ election.title }}</p>

    <form class="form" @submit.prevent="submitVote">
      <label v-for="option in election.options" :key="option.id" class="radio-row">
        <input v-model="selectedOptionId" type="radio" :value="option.id" :disabled="election.voted" />
        {{ option.text }}
      </label>

      <p v-if="error" class="error-text">{{ error }}</p>
      <p v-if="success" class="success-text">{{ success }}</p>

      <button class="btn btn-primary" type="submit" :disabled="election.voted">
        Отправить голос
      </button>
    </form>
  </section>
</template>
