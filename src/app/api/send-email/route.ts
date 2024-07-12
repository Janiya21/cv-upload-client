// pages/api/send-email.js
import { sendEmail } from '@/lib/mail';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const formData = await req.formData();
    const to = formData.get('to') as string | null;
    const subject = formData.get('subject') as string | null;
    const text = formData.get('text') as string | null;
    const html = formData.get('html') as string | null;

    if (!to || !subject || (!text && !html)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await sendEmail({ to, subject, text, html });

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Error sending email' }, { status: 500 });
  }
}
