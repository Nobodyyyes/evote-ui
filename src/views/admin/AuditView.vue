<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import type {AuditEvent, BlockchainObjectReference, BlockchainRecord, Election} from '../../types'
import {getAuditEvents} from '../../api/audit.ts'
import {getElections} from '../../api/election'
import {getBlockchainObjects, getBlockchainRecords} from '../../api/integrity'

type AuditObjectType = 'ELECTION' | 'RESULT' | 'BLOCKCHAIN_RECORD'

type AuditObjectOption = {
  id: string
  objectType: AuditObjectType
  label: string
  description?: string
  createdAt?: string | null
}

const auditEvents = ref<AuditEvent[]>([])
const elections = ref<Election[]>([])
const blockchainObjects = ref<BlockchainObjectReference[]>([])
const blockchainRecords = ref<BlockchainRecord[]>([])
const objectOptions = ref<AuditObjectOption[]>([])

const search = ref('')
const objectType = ref<AuditObjectType>('ELECTION')
const selectedElectionId = ref('')
const selectedObjectId = ref('')

const loadingElections = ref(false)
const loadingObjects = ref(false)
const loadingAudit = ref(false)

const error = ref('')
const searched = ref(false)
const faqOpen = ref(false)

const selectedObject = computed(() => {
  return objectOptions.value.find(object => object.id === selectedObjectId.value)
})

const filteredEvents = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) {
    return auditEvents.value
  }

  return auditEvents.value.filter(event => {
    const text = `${event.actor ?? ''} ${event.action ?? ''} ${event.description ?? ''}`.toLowerCase()
    return text.includes(query)
  })
})

const hasAuditEvents = computed(() => auditEvents.value.length > 0)

async function loadElections(): Promise<void> {
  loadingElections.value = true
  error.value = ''

  try {
    elections.value = await getElections()
  } catch {
    error.value = 'Не удалось загрузить список голосований.'
  } finally {
    loadingElections.value = false
  }
}

async function loadObjectOptions(): Promise<void> {
  error.value = ''
  selectedObjectId.value = ''
  auditEvents.value = []
  searched.value = false
  objectOptions.value = []
  blockchainObjects.value = []
  blockchainRecords.value = []

  if (objectType.value === 'ELECTION') {
    objectOptions.value = elections.value.map(election => ({
      id: election.id,
      objectType: 'ELECTION',
      label: election.name || election.id,
      description: `Статус: ${election.status}`,
      createdAt: election.createdAt ?? null
    }))

    return
  }

  if (!selectedElectionId.value) {
    return
  }

  loadingObjects.value = true

  try {
    const objects = await getBlockchainObjects(selectedElectionId.value)
    blockchainObjects.value = objects

    if (objectType.value === 'RESULT') {
      objectOptions.value = objects
          .filter(object => object.objectType === 'RESULT')
          .map(object => ({
            id: object.id,
            objectType: 'RESULT',
            label: 'Результат голосования',
            description: `${eventTypeLabel(object.eventType)} — ${shortValue(object.id)}`,
            createdAt: object.createdAt ?? null
          }))
    }

    if (objectType.value === 'BLOCKCHAIN_RECORD') {
      const allRecords: BlockchainRecord[] = []

      for (const object of objects) {
        const records = await getBlockchainRecords(object.id)
        allRecords.push(...records)
      }

      blockchainRecords.value = allRecords

      objectOptions.value = allRecords.map(record => ({
        id: record.id,
        objectType: 'BLOCKCHAIN_RECORD',
        label: 'Blockchain-запись',
        description: `${eventTypeLabel(record.eventType)} — ${shortValue(record.id)}`,
        createdAt: record.fixedAt ?? null
      }))
    }
  } catch {
    error.value = 'Не удалось загрузить объекты для выбранного типа аудита.'
  } finally {
    loadingObjects.value = false
  }
}

async function loadAuditEvents(): Promise<void> {
  if (!objectType.value || !selectedObjectId.value) {
    error.value = 'Выберите тип объекта и сам объект для загрузки журнала аудита.'
    auditEvents.value = []
    return
  }

  loadingAudit.value = true
  error.value = ''
  searched.value = true

  try {
    auditEvents.value = await getAuditEvents({
      objectType: objectType.value,
      objectId: selectedObjectId.value
    })
  } catch {
    auditEvents.value = []
    error.value = 'Не удалось загрузить журнал аудита.'
  } finally {
    loadingAudit.value = false
  }
}

function clearSelection(): void {
  selectedObjectId.value = ''
  auditEvents.value = []
  search.value = ''
  error.value = ''
  searched.value = false
}

