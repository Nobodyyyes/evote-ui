<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import type {AuditEvent, BlockchainRecord, Election, User} from '../../types'
import {getAuditEvents} from '../../api/audit.ts'
import {getBlockchainRecords} from '../../api/integrityApi'
import {getElections} from '../../api/election.ts'
import {getUsers} from '../../api/user.ts'

const elections = ref<Election[]>([])
const users = ref<User[]>([])
const auditEvents = ref<AuditEvent[]>([])
const blockchainRecords = ref<BlockchainRecord[]>([])
const loading = ref(false)
const error = ref('')

const activeElections = computed(() => elections.value.filter(e => e.status === 'ACTIVE').length)
const scheduledElections = computed(() => elections.value.filter(e => e.status === 'SCHEDULED').length)
const finishedElections = computed(() => elections.value.filter(e => e.status === 'COMPLETED').length)

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
  <div class="admin-page">
    <section class="page-title admin-page-title">
      <h1>Административная панель</h1>
      <p class="muted">
        Сводка по пользователям, голосованиям, аудиту и blockchain-записям.
      </p>
    </section>

    <div class="admin-state-block">
      <p v-if="error" class="error-text">{{ error }}</p>
      <p v-if="loading" class="muted">Загрузка административной панели...</p>
    </div>

    <section class="grid grid-4 admin-stats-grid">
      <article class="card stat-card">
        <span class="muted">Пользователей</span>
        <span class="stat-value">{{ users.length }}</span>
      </article>

      <article class="card stat-card">
        <span class="muted">Активных голосований</span>
        <span class="stat-value">{{ activeElections }}</span>
      </article>

      <article class="card stat-card">
        <span class="muted">Запланированных голосований</span>
        <span class="stat-value">{{ scheduledElections }}</span>
      </article>

      <article class="card stat-card">
        <span class="muted">Завершенных голосований</span>
        <span class="stat-value">{{ finishedElections }}</span>
      </article>
    </section>

    <section class="admin-section">
      <div class="admin-section-header">
        <h2>Разделы администрирования</h2>
        <p class="muted">Быстрый переход к основным функциям администратора.</p>
      </div>

      <div class="admin-block-grid">
        <RouterLink class="admin-block-card" to="/admin/elections/create">
          <div class="admin-block-icon">＋</div>
          <h3>Создание голосования</h3>
          <p>Создание нового голосования, указание даты, типа доступа и вариантов ответа.</p>
        </RouterLink>

        <RouterLink class="admin-block-card" to="/admin/elections">
          <div class="admin-block-icon">🗳</div>
          <h3>Управление голосованиями</h3>
          <p>Просмотр, запуск, завершение, удаление и управление статусами голосований.</p>
        </RouterLink>

        <RouterLink class="admin-block-card" to="/admin/blockchain">
          <div class="admin-block-icon">⛓</div>
          <h3>Blockchain-записи</h3>
          <p>Просмотр blockchain-записей и контрольных хэшей системы.</p>
        </RouterLink>

        <RouterLink class="admin-block-card" to="/admin/users">
          <div class="admin-block-icon">👥</div>
          <h3>Управление пользователями</h3>
          <p>Просмотр пользователей, ролей, статусов и ограничений доступа.</p>
        </RouterLink>

        <RouterLink class="admin-block-card" to="/admin/audit">
          <div class="admin-block-icon">📋</div>
          <h3>Журнал аудита</h3>
          <p>Просмотр действий пользователей и системных событий.</p>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
