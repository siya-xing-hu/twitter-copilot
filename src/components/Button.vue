<template>
  <div>
    <!-- 遍历按钮列表 -->
    <button v-for="button in buttonList" :key="button.tag" :id="button.tag"
      class="bg-blue-400 hover:bg-blue-500 text-white font-thin py-1 px-2 rounded-md m-0.5"
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
