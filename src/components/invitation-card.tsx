/** Public editorial invitation. The reserved QR area is deliberately empty. */
export function InvitationCard() {
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
        <span className="invitation-divider" aria-hidden="true" />
        <div className="invitation-details">
          <p><time dateTime="2026-10-28T14:30:00Z">Mercredi 28 octobre 2026<br /><span>À 14h30 GMT</span></time></p>
          <p>Boutique Sall Shop · Ouakam, Dakar<br /><span>Après le restaurant nigérien</span></p>
        </div>
        <div className="invitation-qr-space" role="img" aria-label="Espace vide réservé au QR code" />
        <p className="invitation-footnote">SUR INVITATION · UN MOMENT À PARTAGER</p>
      </div>
    </article>
  )
}
