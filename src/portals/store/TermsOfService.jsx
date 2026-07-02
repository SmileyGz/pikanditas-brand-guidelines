import React from 'react'
import { Link } from 'react-router-dom'

export default function TermsOfService() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 2rem 4rem', fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--color-text)' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', marginBottom: '1.5rem', fontSize: '2rem' }}>
        Términos, Condiciones y Aviso de Privacidad
      </h1>
      <p style={{ marginBottom: '2.5rem', color: 'var(--color-text-muted)' }}>
        Última actualización: {new Date().toLocaleDateString('es-MX')}
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', lineHeight: '1.6' }}>
        
        {/* TÉRMINOS Y CONDICIONES */}
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginTop: '1rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          Términos y Condiciones de Servicio
        </h2>
        
        <p>Bienvenido a Pikanditas. Al utilizar nuestro sitio web y realizar compras, aceptas los siguientes términos y condiciones. Si tienes alguna duda, por favor contáctanos antes de realizar tu compra.</p>

        <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--color-text)', fontWeight: 600 }}>1. Condiciones Generales y Jurisdicción</h3>
        <p>Estas condiciones rigen las compras y uso del sitio web de Pikanditas. Cualquier disputa legal estará regida por las leyes de México y se resolverá en los tribunales competentes de Cancún, Quintana Roo. Nos reservamos el derecho de cancelar pedidos en caso de errores tipográficos o de precios evidentes en el sistema.</p>

        <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--color-text)', fontWeight: 600 }}>2. Productos, Alérgenos y Manejo</h3>
        <p>Precaución: vendemos dulces enchilados que son procesados en instalaciones que pueden contener alérgenos (como cacahuate, soya, etc.). Una vez entregado el producto, es responsabilidad del cliente almacenarlo adecuadamente, lejos del calor y la luz solar directa. No nos hacemos responsables por productos que se deterioren debido a un mal almacenamiento tras la entrega.</p>

        <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--color-text)', fontWeight: 600 }}>3. Compras y Cancelaciones</h3>
        <p>Dado que nuestros productos son alimentos preparados bajo demanda, no aceptamos devoluciones. Una vez realizado y pagado un pedido, cuentas con un periodo máximo de 1 hora para solicitar su cancelación o modificación. Pasado este tiempo, el pedido entra a producción y no podrá ser modificado.</p>

        <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--color-text)', fontWeight: 600 }}>4. Envíos y Riesgos</h3>
        <p>Las entregas se realizan dentro de la Zona Metropolitana de Cancún. Una vez que el producto es entregado a la paquetería o repartidor, el riesgo de pérdida pasa al comprador. El cliente es responsable de proporcionar una dirección correcta; de lo contrario, deberá cubrir los costos de reenvío. No nos hacemos responsables por retrasos derivados de causas de fuerza mayor (clima extremo, huracanes, etc.).</p>

        <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--color-text)', fontWeight: 600 }}>5. Facturación y Pagos</h3>
        <p>Procesamos pagos de manera segura mediante Mercado Pago. De acuerdo con las normativas del SAT, las facturas (CFDI) deben ser solicitadas dentro del mismo mes en el que se realizó la compra. Nos reservamos el derecho de bloquear usuarios que intenten realizar contracargos fraudulentos.</p>

        <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--color-text)', fontWeight: 600 }}>6. Propiedad Intelectual y Contenido (UGC)</h3>
        <p>La marca, logo y contenido de Pikanditas están protegidos legalmente. Si nos etiquetas en redes sociales, nos otorgas el derecho no exclusivo de compartir y utilizar dicho contenido en nuestros canales de marketing.</p>

        <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--color-text)', fontWeight: 600 }}>7. Prohibiciones y Ventas B2B</h3>
        <p>Las compras realizadas en este sitio web son para consumo personal. Queda estrictamente prohibida la reventa no autorizada de nuestros productos. Para compras de mayoreo, por favor utiliza la sección de "Mayoristas" que se rige bajo un acuerdo B2B distinto.</p>

        {/* AVISO DE PRIVACIDAD */}
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginTop: '2.5rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          Aviso de Privacidad
        </h2>

        <p>En Pikanditas nos tomamos muy en serio la protección de tu información. Este aviso se emite en cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México.</p>
        
        <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--color-text)', fontWeight: 600 }}>1. Identidad del Responsable</h3>
        <p>El responsable del tratamiento de tus datos personales es Jose Gonzalez Lazaro, con domicilio en 127 Bosques Sn Miguel, Cancún, Quintana Roo.</p>
        
        <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--color-text)', fontWeight: 600 }}>2. Datos que Recopilamos</h3>
        <p>Recopilamos nombre, dirección, correo, teléfono (incluyendo WhatsApp) y datos de navegación. Los datos financieros y de tarjetas son procesados de manera segura por Mercado Pago y nosotros no los almacenamos.</p>

        <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--color-text)', fontWeight: 600 }}>3. Finalidades del Tratamiento</h3>
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <li>Finalidades Primarias: Procesamiento y entrega de pedidos, facturación, atención al cliente y transferencia de datos a logística para la entrega.</li>
          <li>Finalidades Secundarias: Envío de promociones por correo/SMS, retargeting publicitario (Meta, Google), seguimiento de ventas en carritos abandonados y análisis anonimizado.</li>
        </ul>

        <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--color-text)', fontWeight: 600 }}>4. Transferencias</h3>
        <p>Tus datos pueden ser transferidos a paqueterías, plataformas de marketing y proveedores de software que nos ayudan a operar. Al usar el sitio, consientes esta transferencia para fines operativos.</p>

        <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--color-text)', fontWeight: 600 }}>5. Derechos ARCO</h3>
        <p>Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al uso de tus datos. Para ejercer estos derechos, escribe a hola@pikanditas.com. Ten en cuenta que los datos requeridos por ley (como facturación) no pueden ser eliminados inmediatamente.</p>

        <h3 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--color-text)', fontWeight: 600 }}>6. Cookies</h3>
        <p>Utilizamos cookies y tecnologías de rastreo para mejorar tu experiencia y ofrecer publicidad relevante. Puedes deshabilitarlas desde tu navegador.</p>

      </div>
      
      <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
        <Link to="/" className="btn btn-secondary">← Volver al Inicio</Link>
      </div>
    </div>
  )
}
