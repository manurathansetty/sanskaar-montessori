export type ToastVariant = 'success' | 'error';

export type Toast = {
  id: number;
  variant: ToastVariant;
  message: string;
};

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

export const toastStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener([...toasts]);
    return () => listeners.delete(listener);
  },

  add(variant: ToastVariant, message: string): number {
    const id = nextId++;
    toasts = [...toasts, { id, variant, message }];
    notify();
    setTimeout(() => toastStore.dismiss(id), 5000);
    return id;
  },

  success(message: string) { return toastStore.add('success', message); },
  error(message: string)   { return toastStore.add('error', message); },

  dismiss(id: number) {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
};
