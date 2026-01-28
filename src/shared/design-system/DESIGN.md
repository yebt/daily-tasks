# Design System

## Components

### ConfirmModal

A reusable confirmation dialog component that replaces native `confirm()` dialogs with a styled popup.

#### Usage

```vue
<script setup lang="ts">
import { useConfirmModal } from '@/shared/design-system/composables/useConfirmModal'
import ConfirmModal from '@/shared/design-system/components/ConfirmModal.vue'

const confirmModal = useConfirmModal()

const handleDelete = async (id: string) => {
  const confirmed = await confirmModal.confirm({
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
    confirmText: 'Delete',
    isDangerous: true,
  })

  if (confirmed) {
    await deleteItem(id)
  }
}
</script>

<template>
  <ConfirmModal
    :is-open="confirmModal.isOpen"
    :title="confirmModal.title"
    :message="confirmModal.message"
    :confirm-text="confirmModal.confirmText"
    :cancel-text="confirmModal.cancelText"
    :is-dangerous="confirmModal.isDangerous"
    @confirm="confirmModal.handleConfirm()"
    @cancel="confirmModal.handleCancel()"
  />
</template>
```

#### Props

- `isOpen` (boolean | Ref<boolean>): Controls visibility of the modal
- `title` (string | Ref<string>): Modal title
- `message` (string | Ref<string>): Modal message/content
- `confirmText` (string | Ref<string>): Confirm button text (default: "Confirmar")
- `cancelText` (string | Ref<string>): Cancel button text (default: "Cancelar")
- `isDangerous` (boolean | Ref<boolean>): If true, confirm button is red (default: false)

#### Events

- `confirm`: Emitted when confirm button is clicked
- `cancel`: Emitted when cancel button is clicked or backdrop is clicked

#### Composable API

The `useConfirmModal()` composable provides:

- `confirm(options)`: Opens the modal and returns a Promise that resolves to true/false
- `handleConfirm()`: Closes the modal and resolves the promise to true
- `handleCancel()`: Closes the modal and resolves the promise to false
- `isOpen`: Ref<boolean> - Current visibility state
- `title`: Ref<string> - Current title
- `message`: Ref<string> - Current message
- `confirmText`: Ref<string> - Current confirm button text
- `cancelText`: Ref<string> - Current cancel button text
- `isDangerous`: Ref<boolean> - Current danger mode
