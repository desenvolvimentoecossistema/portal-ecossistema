CREATE TABLE `app_user_roles` (
	`email` text PRIMARY KEY NOT NULL,
	`display_name` text DEFAULT '' NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_drafts` (
	`id` text PRIMARY KEY NOT NULL,
	`created_by_user_id` text NOT NULL,
	`payload` text NOT NULL,
	`source_name` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`organization` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`start_date` text NOT NULL,
	`start_time` text DEFAULT '' NOT NULL,
	`end_date` text NOT NULL,
	`end_time` text DEFAULT '' NOT NULL,
	`registration_deadline` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`venue` text NOT NULL,
	`address` text NOT NULL,
	`meeting_point` text NOT NULL,
	`arrival_guidance` text NOT NULL,
	`transport` text NOT NULL,
	`accommodation` text NOT NULL,
	`meals` text NOT NULL,
	`accessibility` text NOT NULL,
	`preparation` text NOT NULL,
	`dress_code` text NOT NULL,
	`costs` text NOT NULL,
	`additional_notes` text DEFAULT '' NOT NULL,
	`contact_name` text NOT NULL,
	`contact_email` text NOT NULL,
	`max_participants` integer NOT NULL,
	`created_by_user_id` text DEFAULT '' NOT NULL,
	`creator_email` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `oauth_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `oauth_states` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`verifier` text NOT NULL,
	`nonce` text NOT NULL,
	`return_to` text NOT NULL,
	`expires_at` integer NOT NULL,
	`consumed_at` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`organization` text NOT NULL,
	`role` text NOT NULL,
	`accessibility_needs` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_registrations_event_email` ON `registrations` (`event_id`,`email`);--> statement-breakpoint
CREATE TABLE `removed_demo_events` (
	`event_id` text PRIMARY KEY NOT NULL,
	`removed_by_user_id` text NOT NULL,
	`removed_at` text NOT NULL
);
