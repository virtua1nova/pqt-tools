<script setup>
import { RouterLink, RouterView } from 'vue-router'
import AppInfo from './components/AppInfo.vue'
</script>

<template>
  <header style="height: inherit;">
    <img alt="烧匕" class="logo" style="box-shadow: 5px 5px 10px #00000063; border-radius: 10px;" src="@/assets/D996CDE7C4D89849804C141664DA2B04.gif" width="133" height="133" />
    <div class="wrapper">
      <AppInfo msg="吉赛尔的工具箱" style1="text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);" />
      <nav>
        <RouterLink to="/">
          <img src="@/assets/644829316013752339.webp" alt="精神支柱" width="24" height="24" style="vertical-align: sub;">
          <span style="margin-left: 0.5rem;">主页</span>
        </RouterLink>
        <RouterLink to="/about">关于</RouterLink>
        <a href="https://github.com/virtua1nova/pqt-tools" target="_blank">
          <img src="@/assets/github-mark.png" alt="" width="24" height="24" style="vertical-align: sub;">
          <span style="margin-left: 0.5rem;">Github</span>
        </a>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

/* @media (min-width: 1024px) { */
header {
  display: flex;
  place-items: center;
  padding-right: calc(var(--section-gap) / 2);
}

.logo {
  margin: 0 2rem 0 0;
}

header .wrapper {
  display: flex;
  place-items: flex-start;
  flex-wrap: wrap;
}

nav {
  text-align: left;
  margin-left: -1rem;
  font-size: 1rem;

  padding: 1rem 0;
  margin-top: 1rem;
}
/* } */
</style>
