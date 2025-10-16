# Training Platform Deployment Guide

## Architecture Overview

The Training Platform uses a clean architecture with separate frontend and backend:

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Spring Boot 3.2 with MongoDB
- **Database**: MongoDB 7+
- **Authentication**: JWT with Spring Security
- **Real-time**: WebSocket/Socket.IO

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd training-platform
```

### 2. Environment Configuration
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your settings

# Frontend environment
cd ..
cp .env.example .env
# Edit .env with your settings
```

### 3. Start with Docker
```bash
cd backend
docker-compose up --build
```

This will start:
- MongoDB on port 27017
- Spring Boot API on port 8080
- Next.js frontend on port 3000

## Manual Setup

### Backend Setup (Spring Boot)

#### Prerequisites
- Java 17+
- Maven 3.6+
- MongoDB 7+

#### Steps
1. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7
   
   # Or start local MongoDB service
   sudo systemctl start mongod
   ```

2. **Configure Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env file with your MongoDB connection string
   ```

3. **Build and Run**
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

The API will be available at `http://localhost:8080`

### Frontend Setup (Next.js)

#### Prerequisites
- Node.js 18+
- npm or yarn

#### Steps
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## Production Deployment

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Configure network access and database user
3. Get connection string
4. Update environment variables

### Backend Deployment

#### Option 1: Docker
```bash
cd backend
docker build -t training-platform-api .
docker run -p 8080:8080 \
  -e MONGODB_URI="your_mongodb_connection_string" \
  -e JWT_SECRET="your_jwt_secret" \
  training-platform-api
```

#### Option 2: JAR Deployment
```bash
cd backend
./mvnw clean package -DskipTests
java -jar target/training-platform-api-1.0.0.jar
```

#### Option 3: Cloud Deployment
- **AWS**: Use Elastic Beanstalk or ECS
- **Google Cloud**: Use App Engine or Cloud Run
- **Azure**: Use App Service or Container Instances

### Frontend Deployment

#### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

#### Option 2: Docker
```bash
# Build
npm run build

# Create Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next ./.next
COPY public ./public
EXPOSE 3000
CMD ["npm", "start"]

# Build and run
docker build -t training-platform-frontend .
docker run -p 3000:3000 training-platform-frontend
```

#### Option 3: Static Export
```bash
npm run build
npm run export
# Deploy the 'out' directory to any static hosting
```

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/training_platform
JWT_SECRET=your_jwt_secret_here_make_it_long_and_secure
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
MONGODB_URI=mongodb://localhost:27017/training_platform
JWT_SECRET=your_jwt_secret_here
```

## Security Configuration

### JWT Security
- Use strong, unique JWT secrets (256-bit minimum)
- Set appropriate token expiration times
- Implement token refresh mechanism
- Store tokens securely on client side

### MongoDB Security
- Enable authentication
- Use strong passwords
- Configure network access rules
- Enable SSL/TLS for production
- Regular security updates

### API Security
- Enable CORS with specific origins
- Implement rate limiting
- Validate all inputs
- Use HTTPS in production
- Regular security audits

## Monitoring and Logging

### Application Monitoring
- Spring Boot Actuator endpoints
- Custom health checks
- Performance metrics
- Error tracking

### Database Monitoring
- MongoDB Atlas monitoring (if using Atlas)
- Connection pool monitoring
- Query performance analysis
- Storage usage tracking

### Log Management
- Structured logging with JSON format
- Log aggregation (ELK stack or similar)
- Error alerting
- Performance monitoring

## Scaling Considerations

### Horizontal Scaling
- Load balancer for API instances
- MongoDB replica sets
- CDN for static assets
- Microservices architecture for large scale

### Performance Optimization
- Database indexing strategy
- Caching layer (Redis)
- API response optimization
- Frontend code splitting

## Backup and Recovery

### Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/training_platform" --out=backup/

# Restore
mongorestore --uri="mongodb://localhost:27017/training_platform" backup/training_platform/
```

### File Storage Backup
- Regular backup of uploads directory
- Version control for configuration files
- Automated backup scheduling

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB service status
   - Verify connection string
   - Check network connectivity

2. **JWT Token Issues**
   - Verify JWT secret configuration
   - Check token expiration
   - Validate token format

3. **CORS Errors**
   - Configure CORS origins
   - Check request headers
   - Verify API endpoints

4. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions
   - Check disk space

### Health Checks
- API: `GET /api/actuator/health`
- Database: `GET /api/actuator/health/mongo`
- Frontend: Check console for errors

## Support

For deployment support:
- Check logs: `docker-compose logs`
- Monitor health endpoints
- Review configuration files
- Contact technical support