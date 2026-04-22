import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { org, email, use_case, countries } = body;

    // Disparo via Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'World Contrast <onboarding@resend.dev>', // E-mail de disparo (padrão de teste do Resend)
        to: 'rafaelstedile@gmail.com', // O seu e-mail de destino
        subject: `[WC-ENTERPRISE] Nova solicitação: ${org}`,
        html: `
          <div style="font-family: sans-serif; color: #111;">
            <h2>Nova Solicitação de Acesso Enterprise</h2>
            <p><strong>Organização:</strong> ${org}</p>
            <p><strong>Email Institucional:</strong> ${email}</p>
            <p><strong>Caso de Uso:</strong> ${use_case}</p>
            <p><strong>Países de Interesse:</strong> ${countries || 'Não informado'}</p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
            <p style="font-size: 12px; color: #666;">Gerado automaticamente via worldcontrast.org</p>
          </div>
        `
      })
    });

    if (res.ok) {
      return NextResponse.json({ success: true });
    } else {
      const errorData = await res.json();
      console.error('Resend Error:', errorData);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