function objectTypeLabel(type?: string): string {
  switch (type) {
    case 'ELECTION':
      return 'Голосование'
    case 'RESULT':
      return 'Результат голосования'
    case 'BLOCKCHAIN_RECORD':
      return 'Blockchain-запись'
    default:
      return type || 'Объект'
  }
}

function eventTypeLabel(eventType?: string): string {
  switch (eventType) {
    case 'VOTE_CAST':
      return 'Голос зафиксирован'
    case 'RESULT_CALCULATED':
      return 'Результаты рассчитаны'
    default:
      return eventType || 'Событие'
  }
}

function actionLabel(action?: string): string {
  switch (action) {
    case 'CREATE':
      return 'Создание'
    case 'UPDATE':
      return 'Обновление'
    case 'DELETE':
      return 'Удаление'
    case 'PUBLISH':
      return 'Публикация'
    case 'VOTE_CAST':
      return 'Голосование'
    case 'RESULT_CALCULATED':
      return 'Расчет результатов'
    case 'RESULT_PUBLISHED':
      return 'Публикация результатов'
    case 'BLOCKCHAIN_RECORD_CREATED':
      return 'Создание blockchain-записи'
    case 'ELECTION_CREATED':
      return 'Создание голосования'
    case 'ELECTION_PUBLISHED':
      return 'Публикация голосования'
    case 'ELECTION_COMPLETED':
      return 'Завершение голосования'
    default:
      return action || 'Действие'
  }
}

function actionUserLabel(action?: string) {
  switch (action) {
    case 'SYSTEM':
      return 'Система'
    case 'USER':
      return 'Пользователь'
    default:
      return action
  }
}

