import { useCallback, useEffect, useState } from 'react'

export function GuestList({ refreshKey }: { refreshKey: number }) {
  const [guests, setGuests] = useState<{ name: string; nickname: string }[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch('/api/invitation/guests', { signal, cache: 'no-store' })
      if (!response.ok) throw new Error()
      const data = await response.json()
      if (!signal?.aborted) { setGuests(data.guests); setStatus('ready') }
    } catch {
      if (!signal?.aborted) setStatus('error')
    }
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    const update = () => { if (!document.hidden) void refresh(controller.signal) }
    update()
    const timer = setInterval(update, 15000)
    document.addEventListener('visibilitychange', update)
    return () => { controller.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', update) }
  }, [refresh, refreshKey])
  return (
    <section className="guest-section motion-section" id="invites" aria-labelledby="guests-title">
      <div className="section-top">
        <div><p className="eyebrow">LE CERCLE S’AGRANDIT</p><h2 id="guests-title">ILS SERONT LÀ<span className="gold-text">.</span></h2></div>
        <span className="guest-live"><span className="tiny-dot" /> ACTUALISATION AUTOMATIQUE</span>
      </div>
      <p className="guest-intro">Les noms et pseudos enregistrés lors de la récupération des invitations. Le plaisir de se retrouver commence ici.</p>
      <p className="guest-status" role="status">
        {status === 'loading' ? 'Chargement de la liste des invités…' : status === 'error' ? 'La liste ne peut pas être actualisée pour le moment.' : guests.length === 0 ? 'Les premières invitations attendent d’être récupérées.' : ''}
      </p>
      {status === 'error' && <button className="text-link" onClick={() => void refresh()}>Réessayer</button>}
      {guests.length > 0 && <ul className="guest-list">{guests.map((guest) => <li key={JSON.stringify([guest.name, guest.nickname])}><span>{guest.name}</span><span>{guest.nickname}</span></li>)}</ul>}
    </section>
  )
}
