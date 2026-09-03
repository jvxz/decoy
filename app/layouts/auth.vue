<script lang="ts">
import type { MatrixClient } from 'matrix-js-sdk'
import type { EditableRootEmits } from 'reka-ui'
import type { ShallowRef } from 'vue'

export interface AuthLayoutContext {
  editableInput: Ref<string>
  editableState: Ref<EditableRootEmits['update:state'][number]>
  isSSONavigating: Ref<boolean>
  isLoggingIn: Ref<boolean>
  registrationDisabled: Ref<boolean>
  formError: ShallowRef<ErrorShape | undefined>
  isLoading: Ref<boolean>
  pendingText: Ref<string>
  refreshHomeserverData: () => void
  setFormError: (error: Error | ErrorShape) => void
  clearFormError: () => void
  error: ShallowRef<ErrorShape | undefined>
  urlParams: Record<string, string | string[]>
  matrixClient: ShallowRef<MatrixClient>
  rateLimitRetryAfterMs: Ref<number>
}

export const [injectAuthLayoutContext, provideAuthLayoutContext] = createContext<AuthLayoutContext>('AuthLayout')
</script>

<script lang="ts" setup>
const urlParams = useUrlSearchParams('history', {
  initialValue: {
    homeserver: 'matrix.org',
  },
})
const editableInput = toRef(urlParams, 'homeserver')
const editableState = ref<EditableRootEmits['update:state'][number]>('cancel')
const error = shallowRef<ErrorShape>()
const formError = shallowRef<ErrorShape>()
const isLoggingIn = ref(false)
const isLoadingLocal = ref(false)
const pendingText = ref('Fetching homeserver config...')
const isSSONavigating = ref(false)
const rateLimitRetryAfterMs = ref(-1)

const { registrationDisabled } = useHomeserverRegistration(editableInput)

const qc = useQueryClient()

const {
  data,
  isFetching: isFetchingHomeserverConfig,
  status: homeserverConfigStatus,
} = useHomeserverConfig(editableInput)
const isValid = computed(() => (data.value ? isHomeserverValid(data.value) : undefined))

const matrixClient = computed(() =>
  markRaw(createTempClient(data.value?.['m.homeserver'].base_url ?? normalizeHomeserverUrl(editableInput.value))),
)

watch([homeserverConfigStatus, isValid], () => {
  if (!isFetchingHomeserverConfig.value && !isValid.value) error.value = GENERIC_ERROR.INVALID_HOMESERVER
  else error.value = undefined
})

const isPendingLoginFlows = useIsKeyFetching('homeserverLoginFlows', editableInput)
const isPendingRegistrationCapability = useIsKeyFetching('homeserverRegistrationFlows', editableInput)
const isLoading = computed(
  () => isFetchingHomeserverConfig.value || isPendingLoginFlows.value || isPendingRegistrationCapability.value,
)
syncRef(isLoading, isLoadingLocal, { direction: 'ltr' })

watchEffect(() => {
  if (isFetchingHomeserverConfig.value) return (pendingText.value = 'Fetching homeserver config...')
  if (isPendingLoginFlows.value) return (pendingText.value = 'Fetching login flows...')
  if (isPendingRegistrationCapability.value) return (pendingText.value = 'Fetching registration capability...')
})

const router = useRouter()
router.afterEach(() => {
  formError.value = undefined
  error.value = undefined
})

provideAuthLayoutContext({
  clearFormError: () => (formError.value = undefined),
  editableInput,
  editableState,
  error,
  formError,
  isLoading: isLoadingLocal,
  isLoggingIn,
  isSSONavigating,
  matrixClient,
  pendingText,
  rateLimitRetryAfterMs,
  refreshHomeserverData: () => {
    for (const k of [
      $qk.homeserverConfig(editableInput),
      $qk.homeserverLoginFlows(editableInput),
      $qk.homeserverRegistrationFlows(editableInput),
    ]) {
      qc.invalidateQueries({ queryKey: k })
    }
  },
  registrationDisabled,
  setFormError: err => (formError.value = err instanceof Error ? parseError(err) : err),
  urlParams,
})
</script>

<template>
  <div class="p-16 flex flex-col w-full">
    <div class="flex flex-col gap-6 max-w-sm w-full">
      <PageLoginHeading />

      <div v-show="!error && isLoading" class="text-sm mx-auto flex gap-2 w-fit items-center">
        <USpinner class="size-1lh" />

        <span class="font-medium">
          {{ pendingText }}
        </span>
      </div>

      <UAlertRoot v-if="error" variant="danger">
        <UAlertIcon name="tabler:exclamation-circle" class="shrink-0" />

        <UAlertContent>
          <UAlertTitle>{{ error.title }}</UAlertTitle>
          <UAlertDescription>{{ error.message }}</UAlertDescription>
        </UAlertContent>
      </UAlertRoot>

      <template v-else-if="isValid && !isLoading">
        <UAlertRoot v-if="formError" variant="danger">
          <UAlertIcon name="tabler:exclamation-circle" class="shrink-0" />

          <UAlertContent>
            <UAlertTitle>{{ formError.title }}</UAlertTitle>
            <UAlertDescription>{{ formError.message }}</UAlertDescription>
          </UAlertContent>

          <UAlertClose @click="formError = undefined" />
        </UAlertRoot>

        <div
          class="flex flex-col gap-3"
          :class="{
            'opacity-50': editableState === 'edit',
          }"
        >
          <slot />
        </div>
      </template>
    </div>
  </div>
</template>
