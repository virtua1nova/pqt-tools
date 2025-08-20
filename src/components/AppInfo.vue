<script setup>
defineProps({
  msg: {
    type: String,
    required: true,
  },
  style1: {
    type: String,
    default: ""
  }
})
</script>

<template>
  <div class="greetings">
    <h1 class="green" :style="style1">{{ msg }}</h1>
    <div>
      用于帮助完成QT相关数据处理的小工具集合(在有羊毛可薅的地方，尽管呼，随叫随到)。
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
