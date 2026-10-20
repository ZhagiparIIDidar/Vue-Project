# Поток событий каждой кнопки

Документ описывает полный путь от клика пользователя до обновления экрана для каждой кнопки и интерактивного элемента приложения.

---

## 0. Общие правила

### 0.1 Принцип

**Данные идут вниз (props), события идут вверх (emit).** Компонент не меняет данные сам: он сообщает родителю, а изменения выполняет слой `useTasks` / `useGoals`.

### 0.2 Как работает клик по `BaseButton`

`BaseButton` не объявляет `click` как собственное событие, поэтому `@click`, `type` и `disabled`, переданные снаружи, автоматически попадают на настоящий `<button>` внутри (fallthrough-атрибуты). Для всех кнопок ниже это шаг 1 пути.

### 0.3 Типовой путь изменения данных

Каждое действие, меняющее задачи или цели, проходит одну и ту же цепочку:

```
Клик
 ↓
Компонент: emit(...)
 ↓
Страница (View): обработчик
 ↓
composable (useTasks / useGoals): функция + обёртка run (ловит ошибки)
 ↓
api/storage.js: чтение → изменение → запись в localStorage
 ↓
composable: обновляет реактивное состояние (tasks / goals)
 ↓
Vue: пересчитывает computed, перерисовывает DOM
 ↓
Другие вкладки: событие storage → subscribe → перечитывают данные
```

### 0.4 Типовой путь навигации

Кнопки навигации данные не меняют, они меняют URL:

```
Клик → router.push({ name, params })
 ↓
router.beforeEach: проверка date / ym (isValidISO / isValidMonth)
   невалидно → редирект на «/»
 ↓
URL меняется, route.params обновляются (реактивно)
 ↓
Страница загружается лениво при первом заходе (import())
 ↓
computed от route.params пересчитываются → DOM перерисовывается
```

---

## 1. Сводная таблица

| # | Где | Элемент | Файл-источник | Результат |
|---|---|---|---|---|
| 1 | Шапка | Вкладка «Неделя» | `App.vue` | переход на `/week/<сегодня>` |
| 2 | Шапка | Вкладка «Месяцы» | `App.vue` | переход на `/month/<текущий месяц>` |
| 3 | Шапка | Вкладка «Сегодня» | `App.vue` | переход на `/day/<сегодня>` |
| 4 | Неделя | «← Пред.» | `WeekView.vue` | неделя назад |
| 5 | Неделя | «След. →» | `WeekView.vue` | неделя вперёд |
| 6 | Неделя | «Сегодня» | `WeekView.vue` | текущая неделя |
| 7 | Неделя | Клик по колонке дня | `DayColumn.vue` | переход на страницу дня |
| 8 | День | «← К неделе» | `DayView.vue` | неделя, содержащая этот день |
| 9 | День | «‹» | `DayView.vue` | предыдущий день |
| 10 | День | «›» | `DayView.vue` | следующий день |
| 11 | День | «Добавить» | `TaskForm.vue` | создание задачи |
| 12 | День | «Сохранить» | `TaskForm.vue` | сохранение изменений задачи |
| 13 | День | «Отмена» | `TaskForm.vue` | выход из режима редактирования |
| 14 | День | «Выполнить / Вернуть» | `TaskItem.vue` | смена статуса `done` ↔ `todo` |
| 15 | День | «Изменить» | `TaskItem.vue` | вход в режим редактирования |
| 16 | День | «Удалить» | `TaskItem.vue` | удаление с подтверждением |
| 17 | День | Список «Статус» | `TaskItem.vue` | смена статуса задачи |
| 18 | День | Список «Приоритет» | `TaskItem.vue` | смена приоритета задачи |
| 19 | Фильтры | Поле поиска | `TaskFilters.vue` | фильтрация по тексту |
| 20 | Фильтры | Список приоритетов | `TaskFilters.vue` | фильтрация по приоритету |
| 21 | Фильтры | Список статусов | `TaskFilters.vue` | фильтрация по статусу |
| 22 | Фильтры | «Сбросить» | `TaskFilters.vue` | сброс всех фильтров |
| 23 | Месяцы | «← Пред.» | `MonthsView.vue` | окно месяцев на месяц назад |
| 24 | Месяцы | «След. →» | `MonthsView.vue` | окно месяцев на месяц вперёд |
| 25 | Месяцы | «Сегодня» | `MonthsView.vue` | окно вокруг текущего месяца |
| 26 | Месяцы | Клик по клетке дня | `MonthCalendar.vue` | переход на страницу дня |
| 27 | Месяцы | «Задать / Изменить» (цель) | `GoalEditor.vue` | открытие редактора цели |
| 28 | Месяцы | «Сохранить» (цель) | `GoalEditor.vue` | сохранение цели месяца или года |
| 29 | Месяцы | «Отмена» (цель) | `GoalEditor.vue` | закрытие редактора без сохранения |

