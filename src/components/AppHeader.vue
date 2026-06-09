<script setup lang="ts">
import {computed} from 'vue'
import {useRouter} from 'vue-router'
import {authState, logout} from '../store/auth'
import {formatRole} from "../utils/labels.ts";

const router = useRouter()
const user = computed(() => authState.user)

async function handleLogout(): Promise<void> {
  await logout()
  router.push('/login')
}

function isAdminRole(role: string): boolean {
  return role === 'ADMIN'
}

function isAuditorRole(role:string):boolean {
  return role === 'AUDITOR'
}
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="logo">EVote System</RouterLink>

    <nav class="nav-links">
      <RouterLink v-if="!user" to="/login">Войти</RouterLink>
      <RouterLink v-if="!user" to="/register">Регистрация</RouterLink>

      <template v-if="user">
        <RouterLink to="/dashboard">Кабинет</RouterLink>

        <RouterLink v-if="!isAuditorRole(user?.role)" to="/elections">Голосования</RouterLink>

        <RouterLink to="/profile">Профиль</RouterLink>

        <RouterLink v-if="isAdminRole(user.role)" to="/admin">Админ-панель</RouterLink>

        <RouterLink v-if="user.role === 'AUDITOR'" to="/admin/audit">Аудит</RouterLink>

        <RouterLink v-if="isAuditorRole(user.role)" to="/admin/integrity">Проверка целостности</RouterLink>
      </template>
    </nav>

    <div v-if="user" class="user-box">
      <span>{{ user.username }} / {{ formatRole(user.role) }}</span>
      <button class="btn btn-light" @click="handleLogout">Выйти</button>
    </div>
  </header>
</template>
