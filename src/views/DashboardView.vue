<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {authState} from '../store/auth'
import StatusBadge from '../components/StatusBadge.vue'
import type {Election} from '../types'
import {getElections} from '../api/electionApi'

const elections = ref<Election[]>([])
const loading = ref(false)
const error = ref('')

const activeCount = computed(() => elections.value.filter(e => e.status === 'ACTIVE').length)
const finishedCount = computed(() => elections.value.filter(e => e.status === 'COMPLETED').length)

async function loadDashboard(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    elections.value = await getElections()
  } catch {
    error.value = 'Не удалось загрузить данные личного кабинета.'
  } finally {
    loading.value = false
  }
}
onMounted(loadDashboard)
</script>

<template>
  <section class="page-title">
    <h1>Личный кабинет</h1>
    <p class="muted">Информация о пользователе и голосованиях.</p>
  </section>

  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="loading" class="muted">Загрузка данных...</p>

  <section class="grid grid-3">
    <article class="card stat-card">
      <span class="muted">Текущий пользователь</span>
      <span class="stat-value">{{ authState.user?.username }}</span>
    </article>
    <article class="card stat-card">
      <span class="muted">Активных голосований</span>
      <span class="stat-value">{{ activeCount }}</span>
    </article>
    <article class="card stat-card">
      <span class="muted">Завершенных голосований</span>
      <span class="stat-value">{{ finishedCount }}</span>
    </article>
  </section>

  <section class="card">
    <h2>Последние голосования</h2>
    <div class="simple-list">
      <div v-for="election in elections" :key="election.id" class="list-row">
        <div>
          <strong>{{ election.name }}</strong>
          <p class="muted">{{ election.startDateTime }} — {{ election.endDateTime }}</p>
        </div>
        <StatusBadge :status="election.status"/>
      </div>
    </div>
  </section>
</template>
