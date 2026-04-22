'use client'

import { useState } from 'react'

export default function EnterpriseForm({ locale }: { locale: string }) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)

    try {
      const response = await fetch('/api/enterprise/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        console.error('Erro ao enviar solicitação.')
      }
    } catch (error) {
      console.error('Erro de conexão:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div style={{
        padding: '48px 32px',
        background: 'var(--onyx-3)',
        border: '1px solid var(--gold-bdr)',
        borderRadius: '4px',
        textAlign: 'center',
      }}>
        <div style={{ color: 'var(--gold)', fontSize: '24px', marginBottom: '16px' }}>✦</div>
        <h3 style={{ fontSize: '18px', color: 'var(--platinum)', fontWeight: 600, marginBottom: '8px' }}>
          {locale === 'pt' ? 'Solicitação recebida.' : 'Application received.'}
        </h3>
        <p style={{ fontFamily: 'var(--font-m)', fontSize: '12px', color: 'var(--plat-dim)', lineHeight: 1.6 }}>
          {locale === 'pt'
            ? 'Nosso time de arquitetura de dados analisará as credenciais e entrará em contato em breve.'
            : 'Our data architecture team will review the credentials and contact you shortly.'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label className="form-label" htmlFor="org">
          {locale === 'pt' ? 'Organização' : 'Organization'}
        </label>
        <input className="form-input" id="org" name="org" type="text"
          placeholder={locale === 'pt' ? 'Reuters · Bloomberg · IMF...' : 'Reuters · Bloomberg · IMF...'} required />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="email">
          {locale === 'pt' ? 'Email institucional' : 'Institutional email'}
        </label>
        <input className="form-input" id="email" name="email" type="email"
          placeholder="name@organization.com" required />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="use-case">
          {locale === 'pt' ? 'Caso de uso' : 'Use case'}
        </label>
        <select className="form-select" id="use-case" name="use_case" required>
          <option value="">{locale === 'pt' ? 'Selecione...' : 'Select...'}</option>
          <option value="news_agency">{locale === 'pt' ? 'Agência de notícias' : 'News agency'}</option>
          <option value="sovereign_fund">{locale === 'pt' ? 'Fundo soberano / Risco político' : 'Sovereign fund / Political risk'}</option>
          <option value="academic">{locale === 'pt' ? 'Pesquisa acadêmica' : 'Academic research'}</option>
          <option value="ngo">{locale === 'pt' ? 'ONG / Sociedade civil' : 'NGO / Civil society'}</option>
          <option value="other">{locale === 'pt' ? 'Outro' : 'Other'}</option>
        </select>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="countries">
          {locale === 'pt' ? 'Países de interesse' : 'Countries of interest'}
        </label>
        <input className="form-input" id="countries" name="countries" type="text"
          placeholder={locale === 'pt' ? 'Brasil, Argentina, EUA...' : 'Brazil, Argentina, USA...'} />
      </div>

      <button type="submit" className="ent-btn" style={{marginTop: 8, opacity: isSubmitting ? 0.7 : 1}} disabled={isSubmitting}>
        {isSubmitting 
          ? (locale === 'pt' ? 'Enviando...' : 'Submitting...') 
          : (locale === 'pt' ? 'Enviar solicitação' : 'Submit application')}
      </button>

      <p className="form-note">
        {locale === 'pt'
          ? 'Ao enviar, você confirma que a organização não está afiliada a nenhum partido político, campanha eleitoral ou governo. Ver TERMS_API.md.'
          : 'By submitting, you confirm that the organization has no affiliation with any political party, electoral campaign, or government. See TERMS_API.md.'}
      </p>
    </form>
  )
}
