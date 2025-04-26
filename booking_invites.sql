-- Create booking_invites table
CREATE TABLE IF NOT EXISTS booking_invites (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id uuid REFERENCES auth.users(id),
    receiver_id uuid REFERENCES auth.users(id),
    gym_id text,
    date date,
    time time,
    status text DEFAULT 'pending',
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE booking_invites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create booking invites"
ON booking_invites FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can view their own booking invites"
ON booking_invites FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can update their own booking invites"
ON booking_invites FOR UPDATE
TO authenticated
USING (receiver_id = auth.uid());