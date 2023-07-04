import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import EventView from "../views/EventView.vue";

const routes = [
  {
    path: "/",
    name: "HomeView",
    component: HomeView,
    meta: { title: "Home | MSFS Events Calendar Viewer" },
  },
  {
    path: "/view-event/:url",
    name: "EventView",
    component: EventView,
    meta: { title: "Events | MSFS Events Calendar Viewer" },
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
   },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
