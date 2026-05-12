<script setup lang="ts">
import { blockchainRecords } from '../../data/mock'
import StatusBadge from '../../components/StatusBadge.vue'
</script>

<template>
  <section class="page-title">
    <h1>Blockchain-записи</h1>
    <p class="muted">Контрольные записи, хэши и идентификаторы транзакций.</p>
  </section>

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
