<script setup lang="ts">
interface Props {
  id?: string
  modelValue: string
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  required: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="ui-input-group">
    <div v-if="label || $slots.labelRight" class="label-row">
      <label v-if="label" :for="id">{{ label }}</label>
      <slot name="labelRight" />
    </div>

    <div class="input-wrapper" :class="{ 'has-error': error }">
      <div v-if="$slots.iconLeft" class="icon-left">
        <slot name="iconLeft" />
      </div>

      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        @input="onInput"
      />

      <div v-if="$slots.iconRight" class="icon-right">
        <slot name="iconRight" />
      </div>
    </div>

    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<style scoped>
.ui-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.icon-left {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  pointer-events: none;
  display: flex;
  align-items: center;
}

.icon-right {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
}

input {
  width: 100%;
  padding: 0.8rem 1rem;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-wrapper:has(.icon-left) input {
  padding-left: 2.75rem;
}

.input-wrapper:has(.icon-right) input {
  padding-right: 2.75rem;
}

input:focus {
  outline: none;
  border-color: var(--border-focus);
  background: var(--bg-input-focus);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

input::placeholder {
  color: var(--text-placeholder);
}

.has-error input {
  border-color: var(--color-danger-500);
}

.error-message {
  font-size: 0.8rem;
  color: var(--color-danger-text);
}
</style>
