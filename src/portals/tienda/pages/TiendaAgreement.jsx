import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../../../store/authStore'

export default function TiendaAgreement() {
  const { user } = useAuthStore()

  // Fetch real data from Supabase
  const { data: agreement, isLoading } = useQuery({
    queryKey: ['my-agreement', user?.id],
    queryFn: async () => {
      // Fetch the user's store first, then its agreement
      const { data: storeData, error: storeError } = await supabase.from('stores').select('id').limit(1).single()
      if (storeError || !storeData) return null
      
      const { data, error } = await supabase.from('agreements').select('*').eq('store_id', storeData.id).eq('status', 'pending').limit(1).single()
      if (error || !data) return null
      
      return {
        id: data.id,
        type: data.type === 'consignacion' ? 'Consignación B2B' : 'Compra Directa',
        status: data.status,
        date: new Date(data.created_at).toLocaleDateString(),
        terms: 'Ver detalles en contrato adjunto.'
      }
    },
    enabled: !!user?.id
  })

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Buscando acuerdos...</div>

  return (
    <div className="seller-section animate-float-in">
      <h2 className="seller-section-title">Mi Acuerdo</h2>
      
      <div className="card" style={{ padding: '1.5rem', border: '2px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{agreement?.type}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{agreement?.id} • {agreement?.date}</p>
          </div>
          <span style={{ 
            background: 'rgba(255,165,0,0.1)', 
            color: '#cc8400', 
            padding: '4px 10px', 
            borderRadius: '20px', 
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            Requiere Firma
          </span>
        </div>

        <div style={{ background: 'var(--color-bg-consumer)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Condiciones del Acuerdo</h4>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
            {agreement?.terms}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to={`/tienda/firmar/${agreement?.id}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>
            ✍️ Firmar Acuerdo
          </Link>
          <button className="btn btn-ghost" style={{ flex: 1 }}>
            Rechazar
          </button>
        </div>
      </div>
    </div>
  )
}
