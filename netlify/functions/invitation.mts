import type { Config, Context } from '@netlify/functions'
import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto'
import { and, eq, gt, sql } from 'drizzle-orm'
import { database } from '../../db/index.js'
import { invitations, accessAttempts, invitationDownloads } from '../../db/schema.js'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import QRCode from 'qrcode'

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex')
}
const program = [
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
export default async (req: Request, context: Context) => {
  const headers = { 'Cache-Control': 'no-store' }
  const json = (body: unknown, status = 200) =>
    Response.json(body, { status, headers })
  try {
    const db = database()
    const path = new URL(req.url).pathname
    if (path.endsWith('/guests') && req.method === 'GET') {
      const guests = await db.selectDistinct({ name: invitationDownloads.name, nickname: invitationDownloads.nickname })
        .from(invitationDownloads).orderBy(invitationDownloads.name, invitationDownloads.nickname)
      return json({ guests })
    }
    if (req.method === 'POST' && path === '/api/invitation') {
      if (req.headers.get('origin') !== new URL(req.url).origin)
        return json({ error: 'Requête non autorisée.' }, 403)
      const commonCode = Netlify.env.get('SALL_INVITATION_CODE')
      if (!commonCode)
        return json(
          {
            error:
              'Les accès ne sont pas encore ouverts. Contactez Sall Shop pour votre code.',
          },
          503,
        )
      const bucket = hash(`${context.ip}:${Math.floor(Date.now() / 900000)}`)
      const [attempt] = await db
        .insert(accessAttempts)
        .values({ id: bucket, count: 1 })
        .onConflictDoUpdate({
          target: accessAttempts.id,
          set: { count: sql`${accessAttempts.count} + 1` },
        })
        .returning()
      if (attempt.count > 12)
        return json(
          { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
          429,
        )
      const body = await req.json()
      if (
        typeof body.code !== 'string' ||
        body.code.length > 200 ||
        typeof body.name !== 'string' ||
        body.name.trim().length < 2 ||
        body.name.trim().length > 70
      )
        return json(
          { error: 'Indiquez votre nom (2 à 70 caractères) et votre code.' },
          400,
        )
      if (
        !timingSafeEqual(
          Buffer.from(hash(body.code.trim())),
          Buffer.from(hash(commonCode.trim())),
        )
      )
        return json(
          { error: 'Ce code n’est pas reconnu. Vérifiez votre invitation.' },
          401,
        )
      const token = randomBytes(32).toString('hex')
      const [guest] = await db
        .insert(invitations)
        .values({
          id: randomUUID(),
          name: body.name.trim(),
          sessionHash: hash(token),
          expiresAt: new Date(Date.now() + 7 * 86400000),
        })
        .returning()
      context.cookies.set({
        name: 'sall_guest',
        value: token,
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        path: '/',
        maxAge: 604800,
      })
      return json({ guest: { id: guest.id, name: guest.name }, program })
    }
    const token = context.cookies.get('sall_guest')
    const [guest] = token
      ? await db
          .select()
          .from(invitations)
          .where(
            and(
              eq(invitations.sessionHash, hash(token)),
              gt(invitations.expiresAt, new Date()),
            ),
          )
          .limit(1)
      : []
    if (req.method === 'DELETE') {
      if (req.headers.get('origin') !== new URL(req.url).origin)
        return json({ error: 'Requête non autorisée.' }, 403)
      if (guest)
        await db
          .update(invitations)
          .set({ expiresAt: new Date() })
          .where(eq(invitations.id, guest.id))
      context.cookies.delete({ name: 'sall_guest', path: '/' })
      return json({ ok: true })
    }
    if (req.method !== 'GET' && !(req.method === 'POST' && path.endsWith('/pdf')))
      return json({ error: 'Méthode non autorisée.' }, 405)
    if (path.endsWith('/verify')) {
      const id = new URL(req.url).searchParams.get('id') ?? ''
      const [record] = await db
        .select({ id: invitations.id })
        .from(invitations)
        .where(eq(invitations.id, id))
        .limit(1)
      return json({ valid: !!record })
    }
    if (!guest) return json({ guest: null }, 401)
    if (!path.endsWith('/pdf'))
      return json({ guest: { id: guest.id, name: guest.name }, program })
    if (req.method !== 'POST') return json({ error: 'Complétez votre nom et votre pseudo avant le téléchargement.' }, 405)
    if (req.headers.get('origin') !== new URL(req.url).origin)
      return json({ error: 'Requête non autorisée.' }, 403)
    const details = await req.json().catch(() => null)
    const validText = (value: unknown, min: number, max: number): value is string =>
      typeof value === 'string' && value.trim().length >= min && value.trim().length <= max && !/[\u0000-\u001f\u007f]/.test(value)
    if (!validText(details?.name, 2, 70) || !validText(details?.nickname, 2, 40))
      return json({ error: 'Indiquez un nom (2 à 70 caractères) et un pseudo (2 à 40 caractères).' }, 400)
    const publicName = details.name.trim()
    const nickname = details.nickname.trim()
    const pdf = await PDFDocument.create()
    const page = pdf.addPage([420, 660])
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const gold = rgb(0.83, 0.69, 0.22)
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 420,
      height: 660,
      color: rgb(0.04, 0.04, 0.04),
    })
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
    ) => page.drawText(text, { x: 48, y, size, font, color })
    page.drawText('SALL SHOP', {
      x: 48,
      y: 587,
      font: bold,
      size: 28,
      color: gold,
    })
    draw('INVITATION PRIVÉE • ANNIVERSAIRE', 558, 10, gold)
    draw('VOUS FAITES PARTIE DE L’HISTOIRE.', 505, 14)
    // Standard PDF fonts support French accents; replace unsupported characters in names.
    const safeName = publicName
      .replace(/[^\u0020-\u007e\u00a0-\u00ff]/g, '')
      .slice(0, 36)
    draw(safeName, 465, 20)
    draw('Mercredi 28 octobre 2026', 417, 15, gold)
    draw('À partir de 14h30 GMT', 392)
    draw('Boutique Sall Shop, Ouakam, Dakar', 353)
    draw('Après le restaurant nigérien', 332)
    const qr = await QRCode.toDataURL(
      `${new URL(req.url).origin}/?invitation=${guest.id}`,
      { width: 320, margin: 2, errorCorrectionLevel: 'M' },
    )
    const png = await pdf.embedPng(qr)
    page.drawImage(png, { x: 143, y: 131, width: 134, height: 134 })
    draw('Votre QR code personnel à présenter à l’accueil.', 102, 10)
    draw('Une invitation. Une personne. Un moment unique.', 64, 9, gold)
    const bytes = Buffer.from(await pdf.save())
    await db.insert(invitationDownloads).values({ invitationId: guest.id, name: publicName, nickname })
      .onConflictDoUpdate({ target: invitationDownloads.invitationId, set: { name: publicName, nickname } })
    return new Response(bytes, {
      headers: {
        ...headers,
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'attachment; filename="invitation-sall-shop.pdf"',
      },
    })
  } catch {
    return json(
      {
        error:
          'Le service est momentanément indisponible. Réessayez dans un instant.',
      },
      500,
    )
  }
}
export const config: Config = {
  path: ['/api/invitation', '/api/invitation/pdf', '/api/invitation/verify', '/api/invitation/guests'],
}
