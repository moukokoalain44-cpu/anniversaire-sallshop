import { useEffect, useState } from 'react'

export interface GuestItem {
  name: string
  nickname: string
}

const DEFAULT_GUESTS: GuestItem[] = [
  { name: 'Marco SALL', nickname: 'Le Fondateur' },
  { name: 'Money swift', nickname: 'Partenaire Officiel' },
  { name: 'Équipe WEBMAJ', nickname: 'Digital & Style' },
]

export function getSavedGuests(): GuestItem[] {
  try {
    const raw = localStorage.getItem('sall_guests_list_v4')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  return DEFAULT_GUESTS
}

export function addSavedGuest(guest: GuestItem) {
  try {
    const current = getSavedGuests()
    const exists = current.some(
      (g) => g.name.toLowerCase() === guest.name.toLowerCase(),
    )
    const updated = exists ? current : [guest, ...current]
    localStorage.setItem('sall_guests_list_v4', JSON.stringify(updated))
    window.dispatchEvent(new Event('sall_guest_added'))
  } catch {
    // ignore
  }
}

export function GuestList({ refreshKey }: { refreshKey: number }) {
  const [guests, setGuests] = useState<GuestItem[]>(getSavedGuests)

  useEffect(() => {
    setGuests(getSavedGuests())

    const handleUpdate = () => {
      setGuests(getSavedGuests())
    }

    window.addEventListener('sall_guest_added', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('sall_guest_added', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [refreshKey])

  return (
    <section
      className="guest-section motion-section is-revealed"
      id="invites"
      aria-labelledby="guests-title"
    >
      <div className="section-top">
        <div>
          <p className="eyebrow">LE CERCLE S’AGRANDIT</p>
          <h2 id="guests-title">
            ILS SERONT LÀ<span className="gold-text">.</span>
          </h2>
        </div>
        <span className="guest-live">
          <span className="tiny-dot" /> ACTUALISATION AUTOMATIQUE
        </span>
      </div>
      <p className="guest-intro">
        Les noms et pseudos enregistrés lors de la récupération des invitations.
        Le plaisir de se retrouver commence ici.
      </p>

      {guests.length === 0 ? (
        <p className="guest-status" role="status">
          Les premières invitations attendent d’être récupérées.
        </p>
      ) : (
        <ul className="guest-list">
          {guests.map((g, idx) => (
            <li key={`${g.name}-${idx}`}>
              <span>{g.name}</span>
              <span>{g.nickname}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
