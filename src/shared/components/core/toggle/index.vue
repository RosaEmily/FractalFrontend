<script setup lang="ts">
import ToggleSwitch from "primevue/toggleswitch";
import type { ToggleCoreEmits, ToggleCoreProps } from "./type";

const props = withDefaults(defineProps<ToggleCoreProps>(), {
  defaultValue: undefined,
});

const emit = defineEmits<ToggleCoreEmits>();
</script>
<template>
  <ToggleSwitch
    :model-value="props.modelValue"
    :defaultValue="props.defaultValue"
    :name="props.name"
    :trueValue="props.trueValue"
    :falseValue="props.falseValue"
    :invalid="props.invalid"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :tabindex="props.tabindex"
    :inputId="props.inputId"
    :inputClass="props.inputClass"
    :inputStyle="props.inputStyle"
    :ariaLabelledby="props.ariaLabelledby"
    :ariaLabel="props.ariaLabel"
    :formControl="props.formControl"
    :dt="props.dt"
    :pt="props.pt"
    :ptOptions="props.ptOptions"
    :unstyled="props.unstyled"
    @value-change="emit('update:model-value', $event)"
  />
</template>
