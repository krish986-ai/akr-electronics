import { AnnouncementBar } from './AnnouncementBar';
import { TopBar } from './TopBar';
import { StoreHeader } from './StoreHeader';
import { MegaMenu } from './MegaMenu';
import { StoreFooter } from './StoreFooter';

export function StoreShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <TopBar />
      <StoreHeader />
      <MegaMenu />
      <main className="min-h-[60vh]">{children}</main>
      <StoreFooter />
    </>
  );
}
