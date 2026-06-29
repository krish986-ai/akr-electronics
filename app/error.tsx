'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className='min-h-screen flex items-center justify-center px-4'>
      <div className='text-center max-w-md'>
        <h1 className='text-6xl font-bold text-neutral-900 mb-4'>500</h1>
        <h2 className='text-2xl font-semibold text-neutral-900 mb-3'>Something Went Wrong</h2>
        <p className='text-neutral-600 mb-8'>
          An unexpected error occurred. Please try again or contact support.
        </p>
        <div className='flex gap-3 justify-center'>
          <Button onClick={() => reset()}>Try Again</Button>
          <Link href='/' className='inline-block'>
            <Button variant='outline'>Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
