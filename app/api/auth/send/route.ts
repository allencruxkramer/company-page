  import { NextRequest, NextResponse } from 'next/server';
  import { signToken } from '@/lib/auth';
  import { Resend } from 'resend';

  export async function POST(request: NextRequest) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { email, from } = await request.json();

      if (!email || typeof email !== 'string') {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      if (!email.toLowerCase().endsWith('@cruxclimate.com')) {
        return NextResponse.json({ error: 'Only @cruxclimate.com emails are allowed' }, { status: 400 });
      }

      const token = await signToken({ email, type: 'magic-link' }, '15m');
      const fromParam = typeof from === 'string' && from.startsWith('/') ? from : '/';
      const magicLink =
  `${process.env.APP_URL}/api/auth/callback?token=${encodeURIComponent(token)}&from=${encodeURIComponent(fromParam)}`;

      console.log(`\n🔗 MAGIC LINK for ${email}:\n${magicLink}\n`);

      const { error } = await resend.emails.send({
        from: process.env.AUTH_FROM_EMAIL ?? 'onboarding@resend.dev',
        to: process.env.AUTH_TO_EMAIL ?? email,
        subject: 'Your Crux login link',
        html: `
          <div style="font-family: Inter, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px
  16px;">
            <h2 style="font-size: 20px; font-weight: 600; color: #1C1917; margin-bottom: 8px;">Sign in to Crux</h2>
            <p style="font-size: 14px; color: #57534e; margin-bottom: 24px;">Click the button below to sign in. This
  link expires in 15 minutes.</p>
            <a href="${magicLink}" style="display: inline-block; background: #1C1917; color: #fff; text-decoration:
  none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500;">Sign in to Crux</a>
            <p style="font-size: 12px; color: #a8a29e; margin-top: 24px;">If you didn't request this, you can safely
  ignore this email.</p>
          </div>
        `,
      });

      if (error) {
        console.error('Resend error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error('Send route error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
