import React from 'react'
import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 2rem 4rem', fontFamily: 'var(--font-body)' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', marginBottom: '2rem' }}>
        Aviso de Privacidad
      </h1>
      <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
        Última actualización: {new Date().toLocaleDateString('es-MX')}
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: '1.8' }}>
        <p>
          En Pikanditas valoramos y respetamos tu privacidad. Este aviso de privacidad describe cómo recopilamos, 
          usamos y protegemos tu información personal cuando visitas nuestro sitio web o realizas una compra.
        </p>
        
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginTop: '1rem' }}>1. Información que recopilamos</h2>
        <p>
          Recopilamos la información que nos proporcionas directamente al realizar un pedido, como tu nombre y correo electrónico. 
          Los datos de pago son procesados de manera segura por nuestro proveedor de pagos (Mercado Pago) y nosotros no almacenamos 
          información de tarjetas de crédito.
        </p>
        
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginTop: '1rem' }}>2. Uso de la información</h2>
        <p>
          Utilizamos tu información únicamente para procesar tus pedidos, comunicarnos contigo sobre tu compra, 
          y mejorar nuestra experiencia de usuario.
        </p>
        
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginTop: '1rem' }}>3. Contacto</h2>
        <p>
          Si tienes preguntas sobre nuestro manejo de datos, por favor contáctanos al WhatsApp de soporte.
        </p>
      </div>
      
      <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
        <Link to="/" className="btn btn-secondary">← Volver al Inicio</Link>
      </div>
    </div>
  )
}
