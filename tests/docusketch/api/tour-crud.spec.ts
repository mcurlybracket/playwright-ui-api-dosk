import { test, expect } from '@playwright/test';

test.describe('Tour CRUD Operations', () => {
  let authToken: string;

  test.beforeEach(async ({ request }) => {
    // Login to get auth token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'password123'
      }
    });
    
    const { token } = await loginResponse.json();
    authToken = token;
  });

  test('Create new tour', async ({ request }) => {
    const tourData = {
      title: 'Luxury Downtown Loft',
      description: 'Beautiful 3-bedroom loft with city views',
      propertyType: 'residential',
      address: '123 Main St, New York, NY',
      price: 2500000,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800
    };

    const response = await request.post('/api/tours', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: tourData
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.title).toBe(tourData.title);
    expect(body.status).toBe('draft');
  });

  test('Get tour by ID', async ({ request }) => {
    const response = await request.get('/api/tours/t2', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id', 't2');
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('scenes');
    expect(Array.isArray(body.scenes)).toBe(true);
  });

  test('Update tour', async ({ request }) => {
    const updateData = {
      title: 'Updated Luxury Loft',
      description: 'Updated description with more details'
    };

    const response = await request.put('/api/tours/t2', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      data: updateData
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.title).toBe(updateData.title);
    expect(body.description).toBe(updateData.description);
  });

  test('List user tours', async ({ request }) => {
    const response = await request.get('/api/tours', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body).toHaveProperty('page');
    expect(body).toHaveProperty('per_page');
    expect(body).toHaveProperty('total');
  });

  test('Delete tour', async ({ request }) => {
    const response = await request.delete('/api/tours/t1', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(204);

    // Verify tour is deleted
    const getResponse = await request.get('/api/tours/t1', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(getResponse.status()).toBe(404);
  });

  test('Publish tour', async ({ request }) => {
    const response = await request.post('/api/tours/t2/publish', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(202);
    const body = await response.json();
    expect(body).toHaveProperty('status', 'queued');
    expect(body).toHaveProperty('publishUrl');
  });

  test('Get tour analytics', async ({ request }) => {
    const response = await request.get('/api/tours/t2/analytics', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('views');
    expect(body).toHaveProperty('uniqueVisitors');
    expect(body).toHaveProperty('avgTimeOnTour');
    expect(body).toHaveProperty('conversionRate');
  });
});
