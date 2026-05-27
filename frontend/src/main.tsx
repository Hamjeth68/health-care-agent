import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function MissingClerkConfig() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md rounded-xl border border-border bg-card p-6 text-sm">
        <h1 className="text-lg font-semibold mb-2">Clerk is not configured</h1>
        <p className="text-muted-foreground">
          Set VITE_CLERK_PUBLISHABLE_KEY in the frontend environment and restart the app.
        </p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {clerkPublishableKey ? (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <HashRouter>
          <ThemeProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ThemeProvider>
        </HashRouter>
      </ClerkProvider>
    ) : (
      <MissingClerkConfig />
    )}
  </React.StrictMode>
);
