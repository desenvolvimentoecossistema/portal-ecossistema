CREATE TABLE legal_document_archives (
 hash TEXT PRIMARY KEY,
 version TEXT NOT NULL,
 content_json TEXT NOT NULL,
 captured_at TEXT NOT NULL
);
CREATE TRIGGER legal_archive_immutable_update BEFORE UPDATE ON legal_document_archives BEGIN SELECT RAISE(ABORT, 'Archived legal documents are immutable'); END;
CREATE TRIGGER legal_archive_immutable_delete BEFORE DELETE ON legal_document_archives BEGIN SELECT RAISE(ABORT, 'Archived legal documents are immutable'); END;
ALTER TABLE legal_acceptances ADD COLUMN user_email TEXT NOT NULL DEFAULT '';
ALTER TABLE legal_acceptances ADD COLUMN user_name TEXT NOT NULL DEFAULT '';
ALTER TABLE legal_acceptances ADD COLUMN resource_end_date TEXT NOT NULL DEFAULT '';
CREATE INDEX legal_acceptance_user_time ON legal_acceptances(user_id,accepted_at);
CREATE TABLE portal_user_activity (
 user_id TEXT PRIMARY KEY,
 email TEXT NOT NULL DEFAULT '',
 display_name TEXT NOT NULL DEFAULT '',
 last_seen_at TEXT NOT NULL
);
INSERT INTO portal_user_activity(user_id,last_seen_at)
 SELECT user_id,MAX(accepted_at) FROM legal_acceptances GROUP BY user_id;
INSERT INTO portal_user_activity(user_id,email,display_name,last_seen_at)
 SELECT user_id,email,display_name,strftime('%Y-%m-%dT%H:%M:%fZ',expires_at-604800,'unixepoch') FROM oauth_sessions WHERE 1 ORDER BY expires_at
 ON CONFLICT(user_id) DO UPDATE SET email=excluded.email,display_name=excluded.display_name,last_seen_at=MAX(last_seen_at,excluded.last_seen_at);
UPDATE legal_acceptances SET resource_end_date=COALESCE((SELECT end_date FROM events WHERE events.id=legal_acceptances.resource_id),'') WHERE action<>'portal-access';
CREATE TABLE privacy_retention_holds (
 id TEXT PRIMARY KEY,
 subject_type TEXT NOT NULL CHECK(subject_type IN ('user','event')),
 subject_id TEXT NOT NULL,
 reason TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE INDEX privacy_hold_subject ON privacy_retention_holds(subject_type,subject_id,expires_at);
CREATE TABLE privacy_maintenance (
 id TEXT PRIMARY KEY,
 completed_at TEXT NOT NULL,
 counts_json TEXT NOT NULL
);
