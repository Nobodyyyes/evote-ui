<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { elections } from '../data/mock'
import StatusBadge from '../components/StatusBadge.vue'

const route = useRoute()
const election = computed(() => elections.find(item => item.id === Number(route.params.id)))
</script>

<template>
  <section v-if="election" class="card details-card">
    <div class="card-topline">
      <StatusBadge :status="election.status" />
      <span class="muted">{{ election.startsAt }} — {{ election.endsAt }}</span>
    </div>

    <h1>{{ election.title }}</h1>
    <p class="muted large-text">{{ election.description }}</p>

    <h2>Варианты ответа</h2>
    <ul class="option-list">
      <li v-for="option in election.options" :key="option.id">{{ option.text }}</li>
    </ul>

    <div class="info-box">
      <strong>Возможность участия:</strong>
      <span v-if="election.status === 'ACTIVE' && !election.voted"> можно проголосовать</span>
      <span v-else-if="election.voted"> голос уже отправлен</span>
      <span v-else> голосование сейчас недоступно</span>
    </div>

    <div class="actions">
      <RouterLink v-if="election.status === 'ACTIVE' && !election.voted" class="btn btn-primary" :to="`/elections/${election.id}/vote`">Проголосовать</RouterLink>
      <RouterLink class="btn btn-light" :to="`/elections/${election.id}/results`">Посмотреть результаты</RouterLink>
    </div>
  </section>

  <section v-else class="card empty-state">
    <h1>Голосование не найдено</h1>
    <RouterLink class="btn btn-secondary" to="/elections">Вернуться к списку</RouterLink>
  </section>
</template>
