<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { AuditEvent, BlockchainRecord, Election, User } from '../../types'
import { getAuditEvents } from '../../api/auditApi'
import { getBlockchainRecords } from '../../api/integrityApi'
import { getElections } from '../../api/electionApi'
import { getUsers } from '../../api/userApi'

const elections = ref<Election[]>([])
const users = ref<User[]>([])
const auditEvents = ref<AuditEvent[]>([])
const blockchainRecords = ref<BlockchainRecord[]>([])
const loading = ref(false)
const error = ref('')

const activeElections = computed(() => elections.value.filter(e => e.status === 'ACTIVE').length)
const scheduledElections = computed(() => elections.value.filter(e => e.status === 'SCHEDULED').length)
const finishedElections = computed(() => elections.value.filter(e => e.status === 'FINISHED').length)

async function loadDashboard(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const [electionsResponse, usersResponse, auditResponse, blockchainResponse] = await Promise.all([
      getElections(),
      getUsers(),
      getAuditEvents(),
      getBlockchainRecords()
    ])

    elections.value = electionsResponse
    users.value = usersResponse
    auditEvents.value = auditResponse
    blockchainRecords.value = blockchainResponse
  } catch {
    error.value = 'Не удалось загрузить данные административной панели.'
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <section class="page-title">
    <h1>Административная панель</h1>
    <p class="muted">Сводка по пользователям, голосованиям, аудиту и blockchain-записям.</p>
  </section>

  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="loading" class="muted">Загрузка административной панели...</p>

  <section class="grid grid-4">
    <article class="card stat-card"><span class="stat-value">{{ users.length }}</span><span class="muted">Пользователей</span></article>
    <article class="card stat-card"><span class="stat-value">{{ activeElections }}</span><span class="muted">Активных</span></article>
    <article class="card stat-card"><span class="stat-value">{{ scheduledElections }}</span><span class="muted">Запланированных</span></article>
    <article class="card stat-card"><span class="stat-value">{{ finishedElections }}</span><span class="muted">Завершенных</span></article>
  </section>

  <section class="grid grid-2">
    <article class="card">
      <h2>Быстрые действия</h2>
      <div class="actions vertical-actions">
        <RouterLink class="btn btn-primary" to="/admin/elections/create">Создать голосование</RouterLink>
        <RouterLink class="btn btn-secondary" to="/admin/integrity">Проверить целостность</RouterLink>
        <RouterLink class="btn btn-light" to="/admin/blockchain">Blockchain-записи: {{ blockchainRecords.length }}</RouterLink>
      </div>
    </article>

    <article class="card">
      <h2>Последние события аудита</h2>
      <div class="simple-list">
        <div v-for="event in auditEvents" :key="event.id" class="list-row">
          <div>
            <strong>{{ event.action }}</strong>
            <p class="muted">{{ event.description }}</p>
          </div>
          <span class="muted">{{ event.createdAt }}</span>
        </div>
      </div>
    </article>
  </section>
</template>
