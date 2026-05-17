<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createElection } from '../../api/electionApi'

const router = useRouter()
const title = ref('')
const description = ref('')
const startsAt = ref('')
const endsAt = ref('')
const options = ref<string[]>(['', ''])
const error = ref('')
const saving = ref(false)

function addOption(): void {
  options.value.push('')
}

function removeOption(index: number): void {
  if (options.value.length <= 2) return
  options.value.splice(index, 1)
}

async function save(): Promise<void> {
  error.value = ''
  const filledOptions = options.value.filter(option => option.trim())

  if (!title.value.trim() || !description.value.trim() || !startsAt.value || !endsAt.value || filledOptions.length < 2) {
    error.value = 'Заполните название, описание, даты и минимум 2 варианта ответа.'
    return
  }

  saving.value = true
  try {
    await createElection({
      title: title.value,
      description: description.value,
      startsAt: startsAt.value,
      endsAt: endsAt.value,
      options: filledOptions
    })
    router.push('/admin/elections')
  } catch {
    error.value = 'Не удалось сохранить голосование.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="card details-card">
    <h1>Создание голосования</h1>

    <form class="form" @submit.prevent="save">
      <label>Название <input v-model="title" type="text" /></label>
      <label>Описание <textarea v-model="description" rows="4"></textarea></label>

      <div class="grid grid-2 no-margin">
        <label>Дата начала <input v-model="startsAt" type="datetime-local" /></label>
        <label>Дата окончания <input v-model="endsAt" type="datetime-local" /></label>
      </div>

      <h2>Варианты ответа</h2>
      <div v-for="(_, index) in options" :key="index" class="option-input-row">
        <input v-model="options[index]" type="text" :placeholder="`Вариант ${index + 1}`" />
        <button class="btn btn-light" type="button" @click="removeOption(index)">Удалить</button>
      </div>

      <button class="btn btn-secondary" type="button" @click="addOption">Добавить вариант</button>
      <p v-if="error" class="error-text">{{ error }}</p>

      <div class="actions">
        <button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? 'Сохранение...' : 'Сохранить' }}</button>
        <RouterLink class="btn btn-light" to="/admin/elections">Отмена</RouterLink>
      </div>
    </form>
  </section>
</template>
