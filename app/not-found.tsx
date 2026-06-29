import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className='min-h-screen flex items-center justify-center px-4'>
      <div className='text-center max-w-md'>
        <h1 className='text-6xl font-bold text-neutral-900 mb-4'>404</h1>
        <h2 className='text-2xl font-semibold text-neutral-900 mb-3'>Page Not Found</h2>
        <p className='text-neutral-600 mb-8'>
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href='/' className='inline-block'>
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
