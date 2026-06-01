<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {createElection} from '../../api/electionApi'
import {authState} from "../../store/auth.ts";
import {AccessElectionType} from "../../types.ts";

const router = useRouter()
const name = ref('')
const description = ref('')
const startDateTime = ref('')
const endDateTime = ref('')
const options = ref<string[]>(['', ''])
const error = ref('')
const saving = ref(false)
const accessElectionType = ref<AccessElectionType>('ALL_AUTHORIZED_USERS')
const accessElectionTypes: { value: AccessElectionType, label: string }[] = [
  {
    value: 'ALL_AUTHORIZED_USERS',
    label: 'Все авторизованные пользователи'
  },
  {
    value: 'SELECTED_USERS_ONLY',
    label: 'Только выбранные пользователи'
  }
]

function addOption(): void {
  options.value.push('')
}

function removeOption(index: number): void {
  if (options.value.length <= 2) return
  options.value.splice(index, 1)
}

async function saveElection(): Promise<void> {
  error.value = ''
  const filledOptions = options.value
      .map(option => option.trim())
      .filter(option => option.trim())

  if (!name.value.trim() || !description.value.trim() || !startDateTime.value || !endDateTime.value || filledOptions.length < 2) {
    error.value = 'Заполните название, описание, даты и минимум 2 варианта ответа.'
    return
  }

  saving.value = true
  try {
    await createElection({
      name: name.value,
      description: description.value,
      startDateTime: startDateTime.value,
      endDateTime: endDateTime.value,
      creatorInfo: authState.user?.username ?? 'admin',
      accessElectionType: accessElectionType.value,
      options: filledOptions
    })
    router.push('/admin/elections')
  } catch {
    error.value = 'Не удалось сохранить голосование...'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="card details-card">
    <h1>Создание голосования</h1>

    <form class="form" @submit.prevent="saveElection">
      <label>Название <input v-model="name" type="text"/></label>
      <label>Описание <textarea v-model="description" rows="4"></textarea></label>

      <div class="grid grid-2 no-margin">
        <label>Дата начала <input v-model="startDateTime" type="datetime-local"/></label>
        <label>Дата окончания <input v-model="endDateTime" type="datetime-local"/></label>
      </div>

      <label>
        Тип доступа
        <select v-model="accessElectionType">
          <option
            v-for="type in accessElectionTypes"
            :key="type.value"
            :value="type.value"
            >
            {{ type.label }}
          </option>
        </select>
      </label>

      <h2>Варианты ответа</h2>
      <div v-for="(_, index) in options" :key="index" class="option-input-row">
        <input v-model="options[index]" type="text" :placeholder="`Вариант ${index + 1}`"/>
        <button class="btn btn-light" type="button" @click="removeOption(index)">Удалить</button>
      </div>

      <button class="btn btn-secondary" type="button" @click="addOption">Добавить вариант</button>
      <p v-if="error" class="error-text">{{ error }}</p>

      <div class="actions">
        <button class="btn btn-primary" type="submit" :disabled="saving">{{
            saving ? 'Сохранение...' : 'Сохранить'
          }}
        </button>
        <RouterLink class="btn btn-light" to="/admin/elections">Отмена</RouterLink>
      </div>
    </form>
  </section>
</template>
