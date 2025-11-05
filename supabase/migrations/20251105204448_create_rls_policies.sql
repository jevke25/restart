/*
  # Row Level Security Policies

  ## Overview
  This migration sets up comprehensive Row Level Security policies for all tables
  to ensure proper data access control.

  ## Security Model

  ### Profiles
  - Users can read their own profile
  - Users can update their own profile
  - Trainers can read profiles of their clients

  ### Trainer-Client Relationships
  - Trainers can manage their client relationships
  - Clients can view their trainer relationships

  ### Exercises
  - Authenticated users can view public exercises
  - Users can view exercises they created
  - Trainers can create exercises
  - Users can update/delete their own exercises

  ### Training Plans & Related
  - Trainers can create/manage training plans for their clients
  - Clients can view their own training plans
  - Same applies to training days and exercises

  ### Nutrition Plans
  - Trainers can create/manage nutrition plans for their clients
  - Clients can view their own nutrition plans

  ### Measurements
  - Trainers can view/add measurements for their clients
  - Clients can view/add their own measurements

  ### Gym Memberships & Visits
  - Trainers can manage memberships for their clients
  - Clients can view their own memberships and check-ins

  ### Food Log
  - Clients can manage their own food log entries
  - Trainers can view food logs of their clients
*/

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Trainers can view their clients"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.client_id = profiles.id
      AND trainer_clients.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Trainer-client policies
CREATE POLICY "Trainers can view their client relationships"
  ON trainer_clients FOR SELECT
  TO authenticated
  USING (trainer_id = auth.uid() OR client_id = auth.uid());

CREATE POLICY "Trainers can create client relationships"
  ON trainer_clients FOR INSERT
  TO authenticated
  WITH CHECK (
    trainer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'trainer'
    )
  );

CREATE POLICY "Trainers can update their client relationships"
  ON trainer_clients FOR UPDATE
  TO authenticated
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can delete their client relationships"
  ON trainer_clients FOR DELETE
  TO authenticated
  USING (trainer_id = auth.uid());

-- Exercises policies
CREATE POLICY "Users can view public exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can view their own exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Trainers can create exercises"
  ON exercises FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'trainer'
    )
  );

CREATE POLICY "Users can update their own exercises"
  ON exercises FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own exercises"
  ON exercises FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Training plans policies
CREATE POLICY "Trainers can view training plans for their clients"
  ON training_plans FOR SELECT
  TO authenticated
  USING (
    trainer_id = auth.uid() OR
    client_id = auth.uid()
  );

CREATE POLICY "Trainers can create training plans"
  ON training_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    trainer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.trainer_id = auth.uid()
      AND trainer_clients.client_id = training_plans.client_id
    )
  );

CREATE POLICY "Trainers can update their training plans"
  ON training_plans FOR UPDATE
  TO authenticated
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can delete their training plans"
  ON training_plans FOR DELETE
  TO authenticated
  USING (trainer_id = auth.uid());

-- Training days policies
CREATE POLICY "Users can view training days"
  ON training_days FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_plans
      WHERE training_plans.id = training_days.training_plan_id
      AND (training_plans.trainer_id = auth.uid() OR training_plans.client_id = auth.uid())
    )
  );

CREATE POLICY "Trainers can create training days"
  ON training_days FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_plans
      WHERE training_plans.id = training_days.training_plan_id
      AND training_plans.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can update training days"
  ON training_days FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_plans
      WHERE training_plans.id = training_days.training_plan_id
      AND training_plans.trainer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_plans
      WHERE training_plans.id = training_days.training_plan_id
      AND training_plans.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can delete training days"
  ON training_days FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_plans
      WHERE training_plans.id = training_days.training_plan_id
      AND training_plans.trainer_id = auth.uid()
    )
  );

-- Training exercises policies
CREATE POLICY "Users can view training exercises"
  ON training_exercises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_days
      JOIN training_plans ON training_plans.id = training_days.training_plan_id
      WHERE training_days.id = training_exercises.training_day_id
      AND (training_plans.trainer_id = auth.uid() OR training_plans.client_id = auth.uid())
    )
  );

