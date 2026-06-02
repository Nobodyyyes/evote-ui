<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { BlockchainRecord } from '../../types'
import { checkIntegrity as runIntegrityCheck, getIntegrityRecords } from '../../api/integrityApi'
import StatusBadge from '../../components/StatusBadge.vue'

const route = useRoute()
const relatedObjectId = ref(String(route.query.objectId ?? ''))
const records = ref<BlockchainRecord[]>([])
const message = ref('')
const loading = ref(false)
const checking = ref(false)
const error = ref('')

async function loadRecords(): Promise<void> {
  if (!relatedObjectId.value.trim()) {
    records.value = []
    error.value = 'Укажите relatedObjectId для загрузки контрольных записей.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    records.value = await getIntegrityRecords(relatedObjectId.value.trim())
  } catch {
    error.value = 'Не удалось загрузить записи для проверки целостности.'
  } finally {
    loading.value = false
  }
}

async function checkIntegrity(): Promise<void> {
  checking.value = true
  error.value = ''
  message.value = ''

  try {
    message.value = await runIntegrityCheck(relatedObjectId.value.trim())
    await loadRecords()
  } catch {
    error.value = 'Не удалось выполнить проверку целостности.'
  } finally {
    checking.value = false
  }
}

onMounted(() => {
  if (relatedObjectId.value) loadRecords()
})
</script>

<template>
  <section class="page-title row-title">
    <div>
      <h1>Проверка целостности</h1>
      <p class="muted">В текущем backend доступны blockchain-записи по relatedObjectId.</p>
    </div>
    <button class="btn btn-primary" @click="checkIntegrity" :disabled="checking">
      {{ checking ? 'Проверка...' : 'Загрузить записи' }}
    </button>
  </section>

  <section class="card toolbar blockchain-toolbar">
    <input v-model="relatedObjectId" type="text" placeholder="relatedObjectId / UUID объекта" />
    <button class="btn btn-secondary" type="button" @click="loadRecords">Найти</button>
  </section>

  <p v-if="message" class="success-box">{{ message }}</p>
  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="loading" class="muted">Загрузка записей...</p>

  <section class="card table-card">
    <table>
      <thead>
        <tr>
          <th>Объект</th>
          <th>Hash</th>
          <th>Blockchain статус</th>
          <th>Дата фиксации</th>
          <th>Tx/Block</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in records" :key="record.id">
          <td>{{ record.relatedObjectId || record.electionTitle }}</td>
          <td>{{ record.hash }}</td>
          <td><StatusBadge :status="record.status" /></td>
          <td>{{ record.fixedAt }}</td>
          <td>{{ record.transactionId }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