---

## 2. Навигация в шапке (`App.vue`)

### 2.1 Вкладки «Неделя», «Месяцы», «Сегодня»

```
Клик по <RouterLink>
 ↓
RouterLink отменяет обычный переход браузера (без перезагрузки страницы)
 ↓
router.push на маршрут из :to
   «Неделя»  → { name: 'week',  params: { date: today() } }
   «Месяцы»  → { name: 'month', params: { ym: monthKey(today()) } }
   «Сегодня» → { name: 'day',   params: { date: today() } }
 ↓
beforeEach: валидация параметров (today() всегда валидна)
 ↓
RouterView показывает нужную страницу
 ↓
Подсветка вкладки: isActive(name) сравнивает route.name с именем вкладки
```

Подсветка зависит от **имени** маршрута, а не от параметров, поэтому вкладка «Неделя» остаётся активной на любой неделе, а не только на текущей.

---

## 3. Страница недели (`WeekView.vue`)

### 3.1 «← Пред.» и «След. →»

```
Клик по BaseButton
 ↓
goWeek(-1) / goWeek(1)
 ↓
addWeeks(date.value, offset)        // utils/date.js
   → addDays(iso, offset * 7)       // fromISO → setDate → toISO
 ↓
router.push({ name: 'week', params: { date: <новая дата> } })
 ↓
beforeEach → валидная дата → переход
 ↓
route.params.date изменился → пересчитываются computed:
   date → days (getWeekDays) → byDay (tasksForDates) → stats (getStats)
 ↓
Vue перерисовывает заголовок диапазона недели, 7 DayColumn и статистику
```

Страница та же, поэтому компонент `WeekView` не пересоздаётся: обновляются только зависимые computed.

### 3.2 «Сегодня»

```
Клик → goToday()
 ↓
router.push({ name: 'week', params: { date: todayISO } })
 ↓
(дальше как в 3.1)
```

### 3.3 Клик по колонке дня (или Enter с клавиатуры)

```
Клик / Enter по <div role="button" tabindex="0"> в DayColumn
 ↓
emit('open', date)
 ↓
WeekView: @open="openDay"
 ↓
openDay(d) → router.push({ name: 'day', params: { date: d } })
 ↓
Загрузка DayView (лениво при первом заходе), показ страницы дня
```

---

## 4. Страница дня (`DayView.vue`)

### 4.1 «← К неделе»

```
Клик → goWeek()
 ↓
router.push({ name: 'week', params: { date: date.value } })
 ↓
WeekView показывает неделю, в которой находится этот день
(getWeekDays сам находит понедельник через startOfWeek)
```

### 4.2 «‹» и «›» (предыдущий и следующий день)

```
Клик → goDay(-1) / goDay(1)
 ↓
addDays(date.value, offset)
 ↓
router.push({ name: 'day', params: { date: <новая дата> } })
 ↓
watch(date) в DayView: editingTask = null (режим редактирования сбрасывается)
 ↓
watch(defaultDate) в TaskForm: поле даты формы получает новый день
 ↓
Пересчитываются tasks и stats, перерисовывается список
```

