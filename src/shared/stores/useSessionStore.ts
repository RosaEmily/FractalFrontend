import { defineStore } from "pinia";
import { ref } from "vue";

type RetryRequest = () => Promise<unknown>;

export const useSessionStore = defineStore("session-store", () => {
    const showSessionModal = ref(false);
    const retryRequest = ref<RetryRequest | null>(null);

    function openSessionModal(retry?: RetryRequest) {
        if (showSessionModal.value) return;

        showSessionModal.value = true;
        retryRequest.value = retry ?? null;
    }

    function closeSessionModal() {
        showSessionModal.value = false;
        retryRequest.value = null;
    }

    async function retryLastRequest() {
        const retry = retryRequest.value;

        if (typeof retry !== "function") {
            return;
        }

        closeSessionModal();
        await retry();
    }

    return {
        // state
        showSessionModal,

        // actions
        openSessionModal,
        closeSessionModal,
        retryLastRequest,
    };
});
