import { getServerCategories, getServerConfig } from '@/lib/data/server-catalog';
import { AnnouncementBar } from './AnnouncementBar';
import { TopBar } from './TopBar';
import { StoreHeader } from './StoreHeader';
import { MegaMenu } from './MegaMenu';
import { StoreFooter } from './StoreFooter';
import { EmailVerificationBanner } from './EmailVerificationBanner';

// Server component: the chrome renders with real config and categories in
// the initial HTML (from the cached server catalog — no extra Firestore
// reads), so there is no flash of default/mock content on load.
export async function StoreShell({ children }: { children: React.ReactNode }) {
  const [config, categories] = await Promise.all([getServerConfig(), getServerCategories()]);

  return (
    <>
      <AnnouncementBar text={config.announcement} />
      <TopBar phone={config.supportPhone} email={config.supportEmail} />
      <StoreHeader categories={categories} />
      <MegaMenu categories={categories} />
      <EmailVerificationBanner />
      <main className="min-h-[60vh]">{children}</main>
      <StoreFooter phone={config.supportPhone} />
    </>
  );
}
