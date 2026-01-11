<script setup lang="ts">
import Dialog from "primevue/dialog";
import type { ModalCoreEmits, ModalCoreProps } from "./type";

const props = withDefaults(defineProps<ModalCoreProps>(), {
    showHeader: true,
    closable: true,
});
const emit = defineEmits<ModalCoreEmits>();
const visible = defineModel<boolean | undefined>({
    default: false,
});
</script>
<template>
    <Dialog
        v-model:visible="visible"
        :header="props.header"
        :footer="props.footer"
        :modal="props.modal"
        :contentStyle="props.contentStyle"
        :contentClass="props.contentClass"
        :contentProps="props.contentProps"
        :closable="props.closable"
        :dismissableMask="props.dismissableMask"
        :closeOnEscape="props.closeOnEscape"
        :showHeader="props.showHeader"
        :blockScroll="props.blockScroll"
        :baseZIndex="props.baseZIndex"
        :autoZIndex="props.autoZIndex"
        :position="props.position"
        :maximizable="props.maximizable"
        :breakpoints="props.breakpoints"
        :draggable="props.draggable"
        :keepInViewport="props.keepInViewport"
        :minX="props.minX"
        :minY="props.minY"
        :appendTo="props.appendTo"
        :style="props.style"
        :closeIcon="props.closeIcon"
        :maximizeIcon="props.maximizeIcon"
        :minimizeIcon="props.minimizeIcon"
        :closeButtonProps="props.closeButtonProps"
        :maximizeButtonProps="props.maximizeButtonProps"
        :dt="props.dt"
        :pt="props.pt"
        :ptOptions="props.ptOptions"
        :unstyled="props.unstyled"
        @hide="emit('hide')"
        @after-hide="emit('after-hide')"
        @show="emit('show')"
        @maximize="emit('maximize', $event)"
        @unmaximize="emit('unmaximize', $event)"
        @dragstart="emit('dragstart', $event)"
        @dragend="emit('dragend', $event)"
    >
        <!-- Default -->
        <template #default>
            <slot />
        </template>

        <!-- Header -->
        <template #header>
            <slot name="header" />
        </template>

        <!-- Footer -->
        <template #footer>
            <slot name="footer" />
        </template>

        <!-- Close Button -->
        <template #closebutton="scope">
            <slot name="closebutton" v-bind="scope" />
        </template>

        <!-- Close Icon -->
        <template #closeicon="scope">
            <slot name="closeicon" v-bind="scope" />
        </template>

        <!-- Maximize Button -->
        <template #maximizebutton="scope">
            <slot name="maximizebutton" v-bind="scope" />
        </template>

        <!-- Maximize Icon -->
        <template #maximizeicon="scope">
            <slot name="maximizeicon" v-bind="scope" />
        </template>

        <!-- Container (drag, close, maximize scopes) -->
        <template v-if="$slots.container" #container="scope">
            <slot name="container" v-bind="scope" />
        </template>
    </Dialog>
</template>
