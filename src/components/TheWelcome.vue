<script setup>
import Tool from './Tool.vue'
// import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
// import EcosystemIcon from './icons/IconEcosystem.vue'
// import CommunityIcon from './icons/IconCommunity.vue'
// import SupportIcon from './icons/IconSupport.vue'
// import { RouterLink, RouterView } from 'vue-router'
// const openReadmeInEditor = () => fetch('/__open-in-editor?file=README.md')
</script>

<template>
  <Tool>
    <template #icon>
      <ToolingIcon />
    </template>
    
    <template #heading>
      <RouterLink to="/exchange-api-param-generator">一、兑换参数转换器</RouterLink>
    </template>
    <div style="text-indent: 2em;">
      用于自定义兑换相关参数；提供解析(通常是编码过的)、编辑、生成参数的功能。比方说，qt中存在一些可利用的漏洞，将原始抓包数据替换为自定义参数来达到超上限兑换物品的效果。
    </div>
  </Tool>
  <Tool>
    <template #icon>
      <ToolingIcon />
    </template>
    
    <template #heading>
      <RouterLink to="/request-interceptor">二、Request Interceptor</RouterLink>
    </template>
    <div style="text-indent: 2em;">
      一个简易的请求拦截器，可用于获取抓包数据，类似的工具有Charles、Fiddler、浏览器开发者等。
    </div>
  </Tool>
  <Tool>
    <template #icon>
      <ToolingIcon />
    </template>
    <template #heading>
      <a href="https://github.com/errr0l/pqt-claimer" target="_blank">三、活动收菜脚本</a>
    </template>
    <div style="text-indent: 2em;">
      用于自动领取约会、送礼等活动的材料。存在局限性，但总体比手机连点器好那么一点，推荐配合Request Interceptor一起，以减少操作的"复杂性"。
    </div>
  </Tool>
  <Tool>
    <template #icon>
      <ToolingIcon />
    </template>
    <template #heading>
      <a href="https://github.com/errr0l/automated-redemption-for-nutaku-daily-rewards" target="_blank">四、n站金币自动签到脚本</a>
    </template>
    <div style="text-indent: 2em;">
      虽然收益已经被拦腰斩，但也好过没有，蚊子腿也是肉.jpg(策划飞马)。
    </div>
  </Tool>
</template>
