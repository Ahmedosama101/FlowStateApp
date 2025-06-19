import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import BucketHelper from '../lib/BucketHelper';

export default function ImageTester() {
  const [imageUrl, setImageUrl] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [errorInfo, setErrorInfo] = useState('');
  const [loadSuccess, setLoadSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [urlTestResults, setUrlTestResults] = useState(null);

  const testImage = async () => {
    if (!imageUrl) {
      Alert.alert('Error', 'Please enter an image URL');
      return;
    }
    
    setShowImage(true);
    setErrorInfo('');
    setLoadSuccess(false);
    setIsChecking(true);
    
    try {
      // Test the URL validity first
      const urlTest = await BucketHelper.testImageUrl(imageUrl);
      setUrlTestResults(urlTest);
      
      if (!urlTest.success) {
        setErrorInfo(`URL test failed: ${urlTest.message}`);
      }
    } catch (err) {
      setErrorInfo(`Error testing URL: ${err.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleImageError = (error) => {
    console.error('Image loading error:', error.nativeEvent.error);
    setErrorInfo(`Error: ${error.nativeEvent.error}`);
    setLoadSuccess(false);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setErrorInfo('');
    setLoadSuccess(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image URL Tester</Text>
      
      <TextInput
        style={styles.input}
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="Enter Supabase image URL"
        placeholderTextColor="#999"
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={testImage}
        disabled={isChecking}
      >
        <Text style={styles.buttonText}>
          {isChecking ? 'Testing...' : 'Test Image URL'}
        </Text>
      </TouchableOpacity>
      
      {isChecking && <ActivityIndicator size="small" color="#4152c7" />}
      
      {urlTestResults && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultTitle}>URL Test Results:</Text>
          <Text style={urlTestResults.success ? styles.successText : styles.errorText}>
            {urlTestResults.message}
          </Text>
          
          {urlTestResults.status && (
            <Text style={styles.resultDetail}>Status: {urlTestResults.status}</Text>
          )}
          
          {urlTestResults.headers?.contentType && (
            <Text style={styles.resultDetail}>
              Content Type: {urlTestResults.headers.contentType}
            </Text>
          )}
        </View>
      )}
      
      {showImage && (
        <View style={styles.imageContainer}>
          <Text style={styles.label}>Testing URL:</Text>
          <Text style={styles.url}>{imageUrl}</Text>
          
          <Image
            source={{ 
              uri: `${imageUrl}?t=${new Date().getTime()}`,
              headers: { 'Cache-Control': 'no-cache' }
            }}
            style={styles.image}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          
          {errorInfo ? (
            <Text style={styles.errorText}>{errorInfo}</Text>
          ) : loadSuccess ? (
            <Text style={styles.successText}>Image loaded successfully!</Text>
          ) : (
            <Text style={styles.loadingText}>Loading image...</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4152c7',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultDetail: {
    fontSize: 12,
    color: '#666',
    marginVertical: 2,
  },
  imageContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    marginBottom: 5,
  },
  url: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginTop: 5,
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 5,
  },
  loadingText: {
    color: '#2196F3',
    textAlign: 'center',
    marginTop: 5,
  },
});
