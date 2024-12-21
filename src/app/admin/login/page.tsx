// /app/admin/login/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        sessionStorage.setItem('isLoggedIn', 'true');
        router.push('/admin/room-management');
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#F7EDE2] to-[#E6D2B7]">
      <Card className="w-full max-w-md bg-[#F7EDE2] shadow-xl border-2 border-[#8B2500]">
        <CardHeader className="text-center">
          <img
            src="/icon_192x192.png"
            alt="Company Logo"
            className="w-22 h-22 mx-auto mb-4 rounded-xl"
          />
          <CardTitle className="text-4xl font-bold text-[#5E3023] mb-2">Admin Login</CardTitle>
          <p className="text-xl text-[#8B4B3B]">Enter your credentials to access the admin panel</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#5E3023] font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-2 border-[#D9B99B] focus:border-[#8B2500] focus:ring-[#8B2500] text-[#5E3023] placeholder-[#8B4B3B] transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#5E3023] font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-2 border-[#D9B99B] focus:border-[#8B2500] focus:ring-[#8B2500] text-[#5E3023] placeholder-[#8B4B3B] transition-colors"
                required
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex justify-center mt-4">
              <Button
                type="submit"
                className="bg-[#8B2500] hover:bg-[#5E3023] text-white text-lg font-semibold transition-all duration-200 "
              >
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}