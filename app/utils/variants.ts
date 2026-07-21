// @unocss-include
import type { VariantProps } from 'tailwind-variants'

export const buttonVariants = tv({
  base: 'relative inline-flex items-center justify-center',
  compoundVariants: [
    {
      class: 'h-fit py-0',
      variant: 'link',
    },
    {
      class: 'h-fit p-0',
      variant: 'ghost-inline',
    },
  ],
  defaultVariants: {
    size: 'default',
    variant: 'soft',
  },
  extend: interactiveBase,
})

export type ButtonVariants = VariantProps<typeof buttonVariants>

export const badgeVariants = tv({
  base: 'inline-flex  shrink-0 cursor-default items-center justify-center tracking-wide select-none',
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
  extend: interactiveBase,
  variants: {
    size: {
      default: 'px-2 h-fit py-0.5 text-xs',
      lg: 'px-2.5 py-1 h-fit text-sm',
      sm: 'px-1.5 py-px h-fit text-2xs ',
    },
  },
})

export type BadgeVariants = VariantProps<typeof badgeVariants>

export const avatarVariants = tv({
  base: 'inline-flex shrink-0 items-center justify-center overflow-hidden bg-secondary font-normal text-foreground select-none',
  variants: {
    shape: {
      circle: 'rounded-full',
      square: 'rounded-md',
    },
    size: {
      base: 'h-16 w-16 text-2xl',
      lg: 'h-32 w-32 text-5xl',
      sm: 'h-10 w-10 text-xs',
    },
  },
})

export type AvatarVariants = VariantProps<typeof avatarVariants>

export const alertVariants = tv({
  base: 'relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 py-3 has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-1 [&>svg]:text-foreground',
  compoundVariants: [
    {
      class: 'shadow',
      variant: 'default',
    },
    {
      class: 'shadow',
      variant: 'danger',
    },
  ],
  defaultVariants: {
    variant: 'default',
  },
  extend: staticBase,
  variants: {
    variant: {
      danger: 'bg-danger/40 text-danger-foreground',
      ghost: 'bg-transparent',
    },
  },
})

export type AlertVariants = VariantProps<typeof alertVariants>['variant']

export const toggleVariants = tv({
  base: 'p-0 data-[state=off]:(hover:text-foreground hover:bg-hover) data-[state=on]:(bg-selected hover:bg-selected text-foreground)',
  defaultVariants: {
    size: 'default',
    variant: 'ghost',
  },
  extend: interactiveBase,
  variants: {
    variant: {
      ghost: interactiveBase({ variant: 'ghost' }),
      outline: interactiveBase({
        class: 'data-[state=on]:(border-border-strong) active:(border-border-strong)',
        variant: 'outline',
      }),
    },
  },
})

export type ToggleVariants = VariantProps<typeof toggleVariants>

export const checkboxVariants = tv({
  base: [buttonVariants(), 'size-4 aspect-square p-0 rounded-sm'],
  defaultVariants: {
    variant: 'soft',
  },
})

export type CheckboxVariants = VariantProps<typeof checkboxVariants>
