<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { BlockchainObjectReference, BlockchainRecord, Election } from '../../types'
import { getBlockchainObjects, getBlockchainRecords } from '../../api/integrityApi'
import { getElections } from '../../api/election'
import StatusBadge from '../../components/StatusBadge.vue'

const route = useRoute()

const elections = ref<Election[]>([])
const blockchainObjects = ref<BlockchainObjectReference[]>([])
const blockchainRecords = ref<BlockchainRecord[]>([])

const selectedElectionId = ref(String(route.query.electionId ?? ''))
const selectedObjectType = ref<'ALL' | 'VOTE' | 'RESULT'>('ALL')
const selectedObjectId = ref(String(route.query.objectId ?? ''))

const loadingElections = ref(false)
const loadingObjects = ref(false)
const loadingRecords = ref(false)

const error = ref('')
const searched = ref(false)
const faqOpen = ref(false)

const filteredObjects = computed(() => {
  if (selectedObjectType.value === 'ALL') {
    return blockchainObjects.value
  }

  return blockchainObjects.value.filter(
      object => object.objectType === selectedObjectType.value
  )
})

const selectedObject = computed(() => {
  return blockchainObjects.value.find(object => object.id === selectedObjectId.value)
})

const hasRecords = computed(() => blockchainRecords.value.length > 0)

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

async function loadBlockchainObjects(): Promise<void> {
  if (!selectedElectionId.value) {
    blockchainObjects.value = []
    selectedObjectId.value = ''
    blockchainRecords.value = []
    searched.value = false
    return
  }

  loadingObjects.value = true
  error.value = ''
  blockchainObjects.value = []
  blockchainRecords.value = []
  searched.value = false

  try {
    blockchainObjects.value = await getBlockchainObjects(selectedElectionId.value)

    if (
        selectedObjectId.value &&
        !blockchainObjects.value.some(object => object.id === selectedObjectId.value)
    ) {
      selectedObjectId.value = ''
    }
  } catch {
    error.value = 'Не удалось загрузить список голосов и результатов для выбранного голосования.'
  } finally {
    loadingObjects.value = false
  }
}

async function loadBlockchainRecords(): Promise<void> {
  if (!selectedElectionId.value) {
    error.value = 'Сначала выберите голосование.'
    return
  }

  if (!selectedObjectId.value) {
    error.value = 'Выберите голос или результат, который нужно проверить.'
    return
  }

  loadingRecords.value = true
  error.value = ''
  searched.value = true

  try {
    blockchainRecords.value = await getBlockchainRecords(selectedObjectId.value)
  } catch {
    blockchainRecords.value = []
    error.value = 'Не удалось загрузить blockchain-записи по выбранному объекту.'
  } finally {
    loadingRecords.value = false
  }
}

function clearSelection(): void {
  selectedObjectType.value = 'ALL'
  selectedObjectId.value = ''
  blockchainRecords.value = []
  searched.value = false
  error.value = ''
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
      return 'Запись создана после того, как пользователь проголосовал.'
    case 'RESULT_CALCULATED':
      return 'Запись создана после расчета итоговых результатов голосования.'
    default:
      return 'Контрольная запись, созданная системой.'
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
      return 'Hash (отпечаток голоса)'
    case 'RESULT_CALCULATED':
      return 'Hash (отпечаток результата)'
    default:
      return 'Hash'
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
  loadBlockchainObjects()
})

watch(selectedObjectType, () => {
  selectedObjectId.value = ''
  blockchainRecords.value = []
  searched.value = false
  error.value = ''
})

onMounted(async () => {
  await loadElections()

  if (selectedElectionId.value) {
    await loadBlockchainObjects()

    if (selectedObjectId.value) {
      await loadBlockchainRecords()
    }
  }
})
</script>

