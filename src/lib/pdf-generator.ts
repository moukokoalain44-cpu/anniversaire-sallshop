import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import QRCode from 'qrcode'

export interface GenerateInvitationParams {
  name: string
  nickname: string
  invitationId?: string
}

export async function generateInvitationPdf({
  name,
  nickname,
  invitationId = 'sall-' + Math.random().toString(36).substring(2, 10),
}: GenerateInvitationParams): Promise<Blob> {
  const publicName = name.trim()
  const publicNickname = nickname.trim()
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([420, 660])
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique)
  const gold = rgb(0.83, 0.69, 0.22)

  // Fond noir élégant
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 420,
    height: 660,
    color: rgb(0.04, 0.04, 0.04),
  })

  // Bordure dorée raffinée
  page.drawRectangle({
    x: 24,
    y: 24,
    width: 372,
    height: 612,
    borderColor: gold,
    borderWidth: 1,
  })

  const draw = (
    text: string,
    y: number,
    size = 12,
    color = rgb(0.95, 0.94, 0.9),
    useFont = font,
  ) => page.drawText(text, { x: 48, y, size, font: useFont, color })

  // Titre SALL SHOP
  page.drawText('SALL SHOP', {
    x: 48,
    y: 587,
    font: bold,
    size: 28,
    color: gold,
  })

  draw('INVITATION PRIVÉE • ANNIVERSAIRE', 558, 10, gold)
  draw('VOUS FAITES PARTIE DE L’HISTOIRE.', 510, 14, rgb(0.95, 0.94, 0.9), bold)

  // Nom de l'invité
  const safeName = publicName
    .replace(/[^\u0020-\u007e\u00a0-\u00ff]/g, '')
    .slice(0, 36)
  draw(safeName, 474, 20, rgb(0.98, 0.98, 0.95), bold)

  // Pseudo de l'invité
  if (publicNickname) {
    const safeNickname = publicNickname
      .replace(/[^\u0020-\u007e\u00a0-\u00ff]/g, '')
      .slice(0, 36)
    draw(`« ${safeNickname} »`, 450, 14, gold, italic)
  }

  // Date et Lieu
  draw('Mercredi 28 octobre 2026', 408, 15, gold)
  draw('À partir de 14h30 GMT', 384)
  draw('Boutique Sall Shop, Ouakam, Dakar', 348)
  draw('Après le restaurant nigérien', 327)

  // QR Code personnel nominatif
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sallshop.sn'
  const qrUrl = `${origin}/?invitation=${invitationId}`
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 320,
    margin: 2,
    errorCorrectionLevel: 'M',
  })

  const png = await pdf.embedPng(qrDataUrl)
  page.drawImage(png, { x: 143, y: 131, width: 134, height: 134 })

  draw('Votre QR code personnel à présenter à l’accueil.', 102, 10)
  draw('Une invitation. Une personne. Un moment unique.', 64, 9, gold)

  const pdfBytes = await pdf.save()
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' })
}

export function downloadPdfBlob(blob: Blob, filename = 'invitation-sall-shop.pdf') {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
