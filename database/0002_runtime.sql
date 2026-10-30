CREATE TABLE map_objects(key TEXT PRIMARY KEY NOT NULL,body TEXT NOT NULL,etag TEXT NOT NULL);
CREATE TRIGGER registrations_require_event_before_insert BEFORE INSERT ON registrations WHEN NOT EXISTS(SELECT 1 FROM events WHERE id=NEW.event_id) BEGIN SELECT RAISE(ABORT,'event_not_found'); END;
CREATE TRIGGER registrations_require_event_before_update BEFORE UPDATE OF event_id ON registrations WHEN NOT EXISTS(SELECT 1 FROM events WHERE id=NEW.event_id) BEGIN SELECT RAISE(ABORT,'event_not_found'); END;
CREATE TRIGGER events_delete_registrations_after_delete AFTER DELETE ON events BEGIN DELETE FROM registrations WHERE event_id=OLD.id; END;
