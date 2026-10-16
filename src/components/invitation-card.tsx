interface InvitationCardProps {
  guestName?: string
  guestNickname?: string
}

/** Public and personalized editorial invitation card. */
export function InvitationCard({ guestName, guestNickname }: InvitationCardProps = {}) {
  return (
    <article className="editorial-invitation" aria-labelledby="invitation-title">
      <figure className="invitation-polaroid">
        <div className="invitation-photo">
          <img
            src="/img/sall-editorial.png"
            alt="Deux silhouettes en vestes de cuir sur un littoral rocheux, photographie de mode en noir et blanc"
            width={654}
            height={591}
            fetchPriority="high"
          />
          <div className="invitation-photo-type" aria-hidden="true">
            <span className="invitation-script">Ensemble.</span>
            <span className="invitation-photo-name">SALL<br />SHOP</span>
            <span className="invitation-photo-rule"><span>✦</span></span>
            <span className="invitation-photo-caption">LE STYLE NOUS RASSEMBLE</span>
          </div>
        </div>
        <figcaption>Une histoire de style. Une histoire de famille.</figcaption>
      </figure>
      <div className="invitation-paper">
        <img
          className="invitation-brand"
          src="/img/sall-logo.png"
          alt="Sall Shop — boutique de vêtements et accessoires"
          width={94}
          height={94}
        />
        <p className="invitation-kicker">L’INVITATION</p>
        <h2 id="invitation-title" className="invitation-message">
          Sall Shop a le plaisir<br />de vous inviter à la célébration<br />de son <em>anniversaire</em><br />et à son <em>défilé de mode</em>
        </h2>

        {/* Bloc Nominatif : Nom et Pseudo de l'invité */}
        {(guestName || guestNickname) && (
          <div
            style={{
              margin: '12px 0',
              padding: '10px 14px',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '10px',
                letterSpacing: '1.5px',
                color: '#d4af37',
                textTransform: 'uppercase',
                margin: '0 0 4px',
                fontWeight: 600,
              }}
            >
              INVITÉ(E) CONFIRMÉ(E)
            </p>
            <p
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#f1f0ec',
                margin: 0,
                letterSpacing: '0.5px',
              }}
            >
              {guestName || 'Votre Nom'}
            </p>
            {guestNickname && (
              <p
                style={{
                  fontSize: '13px',
                  color: '#d4af37',
                  margin: '3px 0 0',
                  fontStyle: 'italic',
                }}
              >
                « {guestNickname} »
              </p>
            )}
          </div>
        )}

        <span className="invitation-divider" aria-hidden="true" />
        <div className="invitation-details">
          <p><time dateTime="2026-10-28T14:30:00Z">Mercredi 28 octobre 2026<br /><span>À 14h30 GMT</span></time></p>
          <p>Boutique Sall Shop · Ouakam, Dakar<br /><span>Après le restaurant nigérien</span></p>
        </div>
        <div className="invitation-qr-space" role="img" aria-label="Espace réservé au QR code officiel" />
        <p className="invitation-footnote">SUR INVITATION · UN MOMENT À PARTAGER</p>
      </div>
    </article>
  )
}
