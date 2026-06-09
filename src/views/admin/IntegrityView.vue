<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { BlockchainObjectReference, BlockchainRecord, Election } from '../../types'
import { checkIntegrity as runIntegrityCheck, getBlockchainObjects, getIntegrityRecords } from '../../api/integrity.ts'
import { getElections } from '../../api/election'
import StatusBadge from '../../components/StatusBadge.vue'

type IntegrityState = 'success' | 'danger' | 'neutral'

type IntegrityCheckApiResponse = {
  valid?: boolean | string | null
  message?: string | null
}

const route = useRoute()

const elections = ref<Election[]>([])
const integrityObjects = ref<BlockchainObjectReference[]>([])
const records = ref<BlockchainRecord[]>([])

const selectedElectionId = ref(String(route.query.electionId ?? ''))
const selectedObjectType = ref<'ALL' | 'VOTE' | 'RESULT'>('ALL')
const selectedObjectId = ref(String(route.query.objectId ?? ''))

const message = ref('')
const error = ref('')
const searched = ref(false)
const faqOpen = ref(false)

const loadingElections = ref(false)
const loadingObjects = ref(false)
const loadingRecords = ref(false)
const checking = ref(false)

const isIntegrityValid = ref<boolean | null>(null)

const filteredObjects = computed(() => {
  if (selectedObjectType.value === 'ALL') {
    return integrityObjects.value
  }

  return integrityObjects.value.filter(object => object.objectType === selectedObjectType.value)
})

const selectedObject = computed(() => {
  return integrityObjects.value.find(object => object.id === selectedObjectId.value)
})

const hasRecords = computed(() => records.value.length > 0)

const integrityState = computed<IntegrityState>(() => {
  if (!message.value) {
    return 'neutral'
  }

  if (isIntegrityValid.value === true) {
    return 'success'
  }

  if (isIntegrityValid.value === false) {
    return 'danger'
  }

  return 'neutral'
})

const integrityTitle = computed(() => {
  if (integrityState.value === 'success') {
    return 'Целостность подтверждена'
  }

  if (integrityState.value === 'danger') {
    return 'Возможно нарушение целостности'
  }

  return 'Результат проверки'
})

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

async function loadIntegrityObjects(): Promise<void> {
  if (!selectedElectionId.value) {
    integrityObjects.value = []
    selectedObjectId.value = ''
    records.value = []
    message.value = ''
    isIntegrityValid.value = null
    searched.value = false
    return
  }

  loadingObjects.value = true
  error.value = ''
  message.value = ''
  isIntegrityValid.value = null
  records.value = []
  searched.value = false

  try {
    integrityObjects.value = await getBlockchainObjects(selectedElectionId.value)

    if (
        selectedObjectId.value &&
        !integrityObjects.value.some(object => object.id === selectedObjectId.value)
    ) {
      selectedObjectId.value = ''
    }
  } catch {
    error.value = 'Не удалось загрузить список голосов и результатов для выбранного голосования.'
  } finally {
    loadingObjects.value = false
  }
}

async function loadRecords(): Promise<void> {
  if (!selectedObjectId.value.trim()) {
    records.value = []
    error.value = 'Выберите голос или результат для загрузки контрольных записей.'
    return
  }

  loadingRecords.value = true
  error.value = ''
  searched.value = true

  try {
    records.value = await getIntegrityRecords(selectedObjectId.value.trim())
  } catch {
    records.value = []
    error.value = 'Не удалось загрузить записи для проверки целостности.'
  } finally {
    loadingRecords.value = false
  }
}

async function checkIntegrity(): Promise<void> {
  if (!selectedObject.value) {
    error.value = 'Выберите голос или результат, который нужно проверить.'
    return
  }

  checking.value = true
  error.value = ''
  message.value = ''
  isIntegrityValid.value = null

  try {
    const response = await runIntegrityCheck(
        selectedObject.value.id,
        selectedObject.value.objectType
    )

    const normalizedResponse = normalizeIntegrityResponse(response)

    message.value = normalizedResponse.message
    isIntegrityValid.value = normalizedResponse.valid

    await loadRecords()
  } catch {
    message.value = ''
    isIntegrityValid.value = null
    error.value = 'Не удалось выполнить проверку целостности.'
  } finally {
    checking.value = false
  }
}

