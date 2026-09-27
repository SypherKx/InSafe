'use client';

import React from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

export const Link = React.forwardRef<HTMLAnchorElement, any>(function Link({ to, href, children, ...props }, ref) {
  const destination = to || href || '/';
  return (
    <NextLink ref={ref} href={destination} {...props}>
      {children}
    </NextLink>
  );
});

export function useNavigate() {
  const router = useRouter();
  return ({ to }: { to: string }) => {
    router.push(to);
  };
}
