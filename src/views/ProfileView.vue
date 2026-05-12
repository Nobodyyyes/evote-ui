<script setup lang="ts">
import { elections } from '../data/mock'
import { authState } from '../store/auth'
</script>

<template>
  <section class="page-title">
    <h1>Профиль</h1>
    <p class="muted">Данные текущего пользователя.</p>
  </section>

  <section class="grid grid-2">
    <article class="card">
      <h2>Основная информация</h2>
      <p><strong>ФИО:</strong> {{ authState.user?.fullName }}</p>
      <p><strong>Логин:</strong> {{ authState.user?.username }}</p>
      <p><strong>Email:</strong> {{ authState.user?.email }}</p>
      <p><strong>Роль:</strong> {{ authState.user?.role }}</p>
      <p><strong>Дата регистрации:</strong> {{ authState.user?.registeredAt }}</p>
      <button class="btn btn-light">Изменить пароль</button>
    </article>

    <article class="card">
      <h2>История участия</h2>
      <div class="simple-list">
        <div v-for="election in elections.filter(e => e.voted)" :key="election.id" class="list-row">
          <span>{{ election.title }}</span>
          <span class="muted">Участвовал</span>
        </div>
      </div>
    </article>
  </section>
</template>