### 4.3 «Добавить» (создание задачи)

```
Клик по BaseButton type="submit"
 ↓
Браузер вызывает событие submit формы
 ↓
@submit.prevent="onSubmit"   (.prevent отменяет перезагрузку страницы)
 ↓
TaskForm.onSubmit: проверка isValid (название не пустое, дата заполнена)
 ↓
emit('submit', { title, description, priority, date })
 ↓
Сразу после emit: resetForm() (поля очищаются, дата = defaultDate)
 ↓
DayView.handleSubmit(data): editingTask пуст → addTask(data)
 ↓
useTasks.addTask → run(...) → api.createTask(data)
 ↓
storage.createTask:
   id = crypto.randomUUID(), createdAt/updatedAt = сейчас, status = 'todo'
   normalizeTask(...) → запись [новая, ...старые] в localStorage
   возврат созданной задачи
 ↓
tasks.value.unshift(created)
 ↓
Vue: пересчитывает tasks и stats в DayView, а также зависимые значения
     в WeekView и MonthsView
 ↓
Другие вкладки: событие storage → перечитывают список задач
```

Кнопка неактивна (`:disabled="!isValid"`), пока не заполнены название и дата. Если выбрать в форме дату, отличную от текущей страницы, задача сохранится, но в списке текущего дня не появится: она будет на своей дате.

### 4.4 «Изменить» (вход в режим редактирования)

```
Клик в TaskItem → emit('edit', task)
 ↓
DayView: @edit="t => (editingTask = t)"
 ↓
watch(() => props.editingTask) в TaskForm (immediate)
 ↓
Форма заполняется: title, description, priority, date из задачи
 ↓
isEditing = true → заголовок «Редактирование задачи»,
   кнопка «Сохранить» вместо «Добавить», появляется кнопка «Отмена»
```

Данные не меняются, меняется только состояние интерфейса.

### 4.5 «Сохранить» (применение редактирования)

```
Клик по BaseButton type="submit"
 ↓
TaskForm.onSubmit → emit('submit', { title, description, priority, date })
   (статус не передаётся, поэтому прежний сохраняется)
 ↓
DayView.handleSubmit: editingTask задан → await updateTask(editingTask.id, data)
 ↓
useTasks.updateTask → run → api.updateTask(id, patch)
 ↓
storage.updateTask:
   находит задачу по id (нет — ошибка «Задача не найдена»)
   объединяет { ...старая, ...patch }, id и createdAt защищены,
   updatedAt = сейчас, normalizeTask
   записывает массив
   возвращает обновлённую задачу
 ↓
replace(updated): задача в массиве tasks заменяется
 ↓
DayView: editingTask = null
 ↓
watch в TaskForm: editingTask null → resetForm()
 ↓
Vue перерисовывает: если дата изменилась, задача исчезает из текущего дня
   и появляется в нужной колонке недели и клетке месяца
```

### 4.6 «Отмена»

```
Клик по BaseButton type="button" (не отправляет форму)
 ↓
emit('cancel')
 ↓
DayView: @cancel="editingTask = null"
 ↓
watch в TaskForm → resetForm(); isEditing = false
 ↓
Форма снова в режиме «Новая задача», кнопка «Отмена» исчезает
```

### 4.7 «Выполнить» / «Вернуть»

```
Клик в TaskItem
 ↓
emit('change-status', task.id, isDone ? 'todo' : 'done')
 ↓
DayView: @change-status="setStatus"
 ↓
useTasks.setStatus(id, status) → updateTask(id, { status })
 ↓
(дальше цепочка 4.5: api.updateTask → replace в tasks)
 ↓
Vue: TaskItem получает новый проп task → пересчитываются isDone и statusText,
   меняются класс task--done (зачёркнутое название), бейдж и надпись кнопки
 ↓
Пересчитывается stats: изменяются счётчики и полоса прогресса
```

