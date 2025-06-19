// Test utility for checking Supabase storage permissions
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { StoragePolicyHelper } from '../lib/StoragePolicyHelper';
import ImageTester from '../components/ImageTester';
import { BucketFixScreen, checkAndFixBucket } from '../lib/FixBucketHelper';

export default function SupabaseTestScreen({ navigation }) {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [policies, setPolicies] = useState(null);

  useEffect(() => {
    // Get user ID on component mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        addResult('Auth Check', true, `Authenticated as user: ${user.id}`);
      } else {
        setUserId(null);
        addResult('Auth Check', false, 'Not authenticated');
      }
    } catch (err) {
      addResult('Auth Check', false, `Error: ${err.message}`);
    }
  };

  const addResult = (name, success, message) => {
    setTestResults(prev => [...prev, { name, success, message, timestamp: new Date().toISOString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testAuthSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        addResult('Auth Session', false, `Error: ${error.message}`);
        return null;
      }
      
      addResult('Auth Session', true, `Session valid: ${!!data.session}, User ID: ${data.session?.user?.id || 'None'}`);
      return data.session?.user?.id;
    } catch (err) {
      addResult('Auth Session', false, `Exception: ${err.message}`);
      return null;
    }
  };

  const testStorageBuckets = async () => {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) {
        addResult('List Buckets', false, `Error: ${error.message}`);
        return;
      }
      
      const buckets = data.map(b => b.name).join(', ');
      addResult('List Buckets', true, `Found buckets: ${buckets}`);
      
      // Check if our bucket exists
      const userImagesBucket = data.find(b => b.name === 'user-images');
      if (!userImagesBucket) {
        addResult('Bucket Check', false, `'user-images' bucket not found!`);
      } else {
        addResult('Bucket Check', true, `'user-images' bucket exists`);
      }
    } catch (err) {
      addResult('List Buckets', false, `Exception: ${err.message}`);
    }
  };

  const testStoragePermissions = async (userId) => {
    if (!userId) {
      addResult('Storage Permissions', false, 'No user ID available for testing');
      return;
    }
    
    try {
      const result = await StoragePolicyHelper.testUserImagesBucket(userId);
      
      if (!result.success) {
        addResult('Storage Test', false, `Error: ${result.error}`);
        return;
      }
      
      const data = result.data;
      
      addResult('Bucket Exists', data.bucketExists, 
        data.bucketExists ? 'user-images bucket exists' : 'user-images bucket not found');
      
      addResult('List Permission', data.canList, 
        data.canList ? 'Can list files in bucket' : 'Cannot list files in bucket');
      
      addResult('Upload Permission', data.canUpload, 
        data.canUpload ? 'Can upload files to bucket' : 'Cannot upload files to bucket');
      
      addResult('Download Permission', data.canDownload, 
        data.canDownload ? 'Can download files from bucket' : 'Cannot download files from bucket');
      
      addResult('Delete Permission', data.canDelete, 
        data.canDelete ? 'Can delete files from bucket' : 'Cannot delete files from bucket');
      
      if (data.errors.length > 0) {
        data.errors.forEach(err => {
          addResult(`Error: ${err.operation}`, false, err.message);
        });
      }
    } catch (err) {
      addResult('Storage Permissions', false, `Exception: ${err.message}`);
    }
  };

  const testProfileImagesTable = async (userId) => {
    if (!userId) {
      addResult('Profile Images Table', false, 'No user ID available for testing');
      return;
    }
    
    try {
      // Test querying the profile_images table
      const { data: queryData, error: queryError } = await supabase
        .from('profile_images')
        .select('*')
        .eq('profile_id', userId);
        
      if (queryError) {
        addResult('Query Images', false, `Error: ${queryError.message}`);
      } else {
        const imageCount = queryData.length;
        addResult('Query Images', true, `Found ${imageCount} profile images for user`);
      }
      
      // Test inserting a test record
      const testUrl = `https://example.com/test_${Date.now()}.jpg`;
      const { data: insertData, error: insertError } = await supabase
        .from('profile_images')
        .insert({
          profile_id: userId,
          image_url: testUrl,
          is_primary: false,
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (insertError) {
        addResult('Insert Test', false, `Error: ${insertError.message}`);
      } else {
        addResult('Insert Test', true, 'Successfully inserted test record');
        
        // Test updating the record
        const recordId = insertData[0].id;
        const { error: updateError } = await supabase
          .from('profile_images')
          .update({ is_primary: true })
          .eq('id', recordId);
          
        if (updateError) {
          addResult('Update Test', false, `Error: ${updateError.message}`);
        } else {
          addResult('Update Test', true, 'Successfully updated test record');
        }
        
        // Test deleting the record
        const { error: deleteError } = await supabase
          .from('profile_images')
          .delete()
          .eq('id', recordId);
          
        if (deleteError) {
          addResult('Delete Test', false, `Error: ${deleteError.message}`);
        } else {
          addResult('Delete Test', true, 'Successfully deleted test record');
        }
      }
    } catch (err) {
      addResult('Profile Images Table', false, `Exception: ${err.message}`);
    }
  };

  const getBucketPolicies = async () => {
    try {
      const result = await StoragePolicyHelper.getBucketPolicySummary();
      
      if (!result.success) {
        addResult('Bucket Policies', false, `Error: ${result.error}`);
        return;
      }
      
      const data = result.data;
      setPolicies(data);
      
      addResult('Bucket Policies', true, `Found ${data.bucketCount} buckets`);
      
      data.buckets.forEach(bucket => {
        addResult(`Bucket: ${bucket.name}`, true, `Public: ${bucket.public ? 'Yes' : 'No'}`);
      });
    } catch (err) {
      addResult('Bucket Policies', false, `Exception: ${err.message}`);
    }
  };

  const showRecommendedPolicies = () => {
    const policies = StoragePolicyHelper.getRecommendedPolicy();
    Alert.alert(
      'Recommended Storage Policies',
      'Here are the recommended Supabase SQL policies to configure in the Supabase dashboard:',
      [
        {
          text: 'Close',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
    
    // Add each policy to the results for reference
    addResult('Recommended Policy: SELECT', true, policies.select.trim());
    addResult('Recommended Policy: INSERT', true, policies.insert.trim());
    addResult('Recommended Policy: UPDATE', true, policies.update.trim());
    addResult('Recommended Policy: DELETE', true, policies.delete.trim());
    addResult('Permissive Policy (Testing)', true, policies.permissive.trim());
  };

  const runAllTests = async () => {
    setIsLoading(true);
    clearResults();
    
    addResult('Test Suite', true, 'Starting tests...');
    const userId = await testAuthSession();
    await testStorageBuckets();
    await testStoragePermissions(userId);
    await testProfileImagesTable(userId);
    await getBucketPolicies();
    addResult('Test Suite', true, 'Tests completed!');
    
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Supabase Storage Tests</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.disabledButton]} 
          onPress={runAllTests} 
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Run All Tests</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton, isLoading && styles.disabledButton]} 
          onPress={clearResults} 
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.button, styles.infoButton]} 
        onPress={showRecommendedPolicies}
      >        <Text style={styles.infoButtonText}>Show Recommended Policies</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.fixButton]} 
        onPress={async () => {
          setIsLoading(true);
          try {
            const result = await checkAndFixBucket();
            addResult('Fix Bucket', result.success, result.message);
            if (result.policyTest) {
              addResult('Policy Test', result.policyTest.success, result.policyTest.message);
            }
            Alert.alert('Bucket Fix', result.message);
          } catch (err) {
            addResult('Fix Bucket', false, `Error: ${err.message}`);
          } finally {
            setIsLoading(false);
          }
        }}
      >
        <Text style={styles.fixButtonText}>Make Bucket Public (Fix Image Display)</Text>
      </TouchableOpacity>
      
      <ImageTester />
      
      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => (
          <View 
            key={index} 
            style={[
              styles.resultItem, 
              result.success ? styles.successItem : styles.errorItem
            ]}
          >
            <Text style={styles.resultName}>{result.name}</Text>
            <Text style={styles.resultMessage}>{result.message}</Text>
            <Text style={styles.timestamp}>{result.timestamp}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4152c7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
  },
  infoButton: {
    backgroundColor: '#e6f7ff',
    borderWidth: 1,
    borderColor: '#91d5ff',
    marginBottom: 15,
  },  infoButtonText: {
    color: '#1890ff',
    fontSize: 16,
    fontWeight: '600',
  },
  fixButton: {
    backgroundColor: '#ffe58f',
    borderWidth: 1,
    borderColor: '#faad14',
    marginBottom: 15,
  },
  fixButtonText: {
    color: '#8c6c04',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  successItem: {
    backgroundColor: '#e6f7e6',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  errorItem: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultMessage: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});
