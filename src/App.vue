<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header style="height: inherit;">
    <img alt="Vue logo" class="logo" style="border-radius: 20px;" src="@/assets/644829316013752339.webp" width="125" height="125" />
    <div class="wrapper">
      <HelloWorld msg="吉赛尔的工具箱" />
      <nav>
        <RouterLink to="/">主页</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
        <a href="https://github.com/virtua1nova/pqt-tools" target="_blank" style="position: relative;">
          <img src="@/assets/github-mark.png" alt="" width="24" height="24" style="position: absolute; top: 50%; transform: translateY(-50%); left: 1rem;">
          <span style="margin-left: 29px;">Github</span>
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
