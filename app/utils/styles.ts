// @unocss-include
export const interactiveBase = tv({
  base: 'font-medium cursor-pointer shadow-none select-none focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:border-danger shrink-0 gap-2 rounded text-base whitespace-nowrap outline-none disabled:pointer-events-none hover:disabled:cursor-not-allowed disabled:opacity-50 underline-offset-4 [&_svg]:pointer-events-none transition-transform duration-75',
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
  variants: {
    size: {
      default: 'h-8 px-2.5 py-0.75 text-sm',
      icon: 'aspect-square size-8',
      'icon-sm': 'aspect-square size-7 text-xs',
      lg: 'h-10 px-5 text-base text-base',
      sm: 'h-7 px-2.5 py-1 text-xs',
    },
    variant: {
      danger:
        'bg-danger border border-transparent hover:(bg-danger-hover) text-danger-foreground active:(bg-danger-press) ',
      default: 'bg-primary text-primary-foreground border border-transparent active:(bg-primary-press) ',
      ghost:
        'text-muted-foreground border border-transparent hover:(bg-secondary text-foreground) data-[highlighted]:(bg-secondary text-foreground) data-[state=open]:(bg-secondary text-foreground) active:(bg-secondary-press)',
      'ghost-inline': 'text-muted-foreground hover:text-foreground data-[state=open]:text-foreground',
      link: 'text-foreground px-2.5 -mx-2.5 underline-offset-4 hover:underline data-[state=open]:underline',
      outline:
        'text-muted-foreground border-border/90 hover:(text-foreground bg-secondary not-active:border-border-strong) focus-visible:(text-foreground bg-secondary not-active:border-border-strong) data-[state=open]:(text-foreground bg-secondary not-active:border-border-strong) active:(border-border bg-secondary-press) border bg-transparent',
      soft: 'bg-secondary border-border text-muted-foreground border hover:(text-foreground not-active:border-border-strong) focus-visible:(text-foreground border-border-strong not-active:border-border-strong) data-[state=open]:(text-foreground border-border-strong not-active:border-border-strong) active:(border-border bg-secondary-press)',
    },
  },
})

export const staticBase = tv({
  base: 'rounded p-2.5 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      danger: 'bg-surface border-danger border [&>svg]:text-current',
      default: 'bg-surface border text-surface-foreground',
    },
  },
})

export const popoverContentBase = tv({
  base: 'shadow-lg z-popover w-52 bg-popover overflow-hidden p-1',
  defaultVariants: {
    variant: 'default',
  },
  extend: staticBase,
})

export const popoverItemBase = tv({
  base: 'rounded-sm duration-0 font-normal relative flex shadow-none cursor-default items-center p-1 px-2 text-sm outline-hidden transition-all select-none focus-visible:ring-0 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  defaultVariants: {
    size: 'default',
    variant: 'ghost',
  },
  extend: interactiveBase,
  variants: {
    variant: {
      ghost: 'text-foreground',
    },
  },
})

export const overlayStyles =
  'duration-75 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-overlay bg-overlay'

export const inputStyles = tv({
  base: [
    staticBase({ variant: 'default' }),
    interactiveBase({ size: 'default' }),
    'w-full cursor-text border-border font-normal truncate placeholder:text-muted-foreground focus-visible:(border-border-strong ring-0) text-sm',
  ],
})

export const dialogStyles = tv({
  base: 'fixed top-[50%] left-[50%] z-50 flex flex-col gap-2 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] data-[state=open]:(animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 animate-in fade-in-0) sm:max-w-lg data-[state=closed]:(animate-out fade-out-0) z-dialog p-5',
  defaultVariants: { variant: 'default' },
  extend: staticBase,
})
