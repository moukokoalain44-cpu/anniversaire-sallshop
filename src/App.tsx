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
import { GuestList, addSavedGuest } from '@/components/guest-list'
import { StorePhoto, useEditorialMotion } from '@/components/store-editorial'
import { InvitationCard } from '@/components/invitation-card'
import { generateInvitationPdf, downloadPdfBlob } from '@/lib/pdf-generator'

const VIP_CODE = 'Sallshop-aniv-vip'

interface Guest {
  id: string
  name: string
  nickname?: string
}

interface ProgramItem {
  title: string
  label: string
  description: string
}

const PROGRAM_DATA: ProgramItem[] = [
  {
    title: 'Bienvenue chez vous',
    label: 'Réception',
    description:
      'On se retrouve, on échange et on lance les festivités. La famille Sall Shop est réunie.',
  },
  {
    title: 'Place à l’énergie',
    label: 'Animation',
    description:
      'Du son, des surprises et une ambiance à notre image. Le rythme est donné.',
  },
  {
    title: 'Le style entre en scène',
    label: 'Défilé de mode',
    description:
      'Nos silhouettes prennent vie. Découvrez une sélection pensée pour celles et ceux qui osent.',
  },
  {
    title: 'Votre moment, votre style',
    label: 'Photos & pop-up store',
    description:
      'Immortalisez votre look et dénichez votre prochaine pièce coup de cœur au pop-up store.',
  },
  {
    title: 'On prolonge le plaisir',
    label: 'Chill & rencontres',
    description:
      'Profitez du moment, rencontrez nos partenaires et célébrez avec nous, tout simplement.',
  },
]

const START_DATE = Date.parse('2026-10-28T14:30:00Z')
const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=Sall+Shop+Ouakam+Dakar'
const PROGRAM_ICONS = [Wine, Music2, Shirt, Camera, Coffee]
const PROGRAM_LABELS = [
  'Réception',
  'Animation',
  'Défilé de mode',
  'Photos & pop-up store',
  'Chill & rencontres',
]

