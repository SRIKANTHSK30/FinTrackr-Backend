# Contributing to FinTrackr Backend

Thank you for your interest in contributing to FinTrackr! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ LTS
- PostgreSQL 15+
- Redis 7+
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/fintrackr-backend.git
   cd fintrackr-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📝 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Write self-documenting code with clear comments
- Keep functions small and focused

### Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add transaction filtering by date range
fix: resolve authentication token expiration issue
docs: update API documentation for new endpoints
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for all new functionality
- Aim for high test coverage
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

Example test structure:
```typescript
describe('Feature Name', () => {
  describe('Method Name', () => {
    it('should handle success case', async () => {
      // Test implementation
    });

    it('should handle error case', async () => {
      // Test implementation
    });
  });
});
```

## 📚 API Development

### Adding New Endpoints

1. **Create the controller function**
   ```typescript
   // src/controllers/featureController.ts
   export const createFeature = async (req: Request, res: Response): Promise<void> => {
     // Implementation
   };
   ```

2. **Add validation middleware**
   ```typescript
   // src/middleware/validation.ts
   export const validateFeature = [
     body('field').isString().notEmpty(),
     handleValidationErrors
   ];
   ```

3. **Create the route**
   ```typescript
   // src/routes/features.ts
   router.post('/', validateFeature, createFeature);
   ```

4. **Add to main routes**
   ```typescript
   // src/routes/index.ts
   router.use('/features', featureRoutes);
   ```

### Database Changes

1. **Update Prisma schema**
   ```prisma
   // prisma/schema.prisma
   model NewModel {
     id String @id @default(uuid())
     // fields
   }
   ```

2. **Create migration**
   ```bash
   npm run db:migrate
   ```

3. **Update seed data if needed**
   ```typescript
   // prisma/seed.ts
   // Add new seed data
   ```

## 🔍 Code Review Process

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] All tests pass
- [ ] New functionality is tested
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Environment variables are properly handled

### Review Checklist

- [ ] Code is readable and well-documented
- [ ] Logic is correct and efficient
- [ ] Error handling is appropriate
- [ ] Security considerations are addressed
- [ ] Performance implications are considered
- [ ] Tests are comprehensive

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to reproduce**: Detailed steps to reproduce the bug
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Environment**: OS, Node.js version, etc.
6. **Screenshots**: If applicable

## 💡 Feature Requests

When suggesting features, please include:

1. **Description**: Clear description of the feature
2. **Use case**: Why this feature would be useful
3. **Implementation ideas**: If you have any ideas about implementation
4. **Alternatives**: Any alternative solutions you've considered

## 📖 Documentation

### API Documentation

- Update Swagger/OpenAPI documentation for new endpoints
- Include request/response examples
- Document any new environment variables
- Update the README if needed

### Code Documentation

- Add JSDoc comments for public functions
- Include inline comments for complex logic
- Update type definitions

## 🚀 Release Process

1. **Version bumping**: Update version in package.json
2. **Changelog**: Update CHANGELOG.md
3. **Tagging**: Create a git tag for the release
4. **Deployment**: Deploy to production

## 📞 Getting Help

- **Discord**: Join our Discord server
- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the maintainers

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to FinTrackr! 🎉
