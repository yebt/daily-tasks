import { ref } from 'vue'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
}

export function useConfirmModal() {
  const isOpen = ref(false)
  const title = ref('')
  const message = ref('')
  const confirmText = ref('Confirmar')
  const cancelText = ref('Cancelar')
  const isDangerous = ref(false)

  let resolveConfirm: ((value: boolean) => void) | null = null

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      title.value = options.title
      message.value = options.message
      confirmText.value = options.confirmText || 'Confirmar'
      cancelText.value = options.cancelText || 'Cancelar'
      isDangerous.value = options.isDangerous || false
      isOpen.value = true
      resolveConfirm = resolve
    })
  }

  const handleConfirm = async () => {
    isOpen.value = false
    resolveConfirm?.(true)
  }

  const handleCancel = () => {
    isOpen.value = false
    resolveConfirm?.(false)
  }

  return {
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    isDangerous,
    confirm,
    handleConfirm,
    handleCancel,
  }
}
