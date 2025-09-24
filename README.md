# Playwright UI + API Tests for DocuSketch/Immoviewer

A runnable testing project that combines Playwright UI and API tests with a mock server for DocuSketch/Immoviewer functionality.

## Quick Start

```bash
# Install dependencies
npm ci

# Run mock server and tests together
npm run dev:test

# Or run them separately:
# Terminal 1: Start mock server
npm run mock:serve

# Terminal 2: Run tests
npm test
```

## Project Structure

```
├── mockapp/
│   ├── server.ts          # Express mock server (TypeScript)
│   ├── server.js          # Express mock server (JavaScript for CI)
│   └── public/
│       ├── tour.html      # Immoviewer-like tour page
│       └── project.html   # DocuSketch-like project page
├── tests/
│   ├── immoviewer/ui/     # UI tests for tour functionality
│   └── docusketch/api/    # API tests for upload workflows
├── playwright.config.ts   # Playwright configuration
└── package.json
```

## Mock Server Endpoints

### Immoviewer-like endpoints:
- `GET /api/tours/:id` - Get tour details
- `GET /api/tours` - List tours
- `POST /api/leads` - Submit lead form
- `POST /api/tours/:id/publish` - Publish tour

### DocuSketch-like endpoints:
- `POST /api/projects/:id/uploads` - Start upload session
- `PUT /api/chunk/:sid` - Upload chunk
- `POST /api/projects/:id/finalize` - Finalize upload
- `GET /api/projects/:id/status` - Check processing status
- `GET /api/projects/:id/floorplan` - Get floorplan data

## Tests

### UI Tests
- **Tour Load Test**: Tests tour page loading and lead form submission
- **Tour Creation Test**: Tests complete tour creation workflow with validation
- **Floor Plan Generation Test**: Tests AI-powered floor plan creation
- **Tour Sharing Test**: Tests sharing via public links and email with custom settings
- Uses `data-test` selectors for reliable element targeting
- Tests form validation and API integration

### API Tests
- **Authentication Test**: Tests login, logout, token refresh, and protected routes
- **Tour CRUD Test**: Tests create, read, update, delete, and analytics for tours
- **Upload Session Test**: Tests complete upload workflow
- Tests session creation → chunk upload → finalization → status polling
- Demonstrates API testing patterns with request context

### Performance Tests
- **Large Image Upload Test**: Tests 10MB+ image uploads with performance metrics
- **Concurrent Upload Test**: Tests multiple simultaneous uploads
- **Memory Usage Test**: Monitors memory consumption during large uploads
- **Timeout Handling Test**: Tests graceful handling of slow uploads

## Switching to Real Environment

To test against real DocuSketch/Immoviewer APIs:

1. Set environment variables:
   ```bash
   export UI_BASE_URL="https://your-staging-url.com"
   export API_BASE_URL="https://your-api-url.com"
   ```

2. Update `playwright.config.ts` to disable webServer when using real URLs

3. Add authentication headers/tokens as needed

## Scripts

- `npm run mock:serve` - Start mock server only (TypeScript version)
- `npm run mock:serve:ci` - Start mock server for CI (JavaScript version)
- `npm run dev:test` - Start mock server and run all tests
- `npm test` - Run all tests (assumes mock server is running)
- `npm run test:ui` - Run tests with Playwright UI
- `npm run test:headed` - Run tests in headed mode
- `npm run test:api` - Run only API tests
- `npm run test:immoviewer` - Run only Immoviewer UI tests
- `npm run test:performance` - Run only performance tests
