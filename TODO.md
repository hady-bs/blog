# TODO: Convert Express Blog to API for React Native while keeping Web Views

## Current Status

- App has both web views (Jade) and API responses (JSON based on headers)
- JWT authentication in place
- Basic CRUD for blogs and users

## Plan

1. **Add CORS Support**: Enable cross-origin requests for React Native app
2. **Enhance API Endpoints**: Ensure all routes return JSON for API calls, keep views for web
3. **Add Missing API Endpoints**: Add full CRUD for blogs (get single, update, delete), user profile API
4. **Update Controllers**: Ensure consistent JSON responses for API requests
5. **Test API**: Verify endpoints work for mobile consumption

## Steps

- [x] Install cors package
- [x] Add CORS middleware to app.js
- [x] Modify routes/blogs.js to add GET /:id, PUT /:id, DELETE /:id
- [x] Modify routes/users.js to add GET /profile API endpoint
- [x] Update BlogController.js for new endpoints
- [x] Update UserController.js for profile API
- [x] Separate web and API routes with clear logic
- [ ] Test API endpoints with curl or Postman
