CREATE TABLE "invitation_downloads" (
	"invitation_id" text PRIMARY KEY,
	"name" text NOT NULL,
	"nickname" text NOT NULL,
	"downloaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invitation_downloads" ADD CONSTRAINT "invitation_downloads_invitation_id_invitations_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id");