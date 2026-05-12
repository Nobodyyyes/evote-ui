<script setup lang="ts">
import { computed } from 'vue'
import { auditEvents, blockchainRecords, elections, users } from '../../data/mock'

const activeElections = computed(() => elections.filter(e => e.status === 'ACTIVE').length)
const scheduledElections = computed(() => elections.filter(e => e.status === 'SCHEDULED').length)
const finishedElections = computed(() => elections.filter(e => e.status === 'FINISHED').length)
</script>

<template>
  <section class="page-title">
    <h1>Административная панель</h1>
    <p class="muted">Сводка по пользователям, голосованиям, аудиту и blockchain-записям.</p>
  </section>

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
