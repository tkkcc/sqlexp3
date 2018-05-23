<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
<style lang="scss">
@import './styles/index.scss'; // 全局自定义的css样式
:not(input):not(textarea),
:not(input):not(textarea)::after,
:not(input):not(textarea)::before {
  -webkit-user-select: none;
  user-select: none;
  cursor: default;
}
// html {
//     overflow-x: hidden;
// }
::-webkit-scrollbar {
  background-color: #fff;
  width: 0.25em;
  height: 0.25em;
}

::-webkit-scrollbar-thumb:window-inactive,
::-webkit-scrollbar-thumb {
  background: slateblue;
}
// html,
// body {
//   height: 101%;
// }
</style>