function normalizeIntegrityResponse(response: unknown): { message: string; valid: boolean | null } {
  if (typeof response === 'string') {
    return {
      message: response,
      valid: detectIntegrityValidByMessage(response)
    }
  }

  const record = response as IntegrityCheckApiResponse

  const responseMessage = String(record?.message ?? 'Проверка целостности выполнена.')
  const responseValid = normalizeValidValue(record?.valid, responseMessage)

  return {
    message: responseMessage,
    valid: responseValid
  }
}

function normalizeValidValue(value: unknown, responseMessage: string): boolean | null {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase()

    if (normalizedValue === 'true' || normalizedValue === 'valid' || normalizedValue === 'success') {
      return true
    }

    if (normalizedValue === 'false' || normalizedValue === 'invalid' || normalizedValue === 'failed') {
      return false
    }
  }

  return detectIntegrityValidByMessage(responseMessage)
}

function detectIntegrityValidByMessage(value: string): boolean | null {
  const text = value.toLowerCase()

  if (
      text.includes('подтвержд') ||
      text.includes('успеш') ||
      text.includes('hash совп') ||
      text.includes('хэш совп') ||
      text.includes('не измен')
  ) {
    return true
  }

  if (
      text.includes('наруш') ||
      text.includes('не пройд') ||
      text.includes('не совп') ||
      text.includes('ошиб') ||
      text.includes('изменен') ||
      text.includes('изменён')
  ) {
    return false
  }

  return null
}

function clearSelection(): void {
  selectedObjectType.value = 'ALL'
  selectedObjectId.value = ''
  records.value = []
  message.value = ''
  isIntegrityValid.value = null
  error.value = ''
  searched.value = false
}

function objectTypeLabel(type?: string): string {
  switch (type) {
    case 'VOTE':
      return 'Голос пользователя'
    case 'RESULT':
      return 'Результат голосования'
    default:
      return 'Объект'
  }
}

function eventTypeLabel(eventType?: string): string {
  switch (eventType) {
    case 'VOTE_CAST':
      return 'Голос зафиксирован'
    case 'RESULT_CALCULATED':
      return 'Результаты рассчитаны'
    default:
      return eventType || 'Неизвестное событие'
  }
}

function eventTypeDescription(eventType?: string): string {
  switch (eventType) {
    case 'VOTE_CAST':
      return 'Проверяется конкретный голос пользователя.'
    case 'RESULT_CALCULATED':
      return 'Проверяются рассчитанные итоги голосования.'
    default:
      return 'Проверяется контрольная запись системы.'
  }
}

function statusLabel(status?: string): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Запись подтверждена'
    case 'PENDING':
      return 'Ожидает подтверждения'
    case 'FAILED':
      return 'Ошибка фиксации'
    default:
      return status || 'Неизвестный статус'
  }
}

function hashLabel(eventType?: string): string {
  switch (eventType) {
    case 'VOTE_CAST':
      return 'Сохраненный hash голоса'
    case 'RESULT_CALCULATED':
      return 'Сохраненный hash результата'
    default:
      return 'Сохраненный hash'
  }
}

