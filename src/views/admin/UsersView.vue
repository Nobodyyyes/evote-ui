<script setup lang="ts">
import { computed, ref } from 'vue'
import { users } from '../../data/mock'
import type { Role } from '../../types'
import StatusBadge from '../../components/StatusBadge.vue'

const search = ref('')
const role = ref<'ALL' | Role>('ALL')

const filteredUsers = computed(() => users.filter(user => {
  const text = `${user.fullName} ${user.username} ${user.email}`.toLowerCase()
  const matchesSearch = text.includes(search.value.toLowerCase())
  const matchesRole = role.value === 'ALL' || user.role === role.value
  return matchesSearch && matchesRole
}))

function toggleStatus(id: number): void {
  const user = users.find(item => item.id === id)
  if (user && window.confirm('Изменить статус пользователя?')) {
    user.status = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'
  }
}
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

  <section class="card table-card">
    <table>
      <thead>
        <tr>
          <th>ФИО</th>
          <th>Логин</th>
          <th>Email</th>
          <th>Роль</th>
          <th>Статус</th>
          <th>Действие</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user.id">
          <td>{{ user.fullName }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td><StatusBadge :status="user.status" /></td>
          <td><button class="btn btn-small btn-light" @click="toggleStatus(user.id)">Изменить статус</button></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
