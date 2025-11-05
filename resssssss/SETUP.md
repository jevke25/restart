# Setup Instructions

## 1. Environment Variables

Create a `.env` file in the `resssssss` directory with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Create Test Users

You need to create users in Supabase Auth to test the application:

### Trainer Account:
- Email: petar@example.com
- Password: petar123
- Role: trainer

### Client Account:
- Email: klijent@example.com
- Password: klijent123
- Role: client

You can create these users either:
- Through Supabase Dashboard (Authentication > Users)
- Or using the signup functionality once implemented

After creating users in Auth, you need to add their profiles to the `profiles` table:

```sql
-- Insert trainer profile
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'auth-user-id-here',
  'petar@example.com',
  'Petar Nedeljkovic',
  'trainer'
);

-- Insert client profile
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'auth-user-id-here',
  'klijent@example.com',
  'Test Klijent',
  'client'
);
```

## 3. Create Test Relationship

To see clients in the trainer dashboard:

```sql
-- Create trainer-client relationship
INSERT INTO trainer_clients (trainer_id, client_id, status, payment_confirmed)
VALUES (
  'trainer-user-id',
  'client-user-id',
  'active',
  true
);
```

## 4. Run the Application

```bash
npm install
npm run dev
```

## 5. Features Ready

- User authentication with Supabase
- Role-based access (Trainer/Client)
- Exercise library from database
- Training plan structure
- Nutrition plan structure
- Measurements tracking
- Gym membership management
- Row Level Security enabled
