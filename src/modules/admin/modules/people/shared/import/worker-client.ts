import type { ImportCommand } from "./types";

export function createImportWorker() {
  const worker = new Worker(new URL("./import.worker.ts", import.meta.url), {
    type: "module",
  });
  let nextId = 0;
  const pending = new Map<
    number,
    {
      resolve: (value: unknown) => void;
      reject: (reason: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  const dispose = () => {
    worker.terminate();
    for (const request of pending.values()) {
      clearTimeout(request.timer);
      request.reject(new Error("La lectura fue interrumpida."));
    }
    pending.clear();
  };
  worker.onmessage = ({ data }) => {
    const request = pending.get(data.id);
    if (!request) return;
    clearTimeout(request.timer);
    pending.delete(data.id);
    if (data.error) request.reject(new Error(data.error));
    else request.resolve(data.result);
  };
  worker.onerror = dispose;
  return {
    call<T>(command: ImportCommand): Promise<T> {
      return new Promise((resolve, reject) => {
        const id = ++nextId;
        const timer = setTimeout(() => {
          dispose();
          reject(
            new Error(
              "La lectura tardó demasiado. Divide el archivo e inténtalo de nuevo.",
            ),
          );
        }, 120000);
        pending.set(id, {
          resolve: (value) => resolve(value as T),
          reject,
          timer,
        });
        worker.postMessage({ id, command });
      });
    },
    dispose,
  };
}
