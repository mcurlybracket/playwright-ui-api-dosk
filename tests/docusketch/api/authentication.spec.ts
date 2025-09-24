import { test, expect } from '@playwright/test';

test.describe('Authentication API', () => {
  test('Login with valid credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'password123'
      }
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(body).toHaveProperty('user');
    expect(body.user.email).toBe('test@example.com');
    expect(body.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
  });

  test('Login with invalid credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      }
    });
    
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Invalid credentials');
  });

  test('Login with missing fields', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'test@example.com'
        // missing password
      }
    });
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Missing required fields');
  });

  test('Refresh token', async ({ request }) => {
    // First login
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'password123'
      }
    });
    
    const { token } = await loginResponse.json();
    
    // Refresh token
    const refreshResponse = await request.post('/api/auth/refresh', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    expect(refreshResponse.status()).toBe(200);
    const body = await refreshResponse.json();
    expect(body).toHaveProperty('token');
    expect(body.token).not.toBe(token); // Should be a new token
  });

  test('Logout', async ({ request }) => {
    // Login first
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'password123'
      }
    });
    
    const { token } = await loginResponse.json();
    
    // Logout
    const logoutResponse = await request.post('/api/auth/logout', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    expect(logoutResponse.status()).toBe(200);
    
    // Verify token is invalidated
    const protectedResponse = await request.get('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    expect(protectedResponse.status()).toBe(401);
  });
});
