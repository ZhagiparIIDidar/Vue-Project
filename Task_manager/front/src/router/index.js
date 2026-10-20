import { createRouter, createWebHistory } from 'vue-router'
import { today, monthKey, isValidISO, isValidMonth } from '../utils/date.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: () => ({ name: 'week', params: { date: today() } }) },
    { path: '/month', redirect: () => ({ name: 'month', params: { ym: monthKey(today()) } }) },
    {
      path: '/week/:date',
      name: 'week',
      component: () => import('../views/WeekView.vue')
    },
    {
      path: '/day/:date',
      name: 'day',
      component: () => import('../views/DayView.vue')
    },
    {
      // :ym — центральный месяц; на экране он показывается вместе с предыдущим и следующим
      path: '/month/:ym',
      name: 'month',
      component: () => import('../views/MonthsView.vue')
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

// Невалидная дата или месяц в URL -> на главную.
// beforeEach, а не beforeEnter: срабатывает и при смене параметра на той же странице.
router.beforeEach(to => {
  if (to.params.date && !isValidISO(to.params.date)) return '/'
  if (to.params.ym && !isValidMonth(to.params.ym)) return '/'
})

export default router
