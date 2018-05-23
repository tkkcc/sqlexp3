import Vue from 'vue'
import Router from 'vue-router'
// const _import = file => require('@/views/' + file + '.vue').default


// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', component: () => import('@/views/404'), hidden: true },

  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [{
      path: 'dashboard',
      component: () => import('@/views/dashboard/index'),
      name: 'dashboard',
      meta: { title: 'dashboard', icon: 'dashboard', noCache: true }
    }]
  },
  // {
  //   path: '/',
  //   component: Layout,
  //   redirect: '/dashboard',
  //   name: 'Dashboard',
  //   // hidden: true,
  //   children: [{
  //     path: 'dashboard',
  //     component: () => import('@/views/dashboard/index')
  //   }]
  // },
  {
    path: '/registry',
    component: Layout,
    children: [{
      path: '',
      component: () => import('@/views/registry/index'),
      name: 'registry',
      meta: { title: 'registry', icon: 'form' }
    }]
  },
  {
    name: 'sql',
    meta: {
      title: 'sql',
      icon: 'sql'
    },
    path: '/sql',
    component: Layout,
    redirect: '/sql/manager',
    children: [{
      path: 'manager',
      component: () => import('@/views/sql/manager'),
      name: 'manager',
      meta: { title: 'manager', noCache: true }
    }, {
      path: 'store',
      component: () => import('@/views/sql/store'),
      name: 'store',
      meta: { title: 'store', noCache: true }
    },
    {
      path: 'room',
      component: () => import('@/views/sql/room'),
      name: 'room',
      meta: { title: 'room', noCache: true }
    },
    {
      path: 'warehouse',
      component: () => import('@/views/sql/warehouse'),
      name: 'warehouse',
      meta: { title: 'warehouse', noCache: true }
    },
    {
      path: 'employee',
      component: () => import('@/views/sql/employee'),
      name: 'employee',
      meta: { title: 'employee', noCache: true }
    },
    {
      path: 'department',
      component: () => import('@/views/sql/department'),
      name: 'department',
      meta: { title: 'department', noCache: true }
    },
    {
      path: 'customer',
      component: () => import('@/views/sql/customer'),
      name: 'customer',
      meta: { title: 'customer', noCache: true }
    },
    {
      path: 'consumption',
      component: () => import('@/views/sql/consumption'),
      name: 'consumption',
      meta: { title: 'consumption', noCache: true }
    },
    {
      path: 'checkin',
      component: () => import('@/views/sql/checkin'),
      name: 'checkin',
      meta: { title: 'checkin', noCache: true }
    },
    ]
  },

  // {
  //   path: '/example',
  //   component: Layout,
  //   redirect: '/example/table',
  //   name: 'Example',
  //   meta: { title: 'Example', icon: 'example' },
  //   children: [
  //     {
  //       path: 'table',
  //       name: 'Table',
  //       component: () => import('@/views/table/index'),
  //       meta: { title: 'Table', icon: 'table' }
  //     },
  //     {
  //       path: 'tree',
  //       name: 'Tree',
  //       component: () => import('@/views/tree/index'),
  //       meta: { title: 'Tree', icon: 'tree' }
  //     }
  //   ]
  // },

  // {
  //   path: '/form',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       name: 'Form',
  //       component: () => import('@/views/form/index'),
  //       meta: { title: 'Form', icon: 'form' }
  //     }
  //   ]
  // },

  { path: '*', redirect: '/404', hidden: true }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

