import type { AuditEvent, BlockchainRecord, Election, User } from '../types'

export const elections: Election[] = [
  {
    id: 1,
    title: 'Выбор председателя студенческого совета',
    description: 'Голосование среди зарегистрированных пользователей за кандидата на должность председателя.',
    status: 'ACTIVE',
    startDateTime: '2026-05-10 09:00',
    endDateTime: '2026-05-15 18:00',
    participants: 42,
    voted: false,
    resultHash: 'res_8b7a91c2',
    voteHash: 'vote_a91c77e0',
    options: [
      { id: 1, text: 'Азамат уулу Нурбек', votes: 18 },
      { id: 2, text: 'Эсенова Айдана', votes: 24 }
    ]
  },
  {
    id: 2,
    title: 'Выбор темы мероприятия',
    description: 'Опрос для определения наиболее интересной темы мероприятия.',
    status: 'SCHEDULED',
    startDateTime: '2026-05-20 10:00',
    endDateTime: '2026-05-22 18:00',
    participants: 0,
    voted: false,
    resultHash: 'res_pending',
    voteHash: 'vote_pending',
    options: [
      { id: 1, text: 'Кибербезопасность', votes: 0 },
      { id: 2, text: 'Искусственный интеллект', votes: 0 },
      { id: 3, text: 'Backend-разработка', votes: 0 }
    ]
  },
  {
    id: 3,
    title: 'Оценка качества учебного процесса',
    description: 'Завершенное голосование для демонстрации страницы результатов.',
    status: 'FINISHED',
    startDateTime: '2026-04-01 09:00',
    endDateTime: '2026-04-10 18:00',
    participants: 120,
    voted: true,
    resultHash: 'res_12aa99ff',
    voteHash: 'vote_90bb31cd',
    options: [
      { id: 1, text: 'Отлично', votes: 70 },
      { id: 2, text: 'Хорошо', votes: 35 },
      { id: 3, text: 'Удовлетворительно', votes: 15 }
    ]
  }
]

export const users: User[] = [
  { id: 1, fullName: 'Администратор системы', username: 'admin', email: 'admin@evote.local', role: 'ADMIN', status: 'ACTIVE', createdAt: '2026-01-10' },
  { id: 2, fullName: 'Аудитор системы', username: 'auditor', email: 'auditor@evote.local', role: 'AUDITOR', status: 'ACTIVE', createdAt: '2026-01-12' },
  { id: 3, fullName: 'Обычный пользователь', username: 'voter', email: 'voter@evote.local', role: 'VOTER', status: 'ACTIVE', createdAt: '2026-02-01' },
  { id: 4, fullName: 'Заблокированный пользователь', username: 'blocked', email: 'blocked@evote.local', role: 'VOTER', status: 'BLOCKED', createdAt: '2026-02-15' }
]

export const auditEvents: AuditEvent[] = [
  { id: 1, createdAt: '2026-05-12 09:10', actor: 'admin', action: 'CREATE_ELECTION', description: 'Создано голосование' },
  { id: 2, createdAt: '2026-05-12 09:30', actor: 'voter', action: 'VOTE_ACCEPTED', description: 'Голос успешно принят' },
  { id: 3, createdAt: '2026-05-12 10:00', actor: 'system', action: 'RESULT_CALCULATED', description: 'Результат голосования рассчитан автоматически' }
]

export const blockchainRecords: BlockchainRecord[] = [
  { id: 1, electionTitle: 'Выбор председателя студенческого совета', eventType: 'VOTE_HASH', hash: '0x9A11C0...', transactionId: 'tx-100-001', status: 'VALID', fixedAt: '2026-05-12 09:31' },
  { id: 2, electionTitle: 'Оценка качества учебного процесса', eventType: 'RESULT_HASH', hash: '0x88BC12...', transactionId: 'tx-100-002', status: 'VALID', fixedAt: '2026-04-10 18:20' }
]
