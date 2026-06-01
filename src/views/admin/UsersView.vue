<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Id, Role, User } from '../../types'
import StatusBadge from '../../components/StatusBadge.vue'
import { getUsers, toggleUserStatus, updateUserRole } from '../../api/userApi'

const users = ref<User[]>([])
const search = ref('')
const role = ref<'ALL' | Role>('ALL')
const loading = ref(false)
const error = ref('')

const filteredUsers = computed(() => users.value.filter(user => {
  const text = `${user.username} ${user.email}`.toLowerCase()
  const matchesSearch = text.includes(search.value.toLowerCase())
  const matchesRole = role.value === 'ALL' || user.role === role.value
  return matchesSearch && matchesRole
}))

async function loadUsers(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    users.value = await getUsers()
  } catch {
    error.value = 'Не удалось загрузить пользователей.'
  } finally {
    loading.value = false
  }
}

async function toggleStatus(user: User): Promise<void> {
  if (!window.confirm('Изменить статус пользователя?')) return
  try {
    await toggleUserStatus(user.id, user.status)
    await loadUsers()
  } catch {
    error.value = 'Не удалось изменить статус пользователя.'
  }
}

async function changeRole(id: Id, newRole: Role): Promise<void> {
  try {
    await updateUserRole(id, newRole)
    await loadUsers()
  } catch {
    error.value = 'Не удалось изменить роль пользователя.'
  }
}

onMounted(loadUsers)
</script>

<template>
  <section class="page-title">
    <h1>Управление пользователями</h1>
    <p class="muted">Поиск, фильтрация по ролям, блокировка и разблокировка.</p>
  </section>

  <section class="card toolbar">
    <input v-model="search" type="text" placeholder="Поиск по имени, логину или email" />
    <select v-model="role">
      <option value="ALL">Все роли</option>
      <option value="VOTER">Избиратель</option>
      <option value="ADMIN">Администратор</option>
      <option value="AUDITOR">Аудитор</option>
    </select>
  </section>

  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="loading" class="muted">Загрузка пользователей...</p>

  <section class="card table-card">
    <table>
      <thead>
        <tr>
          <th>Логин</th>
          <th>Роль</th>
          <th>Статус</th>
          <th>Действие</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user.id">
          <td>{{ user.username }}</td>
          <td>
            <select :value="user.role" @change="changeRole(user.id, ($event.target as HTMLSelectElement).value as Role)">
              <option value="USER">Пользователь</option>
              <option value="ADMIN">Администратор</option>
              <option value="AUDITOR">Аудитор</option>
            </select>
          </td>
          <td><StatusBadge :status="user.status" /></td>
          <td><button class="btn btn-small btn-light" @click="toggleStatus(user)">Изменить статус</button></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
