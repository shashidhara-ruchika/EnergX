import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type AuthFormData = z.infer<typeof authSchema>;

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">🔥</span>
              <h1 className="text-3xl font-bold">EnergX</h1>
            </div>
            <p className="text-black/80">Track your energy. Boost your day.</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
            <div>
              <input
                {...register('email')}
                type="email"
                placeholder="Email"
                className="w-full p-3 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-transparent focus:border-[#924DBF] outline-none transition-all duration-200"
              />
              {errors.email && (
                <p className="text-red-200 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <input
                {...register('password')}
                type="password"
                placeholder="Password"
                className="w-full p-3 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-transparent focus:border-[#924DBF] outline-none transition-all duration-200"
              />
              {errors.password && (
                <p className="text-red-200 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" disabled={loading} className="w-full text-base py-6">
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
            </Button>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-sm text-white/80 hover:text-white transition-colors"
            >
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
            </button>
          </form>
        </div>

        <div className="hidden md:block">
          
            <img src='public/EnergX.png' 
            alt="EnergX Logo"
            className="w-full max-w-lg mx-auto" />
        </div>
      </div>
    </div>
  );
}