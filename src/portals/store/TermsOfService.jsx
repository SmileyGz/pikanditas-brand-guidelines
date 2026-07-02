import React from 'react'
import { Link } from 'react-router-dom'

export default function TermsOfService() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 2rem 4rem', fontFamily: 'var(--font-body)' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', marginBottom: '2rem' }}>
        Términos y Condiciones
      </h1>
      <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
        Última actualización: {new Date().toLocaleDateString('es-MX')}
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: '1.8' }}>
        <p>
          Bienvenido a Pikanditas. Al utilizar nuestro sitio web y realizar compras, aceptas los siguientes términos y condiciones.
        </p>
        
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginTop: '1rem' }}>1. Productos y Envíos</h2>
        <p>
          Todos nuestros productos son artesanales. Las entregas se realizan dentro de la Zona Metropolitana de Cancún 
          en un plazo estimado de 24 a 48 horas tras la confirmación del pago.
        </p>
        
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginTop: '1rem' }}>2. Precios y Pagos</h2>
        <p>
          Los precios están sujetos a cambios sin previo aviso. Procesamos los pagos a través de Mercado Pago para 
          garantizar la seguridad de tus transacciones.
        </p>
        
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginTop: '1rem' }}>3. Devoluciones</h2>
        <p>
          Por tratarse de un producto alimenticio, no aceptamos devoluciones. Si tienes algún problema con tu pedido, 
          por favor contáctanos el mismo día de la entrega.
        </p>
      </div>
      
      <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
        <Link to="/" className="btn btn-secondary">← Volver al Inicio</Link>
      </div>
    </div>
  )
}
