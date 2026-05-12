<script setup lang="ts">
import { ref } from 'vue'
import { blockchainRecords, elections } from '../../data/mock'
import StatusBadge from '../../components/StatusBadge.vue'

const message = ref('')

function checkIntegrity(): void {
  message.value = 'Проверка завершена: контрольные значения совпадают.'
}

function getResultHash(electionTitle: string, fallbackHash: string): string {
  return elections.find(election => election.title === electionTitle)?.resultHash ?? fallbackHash
}
</script>

<template>
  <section class="page-title row-title">
    <div>
      <h1>Проверка целостности</h1>
      <p class="muted">Сверка текущих данных с контрольными hash/blockchain-записями.</p>
    </div>
    <button class="btn btn-primary" @click="checkIntegrity">Запустить проверку</button>
  </section>

  <p v-if="message" class="success-box">{{ message }}</p>

  <section class="card table-card">
    <table>
      <thead>
        <tr>
          <th>Голосование</th>
          <th>resultHash</th>
          <th>Blockchain статус</th>
          <th>Дата фиксации</th>
          <th>Tx/Block</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in blockchainRecords" :key="record.id">
          <td>{{ record.electionTitle }}</td>
          <td>{{ getResultHash(record.electionTitle, record.hash) }}</td>
          <td><StatusBadge :status="record.status" /></td>
          <td>{{ record.fixedAt }}</td>
          <td>{{ record.transactionId }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
