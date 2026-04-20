import { toastStore } from '../store/toastStore';

export function useToast() {
  return {
    toast: {
      success: (msg: string) => toastStore.success(msg),
      error:   (msg: string) => toastStore.error(msg),
    },
  };
}
