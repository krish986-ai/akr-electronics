import { StoreShell } from '@/components/layout/store/StoreShell';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <StoreShell>{children}</StoreShell>;
}
