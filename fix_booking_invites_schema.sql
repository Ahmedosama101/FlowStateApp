-- Drop existing table and recreate with correct schema
DROP TABLE IF EXISTS booking_invites;

CREATE TABLE booking_invites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) NOT NULL,
    gym_id UUID REFERENCES gyms(id) NOT NULL,
    booking_date DATE NOT NULL,
    specific_time TIME NOT NULL,
    time_slot TEXT CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE booking_invites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create booking invites" ON booking_invites;
DROP POLICY IF EXISTS "Users can view their own booking invites" ON booking_invites;
DROP POLICY IF EXISTS "Users can update their own booking invites" ON booking_invites;

-- Create new policies
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
USING (receiver_id = auth.uid() AND status = 'pending');

-- Grant necessary permissions
GRANT ALL ON booking_invites TO authenticated;