function formatDate(value?: string | null): string {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function shortValue(value?: string, start = 10, end = 8): string {
  if (!value) return '—'
  if (value.length <= start + end + 3) return value

  return `${value.slice(0, start)}...${value.slice(-end)}`
}

watch(objectType, () => {
  selectedElectionId.value = ''
  selectedObjectId.value = ''
  objectOptions.value = []
  auditEvents.value = []
  search.value = ''
  error.value = ''
  searched.value = false

  if (objectType.value === 'ELECTION') {
    loadObjectOptions()
  }
})

watch(selectedElectionId, () => {
  loadObjectOptions()
})

onMounted(async () => {
  await loadElections()
  await loadObjectOptions()
})
</script>

<template>
  <section class="page-title">
    <h1>Журнал аудита</h1>
    <p class="muted">
      Просмотр действий пользователей по выбранному объекту системы.
    </p>
  </section>

  <section class="card audit-check">
    <div class="check-grid">
      <div class="search-form">
        <label for="objectType">Тип объекта</label>
        <select id="objectType" v-model="objectType">
          <option value="ELECTION">Голосование</option>
          <option value="RESULT">Результат голосования</option>
          <option value="BLOCKCHAIN_RECORD">Blockchain-запись</option>
        </select>
      </div>

      <div
          v-if="objectType !== 'ELECTION'"
          class="search-form"
      >
        <label for="election">Голосование</label>
        <select
            id="election"
            v-model="selectedElectionId"
            :disabled="loadingElections"
        >
          <option value="">
            {{ loadingElections ? 'Загрузка голосований...' : 'Выберите голосование' }}
          </option>

          <option
              v-for="election in elections"
              :key="election.id"
              :value="election.id"
          >
            {{ election.name || election.id }}
          </option>
        </select>
      </div>

      <div class="search-form">
        <label for="objectId">Объект</label>
        <select
            id="objectId"
            v-model="selectedObjectId"
            :disabled="loadingObjects || objectOptions.length === 0"
        >
          <option value="">
            <template v-if="loadingObjects">Загрузка объектов...</template>
            <template v-else-if="objectOptions.length === 0">Нет доступных объектов</template>
            <template v-else>Выберите объект</template>
          </option>

          <option
              v-for="object in objectOptions"
              :key="object.id"
              :value="object.id"
          >
            {{ object.label }} — {{ object.description || shortValue(object.id) }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="selectedObject" class="selected-object-card">
      <span>Выбранный объект</span>
      <strong>{{ objectTypeLabel(selectedObject.objectType) }}</strong>
      <p class="muted">
        {{ selectedObject.label }}
        <br/>
        ID: {{ selectedObject.id }}
        <br/>
        {{ selectedObject.description }}
        <br/>
        Создано: {{ formatDate(selectedObject.createdAt) }}
      </p>
    </div>

    <div class="audit-filter">
      <label for="search">Фильтр внутри журнала</label>
      <input
          id="search"
          v-model="search"
          type="text"
          placeholder="Пользователь, действие или описание"
      />
    </div>

    <div class="actions">
      <button
          class="btn btn-primary"
          type="button"
          :disabled="loadingAudit || !selectedObjectId"
          @click="loadAuditEvents"
      >
        {{ loadingAudit ? 'Загрузка...' : 'Загрузить аудит' }}
      </button>

      <button
          class="btn btn-secondary"
          type="button"
          :disabled="loadingAudit"
          @click="clearSelection"
      >
        Очистить
      </button>
    </div>
  </section>

  <p v-if="error" class="error-text">
    {{ error }}
  </p>

  <section v-if="loadingAudit" class="card empty-state">
    <h3>Загружаю журнал аудита...</h3>
    <p class="muted">
      Система ищет события по выбранному объекту.
    </p>
  </section>

  <section v-else-if="searched && !hasAuditEvents && !error" class="card empty-state">
    <h3>События аудита не найдены</h3>
    <p class="muted">
      Для выбранного объекта пока нет записей в журнале аудита.
    </p>
  </section>

  <section v-else-if="hasAuditEvents" class="card">
    <div class="result-header">
      <div>
        <h2>Найдено событий: {{ filteredEvents.length }}</h2>
        <p class="muted">
          Журнал показывает, кто и когда выполнял действия с выбранным объектом.
        </p>
      </div>
    </div>

    <div class="audit-list">
      <article
          v-for="event in filteredEvents"
          :key="event.id"
          class="audit-event"
      >
        <div class="audit-event-top">
          <div>
            <h3>{{ actionLabel(event.action) }}</h3>
            <p class="muted">{{ event.description || 'Описание отсутствует' }}</p>
          </div>

          <span class="audit-date">
            {{ formatDate(event.createdAt) }}
          </span>
        </div>

        <div class="audit-event-grid">
          <div class="record-field">
            <span>Пользователь</span>
            <strong>{{ actionUserLabel(event.actor) || '—' }}</strong>
          </div>

          <div class="record-field">
            <span>Действие</span>
            <strong>{{ actionLabel(event.action) || '—' }}</strong>
          </div>

          <div class="record-field">
            <span>Дата</span>
            <strong>{{ formatDate(event.createdAt) }}</strong>
          </div>
        </div>
      </article>
    </div>
  </section>

  <section v-else class="card empty-state">
    <h3>Начните с выбора объекта</h3>
    <p class="muted">
      Выберите тип объекта и объект, затем нажмите «Загрузить аудит».
    </p>
  </section>

  <section class="card audit-faq">
    <button
        class="faq-toggle"
        type="button"
        @click="faqOpen = !faqOpen"
    >
      <div>
        <h2>FAQ: как читать журнал аудита</h2>
        <p class="muted">
          Краткое объяснение, что показывает аудит и как понимать события.
        </p>
      </div>

      <span class="faq-toggle-icon">
        {{ faqOpen ? '−' : '+' }}
      </span>
    </button>

    <div v-show="faqOpen" class="faq-list">
      <details open class="faq-item">
        <summary>Что такое журнал аудита?</summary>
        <p>
          Журнал аудита — это список действий, которые были выполнены пользователями
          или системой над конкретным объектом.
        </p>
        <p>
          Например: создание голосования, публикация, расчет результатов,
          публикация итогов или создание blockchain-записи.
        </p>
      </details>

      <details class="faq-item">
        <summary>Что означает тип объекта «Голосование»?</summary>
        <p>
          Этот тип показывает события, связанные с самим голосованием:
          создание, изменение, публикация или удаление.
        </p>
      </details>

      <details class="faq-item">
        <summary>Что означает тип объекта «Результат голосования»?</summary>
        <p>
          Этот тип показывает события, связанные с рассчитанными итогами голосования.
          Например, расчет или публикация результатов.
        </p>
      </details>

      <details class="faq-item">
        <summary>Что означает тип объекта «Blockchain-запись»?</summary>
        <p>
          Этот тип показывает события, связанные с контрольной hash-записью:
          создание, фиксация или проверка blockchain-записи.
        </p>
      </details>

      <details class="faq-item">
        <summary>Чем аудит отличается от blockchain-записей?</summary>
        <p>
          Blockchain-записи отвечают за контроль целостности данных.
          Они хранят hash, transaction ID и статус фиксации.
        </p>
        <p>
          Аудит отвечает за историю действий: кто, когда и что сделал с объектом.
        </p>
      </details>

      <details class="faq-item">
        <summary>Как объяснить это на защите?</summary>
        <p>
          Журнал аудита используется для отслеживания действий пользователей и системы.
          Он позволяет администратору или аудитору видеть историю операций над голосованиями,
          результатами и blockchain-записями.
        </p>
      </details>
    </div>
  </section>
</template>