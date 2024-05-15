<template>
  <div
    class="fixed inset-0 bg-gray-200 bg-opacity-75 flex justify-center items-center"
  >
    <div class="bg-white p-6 rounded-lg shadow-md w-96 relative">
      <!-- 关闭按钮 -->
      <div class="absolute top-0 left-0 p-2">
        <button @click="cancel" class="text-gray-600 hover:text-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <!-- 标题和内容 -->
      <div class="text-center">
        <span class="font-semibold">AI Generate</span>
        <p class="mt-2 text-gray-600">{{ text }}</p>
      </div>
      <div class="flex justify-around mt-6">
        <button
          @click="confirm"
          class="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-full"
        >
          Confirm
        </button>
        <button
          @click="cancel"
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Dialog",
  props: {
    text: String,
  },
  methods: {
    confirm() {
      this.$emit("confirm");
    },
    cancel() {
      this.$emit("cancel");
    },
  },
});
</script>

<style>
/* 这里可以添加一些 CSS 样式，或者使用 Tailwind CSS 类 */
</style>
