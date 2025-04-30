-- First, let's drop the existing foreign key constraints if they exist
ALTER TABLE IF EXISTS booking_invites 
  DROP CONSTRAINT IF EXISTS booking_invites_sender_id_fkey,
  DROP CONSTRAINT IF EXISTS booking_invites_receiver_id_fkey;

-- Now add the correct foreign key constraints
ALTER TABLE booking_invites
  ADD CONSTRAINT booking_invites_sender_id_fkey 
    FOREIGN KEY (sender_id) 
    REFERENCES profiles(id),
  ADD CONSTRAINT booking_invites_receiver_id_fkey 
    FOREIGN KEY (receiver_id) 
    REFERENCES profiles(id);

-- Grant necessary permissions
GRANT REFERENCES ON profiles TO authenticated;
GRANT REFERENCES ON booking_invites TO authenticated;