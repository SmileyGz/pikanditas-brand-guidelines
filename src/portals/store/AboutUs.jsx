import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLangStore } from '../../store/langStore'
import './AboutUs.css'

export default function AboutUs() {
  const { lang } = useLangStore()
  
  // Floating emojis for the playful background
  const [elements, setElements] = useState([])
  useEffect(() => {
    const emojis = ['🐻', '🌶️', '🍓', '✨', '🔥', '🍬']
    const newElements = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 100 + '%',
      animationDuration: (Math.random() * 10 + 10) + 's',
      animationDelay: (Math.random() * -20) + 's',
      fontSize: (Math.random() * 20 + 20) + 'px'
    }))
    setElements(newElements)
  }, [])

  const t = {
    es: {
      title: '¡Pika la vida!',
      subtitle: 'Nuestra Historia',
      paragraph1: 'Pikanditas nació en Cancún 🌴 de un simple antojo: encontrar el balance perfecto entre lo dulce de las gomitas, lo picosito de un buen chilito, y lo acidito del chamoy artesanal. Nos dimos cuenta que las gomitas enchiladas comerciales sabían artificiales, así que decidimos hacer las nuestras a mano.',
      paragraph2: 'Hoy somos la marca de gomitas más traviesa y divertida 🐻. No solo vendemos dulces, ¡vendemos felicidad y el antojo perfecto! Nuestro Osito Magenta representa la alegría de compartir un momento delicioso (o guardártelas todas para ti, no juzgamos).',
      vibeTitle: 'El Secreto Pikanditas',
      vibeItems: [
        { icon: '🌶️', title: 'Chile de Calidad', desc: 'Mezcla secreta que pica rico, pero no quema.' },
        { icon: '🍓', title: 'Chamoy Casero', desc: 'Súper espeso, sin ese sabor artificial.' },
        { icon: '🍬', title: 'Suavecitas', desc: 'Las gomitas nunca se hacen duras.' }
      ],
      cta: '¡Se me antojaron! Pedir Ahora 🐻',
    },
    en: {
      title: 'Spice up your life!',
      subtitle: 'Our Story',
      paragraph1: 'Pikanditas was born in Cancún 🌴 out of a simple craving: finding the perfect balance between sweet gummies, spicy chili, and sour artisanal chamoy. We realized commercial spicy gummies tasted artificial, so we decided to handcraft our own.',
      paragraph2: 'Today we are the most playful and fun gummy brand 🐻. We don\'t just sell candy, we sell happiness and the perfect craving! Our Magenta Bear represents the joy of sharing a delicious moment (or keeping them all to yourself, we don\'t judge).',
      vibeTitle: 'The Pikanditas Secret',
      vibeItems: [
        { icon: '🌶️', title: 'Quality Chili', desc: 'A secret blend that has a rich kick, but doesn\'t burn.' },
        { icon: '🍓', title: 'Homemade Chamoy', desc: 'Super thick, without that artificial flavor.' },
        { icon: '🍬', title: 'Always Soft', desc: 'Our gummies never get hard or stale.' }
      ],
      cta: 'I\'m craving them! Order Now 🐻',
    }
  }

  const texts = t[lang]

  return (
    <div className="about-root">
      {/* Playful floating background emojis */}
      <div className="floating-container">
        {elements.map(el => (
          <div 
            key={el.id} 
            className="floating-emoji" 
            style={{ left: el.left, animationDuration: el.animationDuration, animationDelay: el.animationDelay, fontSize: el.fontSize }}
          >
            {el.emoji}
          </div>
        ))}
      </div>

      <div className="about-content">
        <div className="about-header text-center">
          <h1 className="about-title text-gradient">{texts.title}</h1>
          <h2 className="about-subtitle">{texts.subtitle}</h2>
        </div>

        <div className="about-grid">
          <div className="about-text-panel glass-panel">
            <p className="about-paragraph">{texts.paragraph1}</p>
            <p className="about-paragraph">{texts.paragraph2}</p>
            
            <div className="about-vibe-box">
              <h3>{texts.vibeTitle}</h3>
              <ul className="vibe-list">
                {texts.vibeItems.map((item, idx) => (
                  <li key={idx}>
                    <span className="vibe-icon">{item.icon}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <br/>
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link to="/#bundles" className="btn btn-primary btn-lg btn-jiggle" style={{ display: 'inline-block' }}>
                {texts.cta}
              </Link>
            </div>
          </div>

          <div className="about-image-container">
            <div className="image-glow" />
            <img 
              src="/about-product.jpg" 
              alt="Pikanditas Gummies" 
              className="about-product-img"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
