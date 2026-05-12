<template>
  <section class="hero card">
    <div>
      <p class="eyebrow">Дипломная работа</p>
      <h1>Веб-система электронного голосования</h1>
      <p class="muted large-text">
        Простой интерфейс для проведения голосований, подачи голоса, просмотра результатов,
        аудита и проверки целостности данных.
      </p>
      <div class="actions">
        <RouterLink class="btn btn-primary" to="/login">Войти</RouterLink>
        <RouterLink class="btn btn-secondary" to="/register">Зарегистрироваться</RouterLink>
      </div>
    </div>
  </section>

  <section class="grid grid-3">
    <article class="card">
      <h3>Конфиденциальность</h3>
      <p class="muted">Голос пользователя не отображается напрямую, а факт участия хранится отдельно.</p>
    </article>
    <article class="card">
      <h3>Целостность</h3>
      <p class="muted">Контрольные хэши помогают проверить, что результаты не были изменены.</p>
    </article>
    <article class="card">
      <h3>Аудит</h3>
      <p class="muted">Критические действия фиксируются в журнале событий.</p>
    </article>
  </section>
</template>
