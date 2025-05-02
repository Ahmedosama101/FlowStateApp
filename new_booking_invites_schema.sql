-- Drop existing table if it exists
DROP TABLE IF EXISTS booking_invites;

-- Create booking invites table with proper relationships
CREATE TABLE booking_invites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    gym_id UUID NOT NULL,
    booking_date DATE NOT NULL,
    specific_time TIME NOT NULL,
    time_slot TEXT CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- Add foreign key constraints
    CONSTRAINT booking_invites_sender_id_fkey 
        FOREIGN KEY (sender_id) 
        REFERENCES auth.users(id)
        ON DELETE CASCADE,
    CONSTRAINT booking_invites_receiver_id_fkey 
        FOREIGN KEY (receiver_id) 
        REFERENCES auth.users(id)
        ON DELETE CASCADE,
    CONSTRAINT booking_invites_gym_id_fkey 
        FOREIGN KEY (gym_id) 
        REFERENCES gyms(id)
        ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE booking_invites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create booking invites" ON booking_invites;
DROP POLICY IF EXISTS "Users can view their own booking invites" ON booking_invites;
DROP POLICY IF EXISTS "Users can update their own booking invites" ON booking_invites;

-- Create RLS policies
CREATE POLICY "Users can create booking invites"
ON booking_invites FOR INSERT
TO authenticated
WITH CHECK (
    -- Allow users to create invites where they are the sender
    sender_id = auth.uid()
);

CREATE POLICY "Users can view their own booking invites"
ON booking_invites FOR SELECT
TO authenticated
USING (
    -- Users can view invites where they are either the sender or receiver
    sender_id = auth.uid() OR receiver_id = auth.uid()
);

CREATE POLICY "Users can update their own booking invites"
ON booking_invites FOR UPDATE
TO authenticated
USING (
    -- Only allow updates if user is the receiver and invite is pending
    (receiver_id = auth.uid() AND status = 'pending')
    -- Or if user is the sender and invite is pending (to allow cancellation)
    OR (sender_id = auth.uid() AND status = 'pending')
);

-- Create necessary indexes for performance
CREATE INDEX booking_invites_sender_id_idx ON booking_invites(sender_id);
CREATE INDEX booking_invites_receiver_id_idx ON booking_invites(receiver_id);
CREATE INDEX booking_invites_status_idx ON booking_invites(status);
CREATE INDEX booking_invites_created_at_idx ON booking_invites(created_at);

-- Grant necessary permissions
GRANT ALL ON booking_invites TO authenticated;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_booking_invites_updated_at
    BEFORE UPDATE ON booking_invites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();