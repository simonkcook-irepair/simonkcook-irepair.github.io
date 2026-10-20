-- Staging-only schema reconstruction from production metadata; no customer data.
-- Review and test before reuse in production. RLS enabled, no client policies.
begin;
create table public."customers" (
 "id" uuid default gen_random_uuid() not null,
 "full_name" text not null,
 "phone" text,
 "email" text,
 "is_demo" boolean default true not null,
 "created_at" timestamp with time zone default now() not null,
 "updated_at" timestamp with time zone default now() not null,
 primary key ("id")
);
alter table public."customers" enable row level security;
create table public."devices" (
 "id" uuid default gen_random_uuid() not null,
 "customer_id" uuid not null,
 "manufacturer" text,
 "model" text not null,
 "variant" text,
 "confidence" text default 'unconfirmed'::text not null check (confidence = ANY (ARRAY['confirmed'::text, 'likely'::text, 'unconfirmed'::text])),
 "nickname" text,
 "is_demo" boolean default true not null,
 "created_at" timestamp with time zone default now() not null,
 "updated_at" timestamp with time zone default now() not null,
 primary key ("id")
);
alter table public."devices" enable row level security;
create table public."repair_jobs" (
 "id" uuid default gen_random_uuid() not null,
 "public_ref" text not null unique,
 "customer_id" uuid not null,
 "device_id" uuid not null,
 "repair_type" text not null,
 "price" numeric,
 "service_type" text default 'Mobile call-out'::text not null,
 "address" text,
 "postcode" text,
 "booking_date" date,
 "booking_slot" text,
 "status" text default 'booked'::text not null check (status = ANY (ARRAY['booked'::text, 'confirmed'::text, 'on_my_way'::text, 'arrived'::text, 'repairing'::text, 'waiting_part'::text, 'completed'::text, 'cancelled'::text])),
 "compatibility_state" text default 'unknown'::text not null check (compatibility_state = ANY (ARRAY['universal'::text, 'variant-sensitive'::text, 'unknown'::text])),
 "part_state" text default 'not_checked'::text not null check (part_state = ANY (ARRAY['not_checked'::text, 'in_stock'::text, 'order_required'::text, 'ordered'::text, 'received'::text, 'fitted'::text])),
 "part_name" text,
 "supplier" text,
 "payment_state" text default 'unpaid'::text not null check (payment_state = ANY (ARRAY['unpaid'::text, 'deposit'::text, 'paid'::text])),
 "priority" text default 'normal'::text not null check (priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text])),
 "technician_name" text,
 "is_demo" boolean default true not null,
 "created_at" timestamp with time zone default now() not null,
 "updated_at" timestamp with time zone default now() not null,
 "schedule_order" integer,
 "destination_latitude" double precision check (destination_latitude IS NULL OR destination_latitude >= '-90'::integer::double precision AND destination_latitude <= 90::double precision),
 "destination_longitude" double precision check (destination_longitude IS NULL OR destination_longitude >= '-180'::integer::double precision AND destination_longitude <= 180::double precision),
 primary key ("id")
);
alter table public."repair_jobs" enable row level security;
create table public."repair_events" (
 "id" uuid default gen_random_uuid() not null,
 "repair_job_id" uuid not null,
 "event_type" text not null,
 "label" text not null,
 "actor" text default 'System'::text not null,
 "visibility" text default 'customer'::text not null check (visibility = ANY (ARRAY['customer'::text, 'internal'::text])),
 "is_demo" boolean default true not null,
 "created_at" timestamp with time zone default now() not null,
 primary key ("id")
);
alter table public."repair_events" enable row level security;
create table public."repair_contacts" (
 "id" uuid default gen_random_uuid() not null,
 "repair_job_id" uuid not null,
 "full_name" text not null,
 "phone" text,
 "email" text,
 "relationship_label" text,
 "receives_updates" boolean default true not null,
 "is_primary_handover_contact" boolean default false not null,
 "invite_status" text default 'not_invited'::text not null check (invite_status = ANY (ARRAY['not_invited'::text, 'invited'::text, 'accepted'::text, 'declined'::text])),
 "linked_customer_id" uuid,
 "is_demo" boolean default true not null,
 "created_at" timestamp with time zone default now() not null,
 "updated_at" timestamp with time zone default now() not null,
 primary key ("id")
);
alter table public."repair_contacts" enable row level security;
create table public."repair_observations" (
 "id" uuid default gen_random_uuid() not null,
 "repair_job_id" uuid not null,
 "category" text default 'other'::text not null check (category = ANY (ARRAY['battery'::text, 'liquid'::text, 'frame'::text, 'camera'::text, 'charging'::text, 'display'::text, 'previous_repair'::text, 'other'::text])),
 "note" text not null,
 "customer_visible" boolean default false not null,
 "customer_advised" boolean default false not null,
 "advised_at" timestamp with time zone,
 "created_by" text default 'Technician'::text not null,
 "is_demo" boolean default true not null,
 "created_at" timestamp with time zone default now() not null,
 primary key ("id")
);
alter table public."repair_observations" enable row level security;
create table public."job_messages" (
 "id" uuid default gen_random_uuid() not null,
 "repair_job_id" uuid not null,
 "sender_role" text not null check (sender_role = ANY (ARRAY['technician'::text, 'customer'::text, 'secondary_contact'::text, 'system'::text])),
 "sender_name" text,
 "contact_id" uuid,
 "body" text not null,
 "message_type" text default 'chat'::text not null check (message_type = ANY (ARRAY['chat'::text, 'approval_request'::text, 'approval_response'::text, 'system'::text])),
 "is_demo" boolean default true not null,
 "created_at" timestamp with time zone default now() not null,
 primary key ("id")
);
alter table public."job_messages" enable row level security;
create table public."referral_invites" (
 "id" uuid default gen_random_uuid() not null,
 "referral_code" text not null unique,
 "repair_job_id" uuid,
 "inviter_customer_id" uuid,
 "inviter_name" text,
 "invitee_name" text,
 "invitee_phone" text,
 "invitee_email" text,
 "channel" text default 'share'::text not null,
 "source_context" text,
 "status" text default 'created'::text not null check (status = ANY (ARRAY['created'::text, 'opened'::text, 'accepted'::text, 'expired'::text, 'cancelled'::text])),
 "marketing_consent" boolean default false not null,
 "is_demo" boolean default true not null,
 "created_at" timestamp with time zone default now() not null,
 "accepted_at" timestamp with time zone,
 primary key ("id")
);
alter table public."referral_invites" enable row level security;
create table public."repair_relay_tokens" (
 "id" uuid default gen_random_uuid() not null,
 "repair_job_id" uuid not null,
 "repair_contact_id" uuid,
 "token" text not null unique,
 "display_name" text,
 "phone" text,
 "email" text,
 "can_view_status" boolean default true not null,
 "can_chat" boolean default true not null,
 "can_receive_completion" boolean default true not null,
 "is_active" boolean default true not null,
 "is_demo" boolean default true not null,
 "created_at" timestamp with time zone default now() not null,
 "expires_at" timestamp with time zone,
 "last_opened_at" timestamp with time zone,
 primary key ("id")
);
alter table public."repair_relay_tokens" enable row level security;
create table public."acquisition_events" (
 "id" uuid default gen_random_uuid() not null,
 "customer_id" uuid,
 "repair_job_id" uuid,
 "referral_invite_id" uuid,
 "source" text not null,
 "medium" text,
 "campaign" text,
 "referrer" text,
 "landing_path" text,
 "is_demo" boolean default true not null,
 "created_at" timestamp with time zone default now() not null,
 primary key ("id")
);
alter table public."acquisition_events" enable row level security;
create table public."quick_reply_price_versions" (
 "id" uuid default gen_random_uuid() not null,
 "source_name" text not null,
 "source_file_name" text not null,
 "source_ref" text,
 "source_checksum" text,
 "active" boolean default false not null,
 "row_count" integer default 0 not null check (row_count >= 0),
 "changed_count" integer default 0 not null check (changed_count >= 0),
 "validation_summary" jsonb default '{}'::jsonb not null,
 "synced_at" timestamp with time zone default now() not null,
 "created_at" timestamp with time zone default now() not null,
 primary key ("id")
);
alter table public."quick_reply_price_versions" enable row level security;
create table public."quick_reply_prices" (
 "id" uuid default gen_random_uuid() not null,
 "version_id" uuid not null,
 "device_family" text not null,
 "model_key" text not null,
 "model" text not null,
 "repair_type" text not null,
 "option_key" text not null,
 "option_label" text not null,
 "price" numeric not null check (price > 0::numeric AND price < 2000::numeric),
 "created_at" timestamp with time zone default now() not null,
 primary key ("id")
);
alter table public."quick_reply_prices" enable row level security;
create table public."technician_availability" (
 "id" text not null,
 "technician_name" text default 'Simon'::text not null,
 "mode" text default 'unavailable'::text not null check (mode = ANY (ARRAY['unavailable'::text, 'mobile_route'::text, 'office_call_in'::text, 'open_for_work'::text])),
 "detour_mode" text default 'route_only'::text not null check (detour_mode = ANY (ARRAY['route_only'::text, 'nearby'::text, 'open'::text])),
 "is_active" boolean default false not null,
 "latitude" double precision,
 "longitude" double precision,
 "accuracy_metres" double precision,
 "location_updated_at" timestamp with time zone,
 "office_label" text,
 "available_until" timestamp with time zone,
 "updated_at" timestamp with time zone default now() not null,
 primary key ("id")
);
alter table public."technician_availability" enable row level security;
create table public."satellite_match_claims" (
 "id" uuid default gen_random_uuid() not null,
 "claim_type" text not null check (claim_type = ANY (ARRAY['office'::text, 'mobile'::text])),
 "expires_at" timestamp with time zone not null,
 "routing_provider" text default 'proximity_fallback'::text not null,
 "match_quality" text default 'proximity'::text not null,
 "approach_minutes" integer,
 "extra_drive_minutes" integer,
 "distance_miles" numeric,
 "suggested_before_job_id" uuid,
 "repair_job_id" uuid,
 "claimed_at" timestamp with time zone,
 "is_demo" boolean default true not null,
 "created_at" timestamp with time zone default now() not null,
 primary key ("id")
);
alter table public."satellite_match_claims" enable row level security;
create table public."repair_trip_state" (
 "repair_job_id" uuid not null,
 "state" text default 'idle'::text not null check (state = ANY (ARRAY['idle'::text, 'planned'::text, 'en_route'::text, 'paused'::text, 'arrived'::text, 'completed'::text, 'cancelled'::text])),
 "provider" text,
 "eta_minutes" integer check (eta_minutes IS NULL OR eta_minutes >= 0),
 "eta_at" timestamp with time zone,
 "distance_remaining_miles" numeric,
 "navigation_started_at" timestamp with time zone,
 "last_synced_at" timestamp with time zone,
 "updated_at" timestamp with time zone default now() not null,
 "is_demo" boolean default true not null,
 "technician_latitude" double precision check (technician_latitude IS NULL OR technician_latitude >= '-90'::integer::double precision AND technician_latitude <= 90::double precision),
 "technician_longitude" double precision check (technician_longitude IS NULL OR technician_longitude >= '-180'::integer::double precision AND technician_longitude <= 180::double precision),
 "technician_accuracy_metres" double precision,
 "location_updated_at" timestamp with time zone,
 "route_polyline" text,
 "route_progress" numeric,
 "heading_degrees" numeric,
 "location_sharing_active" boolean default false not null,
 primary key ("repair_job_id")
);
alter table public."repair_trip_state" enable row level security;
create table public."notification_devices" (
 "id" uuid default gen_random_uuid() not null,
 "tenant_key" text default 'irepair-rescue'::text not null,
 "owner_type" text not null check (owner_type = ANY (ARRAY['customer'::text, 'relay_contact'::text, 'technician'::text])),
 "owner_key" text not null,
 "app_variant" text not null check (app_variant = ANY (ARRAY['customer'::text, 'technician'::text])),
 "platform" text default 'ios'::text not null check (platform = 'ios'::text),
 "device_token" text not null,
 "bundle_id" text,
 "environment" text default 'production'::text not null check (environment = ANY (ARRAY['sandbox'::text, 'production'::text])),
 "notifications_enabled" boolean default true not null,
 "is_active" boolean default true not null,
 "is_demo" boolean default true not null,
 "last_seen_at" timestamp with time zone default now() not null,
 "created_at" timestamp with time zone default now() not null,
 "updated_at" timestamp with time zone default now() not null,
 primary key ("id")
);
alter table public."notification_devices" enable row level security;
create table public."notification_preferences" (
 "id" uuid default gen_random_uuid() not null,
 "tenant_key" text default 'irepair-rescue'::text not null,
 "owner_type" text not null check (owner_type = ANY (ARRAY['customer'::text, 'relay_contact'::text, 'technician'::text])),
 "owner_key" text not null,
 "repair_messages" boolean default true not null,
 "action_required" boolean default true not null,
 "journey_updates" boolean default true not null,
 "repair_completion" boolean default true not null,
 "nearby_availability" boolean default false not null,
 "growth_followups" boolean default false not null,
 "quiet_hours" jsonb default '{}'::jsonb not null,
 "is_demo" boolean default true not null,
 "created_at" timestamp with time zone default now() not null,
 "updated_at" timestamp with time zone default now() not null,
 primary key ("id")
);
alter table public."notification_preferences" enable row level security;
create table public."notification_events" (
 "id" uuid default gen_random_uuid() not null,
 "tenant_key" text default 'irepair-rescue'::text not null,
 "event_type" text not null,
 "category" text not null check (category = ANY (ARRAY['repair_message'::text, 'action_required'::text, 'journey'::text, 'completion'::text, 'nearby'::text, 'growth'::text, 'system'::text])),
 "repair_job_id" uuid,
 "recipient_type" text not null check (recipient_type = ANY (ARRAY['customer'::text, 'relay_contact'::text, 'technician'::text])),
 "recipient_key" text not null,
 "title" text not null,
 "body" text not null,
 "deep_link_path" text,
 "priority" text default 'normal'::text not null check (priority = ANY (ARRAY['normal'::text, 'high'::text, 'time_sensitive'::text])),
 "sound_requested" boolean default true not null,
 "badge_delta" integer default 1 not null,
 "marketing" boolean default false not null,
 "status" text default 'queued'::text not null check (status = ANY (ARRAY['queued'::text, 'pending_apns_config'::text, 'sent'::text, 'failed'::text, 'no_device'::text, 'suppressed'::text])),
 "dedupe_key" text unique,
 "metadata" jsonb default '{}'::jsonb not null,
 "is_demo" boolean default true not null,
 "created_at" timestamp with time zone default now() not null,
 "processed_at" timestamp with time zone,
 primary key ("id")
);
alter table public."notification_events" enable row level security;
create table public."notification_deliveries" (
 "id" uuid default gen_random_uuid() not null,
 "event_id" uuid not null,
 "device_id" uuid not null,
 "provider" text default 'apns'::text not null,
 "status" text default 'queued'::text not null check (status = ANY (ARRAY['queued'::text, 'sent'::text, 'failed'::text, 'suppressed'::text, 'pending_config'::text])),
 "provider_message_id" text,
 "response_code" integer,
 "error_text" text,
 "provider_response" jsonb default '{}'::jsonb not null,
 "created_at" timestamp with time zone default now() not null,
 "attempted_at" timestamp with time zone,
 primary key ("id")
);
alter table public."notification_deliveries" enable row level security;
create table public."notification_geo_subscriptions" (
 "id" uuid default gen_random_uuid() not null,
 "tenant_key" text default 'irepair-rescue'::text not null,
 "owner_type" text default 'customer'::text not null check (owner_type = 'customer'::text),
 "owner_key" text not null,
 "label" text default 'My area'::text not null,
 "latitude" double precision not null check (latitude >= '-90'::integer::double precision AND latitude <= 90::double precision),
 "longitude" double precision not null check (longitude >= '-180'::integer::double precision AND longitude <= 180::double precision),
 "radius_miles" numeric default 4.0 not null check (radius_miles >= 0.5 AND radius_miles <= 20::numeric),
 "is_active" boolean default true not null,
 "consented_at" timestamp with time zone default now() not null,
 "is_demo" boolean default true not null,
 "created_at" timestamp with time zone default now() not null,
 "updated_at" timestamp with time zone default now() not null,
 primary key ("id")
);
alter table public."notification_geo_subscriptions" enable row level security;
create table public."notification_nearby_exposures" (
 "id" uuid default gen_random_uuid() not null,
 "tenant_key" text default 'irepair-rescue'::text not null,
 "technician_id" text not null,
 "recipient_key" text not null,
 "subscription_id" uuid,
 "notification_event_id" uuid,
 "distance_miles" numeric,
 "created_at" timestamp with time zone default now() not null,
 primary key ("id")
);
alter table public."notification_nearby_exposures" enable row level security;
create table public."customer_accounts" (
 "auth_user_id" uuid not null,
 "customer_id" uuid not null unique,
 "tenant_key" text default 'irepair-rescue'::text not null,
 "email" text not null,
 "full_name" text default ''::text not null,
 "created_at" timestamp with time zone default now() not null,
 "updated_at" timestamp with time zone default now() not null,
 "is_demo" boolean default true not null,
 primary key ("auth_user_id")
);
alter table public."customer_accounts" enable row level security;
alter table public.devices add constraint "devices_customer_id_fkey" foreign key ("customer_id") references public.customers ("id");
alter table public.repair_jobs add constraint "repair_jobs_customer_id_fkey" foreign key ("customer_id") references public.customers ("id");
alter table public.repair_jobs add constraint "repair_jobs_device_id_fkey" foreign key ("device_id") references public.devices ("id");
alter table public.repair_events add constraint "repair_events_repair_job_id_fkey" foreign key ("repair_job_id") references public.repair_jobs ("id");
alter table public.repair_contacts add constraint "repair_contacts_repair_job_id_fkey" foreign key ("repair_job_id") references public.repair_jobs ("id");
alter table public.repair_contacts add constraint "repair_contacts_linked_customer_id_fkey" foreign key ("linked_customer_id") references public.customers ("id");
alter table public.repair_observations add constraint "repair_observations_repair_job_id_fkey" foreign key ("repair_job_id") references public.repair_jobs ("id");
alter table public.job_messages add constraint "job_messages_repair_job_id_fkey" foreign key ("repair_job_id") references public.repair_jobs ("id");
alter table public.job_messages add constraint "job_messages_contact_id_fkey" foreign key ("contact_id") references public.repair_contacts ("id");
alter table public.referral_invites add constraint "referral_invites_inviter_customer_id_fkey" foreign key ("inviter_customer_id") references public.customers ("id");
alter table public.referral_invites add constraint "referral_invites_repair_job_id_fkey" foreign key ("repair_job_id") references public.repair_jobs ("id");
alter table public.repair_relay_tokens add constraint "repair_relay_tokens_repair_contact_id_fkey" foreign key ("repair_contact_id") references public.repair_contacts ("id");
alter table public.repair_relay_tokens add constraint "repair_relay_tokens_repair_job_id_fkey" foreign key ("repair_job_id") references public.repair_jobs ("id");
alter table public.acquisition_events add constraint "acquisition_events_repair_job_id_fkey" foreign key ("repair_job_id") references public.repair_jobs ("id");
alter table public.acquisition_events add constraint "acquisition_events_referral_invite_id_fkey" foreign key ("referral_invite_id") references public.referral_invites ("id");
alter table public.acquisition_events add constraint "acquisition_events_customer_id_fkey" foreign key ("customer_id") references public.customers ("id");
alter table public.quick_reply_prices add constraint "quick_reply_prices_version_id_fkey" foreign key ("version_id") references public.quick_reply_price_versions ("id");
alter table public.satellite_match_claims add constraint "satellite_match_claims_repair_job_id_fkey" foreign key ("repair_job_id") references public.repair_jobs ("id");
alter table public.satellite_match_claims add constraint "satellite_match_claims_suggested_before_job_id_fkey" foreign key ("suggested_before_job_id") references public.repair_jobs ("id");
alter table public.repair_trip_state add constraint "repair_trip_state_repair_job_id_fkey" foreign key ("repair_job_id") references public.repair_jobs ("id");
alter table public.notification_events add constraint "notification_events_repair_job_id_fkey" foreign key ("repair_job_id") references public.repair_jobs ("id");
alter table public.notification_deliveries add constraint "notification_deliveries_event_id_fkey" foreign key ("event_id") references public.notification_events ("id");
alter table public.notification_deliveries add constraint "notification_deliveries_device_id_fkey" foreign key ("device_id") references public.notification_devices ("id");
alter table public.notification_nearby_exposures add constraint "notification_nearby_exposures_notification_event_id_fkey" foreign key ("notification_event_id") references public.notification_events ("id");
alter table public.notification_nearby_exposures add constraint "notification_nearby_exposures_subscription_id_fkey" foreign key ("subscription_id") references public.notification_geo_subscriptions ("id");
alter table public.customer_accounts add constraint "customer_accounts_customer_id_fkey" foreign key ("customer_id") references public.customers ("id");
alter table public.customer_accounts add constraint "customer_accounts_auth_user_id_fkey" foreign key ("auth_user_id") references auth.users ("id");
commit;