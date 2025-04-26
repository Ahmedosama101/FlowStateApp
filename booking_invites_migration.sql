-- Update bookings table to include receiver_id and time_slot
ALTER TABLE bookings
ADD COLUMN receiver_id UUID REFERENCES profiles(id),
ADD COLUMN time_slot TEXT CHECK (time_slot IN ('morning', 'afternoon', 'evening'));

-- Create booking invites table
CREATE TABLE booking_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  gym_id UUID REFERENCES gyms(id) NOT NULL,
  booking_date DATE NOT NULL,
  time_slot TEXT CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  specific_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);