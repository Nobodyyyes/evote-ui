<script setup lang="ts">
import { computed } from 'vue'
import { elections } from '../data/mock'
import { authState } from '../store/auth'
import StatusBadge from '../components/StatusBadge.vue'

const activeCount = computed(() => elections.filter(e => e.status === 'ACTIVE').length)
const finishedCount = computed(() => elections.filter(e => e.status === 'FINISHED').length)
</script>

<template>
  <section class="page-title">
    <h1>Личный кабинет</h1>
    <p class="muted">Краткая информация о пользователе и доступных голосованиях.</p>
  </section>

  <section class="grid grid-3">
    <article class="card stat-card">
      <span class="stat-value">{{ authState.user?.fullName }}</span>
      <span class="muted">Текущий пользователь</span>
    </article>
    <article class="card stat-card">
      <span class="stat-value">{{ activeCount }}</span>
      <span class="muted">Активных голосований</span>
    </article>
    <article class="card stat-card">
      <span class="stat-value">{{ finishedCount }}</span>
      <span class="muted">Завершенных голосований</span>
    </article>
  </section>

  <section class="card">
    <h2>Последние голосования</h2>
    <div class="simple-list">
      <div v-for="election in elections" :key="election.id" class="list-row">
        <div>
          <strong>{{ election.title }}</strong>
          <p class="muted">Участников: {{ election.participants }}</p>
        </div>
        <StatusBadge :status="election.status" />
      </div>
    </div>
  </section>
</template>
