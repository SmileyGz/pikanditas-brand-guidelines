import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../../../store/authStore'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default icon issue with Leaflet and Webpack/Vite
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const customIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Custom colorful icons
const getMarkerIcon = (status) => {
  const colorMap = {
    'ok': 'green',
    'due': 'gold',
    'overdue': 'red',
    'default': 'blue'
  }
  const color = colorMap[status] || colorMap.default
  
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

export default function SellerVisits() {
  const { user } = useAuthStore()
  const [view, setView] = useState('map') // 'map' or 'list'

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['seller-stores', user?.id],
    queryFn: async () => {
      // Fetch assigned stores for this seller
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('assigned_seller', user?.id)
      
      if (error) throw error
      
      // Mock data if none exist so the map isn't empty
      if (!data || data.length === 0) {
        return [
          {
            id: 'mock-1',
            name: 'Abarrotes Omar',
            location: { lat: 21.161908, lng: -86.851528 }, // Cancún center
            next_visit_date: new Date().toISOString(),
            status: 'due'
          },
          {
            id: 'mock-2',
            name: 'Papelería La Escolar',
            location: { lat: 21.155, lng: -86.86 },
            next_visit_date: new Date(Date.now() + 86400000 * 5).toISOString(),
            status: 'ok'
          }
        ]
      }
      return data
    },
    enabled: !!user?.id
  })

  // Default center: Cancun
  const center = stores.length > 0 && stores[0].location
    ? [stores[0].location.lat, stores[0].location.lng]
    : [21.161908, -86.851528]

  return (
    <div style={{ padding: 'var(--space-5)' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
        📍 Mi Ruta y Tiendas
      </h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button 
          className={`btn ${view === 'map' ? 'btn-primary' : 'btn-ghost'} btn-sm`} 
          onClick={() => setView('map')}
          style={{ flex: 1 }}
        >
          🗺️ Mapa
        </button>
        <button 
          className={`btn ${view === 'list' ? 'btn-primary' : 'btn-ghost'} btn-sm`} 
          onClick={() => setView('list')}
          style={{ flex: 1 }}
        >
          📋 Lista
        </button>
      </div>

      {isLoading ? (
        <p>Cargando tiendas...</p>
      ) : view === 'map' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: '60vh', borderRadius: 'var(--radius-lg)' }}>
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {stores.filter(s => s.location).map(store => {
              // Determine status for icon color
              let statusStr = 'ok'
              if (store.status) statusStr = store.status
              else {
                const isOverdue = new Date(store.next_visit_date) < new Date()
                statusStr = isOverdue ? 'overdue' : 'ok'
              }

              return (
                <Marker 
                  key={store.id} 
                  position={[store.location.lat, store.location.lng]}
                  icon={getMarkerIcon(statusStr)}
                >
                  <Popup>
                    <strong>{store.name}</strong><br />
                    Próxima visita: {store.next_visit_date ? new Date(store.next_visit_date).toLocaleDateString() : 'No programada'}<br />
                    <button 
                      className="btn btn-primary btn-sm" 
                      style={{ marginTop: '0.5rem', width: '100%' }}
                      onClick={() => window.open(`https://maps.google.com/?q=${store.location.lat},${store.location.lng}`, '_blank')}
                    >
                      🧭 Navegar
                    </button>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {stores.map(store => (
            <div key={store.id} className="card">
              <h3 style={{ margin: 0 }}>{store.name}</h3>
              <p className="text-muted" style={{ margin: '0.25rem 0 0.5rem 0' }}>
                Próxima visita: {store.next_visit_date ? new Date(store.next_visit_date).toLocaleDateString() : 'Sin programar'}
              </p>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Registrar Visita
              </button>
            </div>
          ))}
          {stores.length === 0 && <p className="text-muted text-center" style={{ marginTop: '2rem' }}>No tienes tiendas asignadas.</p>}
        </div>
      )}
    </div>
  )
}
