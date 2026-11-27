import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronRight,
  Mail,
  PackageSearch,
  RotateCw,
  Search,
  Star,
  type LucideIcon,
} from 'lucide-react';

/**
 * The only place icons are sourced from. Lucide (MIT) stands in for Nucleo until
 * a licence is in place; swapping sets means changing this map only.
 */
const icons = {
  'alert-circle': AlertCircle,
  'arrow-left': ArrowLeft,
  check: Check,
  'chevron-right': ChevronRight,
  mail: Mail,
  'package-search': PackageSearch,
  retry: RotateCw,
  search: Search,
  star: Star,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  /** Provide a label only when the icon conveys meaning on its own. */
  label?: string;
}

export function Icon({ name, size = 16, className, label }: IconProps) {
  const Component = icons[name];
  return (
    <Component
      size={size}
      strokeWidth={1}
      absoluteStrokeWidth
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  );
}
