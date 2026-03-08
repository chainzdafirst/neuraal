ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_email boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_study_reminders boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_weekly_report boolean NOT NULL DEFAULT false;