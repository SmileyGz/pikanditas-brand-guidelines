import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
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
const getMarkerIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

export default function AdminMap() {
  const [filter, setFilter] = useState('all') // 'all', 'stores', 'sellers'

  // Fetch all stores
  const { data: stores = [], isLoading: isLoadingStores } = useQuery({
    queryKey: ['admin-map-stores'],
    queryFn: async () => {
      const { data } = await supabase
        .from('stores')
        .select('*, assigned_seller(name)')
      return data || []
    }
  })

  // Fetch latest visits (to get seller locations)
  // We'll get the most recent visit per seller
  const { data: latestVisits = [], isLoading: isLoadingVisits } = useQuery({
    queryKey: ['admin-map-seller-locations'],
    queryFn: async () => {
      // Fetch all visits with locations in the last 7 days
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      
      const { data } = await supabase
        .from('visits')
        .select('seller_id, created_at, location, profiles(name, phone)')
        .not('location', 'is', null)
        .gte('created_at', lastWeek.toISOString())
        .order('created_at', { ascending: false })

      if (!data) return []

      // Deduplicate to only keep the latest location per seller
      const seenSellers = new Set()
      const uniqueVisits = []
      for (const visit of data) {
        if (!seenSellers.has(visit.seller_id)) {
          seenSellers.add(visit.seller_id)
          uniqueVisits.push(visit)
        }
      }
      return uniqueVisits
    }
  })

  // Compile markers
  const markers = useMemo(() => {
    const list = []
    
    if (filter === 'all' || filter === 'stores') {
      stores.forEach(store => {
        if (store.location && store.location.lat && store.location.lng) {
          // Determine color based on status or next_visit_date
          const isOverdue = store.next_visit_date && new Date(store.next_visit_date) < new Date()
          const color = isOverdue ? 'red' : 'green'

          list.push({
            id: `store-${store.id}`,
            lat: store.location.lat,
            lng: store.location.lng,
            type: 'store',
            color: color,
            name: store.name,
            sub: store.assigned_seller?.name || 'Sin Asignar',
            extra: `Visita: ${store.next_visit_date ? new Date(store.next_visit_date).toLocaleDateString() : 'No programada'}`
          })
        }
      })
    }

    if (filter === 'all' || filter === 'sellers') {
      latestVisits.forEach(visit => {
        if (visit.location && visit.location.lat && visit.location.lng) {
          list.push({
            id: `seller-${visit.seller_id}`,
            lat: visit.location.lat,
            lng: visit.location.lng,
            type: 'seller',
            color: 'blue',
            name: `🚶‍♂️ ${visit.profiles?.name || 'Vendedor'}`,
            sub: `Última conexión: ${new Date(visit.created_at).toLocaleString()}`,
            extra: visit.profiles?.phone ? `Tel: ${visit.profiles.phone}` : ''
          })
        }
      })
    }

    return list
  }, [stores, latestVisits, filter])

  // Default center (Cancun if no data)
  const defaultCenter = [21.161908, -86.851528]
  const center = markers.length > 0 ? [markers[0].lat, markers[0].lng] : defaultCenter

  const isLoading = isLoadingStores || isLoadingVisits

  return (
    <div className="admin-page" style={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      <header className="admin-page-header" style={{ flexShrink: 0, paddingBottom: '1rem' }}>
        <h1 className="admin-page-title">🗺️ Mapa Global (Centro de Comando)</h1>
        <p className="admin-page-subtitle">Ubicación de Tienditas y Fuerza de Ventas en tiempo real.</p>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button 
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setFilter('all')}
          >
            Ver Todo
          </button>
          <button 
            className={`btn btn-sm ${filter === 'stores' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setFilter('stores')}
          >
            🏪 Solo Tienditas
          </button>
          <button 
            className={`btn btn-sm ${filter === 'sellers' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setFilter('sellers')}
          >
            🚶‍♂️ Solo Vendedores
          </button>
        </div>
      </header>

      <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <p className="text-muted">Cargando datos geográficos...</p>
          </div>
        ) : (
          <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%', zIndex: 0 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {markers.map(marker => (
              <Marker 
                key={marker.id} 
                position={[marker.lat, marker.lng]}
                icon={getMarkerIcon(marker.color)}
              >
                <Popup>
                  <div style={{ minWidth: 200 }}>
                    <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '4px' }}>
                      {marker.name}
                    </strong>
                    <div className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                      {marker.sub}
                    </div>
                    {marker.extra && (
                      <div style={{ fontSize: '0.85rem' }}>
                        {marker.extra}
                      </div>
                    )}
                    <button 
                      className="btn btn-primary btn-sm" 
                      style={{ marginTop: '0.75rem', width: '100%', padding: '0.4rem' }}
                      onClick={() => window.open(`https://maps.google.com/?q=${marker.lat},${marker.lng}`, '_blank')}
                    >
                      🧭 Abrir en Google Maps
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
      
      <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '1rem', flexShrink: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{display:'inline-block', width:12,height:12,background:'#2ecc71',borderRadius:'50%'}}></span> Tienda al día</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{display:'inline-block', width:12,height:12,background:'#e74c3c',borderRadius:'50%'}}></span> Tienda atrasada</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{display:'inline-block', width:12,height:12,background:'#3498db',borderRadius:'50%'}}></span> Vendedor en ruta</span>
      </div>
    </div>
  )
}
