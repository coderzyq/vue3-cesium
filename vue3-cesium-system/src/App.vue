<template>
    <hello-cesium></hello-cesium>
    <panel></panel>
</template>

<script>
import HelloCesium from '@/components/HelloCesium'
import Panel from '@/components/Panel'
export default {
  name: "App",
  components: {
    HelloCesium,
    Panel
  },
};
</script>

<style lang="scss">
html,
body, 
#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0
}
</style>
