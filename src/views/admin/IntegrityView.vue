<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { BlockchainRecord } from '../../types'
import { checkIntegrity as runIntegrityCheck, getIntegrityRecords } from '../../api/integrityApi'
import StatusBadge from '../../components/StatusBadge.vue'

const records = ref<BlockchainRecord[]>([])
const message = ref('')
const loading = ref(false)
const checking = ref(false)
const error = ref('')

async function loadRecords(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    records.value = await getIntegrityRecords()
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
    message.value = await runIntegrityCheck()
    await loadRecords()
  } catch {
    error.value = 'Не удалось выполнить проверку целостности.'
  } finally {
    checking.value = false
  }
}

onMounted(loadRecords)
</script>

<template>
  <section class="page-title row-title">
    <div>
      <h1>Проверка целостности</h1>
      <p class="muted">Сверка текущих данных с контрольными hash/blockchain-записями.</p>
    </div>
    <button class="btn btn-primary" @click="checkIntegrity" :disabled="checking">
      {{ checking ? 'Проверка...' : 'Запустить проверку' }}
    </button>
  </section>

  <p v-if="message" class="success-box">{{ message }}</p>
  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="loading" class="muted">Загрузка записей...</p>

  <section class="card table-card">
    <table>
      <thead>
        <tr>
          <th>Голосование</th>
          <th>Hash</th>
          <th>Blockchain статус</th>
          <th>Дата фиксации</th>
          <th>Tx/Block</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in records" :key="record.id">
          <td>{{ record.electionTitle }}</td>
          <td>{{ record.hash }}</td>
          <td><StatusBadge :status="record.status" /></td>
          <td>{{ record.fixedAt }}</td>
          <td>{{ record.transactionId }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