### 4.8 «Удалить»

```
Клик в TaskItem → emit('delete', task.id)
 ↓
DayView.onDelete(id)
 ↓
confirm('Удалить задачу?')
   «Отмена» → функция завершается, ничего не меняется
   «ОК» → дальше
 ↓
deleteTask(id) → run → api.deleteTask(id)
 ↓
storage.deleteTask: фильтрует массив, записывает в localStorage
 ↓
tasks.value = tasks.value.filter(t => t.id !== id)
 ↓
Если удалённая задача редактировалась: editingTask = null
 ↓
Vue убирает карточку из списка (v-for по :key="task.id"),
   пересчитывает статистику; если задач нет — «На этот день задач нет»
```

### 4.9 Список «Статус» в карточке задачи

```
Выбор значения → событие change у <select>
 ↓
emit('change-status', task.id, $event.target.value)
 ↓
(дальше полностью совпадает с 4.7: setStatus → updateTask → replace)
```

### 4.10 Список «Приоритет» в карточке задачи

```
Выбор значения → событие change у <select>
 ↓
emit('change-priority', task.id, $event.target.value)
 ↓
DayView: @change-priority="setPriority"
 ↓
useTasks.setPriority(id, priority) → updateTask(id, { priority })
 ↓
api.updateTask → replace в tasks
 ↓
tasksForDate заново сортирует список (высокий приоритет первым)
 ↓
Vue переставляет карточку на новое место (ключ :key="task.id" сохраняет
   компонент), меняется цвет левой рамки; в неделе и месяцах — цвет индикаторов
```

---

## 5. Фильтры и поиск (`TaskFilters.vue`)

Компонент используется на неделе, в дне и на экране месяцев с одними и теми же привязками:

```vue
<TaskFilters
  v-model:search="filters.search"
  v-model:priority="filters.priority"
  v-model:status="filters.status"
  @reset="resetFilters" />
```

`filters` — общий `reactive`-объект из `useTasks`, живёт на уровне модуля.

### 5.1 Поле поиска

```
Ввод символа → событие input
 ↓
emit('update:search', $event.target.value)
 ↓
v-model:search выполняет filters.search = значение
 ↓
Все computed, вызывающие tasksForDate / tasksForDates (matches читает filters),
   пересчитываются
 ↓
Неделя: меняются списки в колонках
День: меняется список карточек, при пустом результате — «Ничего не найдено»
Месяцы: пересчитываются значки в клетках
Статистика недели и дня НЕ меняется (считается без фильтров)
```

Поиск без учёта регистра по названию и описанию. Значение хранится в общем состоянии, поэтому сохраняется при переходе между страницами.

### 5.2 Списки приоритета и статуса

```
Выбор значения → событие change
 ↓
emit('update:priority' | 'update:status', значение)
 ↓
filters.priority / filters.status обновляется
 ↓
(дальше как в 5.1)
```

Значение `all` отключает соответствующий фильтр.

### 5.3 «Сбросить»

```
Кнопка видна только если hasActiveFilters (хотя бы один фильтр задан)
 ↓
Клик → emit('reset')
 ↓
@reset="resetFilters" → search = '', priority = 'all', status = 'all'
 ↓
Props в TaskFilters обновляются, поля возвращаются в исходное состояние
 ↓
hasActiveFilters = false → кнопка «Сбросить» исчезает
 ↓
Списки и индикаторы пересчитываются на полный набор задач
```

---

## 6. Страница месяцев (`MonthsView.vue`)

### 6.1 «← Пред.» и «След. →»

```
Клик → goMonth(-1) / goMonth(1)
 ↓
addMonths(ym.value, offset)    // new Date(y, m - 1 + n, 1) сам переходит через год
 ↓
router.push({ name: 'month', params: { ym: <новый месяц> } })
 ↓
beforeEach: isValidMonth(ym)
 ↓
Пересчитываются computed:
   ym → months = [−1, ym, +1] → byDate:
      getMonthGrid ×3 → flat → filter(inMonth) → map(date) → tasksForDates
   year = ym.slice(0, 4)
 ↓
v-for по months с :key="m": два месяца остаются и сдвигаются,
   один исчезает, один появляется
   (у исчезнувшего месяца состояние GoalEditor теряется)
 ↓
Подсвеченным становится новый центральный месяц (is-current)
```

