import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { sarService } from '../services/sarService.js';
import LoadingSpinner from '../components/common/LoadingSpinner.js';

const LABELS = {
  en: {
    loading: 'Loading your form…',
    invalid: 'This link is invalid or has expired.',
    invalidSub: 'Please contact your county office for assistance.',
    title: 'CalFresh SAR-7 Report',
    subtitle: 'Semi-Annual Report',
    dueIn: 'Due in',
    dueToday: 'Due today',
    overdue: 'Overdue',
    days: 'days',
    step1: 'Household Composition',
    step2: 'Income & Expenses',
    step3: 'Address & Changes',
    step4: 'Review & Submit',
    next: 'Continue',
    back: 'Back',
    submit: 'Submit Report',
    submitting: 'Submitting…',
    success: 'Report Submitted!',
    confirmationNum: 'Confirmation Number',
    thankYou: 'Thank you! Your SAR-7 has been submitted. Your county worker will review it shortly.',
    required: 'This field is required',
    householdLabel: 'Who lives in your household? (List names and relationships)',
    incomeLabel: 'Describe any income in your household (wages, benefits, other)',
    expensesLabel: 'List any changes to your monthly expenses',
    addressLabel: 'Confirm your current mailing address',
    changesLabel: 'Has anything changed in your household since your last report?',
    changesDesc: 'Please describe the changes',
    notesLabel: 'Any additional notes for your caseworker (optional)',
    yes: 'Yes',
    no: 'No',
  },
  es: {
    loading: 'Cargando su formulario…',
    invalid: 'Este enlace no es válido o ha caducado.',
    invalidSub: 'Por favor, comuníquese con la oficina de su condado.',
    title: 'Informe SAR-7 de CalFresh',
    subtitle: 'Informe Semianual',
    dueIn: 'Vence en',
    dueToday: 'Vence hoy',
    overdue: 'Vencido',
    days: 'días',
    step1: 'Composición del hogar',
    step2: 'Ingresos y gastos',
    step3: 'Dirección y cambios',
    step4: 'Revisar y enviar',
    next: 'Continuar',
    back: 'Atrás',
    submit: 'Enviar informe',
    submitting: 'Enviando…',
    success: '¡Informe enviado!',
    confirmationNum: 'Número de confirmación',
    thankYou: '¡Gracias! Su SAR-7 ha sido enviado. Su trabajador del condado lo revisará pronto.',
    required: 'Este campo es obligatorio',
    householdLabel: '¿Quién vive en su hogar? (Liste nombres y relaciones)',
    incomeLabel: 'Describa los ingresos en su hogar (salarios, beneficios, otros)',
    expensesLabel: 'Liste cualquier cambio en sus gastos mensuales',
    addressLabel: 'Confirme su dirección postal actual',
    changesLabel: '¿Ha cambiado algo en su hogar desde su último informe?',
    changesDesc: 'Por favor describa los cambios',
    notesLabel: 'Notas adicionales para su trabajador (opcional)',
    yes: 'Sí',
    no: 'No',
  },
};

const STEPS = 4;

