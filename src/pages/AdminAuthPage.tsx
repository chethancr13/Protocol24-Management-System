import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, Fingerprint } from 'lucide-react';
import { toast } from 'sonner';

import { TEAM_ACCOUNTS } from '../config/team';

const AdminAuthPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const account = TEAM_ACCOUNTS[username.toLowerCase()];
      
      if (account && account.password === password) {
        localStorage.setItem('protocol24-auth', 'authenticated');
        localStorage.setItem('protocol24-user', JSON.stringify({
          username: username.toLowerCase(),
          name: account.name,
          role: account.role
        }));
        toast.success(`Welcome back, ${account.name}`);
        navigate('/admin');
      } else {
        toast.error('Invalid Credentials. Access Denied.');
      }
      setLoading(false);
    }, 400);
  };

  const handleBiometricAuth = async () => {
    try {
      if (!window.PublicKeyCredential) {
        toast.error('Biometrics not supported on this device or browser.');
        return;
      }

      setLoading(true);
      const savedCredentialId = localStorage.getItem('protocol24-passkey-id');
      
      if (!savedCredentialId) {
        // Registration Flow
        toast.info('Registering device for Biometric Access...');
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        const userId = new Uint8Array(16);
        crypto.getRandomValues(userId);

        const credential = await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: "PROTOCOL 24 Dashboard" },
            user: {
              id: userId,
              name: "core-admin",
              displayName: "Core Admin"
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
            authenticatorSelection: {
              authenticatorAttachment: "platform", 
              userVerification: "required",
              residentKey: "preferred"
            },
            timeout: 60000
          }
        }) as PublicKeyCredential;

        if (credential) {
          const credIdStr = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
          localStorage.setItem('protocol24-passkey-id', credIdStr);
          localStorage.setItem('protocol24-auth', 'authenticated');
          toast.success('Device registered & Access Granted');
          navigate('/admin');
        }
      } else {
        // Authentication Flow
        toast.info('Verifying Biometrics...');
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        
        const binaryString = atob(savedCredentialId);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const assertion = await navigator.credentials.get({
          publicKey: {
            challenge,
            allowCredentials: [{
              type: "public-key",
              id: bytes
            }],
            userVerification: "required",
            timeout: 60000
          }
        });

        if (assertion) {
          localStorage.setItem('protocol24-auth', 'authenticated');
          toast.success('Biometric Verified - Welcome back');
          navigate('/admin');
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.name === 'NotAllowedError') {
        toast.error('Biometric confirmation was cancelled.');
      } else {
        toast.error('Biometric authentication failed or is unsupported.');
      }
    } finally {
      setLoading(false);
    }
  };

  const hasPasskey = !!localStorage.getItem('protocol24-passkey-id');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Background styling elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
      <div className="absolute w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="glass-card rounded-3xl p-8 border border-primary/20 shadow-2xl shadow-primary/10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 ring-1 ring-primary/30">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground text-center tracking-tight">PROTOCOL 24</h1>
            <p className="text-muted-foreground text-sm mt-2 text-center uppercase tracking-widest font-semibold flex items-center gap-2">
               Organized by <span className="text-primary">NullPoint</span>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">Username</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin, logistics, etc..."
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrative code..."
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password || !username}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground uppercase tracking-widest font-semibold">Or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <button
              type="button"
              onClick={handleBiometricAuth}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-secondary text-secondary-foreground font-bold flex items-center justify-center gap-2 hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-border"
            >
              <Fingerprint className="w-5 h-5 text-primary" />
              {hasPasskey ? 'Login with Fingerprint / Face ID' : 'Register Device Biometrics'}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-border pt-6">
             <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
               <Shield className="w-3 h-3" /> Core Team Authorization Required
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthPage;
