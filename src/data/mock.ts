import type { AuditEvent, BlockchainRecord, Election, User } from '../types'

export const elections: Election[] = [
  {
    id: '1',
    name: 'Выбор председателя студенческого совета',
    description: 'Голосование среди зарегистрированных пользователей за кандидата на должность председателя.',
    status: 'ACTIVE',
    startDateTime: '2026-05-10 09:00:00',
    endDateTime: '2026-05-15 18:00:00',
    createdAt: '2026-05-01 10:00:00',
    resultVisibilityType: 'AFTER_FINISH',
    resultPublished: false,
    creatorInfo: 'admin',
    accessElectionType: 'ALL_AUTHORIZED_USERS',
    participants: 42,
    voted: false,
    resultHash: 'res_8b7a91c2',
    voteHash: 'vote_a91c77e0',
    options: [
      { id: '1', text: 'Азамат уулу Нурбек', orderNumber: 1, votes: 18, percentage: 42.86 },
      { id: '2', text: 'Эсенова Айдана', orderNumber: 2, votes: 24, percentage: 57.14 }
    ]
  },
  {
    id: '2',
    name: 'Выбор темы мероприятия',
    description: 'Опрос для определения наиболее интересной темы мероприятия.',
    status: 'SCHEDULED',
    startDateTime: '2026-05-20 10:00:00',
    endDateTime: '2026-05-22 18:00:00',
    createdAt: '2026-05-05 10:00:00',
    resultVisibilityType: 'AFTER_FINISH',
    resultPublished: false,
    creatorInfo: 'admin',
    accessElectionType: 'ALL_AUTHORIZED_USERS',
    participants: 0,
    voted: false,
    resultHash: '',
    voteHash: '',
    options: [
      { id: '1', text: 'Кибербезопасность', orderNumber: 1, votes: 0, percentage: 0 },
      { id: '2', text: 'Искусственный интеллект', orderNumber: 2, votes: 0, percentage: 0 },
      { id: '3', text: 'Backend-разработка', orderNumber: 3, votes: 0, percentage: 0 }
    ]
  },
  {
    id: '3',
    name: 'Оценка качества учебного процесса',
    description: 'Завершенное голосование для демонстрации страницы результатов.',
    status: 'COMPLETED',
    startDateTime: '2026-04-01 09:00:00',
    endDateTime: '2026-04-10 18:00:00',
    createdAt: '2026-03-25 10:00:00',
    resultVisibilityType: 'AFTER_FINISH',
    resultPublished: true,
    creatorInfo: 'admin',
    accessElectionType: 'ALL_AUTHORIZED_USERS',
    participants: 120,
    voted: true,
    resultHash: 'res_12aa99ff',
    voteHash: 'vote_90bb31cd',
    options: [
      { id: '1', text: 'Отлично', orderNumber: 1, votes: 70, percentage: 58.33 },
      { id: '2', text: 'Хорошо', orderNumber: 2, votes: 35, percentage: 29.17 },
      { id: '3', text: 'Удовлетворительно', orderNumber: 3, votes: 15, percentage: 12.5 }
    ]
  }
]

export const users: User[] = [
  { id: '1', firstname: 'Администратор', name: 'системы', username: 'admin', email: 'admin@evote.local', roles: ['ADMIN'], role: 'ADMIN', status: 'ACTIVE', createdAt: '2026-01-10' },
  { id: '2', firstname: 'Аудитор', name: 'системы', username: 'auditor', email: 'auditor@evote.local', roles: ['AUDITOR'], role: 'AUDITOR', status: 'ACTIVE', createdAt: '2026-01-12' },
  { id: '3', firstname: 'Обычный', name: 'пользователь', username: 'user', email: 'user@evote.local', roles: ['USER'], role: 'USER', status: 'ACTIVE', createdAt: '2026-02-01' },
  { id: '4', firstname: 'Заблокированный', name: 'пользователь', username: 'blocked', email: 'blocked@evote.local', roles: ['USER'], role: 'USER', status: 'BLOCKED', createdAt: '2026-02-15' }
]

export const auditEvents: AuditEvent[] = [
  { id: '1', createdAt: '2026-05-12 09:10:00', actor: 'admin', action: 'ELECTION_CREATED', description: 'Создано голосование' },
  { id: '2', createdAt: '2026-05-12 09:30:00', actor: 'user', action: 'VOTE_CAST', description: 'Голос успешно принят' },
  { id: '3', createdAt: '2026-05-12 10:00:00', actor: 'system', action: 'RESULT_CALCULATED', description: 'Результат голосования рассчитан автоматически' }
]

export const blockchainRecords: BlockchainRecord[] = [
  { id: '1', relatedObjectId: '1', electionTitle: 'Выбор председателя студенческого совета', eventType: 'VOTE_CAST', hash: '0x9A11C0...', transactionId: 'tx-100-001', status: 'CONFIRMED', fixedAt: '2026-05-12 09:31:00', verifiedAt: '' },
  { id: '2', relatedObjectId: '3', electionTitle: 'Оценка качества учебного процесса', eventType: 'RESULT_CALCULATED', hash: '0x88BC12...', transactionId: 'tx-100-002', status: 'CONFIRMED', fixedAt: '2026-04-10 18:20:00', verifiedAt: '' }
]
