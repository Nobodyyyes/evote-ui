<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import type {Id, Role, User} from '../../types'
import StatusBadge from '../../components/StatusBadge.vue'
import {getUsers, toggleUserStatus, updateUserRole} from '../../api/user.ts'

const users = ref<User[]>([])
const search = ref('')
const role = ref<'ALL' | Role>('ALL')
const status = ref<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL')
const loading = ref(false)
const error = ref('')
const message = ref('')

const editingRoleUserId = ref<Id | null>(null)
const selectedRole = ref<Role>('USER')
const roleSaving = ref(false)

const filteredUsers = computed(() =>
    users.value.filter(user => {
      const text = `
      ${user.firstname ?? ''}
      ${user.name ?? ''}
      ${user.username ?? ''}
      ${user.email ?? ''}
    `.toLowerCase()

      const matchesSearch = text.includes(search.value.toLowerCase())
      const matchesRole = role.value === 'ALL' || user.role === role.value
      const matchesStatus = status.value === 'ALL' || user.status === status.value

      return matchesSearch && matchesRole && matchesStatus
    })
)

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
  const actionText = user.status === 'ACTIVE' ? 'заблокировать' : 'разблокировать'

  if (!window.confirm(`Вы действительно хотите ${actionText} пользователя ${user.username}?`)) return

  try {
    error.value = ''
    message.value = ''

    await toggleUserStatus(user.id, user.status)
    message.value = 'Статус пользователя изменен.'
    await loadUsers()
  } catch {
    error.value = 'Не удалось изменить статус пользователя.'
  }
}

function openRoleEditor(user: User): void {
  editingRoleUserId.value = user.id
  selectedRole.value = user.role
  error.value = ''
  message.value = ''
}

function closeRoleEditor(): void {
  editingRoleUserId.value = null
  selectedRole.value = 'USER'
}

async function saveRole(user: User): Promise<void> {
  if (selectedRole.value === user.role) {
    closeRoleEditor()
    return
  }

  if (!window.confirm(`Изменить роль пользователя ${user.username}?`)) return

  roleSaving.value = true
  error.value = ''
  message.value = ''

  try {
    await updateUserRole(user.id, selectedRole.value)
    message.value = 'Роль пользователя изменена.'
    closeRoleEditor()
    await loadUsers()
  } catch {
    error.value = 'Не удалось изменить роль пользователя.'
  } finally {
    roleSaving.value = false
  }
}

function roleLabel(value?: Role): string {
  switch (value) {
    case 'USER':
      return 'Пользователь'
    case 'ADMIN':
      return 'Администратор'
    case 'AUDITOR':
      return 'Аудитор'
    default:
      return value || 'Неизвестно'
  }
}

function statusActionLabel(user: User): string {
  return user.status === 'ACTIVE' ? 'Заблокировать' : 'Разблокировать'
}

onMounted(loadUsers)
</script>

<template>
  <section class="page-title">
    <h1>Управление пользователями</h1>
    <p class="muted">Поиск, фильтрация по ролям, блокировка и изменение ролей.</p>
  </section>

  <section class="card users-toolbar">
    <div class="users-search">
      <input
          v-model="search"
          type="text"
          placeholder="Поиск по имени, логину или email"
      />
    </div>

    <div class="users-filters">
      <select v-model="role">
        <option value="ALL">Все роли</option>
        <option value="USER">Пользователь</option>
        <option value="ADMIN">Администратор</option>
        <option value="AUDITOR">Аудитор</option>
      </select>

      <select v-model="status">
        <option value="ALL">Все статусы</option>
        <option value="ACTIVE">Активные</option>
        <option value="BLOCKED">Заблокированные</option>
      </select>
    </div>
  </section>

  <p v-if="message" class="success-text">{{ message }}</p>
  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="loading" class="muted">Загрузка пользователей...</p>

  <section class="card table-card">
    <table>
      <thead>
      <tr>
        <th>Пользователь</th>
        <th>Email</th>
        <th>Роль</th>
        <th>Статус</th>
        <th>Действия</th>
      </tr>
      </thead>

      <tbody>
      <template v-for="user in filteredUsers" :key="user.id">
        <tr>
          <td>
            <div class="user-cell">
              <strong>{{ user.username }}</strong>
              <span class="muted">
                  {{ user.firstname }} {{ user.name }}
                </span>
            </div>
          </td>

          <td>
            <div class="user-cell">
              <strong>{{ user.email || '-' }}</strong>
            </div>
          </td>

          <td>
              <span class="role-pill" :class="`role-pill-${user.role}`">
                {{ roleLabel(user.role) }}
              </span>
          </td>

          <td>
            <StatusBadge :status="user.status"/>
          </td>

          <td>
            <div class="table-actions">
              <button
                  class="btn btn-small btn-light"
                  type="button"
                  @click="toggleStatus(user)"
              >
                {{ statusActionLabel(user) }}
              </button>

              <button
                  class="btn btn-small btn-secondary"
                  type="button"
                  @click="openRoleEditor(user)"
              >
                Изменить роль
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="editingRoleUserId === user.id" class="role-editor-row">
          <td colspan="5">
            <div class="role-editor">
              <div>
                <strong>Изменение роли пользователя</strong>
                <p class="muted">
                  Пользователь: {{ user.username }}. Текущая роль: {{ roleLabel(user.role) }}.
                </p>
              </div>

              <div class="role-editor-actions">
                <select v-model="selectedRole" :disabled="roleSaving">
                  <option value="USER">Пользователь</option>
                  <option value="ADMIN">Администратор</option>
                  <option value="AUDITOR">Аудитор</option>
                </select>

                <button
                    class="btn btn-small btn-primary"
                    type="button"
                    :disabled="roleSaving"
                    @click="saveRole(user)"
                >
                  {{ roleSaving ? 'Сохранение...' : 'Сохранить' }}
                </button>

                <button
                    class="btn btn-small btn-light"
                    type="button"
                    :disabled="roleSaving"
                    @click="closeRoleEditor"
                >
                  Отмена
                </button>
              </div>
            </div>
          </td>
        </tr>
      </template>

      <tr v-if="!loading && filteredUsers.length === 0">
        <td colspan="5" class="empty-table-text">
          Пользователи не найдены.
        </td>
      </tr>
      </tbody>
    </table>
  </section>
</template>