function StepIndicator({ current, total, t }) {
  const labels = [t.step1, t.step2, t.step3, t.step4];
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: '28px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '64px' }}>
            <div style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: i < current ? 'var(--color-accent)' : i === current ? 'var(--color-primary)' : '#DEE2E6',
              color: i <= current ? '#fff' : '#ADB5BD',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.85rem',
              transition: 'all 0.25s',
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <div style={{
              fontSize: '0.65rem', marginTop: '4px',
              color: i === current ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: i === current ? 600 : 400,
              textAlign: 'center', lineHeight: 1.3,
              width: '56px',
            }}>
              {labels[i]}
            </div>
          </div>
          {i < total - 1 && (
            <div style={{
              height: '2px', flex: 1, alignSelf: 'flex-start', marginTop: '15px',
              background: i < current ? 'var(--color-accent)' : '#DEE2E6',
              transition: 'background 0.25s',
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

const fieldStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid var(--color-border)',
  borderRadius: '10px',
  fontSize: '1rem',
  outline: 'none',
  resize: 'vertical',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

export default function SarForm() {
  const { token } = useParams();
  const [formMeta, setFormMeta] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [lang, setLang] = useState('en');

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const hasChanges = watch('hasChanges') === 'true';
  const t = LABELS[lang] ?? LABELS.en;

  useEffect(() => {
    sarService.getForm(token)
      .then(data => {
        setFormMeta(data);
        if (data.preferredLanguage === 'es') setLang('es');
      })
      .catch(() => setLoadError(true));
  }, [token]);

  async function onSubmit(data) {
    setSubmitting(true);
    try {
      const result = await sarService.submit(token, {
        householdComposition: data.householdComposition,
        incomeDetails: data.incomeDetails,
        expensesDetails: data.expensesDetails,
        addressConfirmation: data.addressConfirmation,
        hasChanges: data.hasChanges === 'true',
        changesDescription: data.changesDescription ?? null,
        additionalNotes: data.additionalNotes ?? null,
      });
      setConfirmation(result);
    } catch {
      alert('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--color-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '380px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔗</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text)' }}>
            {t.invalid}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{t.invalidSub}</p>
        </div>
      </div>
    );
  }

  if (!formMeta) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <LoadingSpinner size={40} />
          <p style={{ marginTop: '16px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (confirmation) {
    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(135deg, #1B3A6B 0%, #2ECC71 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}>
        <div style={{
          background: '#fff', borderRadius: '24px', padding: '40px 32px',
          maxWidth: '440px', width: '100%', textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '12px' }}>
            {t.success}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
            {t.thankYou}
          </p>
          <div style={{
            background: 'var(--color-bg)', borderRadius: '12px', padding: '16px',
            border: '1px solid var(--color-border)',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              {t.confirmationNum}
            </div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)' }}>
              {confirmation.confirmationNumber}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dueText = formMeta.daysUntilDue < 0
    ? `${t.overdue} ${Math.abs(formMeta.daysUntilDue)} ${t.days}`
    : formMeta.daysUntilDue === 0
      ? t.dueToday
      : `${t.dueIn} ${formMeta.daysUntilDue} ${t.days}`;

  const urgencyColor = formMeta.daysUntilDue <= 7 ? '#E74C3C' : formMeta.daysUntilDue <= 14 ? '#F39C12' : '#2ECC71';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      padding: '0 0 40px',
    }}>
      {/* Top banner */}
      <div style={{
        background: 'var(--color-primary)',
        color: '#fff',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{t.title}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{t.subtitle} · {formMeta.clientFirstName} {formMeta.clientLastName}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            background: urgencyColor,
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}>
            {dueText}
          </span>
          <button
            onClick={() => setLang(l => l === 'en' ? 'es' : 'en')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none', borderRadius: '6px',
              color: '#fff', padding: '4px 10px',
              fontSize: '0.8rem', cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {lang === 'en' ? 'Español' : 'English'}
          </button>
        </div>
      </div>

      {/* Form card */}
      <div style={{ maxWidth: '560px', margin: '24px auto', padding: '0 16px' }}>
        <div style={{
          background: '#fff', borderRadius: '20px',
          padding: '28px 28px',
          boxShadow: 'var(--shadow-md)',
        }}>
          <StepIndicator current={step} total={STEPS} t={t} />

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 0: Household */}
            {step === 0 && (
              <div className="fade-in">
                <h3 style={{ fontWeight: 700, marginBottom: '6px' }}>{t.step1}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>{t.householdLabel}</p>
                <textarea
                  {...register('householdComposition', { required: t.required })}
                  rows={4}
                  style={fieldStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
                {errors.householdComposition && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '4px' }}>{errors.householdComposition.message}</p>}
              </div>
            )}

            {/* Step 1: Income & Expenses */}
            {step === 1 && (
              <div className="fade-in">
                <h3 style={{ fontWeight: 700, marginBottom: '6px' }}>{t.step2}</h3>
                <label style={{ display: 'block', marginBottom: '16px' }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>{t.incomeLabel}</p>
                  <textarea
                    {...register('incomeDetails', { required: t.required })}
                    rows={3}
                    style={fieldStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                  />
                  {errors.incomeDetails && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '4px' }}>{errors.incomeDetails.message}</p>}
                </label>
                <label style={{ display: 'block' }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>{t.expensesLabel}</p>
                  <textarea
                    {...register('expensesDetails', { required: t.required })}
                    rows={3}
                    style={fieldStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                  />
                  {errors.expensesDetails && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '4px' }}>{errors.expensesDetails.message}</p>}
                </label>
              </div>
            )}

            {/* Step 2: Address & Changes */}
            {step === 2 && (
              <div className="fade-in">
                <h3 style={{ fontWeight: 700, marginBottom: '6px' }}>{t.step3}</h3>
                <label style={{ display: 'block', marginBottom: '20px' }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>{t.addressLabel}</p>
                  <textarea
                    {...register('addressConfirmation', { required: t.required })}
                    rows={2}
                    style={fieldStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                  />
                  {errors.addressConfirmation && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '4px' }}>{errors.addressConfirmation.message}</p>}
                </label>

                <p style={{ fontWeight: 600, marginBottom: '10px' }}>{t.changesLabel}</p>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  {[['true', t.yes], ['false', t.no]].map(([val, lbl]) => (
                    <label key={val} style={{
                      flex: 1, padding: '12px', border: `2px solid ${watch('hasChanges') === val ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                      fontWeight: 600, fontSize: '0.95rem',
                      background: watch('hasChanges') === val ? '#EBF5FB' : '#fff',
                      transition: 'all 0.15s',
                    }}>
                      <input type="radio" value={val} {...register('hasChanges', { required: t.required })} style={{ display: 'none' }} />
                      {lbl}
                    </label>
                  ))}
                </div>
                {errors.hasChanges && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '-8px', marginBottom: '8px' }}>{errors.hasChanges.message}</p>}

                {hasChanges && (
                  <div className="fade-in">
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>{t.changesDesc}</p>
                    <textarea
                      {...register('changesDescription', { required: hasChanges ? t.required : false })}
                      rows={3}
                      style={fieldStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                    />
                    {errors.changesDescription && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '4px' }}>{errors.changesDescription.message}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="fade-in">
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>{t.step4}</h3>
                <div style={{
                  background: 'var(--color-bg)', borderRadius: '10px',
                  padding: '16px', marginBottom: '16px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6,
                }}>
                  <strong style={{ color: 'var(--color-text)' }}>{formMeta.clientFirstName} {formMeta.clientLastName}</strong><br />
                  Case #{formMeta.caseNumber} · Due {new Date(formMeta.sarDueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>{t.notesLabel}</p>
                  <textarea
                    {...register('additionalNotes')}
                    rows={3}
                    style={fieldStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  style={{
                    flex: 1, padding: '13px',
                    background: 'none',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: '10px',
                    fontWeight: 600, fontSize: '0.95rem',
                    cursor: 'pointer',
                    color: 'var(--color-text)',
                  }}
                >
                  {t.back}
                </button>
              )}
              {step < STEPS - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(s => s + 1)}
                  style={{
                    flex: 1, padding: '13px',
                    background: 'var(--color-primary)',
                    border: 'none', borderRadius: '10px',
                    color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                    cursor: 'pointer',
                  }}
                >
                  {t.next} →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1, padding: '13px',
                    background: submitting ? '#ADB5BD' : 'var(--color-accent)',
                    border: 'none', borderRadius: '10px',
                    color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  {submitting ? <LoadingSpinner size={18} color="#fff" /> : null}
                  {submitting ? t.submitting : t.submit}
                </button>
              )}
            </div>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
          Powered by Continuum · Waymark Lab
        </p>
      </div>
    </div>
  );
}
