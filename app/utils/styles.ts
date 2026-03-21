// @unocss-include
const interactiveStyles = {
  base: 'font-medium cursor-pointer focus-visible:border-primary/50 select-none focus-visible:ring-ring/40 focus-visible:ring-[3px] active:ring-ring/60 aria-invalid:ring-danger/20 aria-invalid:border-danger dark:aria-invalid:ring-danger/40 shrink-0 gap-2 rounded text-base whitespace-nowrap font-medium outline-none disabled:pointer-events-none hover:disabled:cursor-not-allowed disabled:opacity-50 underline-offset-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 transition-transform duration-75',
  size: {
    default: 'h-8 px-2.5 py-0.75 text-sm',
    icon: 'aspect-square size-8',
    lg: 'h-10 px-5 text-base text-base',
    sm: 'h-7 px-2.5 py-1 text-xs',
  },
  variant: {
    danger:
      'hover:bg-danger/90 bg-danger/90 text-danger-foreground hover:bg-danger active:bg-danger/87.5 glow-red-500 border-danger',
    default:
      'bg-primary/85 border border-primary active:bg-primary/80 text-primary-foreground glow-primary',
    ghost: 'hover:bg-muted/50 hover:text-foreground active:bg-muted/75 text-muted-foreground active:text-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
    outline:
      'border-border/90 hover:bg-muted/90 active:bg-muted/75 hover:border-border active:border-border border bg-transparent',
    soft: 'border-border/90 text-muted-foreground hover:text-foreground hover:bg-muted/75 active:bg-muted/90 hover:border-border active:border-border border bg-input',
  },
}

const staticStyles = {
  base: 'rounded p-6 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  variant: {
    danger:
      'bg-card border-danger text-danger border [&>svg]:text-current',
    default:
      'bg-card border border-border text-card-foreground',
  },
}

const popoverStyles = {
  content: [
    staticStyles.base,
    staticStyles.variant.default,
    'duration-75 data-[state=open]:animate-in shadow-lg data-[state=open]:fade-in-0 data-[state=closed]:animate-out zoom-in-95 z-50 min-w-52 overflow-hidden p-1',
  ],
  item: [
    interactiveStyles.base,
    interactiveStyles.variant.ghost,
    interactiveStyles.size.default,
    'focus:bg-muted focus:text-accent-foreground font-normal duration-0 [&_svg:not([class*=\'text-\'])]:text-muted-foreground [&_svg:not([class*=\'size-\'])]:size-12 data-[variant=danger]:text-danger-foreground data-[variant=danger]:focus:bg-danger/10 data-[variant=danger]:focus:text-danger-foreground data-[variant=danger]:*:[svg]:!text-danger-foreground dark:data-[variant=danger]:focus:bg-danger/40 relative flex cursor-default items-center p-1 px-2 text-sm outline-hidden transition-all select-none focus-visible:ring-0 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
}

const overlayStyles
  = 'duration-75 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-overlay'

export { interactiveStyles, overlayStyles, popoverStyles, staticStyles }
