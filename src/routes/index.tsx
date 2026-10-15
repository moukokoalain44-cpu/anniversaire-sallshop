import { createFileRoute } from '@tanstack/react-router'
import { GuestList } from '@/components/guest-list'
import { StorePhoto, useEditorialMotion } from '@/components/store-editorial'
import { InvitationCard } from '@/components/invitation-card'
import { useEffect, useState, useRef } from 'react'
import {
  ArrowUpRight,
  ArrowRight,
  Download,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Sparkles,
  LockKeyhole,
  Check,
  Wine,
  Music2,
  Shirt,
  Camera,
  Coffee,
  Plus,
  LogOut,
  LoaderCircle,
  Ticket,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export const Route = createFileRoute('/')({ component: Home })
type Guest = { id: string; name: string }
type Program = { title: string; label: string; description: string }
const start = Date.parse('2026-10-28T14:30:00Z')
const mapUrl =
  'https://www.google.com/maps/search/?api=1&query=Sall+Shop+Ouakam+Dakar'
const icons = [Wine, Music2, Shirt, Camera, Coffee]
const labels = [
  'Réception',
  'Animation',
  'Défilé de mode',
  'Photos & pop-up store',
  'Chill & rencontres',
]

function Home() {
  useEditorialMotion()
  const [guestListVersion, setGuestListVersion] = useState(0)
  const [downloadName, setDownloadName] = useState('')
  const [nickname, setNickname] = useState('')
  const [downloadError, setDownloadError] = useState('')
  const [guest, setGuest] = useState<Guest | null>(null)
  const [program, setProgram] = useState<Program[]>([])
  const [remaining, setRemaining] = useState<number | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [invitationOpen, setInvitationOpen] = useState(false)
  const invitationRequested = useRef(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [notice, setNotice] = useState('')
  const [active, setActive] = useState('accueil')
  const [verification, setVerification] = useState<string | null>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const tick = () =>
      setRemaining(Math.max(0, Math.floor((start - Date.now()) / 1000)))
    tick()
    const timer = setInterval(tick, 1000)
    fetch('/api/invitation')
      .then(async (r) => {
        if (r.ok) {
          const d = await r.json()
          setGuest(d.guest)
          setDownloadName(d.guest?.name ?? '')
          setProgram(d.program)
        }
      })
      .catch(() => {})
    const id = new URLSearchParams(window.location.search).get('invitation')
    if (id) {
      setVerification('Vérification de l’invitation…')
      fetch(`/api/invitation/verify?id=${encodeURIComponent(id)}`)
        .then(async (r) => {
          if (!r.ok) throw Error()
          const d = await r.json()
          setVerification(
            d.valid
              ? 'Invitation authentique · Sall Shop, le 28 octobre 2026. Présentez-la à l’accueil.'
              : 'Cette invitation n’est pas reconnue. Contactez Sall Shop.',
          )
        })
        .catch(() =>
          setVerification(
            'Vérification indisponible. Présentez votre invitation à l’accueil.',
          ),
        )
    }
    return () => clearInterval(timer)
  }, [])
  async function login(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const r = await fetch('/api/invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code }),
      })
      const d = await r.json()
      if (!r.ok) throw Error(d.error)
      setGuest(d.guest)
      setDownloadName(d.guest.name)
      setProgram(d.program)
      setLoginOpen(false)
      if (invitationRequested.current) {
        setInvitationOpen(true)
        invitationRequested.current = false
      }
      setCode('')
      setNotice(
        'Bienvenue dans le cercle Sall Shop. Votre accès VIP est confirmé.',
      )
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Connexion impossible. Réessayez.',
      )
    } finally {
      setBusy(false)
    }
  }
  async function download() {
    if (!guest) {
      setLoginOpen(true)
      return
    }
    setDownloadError('')
    setDownloading(true)
    setNotice('')
    try {
      const r = await fetch('/api/invitation/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: downloadName, nickname }),
      })
      if (!r.ok) {
        if (r.status === 401) {
          setGuest(null)
          setProgram([])
          setInvitationOpen(false)
          invitationRequested.current = true
          setLoginOpen(true)
        }
        const failure = await r.json().catch(() => null)
        throw Error(failure?.error ?? 'Impossible de télécharger l’invitation. Réessayez.')
      }
      const url = URL.createObjectURL(await r.blob())
      const a = document.createElement('a')
      a.href = url
      a.download = 'invitation-sall-shop.pdf'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setGuestListVersion((version) => version + 1)
      setNotice('Votre invitation est téléchargée. Gardez-la pour le jour J !')
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : 'Téléchargement indisponible.')
    } finally {
      setDownloading(false)
    }
  }
  async function logout() {
    try {
      const r = await fetch('/api/invitation', { method: 'DELETE' })
      if (!r.ok) throw Error()
      setGuest(null)
      setInvitationOpen(false)
      setProgram([])
      setNotice('Vous êtes déconnecté.')
    } catch {
      setNotice('Déconnexion impossible. Réessayez.')
    }
  }
  function calendar() {
    const text = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sall Shop//Anniversaire//FR',
      'BEGIN:VEVENT',
      'UID:sall-shop-anniversaire-2026',
      'DTSTAMP:20261015T000000Z',
      'DTSTART:20261028T143000Z',
      'SUMMARY:Anniversaire Sall Shop',
      'LOCATION:Boutique Sall Shop - Ouakam après le restaurant nigérien - Dakar',
      'DESCRIPTION:Réception - animation - défilé - photos et pop-up store - chill',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
    const url = URL.createObjectURL(
      new Blob([text], { type: 'text/calendar;charset=utf-8' }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = 'sall-shop-28-octobre.ics'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const values =
    remaining === null
      ? ['--', '--', '--', '--']
      : [
          Math.floor(remaining / 86400),
          Math.floor((remaining % 86400) / 3600),
          Math.floor((remaining % 3600) / 60),
          remaining % 60,
        ].map((v) => String(v).padStart(2, '0'))
  const openInvitation = () => {
    if (guest) {
      setInvitationOpen(true)
    } else {
      invitationRequested.current = true
      setError('')
      setLoginOpen(true)
    }
  }
  const openLogin = () => {
    invitationRequested.current = false
    setError('')
    setLoginOpen(true)
  }
  return (
    <div className="app-shell">
      <header className="header">
        <a className="wordmark" href="#accueil" aria-label="Sall Shop, accueil">
          <img className="header-brand" src="/.netlify/images?url=/img/sall-logo.png&w=160&fm=webp" alt="Sall Shop" width={60} height={60} />
        </a>
        <span className="header-divider" />
        <span className="space-label">
          <span className="tiny-dot" /> ESPACE INVITÉ
        </span>
        <nav aria-label="Navigation principale">
          {[
            ['accueil', 'Accueil'],
            ['programme', 'Le programme'],
            ['dresscode', 'Dress code'],
            ['invites', 'Les invités'],
            ['infos', 'Infos pratiques'],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? 'active' : ''}
              onClick={() => setActive(id)}
            >
              {label}
            </a>
          ))}
        </nav>
        <button
          className="gold-button header-download"
          onClick={openInvitation}
          disabled={downloading}
        >
          <Download size={15} />
          <span>Mon invitation</span>
          <ArrowUpRight size={15} />
        </button>
      </header>
      <main>
        {verification && (
          <div className="verification" role="status">
            <ShieldCheck size={20} />
            {verification}
            <button
              onClick={() => setVerification(null)}
              aria-label="Fermer la vérification"
            >
              <X size={17} />
            </button>
          </div>
        )}
        <div className="welcome-line">
          <span>
            <span className="tiny-dot" /> LE CERCLE SALL SHOP
          </span>
          <span>
            DAKAR, SÉNÉGAL <span className="small-star">✳</span>
          </span>
        </div>
        <section className="hero" id="accueil">
          <img className="hero-image" src="/.netlify/images?url=/img/sall-collectif.png&w=1600&fm=webp" alt="Silhouettes de mode réunies sur le littoral au coucher du soleil" fetchPriority="high" />
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="status-pill"><LockKeyhole size={12} /> UNE CÉLÉBRATION SUR INVITATION</div>
            <p className="eyebrow hero-eyebrow">PLUS QU’UNE BOUTIQUE. UNE FAMILLE.</p>
            <h1>L’ANNIVERSAIRE<br /><span>SALL SHOP.</span></h1>
            <p className="hero-description">Le style nous rassemble.<br />Cette fois, on célèbre notre histoire. Avec vous.</p>
            <div className="hero-meta"><span>28 OCTOBRE 2026</span><span>DÈS 14H30 GMT</span></div>
            <button className="gold-button hero-button" onClick={openInvitation}>Voir mon invitation <ArrowUpRight size={17} /></button>
          </div>
        </section>
        <section className="editorial-pair" aria-label="L’univers Sall Shop">
          <StorePhoto file="sall-silhouettes" alt="Silhouettes en chemises blanches, cravates et pantalons évasés" caption="01 / L’ALLURE, SANS COMPROMIS" />
          <div className="editorial-pair-copy"><p className="eyebrow">DEPUIS OUAKAM, AVEC DU STYLE</p><h2>UNE ALLURE.<br />DES HISTOIRES.<br /><span>NOTRE FAMILLE.</span></h2><p>Des pièces qui se portent. Une personnalité qui s’affirme. Retrouvez l’univers Sall Shop, en images.</p></div>
        </section>
        <div className="dashboard-grid">
          <div className="main-column">
            <section className="countdown-card">
              <div className="countdown-heading">
                <span className="eyebrow">LE RENDEZ-VOUS APPROCHE</span>
                <span className="live-dot" />
              </div>
              <div className="countdown-bottom">
                <p>
                  {remaining === 0
                    ? 'C’est le grand jour.'
                    : 'L’impatience a du style.'}
                  <span>
                    {remaining === 0
                      ? 'La célébration commence.'
                      : 'Chaque seconde nous rapproche.'}
                  </span>
                </p>
                <div
                  className="countdown"
                  aria-label="Compte à rebours avant le 28 octobre 2026"
                >
                  {values.map((v, i) => (
                    <div className="time-unit" key={i}>
                      <strong>{v}</strong>
                      <span>
                        {['JOURS', 'HEURES', 'MINUTES', 'SECONDES'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <section className="program-section" id="programme">
              <div className="section-top">
                <div>
                  <p className="eyebrow">UNE JOURNÉE À PART</p>
                  <h2>
                    LE PROGRAMME<span className="gold-text">.</span>
                  </h2>
                </div>
                <span className="section-caption">
                  Du style. Du son. Des rencontres.
                </span>
              </div>
              <div className="program-list">
                {labels.map((label, i) => {
                  const Icon = icons[i]
                  return (
                    <div
                      className={`program-row ${!guest ? 'locked-row' : ''}`}
                      key={label}
                    >
                      <span className="program-number">0{i + 1}</span>
                      <div className="program-icon">
                        <Icon size={21} strokeWidth={1.4} />
                      </div>
                      <div className="program-text">
                        <span className="program-label">{label}</span>
                        <h3>
                          {guest
                            ? program[i]?.title
                            : [
                                'Les retrouvailles',
                                'L’énergie du moment',
                                'Le rendez-vous mode',
                                'Les souvenirs se créent',
                                'Le plaisir de rester',
                              ][i]}
                        </h3>
                        {guest && <p>{program[i]?.description}</p>}
                      </div>
                      {guest ? (
                        <ArrowUpRight size={17} className="row-arrow" />
                      ) : (
                        <LockKeyhole size={14} className="row-arrow" />
                      )}
                    </div>
                  )
                })}
              </div>
              {!guest && (
                <button className="unlock-button" onClick={openLogin}>
                  <LockKeyhole size={13} />
                  Connectez-vous pour découvrir les détails de votre journée
                  <ArrowRight size={15} />
                </button>
              )}
            </section>
            <section className="dress-card" id="dresscode">
              <div className="dress-copy">
                <p className="eyebrow">
                  <Sparkles size={13} /> L’ALLURE DU JOUR
                </p>
                <h2>
                  VENEZ COMME VOUS.
                  <br />
                  <span>EN PLUS CHIC.</span>
                </h2>
                <p>
                  Élégant chic ou streetwear premium : affirmez votre style. Une
                  touche de noir, un détail doré, et surtout, votre
                  personnalité.
                </p>
                <span className="dress-tag">
                  BLACK & GOLD <span>•</span> LIBRE D’ÊTRE VOUS
                </span>
              </div>
              <div className="dress-images">
                <img
                  src="/.netlify/images?url=/img/sall-rue.png&w=500&h=700&fit=cover&position=right&fm=webp"
                  alt="Inspiration : chemises, cravates et pantalons évasés dans la rue"
                  loading="lazy"
                />
                <div className="detail-image">
                  <img
                    src="/.netlify/images?url=/img/sall-sneakers.png&w=350&fm=webp"
                    alt="Baskets noires et blanches à lacets larges"
                    loading="lazy"
                  />
                  <span>LE SENS DU DÉTAIL</span>
                </div>
              </div>
            </section>
          </div>
          <aside className="sidebar">
            <section className="invitation-card">
              <div className="card-overline">
                <Ticket size={17} />
                <span>VOTRE ACCÈS PRIVILÉGIÉ</span>
                <span className="tiny-dot" />
              </div>
              <h3>
                {guest
                  ? `Bienvenue, ${guest.name.split(' ')[0]}.`
                  : 'Votre nom sur la liste.'}
              </h3>
              <p>
                {guest
                  ? 'Votre invitation personnelle est prête. Téléchargez-la et présentez votre QR code à l’accueil.'
                  : 'Un code, une invitation, un moment unique. Entrez dans le cercle Sall Shop.'}
              </p>
              <button
                className="gold-button full-button"
                onClick={openInvitation}
                disabled={downloading}
              >
                {downloading ? (
                  <LoaderCircle size={16} className="spin" />
                ) : guest ? (
                  <Download size={16} />
                ) : (
                  <LockKeyhole size={15} />
                )}{' '}
                {downloading
                  ? 'Préparation du PDF…'
                  : 'Voir mon invitation'}
                <ArrowRight size={16} />
              </button>
              <span className="secure-note">
                <ShieldCheck size={12} />
                {guest
                  ? 'PDF personnel avec QR code unique'
                  : 'Espace privé · Réservé à nos invités'}
              </span>
              {guest && (
                <button className="logout" onClick={logout}>
                  <LogOut size={12} />
                  Se déconnecter
                </button>
              )}
            </section>
            <section className="location-card">
              <div className="location-symbol">
                <MapPin size={22} strokeWidth={1.3} />
              </div>
              <p className="eyebrow">ON SE RETROUVE ICI</p>
              <h3>
                À LA MAISON.
                <br />
                CHEZ SALL SHOP.
              </h3>
              <p>
                Ouakam, Dakar
                <br />
                Après le restaurant nigérien.
              </p>
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                Ouvrir l’itinéraire
                <ArrowUpRight size={15} />
              </a>
              <div className="shop-contacts">
                <a href="tel:+221785828417" className="text-link">+221 78 582 84 17 <ArrowUpRight size={15} /></a>
                <a href="https://www.instagram.com/sall_shop24?exln=ZDZ1anZ6d3J0ejR1" target="_blank" rel="noreferrer" className="text-link">Instagram · @sall_shop24 <ArrowUpRight size={15} /></a>
              </div>
              <div className="location-separator" />
              <button className="calendar-button" onClick={calendar}>
                <CalendarDays size={16} />
                Ajouter à mon calendrier
                <Plus size={15} />
              </button>
            </section>
            <div className="small-note">
              <Sparkles size={19} />
              <p>
                La mode passe.
                <br />
                <strong>Les liens restent.</strong>
              </p>
            </div>
          </aside>
        </div>
        <section className="editorial-triptych" aria-label="Regards sur la collection">
          <StorePhoto file="sall-littoral" alt="Trois silhouettes en noir et blanc sur les rochers du littoral" caption="02 / LE STYLE NOUS RASSEMBLE" />
          <StorePhoto file="sall-sneakers" alt="Détail des baskets à lacets larges et ornements métalliques" caption="03 / TOUT EST DANS LE DÉTAIL" />
          <StorePhoto file="sall-jiji" alt="Deux silhouettes portant les t-shirts Jiji Tattoo en noir et blanc" caption="04 / LES LIENS SE CULTIVENT" />
        </section>
        <GuestList refreshKey={guestListVersion} />
        <section className="partners" id="partenaires">
          <div>
            <p className="eyebrow">BIEN ENTOURÉS, TOUJOURS.</p>
            <h2>
              ILS FONT PARTIE
              <br />
              DE L’HISTOIRE<span className="gold-text">.</span>
            </h2>
          </div>
          <div className="partner-logos">
            <div className="jiji-logo">
              jiji<span>tattoo</span>
            </div>
            <span className="partner-cross">×</span>
            <div className="webmaj-logo">
              WEBMAJ<span>LE DIGITAL QUI VOUS RESSEMBLE</span>
            </div>
          </div>
          <p>
            Merci à nos partenaires
            <br />
            de célébrer ce moment à nos côtés.
          </p>
        </section>
        <section className="faq" id="infos">
          <div className="faq-intro">
            <p className="eyebrow">L’ESSENTIEL, TOUT SIMPLEMENT</p>
            <h2>
              AVANT DE
              <br />
              SE RETROUVER<span className="gold-text">.</span>
            </h2>
            <p>
              Les réponses aux petites questions
              <br />
              pour profiter du grand moment.
            </p>
          </div>
          <div className="faq-list">
            {[
              [
                'Où et quand se déroule l’événement ?',
                'Le mercredi 28 octobre 2026, à partir de 14h30 GMT, à la boutique Sall Shop à Ouakam, Dakar, après le restaurant nigérien.',
              ],
              [
                'Comment utiliser mon invitation ?',
                'Entrez le code reçu de Sall Shop et votre nom. Téléchargez ensuite votre invitation PDF avec son QR code personnel. Présentez-la à l’accueil, sur téléphone ou imprimée.',
              ],
              [
                'Puis-je venir accompagné(e) ?',
                'L’invitation est personnelle. Pour venir avec un proche, contactez directement l’équipe Sall Shop afin de confirmer son accès.',
              ],
              [
                'Quel dress code et où se garer ?',
                'Élégant chic ou streetwear premium, avec une touche de noir et de doré si vous le souhaitez. Le stationnement dépend des places disponibles à proximité ; aucun parking réservé n’est confirmé.',
              ],
              [
                'Comment contacter l’équipe ?',
                'Appelez Sall Shop au +221 78 582 84 17, retrouvez la boutique sur Instagram (@sall_shop24), ou rendez-vous directement à Ouakam.',
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <Plus size={17} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing">
          <div>
            <p className="eyebrow">LE 28 OCTOBRE, ON ÉCRIT LA SUITE.</p>
            <h2>ET VOUS EN FAITES PARTIE.</h2>
          </div>
          <button className="gold-button" onClick={openInvitation}>
            <Download size={16} />
            Mon invitation
            <ArrowUpRight size={16} />
          </button>
        </section>
      </main>
      <footer>
        <a className="footer-logo" href="#accueil">
          <img className="footer-brand" src="/.netlify/images?url=/img/sall-logo.png&w=120&fm=webp" alt="Sall Shop" width={54} height={54} />
        </a>
        <span>DU STYLE. DES LIENS. UNE HISTOIRE.</span>
        <span>© 2026 SALL SHOP · TOUS DROITS RÉSERVÉS</span>
      </footer>
      {notice && (
        <div className="notice" role="status">
          <Check size={17} />
          <span>{notice}</span>
          <button
            aria-label="Fermer la notification"
            onClick={() => setNotice('')}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <Dialog open={invitationOpen && !!guest} onOpenChange={setInvitationOpen}>
        <DialogContent className="invitation-dialog" showCloseButton={false}>
          <div className="invitation-dialog-heading">
            <div>
              <DialogTitle>Votre invitation Sall Shop</DialogTitle>
              <DialogDescription>Bienvenue, {guest?.name}. Votre PDF personnel contient votre QR code unique.</DialogDescription>
            </div>
            <DialogClose className="invitation-dialog-close" aria-label="Fermer l’invitation"><X size={22} /></DialogClose>
          </div>
          <InvitationCard />
          <form className="invitation-download-form" onSubmit={(event) => { event.preventDefault(); void download() }}>
            <p>Votre nom et votre pseudo apparaissent dans la liste publique des invités dès la préparation de votre PDF.</p>
            <div className="download-fields">
              <label htmlFor="download-name">Votre nom<input id="download-name" autoComplete="name" value={downloadName} onChange={(event) => setDownloadName(event.target.value)} required minLength={2} maxLength={70} /></label>
              <label htmlFor="download-nickname">Votre pseudo<input id="download-nickname" autoComplete="nickname" value={nickname} onChange={(event) => setNickname(event.target.value)} required minLength={2} maxLength={40} placeholder="Votre pseudo" /></label>
            </div>
            {downloadError && <p className="form-error" role="alert">{downloadError}</p>}
            <button className="gold-button full-button" type="submit" disabled={downloading}>
              {downloading ? <LoaderCircle size={16} className="spin" /> : <Download size={16} />}
              {downloading ? 'Préparation du PDF…' : 'Télécharger mon invitation PDF'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent
          className="login-dialog"
          onOpenAutoFocus={() =>
            setTimeout(() => nameInput.current?.focus(), 0)
          }
        >
          <div className="login-emblem">
            <LockKeyhole size={25} />
          </div>
          <p className="eyebrow">LE CERCLE SALL SHOP</p>
          <DialogTitle>VOTRE PLACE EST ICI.</DialogTitle>
          <DialogDescription>
            Un espace réservé à celles et ceux qui font notre histoire.
            Saisissez le code reçu de Sall Shop.
          </DialogDescription>
          <form onSubmit={login}>
            <label htmlFor="guest-name">Votre nom complet</label>
            <input
              ref={nameInput}
              id="guest-name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={70}
              placeholder="Le nom sur votre invitation"
            />
            <label htmlFor="invite-code">Votre code d’invitation</label>
            <input
              id="invite-code"
              type="password"
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={200}
              placeholder="Entrez votre code privé"
            />
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="gold-button full-button" disabled={busy}>
              {busy ? (
                <LoaderCircle size={16} className="spin" />
              ) : (
                <ArrowRight size={16} />
              )}{' '}
              {busy ? 'Vérification de votre accès…' : 'Entrer dans le cercle'}
            </button>
          </form>
          <p className="login-help">
            Pas encore de code ? Rapprochez-vous de l’équipe Sall Shop.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
