import { AnimatedAuthContainer } from '@/components/auth/animated-auth-container';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | Comicraft',
  description: 'Create an account to start publishing stories and minting NFTs.',
};

export default function SignUpPage() {
  return <AnimatedAuthContainer initialMode="register" />;
}
