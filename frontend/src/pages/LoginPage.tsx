import { SignIn } from '@clerk/clerk-react';

const clerkAppearance = {
  elements: {
    rootBox: 'w-full',
    cardBox: 'w-full shadow-none',
    card: 'w-full bg-transparent shadow-none border-0',
  },
};

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 relative z-10">
      <div className="w-full max-w-md glass-strong rounded-2xl border border-border p-3">
        <SignIn
          routing="virtual"
          signUpUrl="/#/signup"
          fallbackRedirectUrl="/#/chat"
          signUpFallbackRedirectUrl="/#/chat"
          appearance={clerkAppearance}
          oauthFlow="redirect"
        />
      </div>
    </div>
  );
}
