<template>
  <div id="tt-post-buttons">
    <!-- 遍历按钮列表 -->
    <button v-for="button in buttonList" :key="button.tag" :id="button.tag" class=""
      @click="button.handler(button.tag, button.params)">
      {{ button.text }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";

const { buttonList } = defineProps(["buttonList"]);
</script>

<style></style>