function getRecordHash(record: BlockchainRecord): string {
  const recordWithDataHash = record as BlockchainRecord & { dataHash?: string | null }

  return record.hash || recordWithDataHash.dataHash || ''
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

async function copyText(value?: string): Promise<void> {
  if (!value) return

  try {
    await navigator.clipboard.writeText(value)
  } catch {
    // Браузер может запретить доступ к clipboard.
  }
}

watch(selectedElectionId, () => {
  selectedObjectId.value = ''
  loadIntegrityObjects()
})

watch(selectedObjectType, () => {
  selectedObjectId.value = ''
  records.value = []
  message.value = ''
  isIntegrityValid.value = null
  searched.value = false
  error.value = ''
})

watch(selectedObjectId, () => {
  message.value = ''
  isIntegrityValid.value = null
  records.value = []
  searched.value = false
  error.value = ''
})

onMounted(async () => {
  await loadElections()

  if (selectedElectionId.value) {
    await loadIntegrityObjects()
  }

  if (selectedObjectId.value) {
    await loadRecords()
  }
})
</script>

<template>
  <section class="page-title">
    <h1>Проверка целостности</h1>
    <p class="muted">
      Проверка того, изменялись ли голос или результат после фиксации hash-записи.
    </p>
  </section>

  <section class="card integrity-check">
    <div class="check-grid">
      <div class="search-form">
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
        <label for="objectType">Что проверяем?</label>
        <select
            id="objectType"
            v-model="selectedObjectType"
            :disabled="!selectedElectionId || loadingObjects"
        >
          <option value="ALL">Все объекты</option>
          <option value="VOTE">Только голоса</option>
          <option value="RESULT">Только результаты</option>
        </select>
      </div>

      <div class="search-form">
        <label for="objectId">Объект</label>
        <select
            id="objectId"
            v-model="selectedObjectId"
            :disabled="!selectedElectionId || loadingObjects || filteredObjects.length === 0"
        >
          <option value="">
            <template v-if="loadingObjects">Загрузка объектов...</template>
            <template v-else-if="!selectedElectionId">Сначала выберите голосование</template>
            <template v-else-if="filteredObjects.length === 0">Нет доступных объектов</template>
            <template v-else>Выберите голос или результат</template>
          </option>

          <option
              v-for="object in filteredObjects"
              :key="object.id"
              :value="object.id"
          >
            {{ objectTypeLabel(object.objectType) }} — {{ eventTypeLabel(object.eventType) }} —
            {{ shortValue(object.id) }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="selectedObject" class="selected-object-card">
      <span>Выбранный объект</span>
      <strong>{{ objectTypeLabel(selectedObject.objectType) }}</strong>
      <p class="muted">
        {{ eventTypeLabel(selectedObject.eventType) }}
        <br />
        ID: {{ selectedObject.id }}
        <br />
        Создано: {{ formatDate(selectedObject.createdAt) }}
      </p>
    </div>

    <div class="actions">
      <button
          class="btn btn-primary"
          type="button"
          :disabled="checking || !selectedObjectId"
          @click="checkIntegrity"
      >
        {{ checking ? 'Проверка...' : 'Проверить целостность' }}
      </button>

      <button
          class="btn btn-secondary"
          type="button"
          :disabled="loadingRecords || !selectedObjectId"
          @click="loadRecords"
      >
        {{ loadingRecords ? 'Загрузка...' : 'Показать записи' }}
      </button>

      <button
          class="btn btn-secondary"
          type="button"
          :disabled="checking || loadingRecords"
          @click="clearSelection"
      >
        Очистить
      </button>
    </div>
  </section>

  <p v-if="error" class="error-text">
    {{ error }}
  </p>

  <section
      v-if="message"
      class="card integrity-result"
      :class="`integrity-result-${integrityState}`"
  >
    <div class="integrity-result-icon">
      <span v-if="integrityState === 'success'">✓</span>
      <span v-else-if="integrityState === 'danger'">!</span>
      <span v-else>i</span>
    </div>

    <div>
      <h2>{{ integrityTitle }}</h2>
      <p>{{ message }}</p>
    </div>
  </section>

  <section v-if="loadingRecords" class="card empty-state">
    <h3>Загружаю контрольные записи...</h3>
    <p class="muted">
      Система ищет записи по выбранному объекту.
    </p>
  </section>

  <section v-else-if="searched && !hasRecords && !error" class="card empty-state">
    <h3>Контрольные записи не найдены</h3>
    <p class="muted">
      Для выбранного объекта пока нет blockchain-записи.
    </p>

    <div class="simple-hint">
      <strong>Что проверить:</strong>
      <ul>
        <li>для голоса запись появляется после успешного голосования;</li>
        <li>для результата запись появляется после расчета итогов;</li>
        <li>в базе должна быть запись в таблице <b>blockchain_records</b>;</li>
        <li>поле <b>related_object_id</b> должно совпадать с выбранным ID.</li>
      </ul>
    </div>
  </section>

  <section v-else-if="hasRecords" class="card">
    <div class="result-header">
      <div>
        <h2>Контрольные записи: {{ records.length }}</h2>
        <p class="muted">
          Эти записи используются для сравнения сохраненного hash с текущим состоянием данных.
        </p>
      </div>
    </div>

    <div class="records-list">
      <article
          v-for="record in records"
          :key="record.id"
          class="blockchain-record"
      >
        <div class="record-top">
          <div>
            <h3>{{ eventTypeLabel(record.eventType) }}</h3>
            <p class="muted">
              {{ eventTypeDescription(record.eventType) }}
            </p>
          </div>

          <StatusBadge :status="record.status" />
        </div>

        <div class="record-grid">
          <div class="record-field">
            <span>Объект проверки</span>
            <strong>{{ shortValue(record.relatedObjectId || record.electionTitle) }}</strong>
            <button
                v-if="record.relatedObjectId"
                type="button"
                class="copy-btn"
                @click="copyText(record.relatedObjectId)"
            >
              Скопировать
            </button>
          </div>

          <div class="record-field">
            <span>Тип события</span>
            <strong>{{ eventTypeLabel(record.eventType) }}</strong>
          </div>

          <div class="record-field">
            <span>Blockchain статус</span>
            <strong>{{ statusLabel(record.status) }}</strong>
          </div>

          <div class="record-field">
            <span>Дата фиксации</span>
            <strong>{{ formatDate(record.fixedAt) }}</strong>
          </div>
        </div>

        <div class="technical-details">
          <div class="detail-row">
            <span>{{ hashLabel(record.eventType) }}</span>
            <code>{{ getRecordHash(record) || '—' }}</code>
            <button
                v-if="getRecordHash(record)"
                type="button"
                class="copy-btn"
                @click="copyText(getRecordHash(record))"
            >
              Скопировать
            </button>
          </div>

          <div class="detail-row">
            <span>Transaction ID</span>
            <code>{{ record.transactionId || '—' }}</code>
            <button
                v-if="record.transactionId"
                type="button"
                class="copy-btn"
                @click="copyText(record.transactionId)"
            >
              Скопировать
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>

  <section v-else class="card empty-state">
    <h3>Начните с выбора объекта</h3>
    <p class="muted">
      Выберите голосование, тип объекта и конкретный голос или результат.
    </p>
  </section>

  <section class="card integrity-faq">
    <button
        class="faq-toggle"
        type="button"
        @click="faqOpen = !faqOpen"
    >
      <div>
        <h2>FAQ: как работает проверка целостности</h2>
        <p class="muted">
          Краткое объяснение, что именно проверяет система и как читать результат.
        </p>
      </div>

      <span class="faq-toggle-icon">
        {{ faqOpen ? '−' : '+' }}
      </span>
    </button>

    <div v-show="faqOpen" class="faq-list">
      <details open class="faq-item">
        <summary>Что делает вкладка «Проверка целостности»?</summary>
        <p>
          Эта вкладка проверяет, изменялись ли данные после фиксации. Система берет сохраненный
          hash из blockchain-записи и сравнивает его с hash, который backend заново рассчитывает
          по текущим данным.
        </p>
        <p>
          Если hash совпадает — данные не изменялись. Если hash отличается — возможно,
          данные были изменены напрямую в базе.
        </p>
      </details>

      <details class="faq-item">
        <summary>Чем отличается от вкладки «Blockchain-записи»?</summary>
        <p>
          Вкладка «Blockchain-записи» показывает сохраненные контрольные записи: hash,
          transaction ID, статус и дату фиксации.
        </p>
        <p>
          Вкладка «Проверка целостности» выполняет проверку: сравнивает сохраненный hash
          с заново рассчитанным hash.
        </p>
      </details>

      <details class="faq-item">
        <summary>Что проверяется, если выбрать «Только голоса»?</summary>
        <p>
          Проверяется конкретный <b>vote.id</b>. Это один факт голосования одного пользователя.
          Система проверяет, не менялись ли данные этого голоса после фиксации.
        </p>
      </details>

      <details class="faq-item">
        <summary>Что проверяется, если выбрать «Только результаты»?</summary>
        <p>
          Проверяется конкретный <b>result.id</b>. Это рассчитанные итоги голосования.
          Система проверяет, не менялись ли результаты после расчета и фиксации.
        </p>
      </details>

      <details class="faq-item">
        <summary>Что значит «Целостность подтверждена»?</summary>
        <p>
          Это значит, что сохраненный hash совпал с hash, заново рассчитанным по текущим данным.
          Следовательно, данные не были изменены после фиксации.
        </p>
      </details>

      <details class="faq-item">
        <summary>Что значит «Нарушение целостности»?</summary>
        <p>
          Это значит, что сохраненный hash и заново рассчитанный hash не совпадают.
          Такая ситуация может означать, что данные голоса или результата были изменены после фиксации.
        </p>
      </details>

      <details class="faq-item">
        <summary>Как проверить это вручную?</summary>
        <p>
          Для теста можно временно изменить данные голоса или результата в базе данных, не меняя
          запись в таблице <b>blockchain_records</b>. После этого проверка должна показать,
          что hash не совпадает.
        </p>
        <p>
          После теста данные лучше вернуть назад через <b>ROLLBACK</b> или обратный UPDATE.
        </p>
      </details>

      <details class="faq-item">
        <summary>Как объяснить это на защите?</summary>
        <p>
          Проверка целостности сравнивает сохраненный контрольный hash с hash, повторно рассчитанным
          по текущим данным. Если значения совпадают, данные не изменялись. Если отличаются,
          система обнаруживает нарушение целостности.
        </p>
      </details>
    </div>
  </section>
</template>