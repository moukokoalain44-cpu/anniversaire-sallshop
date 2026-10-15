import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core'
export const invitations = pgTable('invitations', {
  id: text().primaryKey(),
  name: text().notNull(),
  sessionHash: text('session_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})
export const accessAttempts = pgTable('access_attempts', {
  id: text().primaryKey(),
  count: integer().notNull().default(0),
})

export const invitationDownloads = pgTable('invitation_downloads', {
  invitationId: text('invitation_id').primaryKey().references(() => invitations.id),
  name: text().notNull(),
  nickname: text().notNull(),
  downloadedAt: timestamp('downloaded_at', { withTimezone: true }).defaultNow().notNull(),
})