CREATE POLICY "Trainers can create training exercises"
  ON training_exercises FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_days
      JOIN training_plans ON training_plans.id = training_days.training_plan_id
      WHERE training_days.id = training_exercises.training_day_id
      AND training_plans.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can update training exercises"
  ON training_exercises FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_days
      JOIN training_plans ON training_plans.id = training_days.training_plan_id
      WHERE training_days.id = training_exercises.training_day_id
      AND training_plans.trainer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_days
      JOIN training_plans ON training_plans.id = training_days.training_plan_id
      WHERE training_days.id = training_exercises.training_day_id
      AND training_plans.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can delete training exercises"
  ON training_exercises FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_days
      JOIN training_plans ON training_plans.id = training_days.training_plan_id
      WHERE training_days.id = training_exercises.training_day_id
      AND training_plans.trainer_id = auth.uid()
    )
  );

-- Nutrition plans policies
CREATE POLICY "Users can view nutrition plans"
  ON nutrition_plans FOR SELECT
  TO authenticated
  USING (trainer_id = auth.uid() OR client_id = auth.uid());

CREATE POLICY "Trainers can create nutrition plans"
  ON nutrition_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    trainer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.trainer_id = auth.uid()
      AND trainer_clients.client_id = nutrition_plans.client_id
    )
  );

CREATE POLICY "Trainers can update nutrition plans"
  ON nutrition_plans FOR UPDATE
  TO authenticated
  USING (trainer_id = auth.uid())
  WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can delete nutrition plans"
  ON nutrition_plans FOR DELETE
  TO authenticated
  USING (trainer_id = auth.uid());

-- Measurements policies
CREATE POLICY "Users can view their measurements"
  ON measurements FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.client_id = measurements.client_id
      AND trainer_clients.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create their measurements"
  ON measurements FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Trainers can create measurements for clients"
  ON measurements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.client_id = measurements.client_id
      AND trainer_clients.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their measurements"
  ON measurements FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.client_id = measurements.client_id
      AND trainer_clients.trainer_id = auth.uid()
    )
  )
  WITH CHECK (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.client_id = measurements.client_id
      AND trainer_clients.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their measurements"
  ON measurements FOR DELETE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.client_id = measurements.client_id
      AND trainer_clients.trainer_id = auth.uid()
    )
  );

-- Gym memberships policies
CREATE POLICY "Users can view their gym memberships"
  ON gym_memberships FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.client_id = gym_memberships.client_id
      AND trainer_clients.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can create gym memberships"
  ON gym_memberships FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.client_id = gym_memberships.client_id
      AND trainer_clients.trainer_id = auth.uid()
    ) OR
    client_id = auth.uid()
  );

CREATE POLICY "Users can update gym memberships"
  ON gym_memberships FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.client_id = gym_memberships.client_id
      AND trainer_clients.trainer_id = auth.uid()
    )
  )
  WITH CHECK (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.client_id = gym_memberships.client_id
      AND trainer_clients.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete gym memberships"
  ON gym_memberships FOR DELETE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.client_id = gym_memberships.client_id
      AND trainer_clients.trainer_id = auth.uid()
    )
  );

-- Gym visits policies
CREATE POLICY "Users can view their gym visits"
  ON gym_visits FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.client_id = gym_visits.client_id
      AND trainer_clients.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create their gym visits"
  ON gym_visits FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update their gym visits"
  ON gym_visits FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Food log policies
CREATE POLICY "Users can view their food log"
  ON food_log FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM trainer_clients
      WHERE trainer_clients.client_id = food_log.client_id
      AND trainer_clients.trainer_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create food log entries"
  ON food_log FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update their food log"
  ON food_log FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can delete their food log"
  ON food_log FOR DELETE
  TO authenticated
  USING (client_id = auth.uid());