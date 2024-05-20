<template>
  <div>
    <!-- 遍历按钮列表 -->
    <button
      v-for="button in buttonList"
      :key="button.tag"
      :id="button.tag"
      :disabled="button.disabled"
      class="bg-blue-400 hover:bg-blue-500 text-white font-light py-1 px-2 rounded-md m-0.5"
      @click="handleClick(button)"
    >
      {{ button.text }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { ButtonData } from "./button";

const { buttonList } = defineProps(["buttonList"]);

const handleClick = async (button: ButtonData) => {
  if (button.disabled) {
    return;
  }
  button.disabled = true; // 禁用按钮
  try {
    await button.handler(button.tag, button.params);
  } finally {
    button.disabled = false; // 重新启用按钮
  }
};
</script>

<style></style>
