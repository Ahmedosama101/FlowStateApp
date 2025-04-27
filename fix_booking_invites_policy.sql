-- Drop existing policies
DROP POLICY IF EXISTS "Users can create booking invites" ON booking_invites;
DROP POLICY IF EXISTS "Users can view their own booking invites" ON booking_invites;
DROP POLICY IF EXISTS "Users can update their own booking invites" ON booking_invites;

-- Create new insert policy using profile id
CREATE POLICY "Users can create booking invites"
ON booking_invites FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = booking_invites.sender_id
    AND profiles.auth_id = auth.uid()
));

-- Create new select policy
CREATE POLICY "Users can view their own booking invites"
ON booking_invites FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.auth_id = auth.uid()
    AND (profiles.id = booking_invites.sender_id OR profiles.id = booking_invites.receiver_id)
));

-- Create new update policy
CREATE POLICY "Users can update their own booking invites"
ON booking_invites FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.auth_id = auth.uid()
        AND (
            (profiles.id = booking_invites.sender_id AND status = 'pending')
            OR 
            (profiles.id = booking_invites.receiver_id AND status = 'pending')
        )
    )
);