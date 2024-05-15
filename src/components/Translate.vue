<template>
  <span
    class="whitespace-pre-wrap leading-tight text-sm text-gray-500 mt-2"
    style="text-overflow: unset"
  >
    <!-- 显示翻译内容 -->
    {{ translatedText }}
  </span>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";

const { translatedText } = defineProps(["translatedText"]);
</script>

<style></style>
