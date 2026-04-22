import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { org, email, use_case, countries } = body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"World Contrast API" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `[WC-ENTERPRISE] Nova solicitação: ${org}`,
      html: `
        <div style="font-family: sans-serif; color: #111; max-width: 600px; padding: 20px;">
          <h2 style="color: #C8A96E; margin-bottom: 24px;">Nova Solicitação de Acesso Enterprise</h2>
          
          <div style="background: #f4f4f5; padding: 16px; border-radius: 4px;">
            <p style="margin: 8px 0;"><strong>Organização:</strong> ${org}</p>
            <p style="margin: 8px 0;"><strong>Email Institucional:</strong> ${email}</p>
            <p style="margin: 8px 0;"><strong>Caso de Uso:</strong> ${use_case}</p>
            <p style="margin: 8px 0;"><strong>Países de Interesse:</strong> ${countries || 'Não informado'}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
          <p style="font-size: 12px; color: #666;">Enviado automaticamente via worldcontrast.org</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Nodemailer Error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
