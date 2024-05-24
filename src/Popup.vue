<template>
  <div
    class="p-3 m-0 text-gray-600 max-h-screen flex justify-center items-center"
  >
    <div class="w-96">
      <!-- 固定宽度为 24rem (96 * 0.25rem) -->
      <h1 class="text-lg font-normal mt-0 text-gray-800">Config Setting</h1>
      <form class="mt-4">
        <div v-for="field in fields" :key="field.name">
          <label :for="field.name" class="block text-sm font-semibold mb-2">
            {{ field.label }}
            <select
              v-if="field.type === 'select'"
              v-model="field.value"
              class="w-full mt-2 bg-gray-200 border-none rounded p-2 pr-10 text-sm text-gray-600"
            >
              <!-- 假设 field.options 是下拉框的选项数组 -->
              <option
                v-for="option in field.options"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <input
              v-else
              :type="field.type"
              v-model="field.value"
              class="w-full mt-2 bg-gray-200 border-none rounded p-2 pr-10 text-sm text-gray-600"
            />
            <div v-if="field.isLoading" class="loader"></div>
            <div v-if="field.isSuccess" class="check-icon">
              <span class="icon-line line-tip"></span>
              <span class="icon-line line-long"></span>
            </div>
          </label>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch, onMounted } from "vue";
import { initConfig, onInput, fields } from "./popup-config";

onMounted(async () => {
  await initConfig();

  fields.value.forEach((field) => {
    watch(
      () => field.value,
      (value) => {
        field.isLoading = true;
        field.isSuccess = false;
        onInput(field.name, value);
        setTimeout(() => {
          field.isLoading = false;
          field.isSuccess = true;
        }, 500);
        setTimeout(() => {
          field.isLoading = false;
          field.isSuccess = false;
        }, 1000);
      }
    );
  });
});
</script>

<style>
.loader {
  right: 40px;
  position: absolute;
  margin-top: -20px;
  display: grid;
}
.check-icon {
  scale: 0.4;
  right: 0;
  position: absolute;
  margin-top: -55px;
  display: grid;
}
</style>
