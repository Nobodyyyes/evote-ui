<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { BlockchainRecord } from '../../types'
import { getBlockchainRecords } from '../../api/integrityApi'
import StatusBadge from '../../components/StatusBadge.vue'

const route = useRoute()
const relatedObjectId = ref(String(route.query.objectId ?? ''))
const blockchainRecords = ref<BlockchainRecord[]>([])
const loading = ref(false)
const error = ref('')

async function loadBlockchainRecords(): Promise<void> {
  if (!relatedObjectId.value.trim()) {
    error.value = 'Укажите relatedObjectId. Backend отдает blockchain-записи по /blockchain/records/{relatedObjectId}.'
    blockchainRecords.value = []
    return
  }

  loading.value = true
  error.value = ''

  try {
    blockchainRecords.value = await getBlockchainRecords(relatedObjectId.value.trim())
  } catch {
    error.value = 'Не удалось загрузить blockchain-записи.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (relatedObjectId.value) loadBlockchainRecords()
})
</script>

<template>
  <section class="page-title">
    <h1>Blockchain-записи</h1>
    <p class="muted">Контрольные записи, хэши и идентификаторы транзакций.</p>
  </section>

  <section class="card toolbar blockchain-toolbar">
    <input v-model="relatedObjectId" type="text" placeholder="relatedObjectId / UUID объекта" />
    <button class="btn btn-primary" type="button" @click="loadBlockchainRecords">Загрузить</button>
  </section>

  <p v-if="error" class="error-text">{{ error }}</p>
  <p v-if="loading" class="muted">Загрузка blockchain-записей...</p>

  <section class="card table-card">
    <table>
      <thead>
        <tr>
          <th>Объект</th>
          <th>Тип события</th>
          <th>Hash</th>
          <th>Transaction ID</th>
          <th>Статус</th>
          <th>Зафиксировано</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in blockchainRecords" :key="record.id">
          <td>{{ record.relatedObjectId || record.electionTitle }}</td>
          <td>{{ record.eventType }}</td>
          <td>{{ record.hash }}</td>
          <td>{{ record.transactionId }}</td>
          <td><StatusBadge :status="record.status" /></td>
          <td>{{ record.fixedAt }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
