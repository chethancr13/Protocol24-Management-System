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
          role: account.role,
          loginTime: Date.now()
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
          const savedUser = localStorage.getItem('protocol24-user');
          if (savedUser) {
            const user = JSON.parse(savedUser);
            localStorage.setItem('protocol24-user', JSON.stringify({ ...user, loginTime: Date.now() }));
          } else {
            localStorage.setItem('protocol24-user', JSON.stringify({ 
              username: 'core-admin', 
              name: 'Core Admin', 
              role: 'Organizer', 
              loginTime: Date.now() 
            }));
          }
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
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4 font-sans">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      
      <div className="w-full max-w-[440px] relative z-10 animate-fade-up">
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-12 h-12 rounded-lg bg-[#106292] flex items-center justify-center mb-6 shadow-sm">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-[#1B2533] text-center tracking-tight">Protocol 24</h1>
            <p className="text-[#64748B] text-sm mt-3 text-center">
              Sign in to manage your hackathon operations
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#475569] uppercase tracking-wider ml-0.5">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full h-11 px-4 rounded-md bg-white border border-[#CBD5E1] text-[#1B2533] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#106292] focus:ring-1 focus:ring-[#106292] transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#475569] uppercase tracking-wider ml-0.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-md bg-white border border-[#CBD5E1] text-[#1B2533] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#106292] focus:ring-1 focus:ring-[#106292] transition-colors font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password || !username}
              className="w-full h-11 rounded-md bg-[#106292] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#0D547D] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-[#E2E8F0]"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] text-[#94A3B8] uppercase tracking-[0.2em] font-bold">Secure Access</span>
              <div className="flex-grow border-t border-[#E2E8F0]"></div>
            </div>

            <button
              type="button"
              onClick={handleBiometricAuth}
              disabled={loading}
              className="w-full h-11 rounded-md bg-white text-[#1B2533] font-semibold flex items-center justify-center gap-2 hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-[#CBD5E1]"
            >
              <Fingerprint className="w-4 h-4 text-[#106292]" />
              {hasPasskey ? 'Biometric Login' : 'Enable Device Access'}
            </button>
          </form>
          
          <div className="mt-10 text-center border-t border-[#E2E8F0] pt-6">
             <p className="text-[10px] text-[#94A3B8] flex items-center justify-center gap-2 font-medium uppercase tracking-wider">
               <Shield className="w-3 h-3" /> Encrypted Dashboard Session
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthPage;
