// StoragePolicyHelper.js - Utility to help diagnose Supabase Storage policy issues
import { supabase } from './supabase';

// Helper function to get a readable policy description
const formatPolicy = (policy) => {
  if (!policy) return 'No policy defined';
  
  try {
    // Try to format the policy definition in a readable way
    const definition = typeof policy.definition === 'string' 
      ? JSON.parse(policy.definition) 
      : policy.definition;
      
    return {
      name: policy.name,
      id: policy.id,
      definition: {
        roles: definition.roles || [],
        predicate: definition.predicate || '',
        operations: definition.operations || []
      }
    };
  } catch (err) {
    return {
      name: policy.name,
      id: policy.id,
      definition: policy.definition
    };
  }
};

// Main API for policy checking
export const StoragePolicyHelper = {
  // Get a summary of all storage buckets and their policies
  async getBucketPolicySummary() {
    try {
      // List all buckets
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        return {
          success: false,
          error: bucketError.message,
          data: null
        };
      }
      
      if (!buckets || buckets.length === 0) {
        return {
          success: true,
          data: {
            bucketCount: 0,
            buckets: []
          }
        };
      }
      
      // Create a simplified summary of the buckets and their policies
      const bucketSummaries = buckets.map(bucket => ({
        name: bucket.name,
        id: bucket.id,
        public: bucket.public,
        createdAt: bucket.created_at,
        policies: [] // To be filled below
      }));
      
      return {
        success: true,
        data: {
          bucketCount: buckets.length,
          buckets: bucketSummaries
        }
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        data: null
      };
    }
  },
  
  // Run diagnostic tests for the user-images bucket specifically
  async testUserImagesBucket(userId) {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'No user ID provided',
          data: null
        };
      }
      
      const bucketName = 'user-images';
      const results = {
        bucketExists: false,
        canList: false,
        canUpload: false,
        canDownload: false,
        canDelete: false,
        errors: []
      };
      
      // Check if the bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        results.errors.push({
          operation: 'listBuckets',
          message: bucketError.message
        });
        return {
          success: false,
          error: 'Failed to list buckets',
          data: results
        };
      }
      
      const bucket = buckets.find(b => b.name === bucketName);
      results.bucketExists = !!bucket;
      
      if (!bucket) {
        results.errors.push({
          operation: 'findBucket',
          message: `Bucket ${bucketName} does not exist`
        });
        return {
          success: false,
          error: `Bucket ${bucketName} not found`,
          data: results
        };
      }
      
      // Test listing files
      const { data: listData, error: listError } = await supabase.storage
        .from(bucketName)
        .list(userId, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      results.canList = !listError;
      if (listError) {
        results.errors.push({
          operation: 'list',
          message: listError.message
        });
      }
      
      // Test upload permission with a small test file
      const testBlob = new Blob(['test content'], { type: 'text/plain' });
      const testPath = `${userId}/test_${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(testPath, testBlob, { upsert: true });
      
      results.canUpload = !uploadError;
      if (uploadError) {
        results.errors.push({
          operation: 'upload',
          message: uploadError.message
        });
      } else {
        // If upload succeeded, test download
        const { data: downloadData, error: downloadError } = await supabase.storage
          .from(bucketName)
          .download(testPath);
        
        results.canDownload = !downloadError;
        if (downloadError) {
          results.errors.push({
            operation: 'download',
            message: downloadError.message
          });
        }
        
        // Test delete permission
        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove([testPath]);
        
        results.canDelete = !deleteError;
        if (deleteError) {
          results.errors.push({
            operation: 'delete',
            message: deleteError.message
          });
        }
      }
      
      return {
        success: results.errors.length === 0,
        error: results.errors.length > 0 ? 'Some operations failed' : null,
        data: results
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        data: null
      };
    }
  },
  
  // Recommended RLS policy for user-images bucket
  getRecommendedPolicy() {
    return {
      select: `
CREATE POLICY "Allow users to view their own folder" ON storage.objects
  FOR SELECT
  USING (auth.uid()::text = (storage.foldername(name))[1]);
      `,
      insert: `
CREATE POLICY "Allow users to upload to their own folder" ON storage.objects
  FOR INSERT
  WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
      `,
      update: `
CREATE POLICY "Allow users to update their own files" ON storage.objects
  FOR UPDATE
  USING (auth.uid()::text = (storage.foldername(name))[1]);
      `,
      delete: `
CREATE POLICY "Allow users to delete their own files" ON storage.objects
  FOR DELETE
  USING (auth.uid()::text = (storage.foldername(name))[1]);
      `,
      permissive: `
-- More permissive policy for testing
CREATE POLICY "Allow authenticated users to manage all files" ON storage.objects
  FOR ALL
  USING (auth.role() = 'authenticated');
      `
    };
  }
};

export default StoragePolicyHelper;
