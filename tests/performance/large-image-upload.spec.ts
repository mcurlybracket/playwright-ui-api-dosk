import { test, expect } from '@playwright/test';

test.describe('Large Image Upload Performance', () => {
  test('Upload large 360° image (10MB)', async ({ request }) => {
    const startTime = Date.now();
    
    // Create upload session
    const sessionResponse = await request.post('/api/projects/p1/uploads', {
      data: {
        filename: 'large_360_image.jpg',
        size: 10 * 1024 * 1024, // 10MB
        mimeType: 'image/jpeg'
      }
    });
    
    expect(sessionResponse.status()).toBe(201);
    const { sessionId, chunkUrl } = await sessionResponse.json();
    
    // Create large mock image data (10MB)
    const largeImageBuffer = Buffer.alloc(10 * 1024 * 1024, 'A');
    
    // Upload in chunks
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(largeImageBuffer.length / chunkSize);
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, largeImageBuffer.length);
      const chunk = largeImageBuffer.slice(start, end);
      
      const chunkResponse = await request.put(chunkUrl, {
        data: chunk,
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Chunk-Index': i.toString(),
          'X-Total-Chunks': totalChunks.toString()
        }
      });
      
      expect(chunkResponse.status()).toBe(200);
    }
    
    // Finalize upload
    const finalizeResponse = await request.post('/api/projects/p1/finalize', {
      data: { sessionId }
    });
    
    expect(finalizeResponse.status()).toBe(202);
    
    const uploadTime = Date.now() - startTime;
    console.log(`Large image upload completed in ${uploadTime}ms`);
    
    // Performance assertion: should complete within reasonable time
    expect(uploadTime).toBeLessThan(30000); // 30 seconds max
  });

  test('Concurrent large image uploads', async ({ request }) => {
    const uploadPromises = [];
    const numConcurrentUploads = 3;
    
    for (let i = 0; i < numConcurrentUploads; i++) {
      const uploadPromise = (async () => {
        const startTime = Date.now();
        
        // Create session
        const sessionResponse = await request.post('/api/projects/p1/uploads', {
          data: {
            filename: `concurrent_image_${i}.jpg`,
            size: 5 * 1024 * 1024, // 5MB each
            mimeType: 'image/jpeg'
          }
        });
        
        const { sessionId, chunkUrl } = await sessionResponse.json();
        
        // Upload 5MB mock data
        const imageBuffer = Buffer.alloc(5 * 1024 * 1024, `B${i}`);
        const chunkResponse = await request.put(chunkUrl, {
          data: imageBuffer,
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        });
        
        expect(chunkResponse.status()).toBe(200);
        
        // Finalize
        const finalizeResponse = await request.post('/api/projects/p1/finalize', {
          data: { sessionId }
        });
        
        expect(finalizeResponse.status()).toBe(202);
        
        return Date.now() - startTime;
      })();
      
      uploadPromises.push(uploadPromise);
    }
    
    const uploadTimes = await Promise.all(uploadPromises);
    const avgUploadTime = uploadTimes.reduce((a, b) => a + b, 0) / uploadTimes.length;
    
    console.log(`Average concurrent upload time: ${avgUploadTime}ms`);
    
    // All uploads should complete successfully
    expect(uploadTimes).toHaveLength(numConcurrentUploads);
    expect(avgUploadTime).toBeLessThan(20000); // 20 seconds average
  });

  test('Memory usage during large upload', async ({ request }) => {
    const initialMemory = process.memoryUsage();
    
    // Upload multiple large images to test memory usage
    for (let i = 0; i < 5; i++) {
      const sessionResponse = await request.post('/api/projects/p1/uploads', {
        data: {
          filename: `memory_test_${i}.jpg`,
          size: 8 * 1024 * 1024, // 8MB each
          mimeType: 'image/jpeg'
        }
      });
      
      const { sessionId, chunkUrl } = await sessionResponse.json();
      
      // Upload 8MB mock data
      const imageBuffer = Buffer.alloc(8 * 1024 * 1024, `C${i}`);
      await request.put(chunkUrl, {
        data: imageBuffer,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });
      
      await request.post('/api/projects/p1/finalize', {
        data: { sessionId }
      });
    }
    
    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    
    console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    
    // Memory increase should be reasonable (less than 100MB for 5x8MB uploads)
    expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
  });

  test('Upload timeout handling', async ({ request }) => {
    // Test with very large file that might timeout
    const sessionResponse = await request.post('/api/projects/p1/uploads', {
      data: {
        filename: 'huge_image.jpg',
        size: 100 * 1024 * 1024, // 100MB
        mimeType: 'image/jpeg'
      }
    });
    
    expect(sessionResponse.status()).toBe(201);
    const { sessionId, chunkUrl } = await sessionResponse.json();
    
    // Simulate slow upload with timeout
    const slowBuffer = Buffer.alloc(1024 * 1024, 'D'); // 1MB chunk
    
    const startTime = Date.now();
    const chunkResponse = await request.put(chunkUrl, {
      data: slowBuffer,
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Simulate-Slow': 'true' // Mock server can simulate slow response
      },
      timeout: 5000 // 5 second timeout
    });
    
    const uploadTime = Date.now() - startTime;
    
    // Should either complete or timeout gracefully
    if (chunkResponse.status() === 200) {
      expect(uploadTime).toBeLessThan(10000); // Should complete within 10s
    } else {
      expect(chunkResponse.status()).toBe(408); // Timeout status
    }
  });
});
