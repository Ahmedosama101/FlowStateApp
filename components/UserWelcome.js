import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { supabase } from '../app/lib/supabase';

const UserWelcome = () => {
  const [userName, setUserName] = useState('User');
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Fetch user profile
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          if (data) {
            setUserName(data.full_name || 'User');
          }          // Fetch user's primary profile image
          console.log('About to fetch profile image for user ID:', user.id);
          console.log('User object:', user);
          
          const { data: imageData, error: imageError } = await supabase
            .from('profile_images')
            .select('*') // Select all columns for debugging
            .eq('profile_id', user.id)
            .eq('is_primary', true);
            
          console.log('Raw profile images query result:', imageData);
          
          if (imageError) {
            console.error('Error fetching profile image:', imageError);
          }
            console.log('Profile image data:', imageData);
          
          if (imageData && imageData.length > 0) {
            const primaryImage = imageData[0];
            console.log('Found primary image:', primaryImage);
            
            if (primaryImage.image_url) {
              console.log('Setting profile image URL:', primaryImage.image_url);
              
              // Check if the image URL is already a full URL or a storage path
              if (primaryImage.image_url.startsWith('http')) {
                // It's already a full URL
                console.log('Using full URL:', primaryImage.image_url);
                setProfileImage(primaryImage.image_url);
              } else {              // It's a storage path, so get the public URL
              try {
                console.log('Getting public URL for storage path:', primaryImage.image_url);
                console.log('Using bucket:', 'user-images');
                
                const { data: urlData } = supabase.storage
                  .from('user-images')
                  .getPublicUrl(primaryImage.image_url);
                  
                console.log('Generated public URL:', urlData?.publicUrl);
                if (urlData && urlData.publicUrl) {
                  setProfileImage(urlData.publicUrl);
                } else {
                  console.error('Failed to generate public URL');
                }
              } catch (urlError) {
                console.error('Error generating public URL:', urlError);
              }
              }
            }
          } else {
            console.log('No profile image found for user:', user.id);
            console.log('Attempting direct query to verify table has data...');
            
            // Additional debug query to verify table has data at all
            const { data: anyImages } = await supabase
              .from('profile_images')
              .select('profile_id, is_primary')
              .limit(5);
              
            console.log('Sample of profile_images table:', anyImages);
            
            // Check if there are any images for this user at all, regardless of is_primary
            const { data: userImages } = await supabase
              .from('profile_images')
              .select('*')
              .eq('profile_id', user.id);
              
            console.log('All images for current user:', userImages);
            
            // If there are images but none are primary, use the first one anyway
            if (userImages && userImages.length > 0) {
              console.log('Found non-primary images for user. Using first one.');
              const firstImage = userImages[0];
              
              if (firstImage.image_url) {                if (firstImage.image_url.startsWith('http')) {
                  console.log('Using full URL from non-primary image:', firstImage.image_url);
                  setProfileImage(firstImage.image_url);
                } else {
                  try {
                    console.log('Getting public URL for non-primary image:', firstImage.image_url);
                    const { data: urlData } = supabase.storage
                      .from('user-images')
                      .getPublicUrl(firstImage.image_url);
                      
                    console.log('Generated public URL for non-primary image:', urlData?.publicUrl);
                    if (urlData && urlData.publicUrl) {
                      setProfileImage(urlData.publicUrl);
                    }
                  } catch (urlError) {
                    console.error('Error generating public URL for non-primary image:', urlError);
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    };

    fetchUserData();
  }, []);  return (
    <View style={[styles.headerContainer, styles.userWelcomeContainer]}>
      {console.log('Rendering image with URL:', profileImage)}
      <Image
        source={{ 
          uri: profileImage || 'https://images.unsplash.com/photo-1744132116978-bbf797a1e689?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
        }}
        style={styles.profileImage}
        onError={(e) => console.error('Image loading error:', e.nativeEvent.error)}
      />
      <Text style={styles.welcomeText}>
        Welcome {userName}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userWelcomeContainer: {
    paddingLeft: 20, // Left padding specifically for UserWelcome
  },
});

export default UserWelcome;