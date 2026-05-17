<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { BlockchainRecord } from '../../types'
import { getBlockchainRecords } from '../../api/integrityApi'
import StatusBadge from '../../components/StatusBadge.vue'

const blockchainRecords = ref<BlockchainRecord[]>([])
const loading = ref(false)
const error = ref('')

async function loadBlockchainRecords(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    blockchainRecords.value = await getBlockchainRecords()
  } catch {
    error.value = 'Не удалось загрузить blockchain-записи.'
  } finally {
    loading.value = false
  }
}

onMounted(loadBlockchainRecords)
</script>

<template>
  <section class="page-title">
    <h1>Blockchain-записи</h1>
    <p class="muted">Контрольные записи, хэши и идентификаторы транзакций.</p>
  </section>

  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="loading" class="muted">Загрузка blockchain-записей...</p>

  <section class="card table-card">
    <table>
      <thead>
        <tr>
          <th>Голосование</th>
          <th>Тип события</th>
          <th>Hash</th>
          <th>Transaction ID</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in blockchainRecords" :key="record.id">
          <td>{{ record.electionTitle }}</td>
          <td>{{ record.eventType }}</td>
          <td>{{ record.hash }}</td>
          <td>{{ record.transactionId }}</td>
          <td><StatusBadge :status="record.status" /></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
