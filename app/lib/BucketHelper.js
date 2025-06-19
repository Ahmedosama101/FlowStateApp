import { supabase } from './supabase';

export const BucketHelper = {
  /**
   * Check if a bucket is publicly accessible
   * @param {string} bucketName - The name of the bucket to check
   * @returns {Promise<object>} - Result with bucket info and access status
   */
  async checkBucketAccess(bucketName) {
    try {
      // Get bucket info first
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        return { 
          success: false, 
          error: bucketsError.message, 
          bucketExists: false,
          isPublic: false 
        };
      }
      
      const bucket = buckets.find(b => b.name === bucketName);
      
      if (!bucket) {
        return { 
          success: true, 
          bucketExists: false,
          isPublic: false,
          message: `Bucket '${bucketName}' does not exist` 
        };
      }
      
      return {
        success: true,
        bucketExists: true,
        isPublic: bucket.public,
        bucket: bucket,
        message: bucket.public 
          ? `Bucket '${bucketName}' is publicly accessible` 
          : `Bucket '${bucketName}' is NOT publicly accessible`
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
  
  /**
   * Make a bucket public or private
   * @param {string} bucketName - The name of the bucket
   * @param {boolean} makePublic - Whether to make the bucket public (true) or private (false)
   * @returns {Promise<object>} - Result of the operation
   */
  async setBucketPublic(bucketName, makePublic) {
    try {
      const { data, error } = await supabase.storage.updateBucket(
        bucketName, 
        { public: makePublic }
      );
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return {
        success: true,
        bucket: data,
        message: makePublic
          ? `Bucket '${bucketName}' is now publicly accessible`
          : `Bucket '${bucketName}' is now private`
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
  
  /**
   * Test image URL validity by trying to fetch the headers
   * @param {string} imageUrl - The image URL to test
   * @returns {Promise<object>} - Result with status and headers
   */
  async testImageUrl(imageUrl) {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      
      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: {
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length'),
          cacheControl: response.headers.get('cache-control')
        },
        message: response.ok 
          ? `Image URL is valid (status: ${response.status})`
          : `Image URL is invalid (status: ${response.status} - ${response.statusText})`
      };
    } catch (err) {
      return { 
        success: false, 
        error: err.message,
        message: `Failed to fetch image: ${err.message}`
      };
    }
  }
};

export default BucketHelper;
