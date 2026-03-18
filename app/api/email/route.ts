import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, html } = body;

    // Basic validation
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // Call Resend API natively via fetch to avoid Node package cache issues
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Comicraft <noreply@comicraft.com>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      return NextResponse.json({ success: true, data });
    } else {
      console.error('Resend API Error:', data);
      return NextResponse.json({ error: data }, { status: res.status });
    }
  } catch (error) {
    console.error('Email API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing email request' },
      { status: 500 }
    );
  }
}
