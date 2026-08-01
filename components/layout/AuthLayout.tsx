import Link from 'next/link';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AuthLayout({
  children,
  title,
  description,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="block w-fit mx-auto mb-6">
          <Image
            src="/images/logo-full.png"
            alt="A.K.R Electronics"
            width={892}
            height={460}
            priority
            className="w-40 h-auto rounded-xl shadow-md"
          />
        </Link>
        <div className="bg-white rounded-lg shadow-lg p-8">
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
              {description && (
                <p className="text-neutral-600 mt-1 text-sm">{description}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