export default function App() {
  useEditorialMotion()

  const [guestListVersion, setGuestListVersion] = useState(0)
  const [downloadName, setDownloadName] = useState('')
  const [nickname, setNickname] = useState('')
  const [downloadError, setDownloadError] = useState('')
  const [guest, setGuest] = useState<Guest | null>(() => {
    try {
      const saved = localStorage.getItem('sall_guest_session')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
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
    if (guest && !downloadName) {
      setDownloadName(guest.name)
    }
  }, [guest, downloadName])

  useEffect(() => {
    const tick = () => {
      setRemaining(Math.max(0, Math.floor((START_DATE - Date.now()) / 1000)))
    }
    tick()
    const timer = setInterval(tick, 1000)

    const params = new URLSearchParams(window.location.search)
    const invitationParam = params.get('invitation')
    if (invitationParam) {
      setVerification(
        'Invitation authentique · Sall Shop, le 28 octobre 2026. Présentez-la à l’accueil.',
      )
    }

    return () => clearInterval(timer)
  }, [])

  function login(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')

    const cleanName = name.trim()
    const cleanCode = code.trim()

    if (cleanName.length < 2 || cleanName.length > 70) {
      setError('Indiquez votre nom complet (2 à 70 caractères).')
      setBusy(false)
      return
    }

    // Validation du code d'accès VIP (insensible à la casse pour confort utilisateur)
    if (cleanCode.toLowerCase() !== VIP_CODE.toLowerCase()) {
      setError('Ce code n’est pas reconnu. Vérifiez votre invitation.')
      setBusy(false)
      return
    }

    setTimeout(() => {
      const newGuest: Guest = {
        id: 'sall-' + Math.random().toString(36).substring(2, 9),
        name: cleanName,
      }
      setGuest(newGuest)
      setDownloadName(cleanName)
      try {
        localStorage.setItem('sall_guest_session', JSON.stringify(newGuest))
      } catch {
        // ignore
      }
      setLoginOpen(false)
      setCode('')
      setBusy(false)

      if (invitationRequested.current) {
        setInvitationOpen(true)
        invitationRequested.current = false
      }

      setNotice('Bienvenue dans le cercle Sall Shop. Votre accès VIP est confirmé.')
    }, 400)
  }

  async function download() {
    if (!guest) {
      setLoginOpen(true)
      return
    }

    const cleanName = downloadName.trim()
    const cleanNickname = nickname.trim()

    if (cleanName.length < 2 || cleanName.length > 70) {
      setDownloadError('Indiquez un nom valide (2 à 70 caractères).')
      return
    }
    if (cleanNickname.length < 2 || cleanNickname.length > 40) {
      setDownloadError('Indiquez un pseudo (2 à 40 caractères).')
      return
    }

    setDownloadError('')
    setDownloading(true)
    setNotice('')

    try {
      const pdfBlob = await generateInvitationPdf({
        name: cleanName,
        nickname: cleanNickname,
        invitationId: guest.id,
      })

      downloadPdfBlob(pdfBlob, `invitation-sall-shop-${cleanName.replace(/\s+/g, '-').toLowerCase()}.pdf`)

      // Ajout de l'invité à la liste publique
      addSavedGuest({ name: cleanName, nickname: cleanNickname })
      setGuestListVersion((v) => v + 1)

      setNotice('Votre invitation est téléchargée. Gardez-la précieusement pour le 28 octobre !')
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Téléchargement indisponible.')
    } finally {
      setDownloading(false)
    }
  }

  function logout() {
    setGuest(null)
    setInvitationOpen(false)
    try {
      localStorage.removeItem('sall_guest_session')
    } catch {
      // ignore
    }
    setNotice('Vous êtes déconnecté.')
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
      {/* HEADER */}
      <header className="header">
        <a className="wordmark" href="#accueil" aria-label="Sall Shop, accueil">
          <img
            className="header-brand"
            src="/img/sall-logo.png"
            alt="Sall Shop"
            width={60}
            height={60}
          />
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

      {/* MAIN CONTENT */}
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

        {/* HERO */}
        <section className="hero" id="accueil">
          <img
            className="hero-image"
            src="/img/sall-collectif.png"
            alt="Silhouettes de mode réunies sur le littoral au coucher du soleil"
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="status-pill">
              <LockKeyhole size={12} /> UNE CÉLÉBRATION SUR INVITATION
            </div>
            <p className="eyebrow hero-eyebrow">PLUS QU’UNE BOUTIQUE. UNE FAMILLE.</p>
            <h1>
              L’ANNIVERSAIRE
              <br />
              <span>SALL SHOP.</span>
            </h1>
            <p className="hero-description">
              Le style nous rassemble.
              <br />
              Cette fois, on célèbre notre histoire. Avec vous.
            </p>
            <div className="hero-meta">
              <span>28 OCTOBRE 2026</span>
              <span>DÈS 14H30 GMT</span>
            </div>
            <button className="gold-button hero-button" onClick={openInvitation}>
              Voir mon invitation <ArrowUpRight size={17} />
            </button>
          </div>
        </section>

        {/* EDITORIAL PAIR */}
        <section className="editorial-pair" aria-label="L’univers Sall Shop">
          <StorePhoto
            file="sall-silhouettes"
            alt="Silhouettes en chemises blanches, cravates et pantalons évasés"
            caption="01 / L’ALLURE, SANS COMPROMIS"
          />
          <div className="editorial-pair-copy">
            <p className="eyebrow">DEPUIS OUAKAM, AVEC DU STYLE</p>
            <h2>
              UNE ALLURE.
              <br />
              DES HISTOIRES.
              <br />
              <span>NOTRE FAMILLE.</span>
            </h2>
            <p>
              Des pièces qui se portent. Une personnalité qui s’affirme.
              Retrouvez l’univers Sall Shop, en images.
            </p>
          </div>
        </section>

        {/* DASHBOARD GRID */}
        <div className="dashboard-grid">
          <div className="main-column">
            {/* COUNTDOWN */}
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

            {/* PROGRAMME */}
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
                {PROGRAM_LABELS.map((label, i) => {
                  const Icon = PROGRAM_ICONS[i]
                  const item = PROGRAM_DATA[i]
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
                            ? item.title
                            : [
                                'Les retrouvailles',
                                'L’énergie du moment',
                                'Le rendez-vous mode',
                                'Les souvenirs se créent',
                                'Le plaisir de rester',
                              ][i]}
                        </h3>
                        {guest && <p>{item.description}</p>}
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

            {/* DRESS CODE */}
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
                  src="/img/sall-rue.png"
                  alt="Inspiration : chemises, cravates et pantalons évasés dans la rue"
                  loading="lazy"
                />
                <div className="detail-image">
                  <img
                    src="/img/sall-sneakers.png"
                    alt="Baskets noires et blanches à lacets larges"
                    loading="lazy"
                  />
                  <span>LE SENS DU DÉTAIL</span>
                </div>
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
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
                href={MAP_URL}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                Ouvrir l’itinéraire
                <ArrowUpRight size={15} />
              </a>
              <div className="shop-contacts">
                <a href="tel:+221785828417" className="text-link">
                  +221 78 582 84 17 <ArrowUpRight size={15} />
                </a>
                <a
                  href="https://www.instagram.com/sall_shop24?exln=ZDZ1anZ6d3J0ejR1"
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  Instagram · @sall_shop24 <ArrowUpRight size={15} />
                </a>
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

        {/* TRIPTYCH */}
        <section className="editorial-triptych" aria-label="Regards sur la collection">
          <StorePhoto
            file="sall-littoral"
            alt="Trois silhouettes en noir et blanc sur les rochers du littoral"
            caption="02 / LE STYLE NOUS RASSEMBLE"
          />
          <StorePhoto
            file="sall-sneakers"
            alt="Détail des baskets à lacets larges et ornements métalliques"
            caption="03 / TOUT EST DANS LE DÉTAIL"
          />
          <StorePhoto
            file="sall-jiji"
            alt="Deux silhouettes portant les t-shirts Jiji Tattoo en noir et blanc"
            caption="04 / LES LIENS SE CULTIVENT"
          />
        </section>

        {/* GUESTS */}
        <GuestList refreshKey={guestListVersion} />

        {/* PARTNERS */}
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
              Moeny<span>swift</span>
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

        {/* FAQ */}
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

        {/* CLOSING */}
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

      {/* FOOTER */}
      <footer>
        <a className="footer-logo" href="#accueil">
          <img
            className="footer-brand"
            src="/img/sall-logo.png"
            alt="Sall Shop"
            width={54}
            height={54}
          />
        </a>
        <span>DU STYLE. DES LIENS. UNE HISTOIRE.</span>
        <span>© 2026 SALL SHOP · TOUS DROITS RÉSERVÉS</span>
      </footer>

      {/* NOTICE TOAST */}
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

      {/* INVITATION MODAL */}
      <Dialog open={invitationOpen && !!guest} onOpenChange={setInvitationOpen}>
        <DialogContent className="invitation-dialog" showCloseButton={false}>
          <div className="invitation-dialog-heading">
            <div>
              <DialogTitle>Votre invitation Sall Shop</DialogTitle>
              <DialogDescription>
                Bienvenue, {guest?.name}. Votre PDF personnel contient votre QR code unique.
              </DialogDescription>
            </div>
            <DialogClose
              className="invitation-dialog-close"
              aria-label="Fermer l’invitation"
            >
              <X size={22} />
            </DialogClose>
          </div>
          <InvitationCard
            guestName={downloadName || guest?.name}
            guestNickname={nickname}
          />
          <form
            className="invitation-download-form"
            onSubmit={(event) => {
              event.preventDefault()
              void download()
            }}
          >
            <p>
              Votre nom et votre pseudo apparaissent dans la liste publique des
              invités dès la préparation de votre PDF.
            </p>
            <div className="download-fields">
              <label htmlFor="download-name">
                Votre nom
                <input
                  id="download-name"
                  autoComplete="name"
                  value={downloadName}
                  onChange={(event) => setDownloadName(event.target.value)}
                  required
                  minLength={2}
                  maxLength={70}
                />
              </label>
              <label htmlFor="download-nickname">
                Votre pseudo
                <input
                  id="download-nickname"
                  autoComplete="nickname"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  required
                  minLength={2}
                  maxLength={40}
                  placeholder="Votre pseudo (ex: Sall VIP)"
                />
              </label>
            </div>
            {downloadError && (
              <p className="form-error" role="alert">
                {downloadError}
              </p>
            )}
            <button
              className="gold-button full-button"
              type="submit"
              disabled={downloading}
            >
              {downloading ? (
                <LoaderCircle size={16} className="spin" />
              ) : (
                <Download size={16} />
              )}
              {downloading
                ? 'Préparation du PDF haute qualité…'
                : 'Télécharger mon invitation PDF'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* LOGIN MODAL */}
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
              placeholder="Entrez votre code privé (ex: Sallshop-aniv-vip)"
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
            Code d'accès : <strong>Sallshop-aniv-vip</strong>
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
