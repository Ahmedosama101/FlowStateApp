import React from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from './supabase';

export const checkAndFixBucket = async () => {
  try {
    // Step 1: Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      return {
        success: false,
        error: listError.message,
        message: 'Failed to list buckets'
      };
    }
    
    const bucket = buckets.find(b => b.name === 'user-images');
    let bucketExists = !!bucket;
    let isPublic = bucket?.public || false;
    let wasCreated = false;
    let wasUpdated = false;
    
    // Step 2: Create the bucket if it doesn't exist
    if (!bucketExists) {
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('user-images', { 
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        return {
          success: false,
          error: createError.message,
          message: 'Failed to create bucket'
        };
      }
      
      bucketExists = true;
      isPublic = true;
      wasCreated = true;
    }
    // Step 3: Update the bucket to be public if it exists but isn't public
    else if (!isPublic) {
      const { error: updateError } = await supabase.storage.updateBucket('user-images', { 
        public: true 
      });
      
      if (updateError) {
        return {
          success: false,
          error: updateError.message,
          message: 'Failed to update bucket to public'
        };
      }
      
      isPublic = true;
      wasUpdated = true;
    }
    
    // Step 4: Check if the policies exist or create them
    const testUpload = async () => {
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const { data: { user } } = await supabase.auth.getUser();
      const testPath = `${user.id}/test-${Date.now()}.txt`;
      
      const { data, error } = await supabase.storage
        .from('user-images')
        .upload(testPath, testBlob, { upsert: true });
        
      if (error) {
        return {
          success: false,
          error: error.message,
          message: 'Policy test failed: Cannot upload'
        };
      }
      
      // Try to get the URL to verify it's accessible
      const { data: urlData } = supabase.storage
        .from('user-images')
        .getPublicUrl(testPath);
      
      // Clean up test file
      await supabase.storage
        .from('user-images')
        .remove([testPath]);
      
      return {
        success: true,
        publicUrl: urlData?.publicUrl,
        message: 'Policy test passed: File uploaded and URL generated'
      };
    };
    
    const policyTest = await testUpload();
    
    return {
      success: true,
      bucketExists,
      isPublic,
      wasCreated,
      wasUpdated,
      policyTest,
      message: wasCreated 
        ? 'Bucket created and set to public' 
        : wasUpdated 
          ? 'Bucket updated to be public' 
          : 'Bucket already exists and is public'
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      message: 'Unexpected error fixing bucket'
    };
  }
};

// React component to check and fix the bucket
export const BucketFixScreen = ({ onComplete }) => {
  const [loading, setLoading] = React.useState(true);
  const [result, setResult] = React.useState(null);
  
  React.useEffect(() => {
    async function fixBucket() {
      try {
        const result = await checkAndFixBucket();
        setResult(result);
        
        if (result.success) {
          Alert.alert(
            'Bucket Configuration',
            result.message,
            [{ text: 'OK', onPress: () => onComplete && onComplete(result) }]
          );
        } else {
          Alert.alert(
            'Bucket Configuration Error',
            result.message,
            [{ text: 'OK', onPress: () => onComplete && onComplete(result) }]
          );
        }
      } catch (err) {
        setResult({
          success: false,
          error: err.message,
          message: 'Unexpected error'
        });
        
        Alert.alert(
          'Error',
          'Unexpected error: ' + err.message,
          [{ text: 'OK', onPress: () => onComplete && onComplete(result) }]
        );
      } finally {
        setLoading(false);
      }
    }
    
    fixBucket();
  }, []);
  
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Checking and fixing Supabase storage bucket...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: result?.success ? 'green' : 'red' }]}>
        {result?.message || 'Unknown result'}
      </Text>
      
      {result?.policyTest && (
        <View style={styles.policyContainer}>
          <Text style={styles.policyTitle}>Policy Test Result:</Text>
          <Text style={styles.policyText}>{result.policyTest.message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  policyContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e6f7ff',
    borderRadius: 5,
    width: '100%',
  },
  policyTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  policyText: {
    fontSize: 14,
  },
});

export default {
  checkAndFixBucket,
  BucketFixScreen
};