<template>
  <section class="page-title">
    <h1>Blockchain-записи</h1>
    <p class="muted">
      Проверка контрольных записей по голосам и результатам голосования.
    </p>
  </section>

  <section class="card blockchain-check">
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
          :disabled="loadingRecords || !selectedObjectId"
          @click="loadBlockchainRecords"
      >
        {{ loadingRecords ? 'Загрузка...' : 'Показать blockchain-записи' }}
      </button>

      <button
          class="btn btn-secondary"
          type="button"
          :disabled="loadingRecords"
          @click="clearSelection"
      >
        Очистить
      </button>
    </div>
  </section>

  <p v-if="error" class="error-text">
    {{ error }}
  </p>

  <section v-if="loadingRecords" class="card empty-state">
    <h3>Загружаю blockchain-записи...</h3>
    <p class="muted">
      Система ищет записи по выбранному объекту.
    </p>
  </section>

  <section v-else-if="searched && !hasRecords && !error" class="card empty-state">
    <h3>Blockchain-записи не найдены</h3>
    <p class="muted">
      Для выбранного объекта пока нет контрольной записи.
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
        <h2>Найдено записей: {{ blockchainRecords.length }}</h2>
        <p class="muted">
          Эти записи подтверждают, что выбранный объект был зафиксирован системой.
        </p>
      </div>
    </div>

    <div class="records-list">
      <article
          v-for="record in blockchainRecords"
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
            <span>Объект</span>
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
            <strong>{{ eventTypeLabel(record.eventType) || '—' }}</strong>
          </div>

          <div class="record-field">
            <span>Статус</span>
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
    <h3>Начните с выбора голосования</h3>
    <p class="muted">
      Выберите голосование, тип объекта и конкретный голос или результат.
    </p>
  </section>

  <section class="card blockchain-faq">
    <button
        class="faq-toggle"
        type="button"
        @click="faqOpen = !faqOpen"
    >
      <div>
        <h2>FAQ: как читать blockchain-записи</h2>
        <p class="muted">
          Краткая расшифровка полей и ситуаций, которые встречаются на этой странице.
        </p>
      </div>

      <span class="faq-toggle-icon">
        {{ faqOpen ? '−' : '+' }}
      </span>
    </button>

    <div v-show="faqOpen" class="faq-list">
      <details open class="faq-item">
        <summary>Что такое blockchain-запись в этой системе?</summary>
        <p>
          Blockchain-запись — это контрольная запись, которая создается после важного действия:
          голосования пользователя или расчета результатов. Она хранит hash, transaction ID,
          тип события, статус и дату фиксации.
        </p>
        <p>
          Простыми словами: система сохраняет цифровой отпечаток данных, чтобы потом можно было
          проверить, не изменялись ли голос или результат после фиксации.
        </p>
      </details>

      <details class="faq-item">
        <summary>Что означает «Только голоса»?</summary>
        <p>
          Этот режим показывает объекты типа <b>VOTE</b>. Каждый такой объект — это один конкретный
          голос пользователя в выбранном голосовании.
        </p>
        <p>
          Когда вы выбираете «Голос пользователя — ...», система ищет blockchain-запись именно
          по <b>vote.id</b>. То есть проверяется не всё голосование, а один конкретный факт голосования.
        </p>
      </details>

      <details class="faq-item">
        <summary>Что означает «Только результаты»?</summary>
        <p>
          Этот режим показывает объекты типа <b>RESULT</b>. Такой объект появляется после того,
          как администратор рассчитал итоги голосования.
        </p>
        <p>
          В этом случае hash относится к рассчитанным итогам: например, сколько голосов получил
          каждый вариант ответа и когда результат был рассчитан.
        </p>
      </details>

      <details class="faq-item">
        <summary>Что значит VOTE_CAST?</summary>
        <p>
          <b>VOTE_CAST</b> означает «Голос зафиксирован». Такая запись создается после того,
          как пользователь успешно проголосовал.
        </p>
        <p>
          Если на экране показано событие VOTE_CAST, значит выбранный <b>vote.id</b> был зафиксирован
          в системе контроля целостности.
        </p>
      </details>

      <details class="faq-item">
        <summary>Что значит RESULT_CALCULATED?</summary>
        <p>
          <b>RESULT_CALCULATED</b> означает «Результаты рассчитаны». Такая запись создается после
          расчета итогов голосования.
        </p>
        <p>
          Если на экране показано событие RESULT_CALCULATED, значит выбранный <b>result.id</b>
          был зафиксирован после подсчета голосов.
        </p>
      </details>

      <details class="faq-item">
        <summary>Что такое Hash?</summary>
        <p>
          Hash — это цифровой отпечаток данных. Для голоса hash формируется на основе данных
          конкретного голоса. Для результата hash формируется на основе рассчитанных итогов.
        </p>
        <p>
          Если кто-то вручную изменит данные в базе, например выбранный вариант ответа или количество
          голосов в результате, повторно рассчитанный hash уже будет другим.
        </p>
      </details>

      <details class="faq-item">
        <summary>Что такое Transaction ID?</summary>
        <p>
          Transaction ID — это внутренний идентификатор фиксации. В этой системе это не Ethereum
          и не Bitcoin-транзакция, а локальный номер контрольной операции.
        </p>
        <p>
          Его можно использовать как технический след: когда и для какого объекта была создана
          blockchain-запись.
        </p>
      </details>

      <details class="faq-item">
        <summary>Что означает статус «Запись подтверждена»?</summary>
        <p>
          Статус <b>CONFIRMED</b> означает, что blockchain-запись была успешно создана и сохранена.
        </p>
        <p>
          Для пользователя это значит: выбранный голос или результат получил контрольный hash
          и был зафиксирован системой.
        </p>
      </details>

      <details class="faq-item">
        <summary>Почему blockchain-записи не найдены?</summary>
        <p>
          Такое может быть, если пользователь еще не голосовал, результаты еще не рассчитаны
          или backend не создал запись в таблице <b>blockchain_records</b>.
        </p>
        <p>
          Для голосов запись появляется после голосования. Для результатов — после расчета итогов.
        </p>
      </details>

      <details class="faq-item">
        <summary>Как проверить, что данные не менялись?</summary>
        <p>
          Для настоящей проверки нужно сравнить сохраненный hash из blockchain-записи с новым hash,
          который backend заново рассчитывает по текущим данным голоса или результата.
        </p>
        <p>
          Если hash совпадает — данные не менялись. Если hash отличается — значит объект был изменен
          после фиксации.
        </p>
      </details>

      <details class="faq-item">
        <summary>Это настоящий blockchain как Ethereum?</summary>
        <p>
          Нет. В этой системе используется внутренний модуль фиксации контрольных hash-записей.
          Он работает по принципу blockchain-контроля целостности, но не является внешней
          децентрализованной сетью.
        </p>
        <p>
          Для дипломного проекта корректнее говорить: модуль контроля целостности данных,
          основанный на принципах blockchain-технологии.
        </p>
      </details>

      <details class="faq-item">
        <summary>Как правильно объяснить это на защите?</summary>
        <p>
          В системе blockchain-записи используются для контроля целостности данных. После голосования
          или расчета результатов backend формирует hash и сохраняет его в отдельной таблице.
        </p>
        <p>
          Если данные будут изменены напрямую в базе, новый hash не совпадет с сохраненным.
          Это позволяет обнаружить нарушение целостности.
        </p>
      </details>
    </div>
  </section>
</template>