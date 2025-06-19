import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen({ route, navigation }) {
  const { userData } = route.params;
  const [formData, setFormData] = useState({
    ...userData,
    // Convert age to string if it exists, otherwise use empty string
    age: userData.age ? userData.age.toString() : ''
  });
  const [profileImage, setProfileImage] = useState(userData.profile_image_url || null);
  const [uploading, setUploading] = useState(false);

  const [fontsLoaded] = useFonts({
    'Raleway-Regular': require('../assets/fonts/Raleway-Regular.ttf'),
    'Raleway-Medium': require('../assets/fonts/Raleway-Medium.ttf'),
    'Raleway-Bold': require('../assets/fonts/Raleway-Bold.ttf'),
  });

  const handleSave = async () => {
    try {
      if (!formData.id) {
        throw new Error('User ID is missing');
      }

      // Update user metadata for phone number if it changed
      if (formData.phone_number !== userData.phone_number) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { phone_number: formData.phone_number }
        });
        if (metadataError) throw metadataError;
      }      // Update other profile fields
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          // Don't update date_of_birth from age as it requires special handling
          gender: formData.gender,
          weight: formData.weight,
          height: formData.height,
          profile_image_url: profileImage, // Add profile image URL
          updated_at: new Date().toISOString()
        })
        .eq('id', formData.id);

      if (profileError) throw profileError;
      
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Update error:', error.message);
      Alert.alert('Error', error.message);
    }
  };

  // Image picker and upload logic
  const pickAndUploadImage = async () => {
    try {
      console.log('Starting image upload...');
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Permission to access media library is required!');
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      console.log('Picker result:', pickerResult);
      if (pickerResult.cancelled || (pickerResult.assets && pickerResult.assets.length === 0)) return;
      setUploading(true);
      const uri = pickerResult.assets ? pickerResult.assets[0].uri : pickerResult.uri;
      console.log('Image URI:', uri);
      const fileName = `profile_${Date.now()}.jpg`;
      
      // Check current auth session to debug auth state
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        Alert.alert('Session Error', 'Failed to get current session.');
        setUploading(false);
        return;
      }
      console.log('Current session:', JSON.stringify(sessionData, null, 2));

      // Get the Supabase auth user id (not profile id)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Auth user error:', userError);
        Alert.alert('Auth Error', 'Could not get authenticated user.');
        setUploading(false);
        return;
      }
      console.log('Auth user details:', JSON.stringify(user, null, 2));
      console.log('User ID from auth:', user.id);
      console.log('User ID from form data:', formData.id);
      
      // Use auth user ID for storage and profile_images table
      const userId = user.id; 
      
      let blob;
      try {
        const response = await fetch(uri);
        blob = await response.blob();
        console.log('Blob size:', blob.size, 'Blob type:', blob.type);
      } catch (fetchErr) {
        console.error('Error fetching image blob:', fetchErr);
        Alert.alert('Image Error', 'Could not read image file.');
        setUploading(false);
        return;
      }
      
      // Testing RLS policies with Supabase
      try {
        const { data: policyTest, error: policyError } = await supabase
          .from('profile_images')
          .select('*')
          .limit(1);
        console.log('Policy test result:', policyTest, policyError);
      } catch (policyTestErr) {
        console.error('Policy test error:', policyTestErr);
      }
      
      const filePath = `${userId}/${fileName}`;
      console.log('Uploading to:', filePath);
      
      // Upload with detailed logging
      console.log('Before upload, bucket:', 'user-images', 'filePath:', filePath);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-images')
        .upload(filePath, blob, { 
          upsert: true, 
          contentType: 'image/jpeg',
          cacheControl: '3600'
        });
        
      console.log('Upload result:', JSON.stringify(uploadData), JSON.stringify(uploadError));
      
      if (uploadError) {
        console.error('Supabase upload error code:', uploadError.code);
        console.error('Supabase upload error message:', uploadError.message);
        console.error('Supabase upload error details:', uploadError.details);
        Alert.alert('Upload Error', uploadError.message || 'Unknown upload error');
        setUploading(false);
        return;
      }
      
      const { data: urlData, error: urlError } = supabase.storage
        .from('user-images')
        .getPublicUrl(filePath);
        
      console.log('Get public URL result:', JSON.stringify(urlData), JSON.stringify(urlError));
      
      if (urlError) {
        console.error('Supabase publicUrl error:', urlError);
        Alert.alert('URL Error', urlError.message || 'Unknown URL error');
        setUploading(false);
        return;
      }
        const publicUrl = urlData.publicUrl;
      setProfileImage(publicUrl);
      console.log('Setting profile image URL:', publicUrl);
      
      // Update form data with the new image URL
      setFormData(prevData => ({
        ...prevData,
        profile_image_url: publicUrl
      }));
      console.log('Updated form data with new image URL');
      
      // Mark all previous as not primary
      console.log('Updating previous profile images for user ID:', userId);
      const { error: updateError } = await supabase
        .from('profile_images')
        .update({ is_primary: false })
        .eq('profile_id', userId);
        
      if (updateError) {
        console.error('Update is_primary error:', updateError);
        Alert.alert('DB Update Error', updateError.message || 'Unknown update error');
        setUploading(false);
        return;
      }
        // Upsert new image as primary
      console.log('Upserting new profile image for user ID:', userId);
      // First check if a record already exists
      const { data: existingImages, error: checkError } = await supabase
        .from('profile_images')
        .select('id, image_url')
        .eq('profile_id', userId)
        .eq('image_url', publicUrl);
        
      console.log('Existing image check:', existingImages, checkError);
      
      let upsertError = null;
      
      if (checkError) {
        console.error('Error checking existing images:', checkError);
      } else if (existingImages && existingImages.length > 0) {
        // Update existing record
        console.log('Updating existing image record');
        const { error: updateImageError } = await supabase
          .from('profile_images')
          .update({
            is_primary: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingImages[0].id);
          
        upsertError = updateImageError;
      } else {
        // Insert new record
        console.log('Inserting new image record');
        const { error: insertError } = await supabase
          .from('profile_images')
          .insert({
            profile_id: userId,
            image_url: publicUrl,
            is_primary: true,
            updated_at: new Date().toISOString()
          });
          
        upsertError = insertError;
      }
      
      if (upsertError) {
        console.error('Upsert error:', upsertError);
        Alert.alert('DB Upsert Error', upsertError.message || 'Unknown upsert error');
        setUploading(false);
        return;
      }
        // Update the profile table with the image URL
      console.log('Updating profile table with image URL for ID:', formData.id);
      console.log('Using auth user ID:', userId, 'vs formData ID:', formData.id);
      
      // Make sure we're using the correct ID
      const profileId = formData.id === userId ? formData.id : userId;
      console.log('Selected profile ID for update:', profileId);
      
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ 
          profile_image_url: publicUrl,
          updated_at: new Date().toISOString() 
        })
        .eq('id', profileId);
        
      if (profileUpdateError) {
        console.error('Profile update error:', profileUpdateError);
        Alert.alert('Profile Update Warning', 'Profile image was uploaded but profile wasn\'t updated with the new image.');
      } else {
        console.log('Profile successfully updated with new image URL');
      }
        Alert.alert('Success', 'Profile image updated!');
      
      // Force refresh of the profile screen when navigating back
      navigation.navigate('ProfileMain', { refresh: true });
    } catch (err) {
      console.error('Image upload error:', err);
      Alert.alert('Error', 'Failed to upload image. See logs for details.');
    } finally {
      setUploading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageSection}>
        {uploading ? (
          <ActivityIndicator size="large" color="#0C2252" />
        ) : (
          <Image
            source={profileImage ? { uri: profileImage } : require('../assets/black.png')}
            style={styles.profileImage}
          />
        )}
        <TouchableOpacity style={styles.uploadButton} onPress={pickAndUploadImage}>
          <Text style={styles.uploadButtonText}>Upload Profile Image</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <FormField
          label="Full Name"
          value={formData.fullName}
          onChangeText={(text) => updateField('fullName', text)}
        />
        <FormField
          label="Email"
          value={formData.email}
          editable={false} // Email should generally not be editable through profile
        />
        <FormField
          label="Age"
          value={formData.age}
          onChangeText={(text) => updateField('age', text)}
          keyboardType="numeric"
          editable={false} // Should not directly edit age as it's calculated from DOB
        />
        <FormField
          label="Gender"
          value={formData.gender}
          onChangeText={(text) => updateField('gender', text)}
        />
        <FormField
          label="Weight (kg)"
          value={formData.weight}
          onChangeText={(text) => updateField('weight', text)}
          keyboardType="numeric"
        />
        <FormField
          label="Height (cm)"
          value={formData.height}
          onChangeText={(text) => updateField('height', text)}
          keyboardType="numeric"
        />
        <FormField
          label="Phone Number"
          value={formData.phone_number}
          onChangeText={(text) => updateField('phone_number', text)}
          keyboardType="phone-pad"
        />
      </View>
    </ScrollView>
  );
}

const FormField = ({ label, value, onChangeText, keyboardType = 'default', editable = true }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, !editable && styles.disabledInput]}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      editable={editable}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Raleway-Bold',
  },
  saveButton: {
    backgroundColor: '#BBD4F9',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    fontFamily: 'Raleway-Medium',
    fontSize: 16,
  },
  form: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
    marginBottom: 8,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  imageSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#BBD4F9',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadButtonText: {
    fontFamily: 'Raleway-Medium',
    fontSize: 16,
    color: '#222',
  },
});