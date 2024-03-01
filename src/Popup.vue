<template>
  <div class="p-5 m-0 text-gray-600">
    <h1 class="text-lg font-normal mt-0 text-gray-800">API 配置</h1>
    <form class="mt-4">
      <div v-for="field in fields" :key="field.name">
        <label :for="field.name" class="block text-sm font-semibold mb-2">
          {{ field.label }}
          <select v-if="field.type === 'select'" v-model="field.value"
            class="w-full mt-2 bg-gray-200 border-none rounded p-2 pr-10 text-sm text-gray-600">
            <!-- Assuming field.options is an array of options for the dropdown -->
            <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <input v-else :type="field.type" v-model="field.value"
            class="w-full mt-2 bg-gray-200 border-none rounded p-2 pr-10 text-sm text-gray-600" />
          <div v-if="field.isLoading" class="loader"></div>
          <div v-if="field.isSuccess" class="check-icon">
            <span class="icon-line line-tip"></span>
            <span class="icon-line line-long"></span>
          </div>
        </label>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import { init, onInput } from './translator-config';

export default defineComponent({
  name: 'Popup',
  setup() {
    const fields = ref([
      { label: 'OPENAI_API_KEY', name: 'openaiApiKey', type: 'password', value: '', isLoading: false, isSuccess: false },
      { label: 'OPENAI_ORGANIZATION', name: 'openaiOrganization', type: 'password', value: '', isLoading: false, isSuccess: false },
      {
        label: 'OPENAI_CHAT_MODEL', name: 'openaiChatModel', type: 'select', value: '', isLoading: false, isSuccess: false, options: [
          { value: 'gpt-3.5-turbo-1106', label: 'gpt-3.5', select: true },
          { value: 'gpt-4-turbo-preview', label: 'gpt-4.0' },
        ]
      }
    ]);

    onMounted(async () => {
      await init(fields.value);

      fields.value.forEach((field) => {
        watch(() => field.value, (value) => {
          field.isLoading = true;
          field.isSuccess = false;
          onInput(field.name, value);
          setTimeout(() => {
            field.isLoading = false;
            field.isSuccess = true;
          }, 1000);
          setTimeout(() => {
            field.isLoading = false;
            field.isSuccess = false;
          }, 3000);
        });
      });
    });

    return {
      fields,
    };
  },
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