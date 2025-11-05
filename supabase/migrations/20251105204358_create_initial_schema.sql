/*
  # Initial Database Schema for Fitness Management App

  ## Overview
  This migration creates the complete database structure for a fitness management application
  that supports trainers managing clients, creating training and nutrition plans, tracking
  measurements, and managing gym memberships.

  ## New Tables

  ### 1. `profiles`
  User profiles extending Supabase auth.users
  - `id` (uuid, FK to auth.users)
  - `email` (text)
  - `full_name` (text)
  - `role` (text: 'trainer' or 'client')
  - `phone` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `trainer_clients`
  Relationship between trainers and their clients
  - `id` (uuid, PK)
  - `trainer_id` (uuid, FK to profiles)
  - `client_id` (uuid, FK to profiles)
  - `status` (text: 'active', 'waiting_payment', 'waiting_training', 'inactive')
  - `payment_confirmed` (boolean)
  - `membership_start` (date, nullable)
  - `membership_end` (date, nullable)
  - `created_at` (timestamptz)

  ### 3. `exercises`
  Exercise library
  - `id` (uuid, PK)
  - `name` (text)
  - `muscle_group` (text)
  - `description` (text, nullable)
  - `video_url` (text, nullable)
  - `tips` (text[], nullable)
  - `created_by` (uuid, FK to profiles)
  - `is_public` (boolean)
  - `created_at` (timestamptz)

  ### 4. `training_plans`
  Training plans created by trainers
  - `id` (uuid, PK)
  - `client_id` (uuid, FK to profiles)
  - `trainer_id` (uuid, FK to profiles)
  - `name` (text)
  - `description` (text, nullable)
  - `start_date` (date)
  - `end_date` (date, nullable)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 5. `training_days`
  Individual days within a training plan
  - `id` (uuid, PK)
  - `training_plan_id` (uuid, FK to training_plans)
  - `day_number` (integer)
  - `name` (text)
  - `created_at` (timestamptz)

  ### 6. `training_exercises`
  Exercises assigned to training days
  - `id` (uuid, PK)
  - `training_day_id` (uuid, FK to training_days)
  - `exercise_id` (uuid, FK to exercises)
  - `sets` (integer)
  - `reps` (integer)
  - `notes` (text, nullable)
  - `order_index` (integer)
  - `created_at` (timestamptz)

  ### 7. `nutrition_plans`
  Nutrition plans for clients
  - `id` (uuid, PK)
  - `client_id` (uuid, FK to profiles)
  - `trainer_id` (uuid, FK to profiles)
  - `day_number` (integer)
  - `calories` (integer)
  - `protein` (integer)
  - `carbs` (integer)
  - `fats` (integer)
  - `notes` (text, nullable)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 8. `measurements`
  Client body measurements tracking
  - `id` (uuid, PK)
  - `client_id` (uuid, FK to profiles)
  - `weight` (decimal, nullable)
  - `waist` (decimal, nullable)
  - `chest` (decimal, nullable)
  - `biceps` (decimal, nullable)
  - `thighs` (decimal, nullable)
  - `measurement_date` (date)
  - `notes` (text, nullable)
  - `created_at` (timestamptz)

  ### 9. `gym_memberships`
  Gym membership management
  - `id` (uuid, PK)
  - `client_id` (uuid, FK to profiles)
  - `membership_type` (text)
  - `start_date` (date)
  - `end_date` (date)
  - `status` (text: 'active', 'expired', 'expiring')
  - `price` (decimal, nullable)
  - `created_at` (timestamptz)

  ### 10. `gym_visits`
  Track gym check-ins
  - `id` (uuid, PK)
  - `client_id` (uuid, FK to profiles)
  - `check_in_time` (timestamptz)
  - `check_out_time` (timestamptz, nullable)
  - `created_at` (timestamptz)

  ### 11. `food_log`
  Daily food intake tracking
  - `id` (uuid, PK)
  - `client_id` (uuid, FK to profiles)
  - `food_name` (text)
  - `calories` (integer)
  - `protein` (integer)
  - `carbs` (integer)
  - `fats` (integer)
  - `meal_time` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Trainers can view/edit their clients' data
  - Clients can view their own data
  - Trainers can manage exercises they create
  - Public exercises are viewable by all authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('trainer', 'client')),
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Trainer-Client relationship
CREATE TABLE IF NOT EXISTS trainer_clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'waiting_payment' CHECK (status IN ('active', 'waiting_payment', 'waiting_training', 'inactive')),
  payment_confirmed boolean DEFAULT false,
  membership_start date,
  membership_end date,
  created_at timestamptz DEFAULT now(),
  UNIQUE(trainer_id, client_id)
);

ALTER TABLE trainer_clients ENABLE ROW LEVEL SECURITY;

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  muscle_group text NOT NULL,
  description text,
  video_url text,
  tips text[],
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Training plans
CREATE TABLE IF NOT EXISTS training_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

-- Training days
CREATE TABLE IF NOT EXISTS training_days (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_plan_id uuid NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number > 0),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(training_plan_id, day_number)
);

ALTER TABLE training_days ENABLE ROW LEVEL SECURITY;

-- Training exercises
CREATE TABLE IF NOT EXISTS training_exercises (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_day_id uuid NOT NULL REFERENCES training_days(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sets integer NOT NULL DEFAULT 3,
  reps integer NOT NULL DEFAULT 12,
  notes text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE training_exercises ENABLE ROW LEVEL SECURITY;

-- Nutrition plans
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number > 0 AND day_number <= 7),
  calories integer NOT NULL DEFAULT 0,
  protein integer NOT NULL DEFAULT 0,
  carbs integer NOT NULL DEFAULT 0,
  fats integer NOT NULL DEFAULT 0,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, day_number, is_active)
);

ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;

-- Measurements
CREATE TABLE IF NOT EXISTS measurements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weight decimal(5,2),
  waist decimal(5,2),
  chest decimal(5,2),
  biceps decimal(5,2),
  thighs decimal(5,2),
  measurement_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

-- Gym memberships
CREATE TABLE IF NOT EXISTS gym_memberships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  membership_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'expiring')),
  price decimal(10,2),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gym_memberships ENABLE ROW LEVEL SECURITY;

-- Gym visits
CREATE TABLE IF NOT EXISTS gym_visits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  check_in_time timestamptz NOT NULL DEFAULT now(),
  check_out_time timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gym_visits ENABLE ROW LEVEL SECURITY;

-- Food log
CREATE TABLE IF NOT EXISTS food_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  food_name text NOT NULL,
  calories integer NOT NULL DEFAULT 0,
  protein integer NOT NULL DEFAULT 0,
  carbs integer NOT NULL DEFAULT 0,
  fats integer NOT NULL DEFAULT 0,
  meal_time timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE food_log ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trainer_clients_trainer ON trainer_clients(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_clients_client ON trainer_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_client ON training_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_trainer ON training_plans(trainer_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_client ON nutrition_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_measurements_client ON measurements(client_id);
CREATE INDEX IF NOT EXISTS idx_gym_visits_client ON gym_visits(client_id);
CREATE INDEX IF NOT EXISTS idx_food_log_client ON food_log(client_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();