Цель года обновится, если окно перешло на другой год (она берётся для года центрального месяца).

### 6.2 «Сегодня»

```
Клик → goToday()
 ↓
router.push({ name: 'month', params: { ym: monthKey(todayISO) } })
 ↓
(дальше как в 6.1)
```

### 6.3 Клик по клетке дня

```
Клик по <button class="cell"> в MonthCalendar
 ↓
emit('open', cell.date)
 ↓
MonthsView: @open="openDay"
 ↓
router.push({ name: 'day', params: { date } })
 ↓
Открывается страница дня
```

Клетки соседних месяцев отрисовываются пустыми `div` и кликов не принимают.

---

## 7. Редактор цели (`GoalEditor.vue`)

Один компонент используется для цели месяца (внутри каждого `MonthCalendar`) и для цели года (в `MonthsView`). Отличаются только привязки.

### 7.1 «Задать» / «Изменить»

```
Клик → start()
 ↓
draft = текущий текст (props.modelValue); editing = true
 ↓
Шаблон переключается: вместо текста и кнопки — textarea и две кнопки
```

Данные не меняются, только локальное состояние компонента.

### 7.2 «Сохранить» (и Ctrl+Enter в поле)

```
Клик (или Ctrl+Enter) → save()
 ↓
emit('save', draft)
 ↓
editing = false
 ↓
Дальше путь зависит от привязки:

Цель месяца:
   MonthCalendar: @save="text => setMonthGoal(ym, text)"
    ↓
   useGoals.setMonthGoal → api.saveGoal('months', ym, text)

Цель года:
   MonthsView: @save="text => setYearGoal(year, text)"
    ↓
   useGoals.setYearGoal → api.saveGoal('years', String(year), text)
 ↓
storage.saveGoal:
   getGoals → value = text.trim()
   текст есть → goals[type][key] = value
   текст пустой → delete goals[type][key]
   запись в localStorage, возврат всех целей
 ↓
goals.value = результат
 ↓
getMonthGoal(ym) / getYearGoal(year) в шаблонах перечитываются,
   проп modelValue обновляется, показывается новый текст
   (или «Цель не задана» после удаления)
 ↓
Другие вкладки: событие storage → subscribe('goals') → initGoals перечитывает цели
```

### 7.3 «Отмена» (и Esc в поле)

```
Клик (или Esc) → cancel()
 ↓
editing = false
 ↓
Черновик (draft) отбрасывается, показывается прежний текст цели
```

События наружу не отправляются, данные не меняются.

---

## 8. Что происходит в других вкладках

После любой записи в `localStorage` браузер отправляет событие `storage` во все **остальные** вкладки (в той, где запись произошла, оно не приходит):

```
window 'storage' → обработчик из api.subscribe
 ↓
ключ задач → onChange('tasks') → useTasks: tasks.value = await api.getTasks()
ключ целей → onChange('goals') → useGoals: goals.value = await api.getGoals()
 ↓
Vue перерисовывает интерфейс во второй вкладке
```

---

## 9. Итог

| Тип кнопки | Меняет данные? | Затрагивает |
|---|---|---|
| Навигация (вкладки, недели, месяцы, дни, клики по ячейкам) | нет | URL → computed → DOM |
| Создание / редактирование / удаление / смена статуса и приоритета | да | useTasks → storage → tasks → все страницы |
| Цели | да | useGoals → storage → goals |
| Фильтры и поиск | нет (только состояние `filters`) | computed во всех страницах |
| «Изменить», «Задать», «Отмена» | нет | локальное состояние формы или редактора |
