import { useTheme } from '../../context/ThemeContext';
import logoLight from '../../assets/logo.png';
import logoDark from '../../assets/logoDark.png';

type BrandLogoProps = {
  alt?: string;
  className?: string;
  /** `auto` follows app light/dark; override for fixed assets (e.g. always-dark footer). */
  variant?: 'auto' | 'light' | 'dark';
};

export default function BrandLogo({
  alt = 'Interviewsta',
  className,
  variant = 'auto',
}: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const src =
    variant === 'light'
      ? logoLight
      : variant === 'dark'
        ? logoDark
        : resolvedTheme === 'dark'
          ? logoDark
          : logoLight;

  return <img src={src} alt={alt} className={className} decoding="async" />;
}
