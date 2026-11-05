CREATE TABLE `legal_acceptances` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`terms_version` text NOT NULL,
	`terms_hash` text NOT NULL,
	`accepted_at` text NOT NULL,
	`action` text NOT NULL,
	`resource_id` text NOT NULL
);
