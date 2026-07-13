import React from 'react';
import './BrandMoodboard.css';

function BrandMoodboard() {
  const copyToClipboard = (hex) => {
    navigator.clipboard.writeText(hex);
    alert(`¡Copiado ${hex} al portapapeles!`);
  };

  return (
    <div className="app-container brand-portal-root">
      <div className="moodboard brand-tab" style={{ paddingTop: '2rem' }}>
      
      {/* Brand Logo / Tagline */}
      <div className="card tagline-card tilt-left">
        <h2>Pika la vida</h2>
        <p>Dulce, picosito y delicioso. El antojo perfecto.</p>
        <p>Hecho en Cancún.</p>
      </div>

      {/* Logo Card */}
      <div className="card tilt-right polaroid">
        <div className="logo-container">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo de Pikanditas" onError={(e) => {
            e.target.onerror = null; 
            e.target.src = 'https://via.placeholder.com/400x400/FF0055/ffffff?text=Reemplazar+por+logo.png';
          }} />
        </div>
        <p>Logo de Inspiración Oficial</p>
      </div>

      {/* Misión, Visión */}
      <div className="card tilt-right">
        <h3 style={{color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.5rem'}}>MISIÓN</h3>
        <p style={{marginBottom: '1.5rem', fontSize: '0.95rem'}}>
          Crear momentos felices y sabrosos llevando gomitas enchiladas irresistibles a cada rincón, con una imagen fresca, divertida y un sabor que hace sonreír.
        </p>
        
        <h3 style={{color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.5rem'}}>VISIÓN</h3>
        <p style={{marginBottom: '0', fontSize: '0.95rem'}}>
          Ser la marca de gomitas enchiladas favorita en México, reconocida por su sabor único, su personalidad vibrante y su compromiso con la cercanía, el sabor y la calidad.
        </p>
      </div>

      {/* Valores */}
      <div className="card tilt-left-more" style={{ maxWidth: '450px' }}>
        <h3 style={{color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.5rem'}}>VALORES</h3>
        <ul style={{ fontSize: '0.95rem', marginTop: '0' }}>
          <li className="neutral-check" style={{marginBottom: '1rem'}}>
            <div><strong>Alegría:</strong> <br/>Cada bolsita lleva sabor y sonrisa.</div>
          </li>
          <li className="neutral-check" style={{marginBottom: '1rem'}}>
            <div><strong>Cercanía:</strong> <br/>Estamos en la tiendita, en la calle, contigo.</div>
          </li>
          <li className="neutral-check" style={{marginBottom: '1rem'}}>
            <div><strong>Pasión por lo que pica rico:</strong> <br/>Sabemos lo que nos gusta y lo hacemos bien.</div>
          </li>
          <li className="neutral-check" style={{marginBottom: '1rem'}}>
            <div><strong>Creatividad:</strong> <br/>Desde la etiqueta hasta el sabor, todo tiene nuestro toque único.</div>
          </li>
          <li className="neutral-check">
            <div><strong>Responsabilidad:</strong> <br/>Buscamos crecer cuidando nuestro entorno y relaciones.</div>
          </li>
        </ul>
      </div>

      {/* Atributos Clave */}
      <div className="card tilt-right tagline-card">
        <h3 style={{ marginBottom: '1rem' }}>¿Por qué Pikanditas?</h3>
        <ul style={{ fontSize: '0.9rem', textAlign: 'left', listStyle: 'none', padding: 0 }}>
          <li style={{marginBottom: '0.8rem'}}><span>🍓</span> <span><strong>Sabor inconfundible:</strong> un picante dulce al estilo Mexicano que emociona.</span></li>
          <li style={{marginBottom: '0.8rem'}}><span>🧸</span> <span><strong>Branding tierno y atrevido:</strong> nuestro oso picosito conquista a primera vista.</span></li>
          <li style={{marginBottom: '0.8rem'}}><span>👜</span> <span><strong>Presentación práctica y coqueta:</strong> ideal para tiendas, antojos y compartir.</span></li>
          <li style={{marginBottom: '0.8rem'}}><span>♻️</span> <span><strong>En camino a lo eco-amigable:</strong> empaques pequeños, menos desperdicio.</span></li>
          <li><span>🤝</span> <span><strong>Con alma de comunidad:</strong> vendemos con trato directo, cálido y constante.</span></li>
        </ul>
      </div>

      {/* Colors */}
      <div className="card tilt-left">
        <h3>Colores de la Marca</h3>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Inspiración visual - Haz clic para copiar HEX</p>
        <div className="swatches">
          <div className="swatch" style={{ backgroundColor: '#FF0055' }} onClick={() => copyToClipboard('#FF0055')} title="Magenta Osito"></div>
          <div className="swatch" style={{ backgroundColor: '#7ED321' }} onClick={() => copyToClipboard('#7ED321')} title="Verde Letras"></div>
          <div className="swatch" style={{ backgroundColor: '#FF9900' }} onClick={() => copyToClipboard('#FF9900')} title="Naranja Dulce"></div>
          <div className="swatch" style={{ backgroundColor: '#FF0000' }} onClick={() => copyToClipboard('#FF0000')} title="Rojo Chile"></div>
          <div className="swatch" style={{ backgroundColor: '#FFD6E0' }} onClick={() => copyToClipboard('#FFD6E0')} title="Rosa Pastel Fondo"></div>
          <div className="swatch" style={{ backgroundColor: '#2f3542' }} onClick={() => copyToClipboard('#2f3542')} title="Texto Oscuro"></div>
        </div>
        
        <h3 style={{ marginTop: '1.5rem' }}>Colores de las Gomitas</h3>
        <div className="swatches">
          <div className="swatch" style={{ backgroundColor: '#FF0000' }} onClick={() => copyToClipboard('#FF0000')} title="Rojo Intenso"></div>
          <div className="swatch" style={{ backgroundColor: '#FF7F00' }} onClick={() => copyToClipboard('#FF7F00')} title="Naranja Brillante"></div>
          <div className="swatch" style={{ backgroundColor: '#FFEA00' }} onClick={() => copyToClipboard('#FFEA00')} title="Amarillo Vivo"></div>
          <div className="swatch" style={{ backgroundColor: '#00CC00' }} onClick={() => copyToClipboard('#00CC00')} title="Verde Fuerte"></div>
        </div>
      </div>

      {/* Archetype & Tone */}
      <div className="card tilt-right">
        <h3>Personalidad</h3>
        <ul>
          <li className="neutral-check"><span><strong>Arquetipo:</strong> El Bufón (Principal), El Creador (Secundario)</span></li>
          <li className="neutral-check"><span><strong>Tono:</strong> Divertido, Juguetón, Amigable</span></li>
          <li className="neutral-check"><span><strong>Vibra:</strong> Local, Juvenil, Ligeramente travieso</span></li>
          <li className="no-check"><span>Nunca agresivo, nunca vulgar</span></li>
        </ul>
      </div>

      {/* Typography */}
      <div className="card tilt-left-more">
        <h3>Tipografía</h3>
        <div style={{ marginTop: '1rem' }}>
          <div className="typo-sample font-outfit">Outfit</div>
          <p className="font-outfit">Fuente Principal para Títulos (Pesos: 400, 600, 800)</p>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <div className="typo-sample font-inter">Inter</div>
          <p className="font-inter">Fuente para Texto (Pesos: 400, 500, 700)</p>
        </div>
      </div>

      {/* Strategy & Sales */}
      <div className="card tilt-left">
        <h3>Estrategia de Ventas</h3>
        <h2 style={{ color: 'var(--primary)', marginTop: '0.5rem', marginBottom: '1rem' }}>"Vende rotación. No dulces."</h2>
        <ul style={{ fontSize: '0.9rem' }}>
          <li className="neutral-check"><span><strong>Consumidores:</strong> Vende el antojo.</span></li>
          <li className="neutral-check"><span><strong>Estudiantes:</strong> Vende la oportunidad.</span></li>
          <li className="neutral-check">
            <div>
              <strong>Mayoreo:</strong> Ideal para reventa rápida.
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.1rem' }}>(10+ piezas)</div>
            </div>
          </li>
          <li className="neutral-check">
            <div>
              <strong>Distribuidores:</strong> Vende volumen.
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.1rem' }}>(20+ piezas)</div>
            </div>
          </li>
        </ul>
      </div>

      {/* Oportunidad de Negocio */}
      <div className="card tilt-right-more tagline-card">
        <h3 style={{ marginBottom: '1rem' }}>Oportunidad de Negocio</h3>
        <p style={{ fontSize: '1.1rem', marginBottom: '1rem', fontStyle: 'italic' }}>
          "Empieza con poco, gana rápido y diviértete vendiendo Pikanditas."
        </p>
        <ul style={{ fontSize: '0.9rem', textAlign: 'left' }}>
          <li className="yes-check"><span>Baja inversión inicial</span></li>
          <li className="yes-check"><span>Alta rotación (se venden en minutos)</span></li>
          <li className="yes-check"><span>Excelente margen de ganancia</span></li>
          <li className="yes-check"><span>Imagen profesional y respaldo comprobado</span></li>
        </ul>
      </div>
        </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', 
        padding: '2rem 1rem 1rem', 
        fontSize: '0.8rem', 
        color: 'var(--primary)', 
        opacity: 0.5,
        marginTop: 'auto'
      }}>
        powered by Jonla Agencia
      </footer>
    </div>
  );
}

export default BrandMoodboard;
