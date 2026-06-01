<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {getElections} from '../api/electionApi'
import {authState} from '../store/auth'
import type {Election} from '../types'
import {formatDateTime} from "../utils/date.ts"
import {formatRole} from '../utils/labels'

const elections = ref<Election[]>([])
const loading = ref(false)
const error = ref('')
const votedElections = computed(() => elections.value.filter(e => e.voted))

async function loadProfileData(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    elections.value = await getElections()
  } catch {
    error.value = 'Не удалось загрузить историю участия.'
  } finally {
    loading.value = false
  }
}

onMounted(loadProfileData)
</script>

<template>
  <section class="page-title">
    <h1>Профиль</h1>
    <p class="muted">Данные текущего пользователя.</p>
  </section>

  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="loading" class="muted">Загрузка профиля...</p>

  <section class="grid grid-2">
    <article class="card">
      <h2>Основная информация</h2>
      <p><strong>Пользователь:</strong> {{ authState.user?.firstname }} {{ authState.user?.name }}</p>
      <p><strong>Логин:</strong> {{ authState.user?.username }}</p>
      <p><strong>Email:</strong> {{ authState.user?.email }}</p>
      <p><strong>Роль:</strong> {{ formatRole(authState.user?.role) }}</p>
      <p><strong>Дата и время регистрации:</strong> {{ formatDateTime(authState.user?.createdAt) }}</p>
      <button class="btn btn-light" type="button">Изменить пароль</button>
    </article>

    <article class="card">
      <h2>История участия</h2>
      <div class="simple-list">
        <div v-for="election in votedElections" :key="election.id" class="list-row">
          <span>{{ election.name }}</span>
          <span class="muted">Участвовал</span>
        </div>
        <p v-if="!votedElections.length" class="muted">История участия пока пустая.</p>
      </div>
    </article>
  </section>
</template>
