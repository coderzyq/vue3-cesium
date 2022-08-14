<template>
  <init-cesium></init-cesium>
</template>

<script>
import InitCesium from "@/components/InitCesium";

export default {
  name: "App",
  components: {
    InitCesium,
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
  padding: 0;
}
</style>
