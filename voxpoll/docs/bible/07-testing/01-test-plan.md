# Test Plan & Strategy

> VoxPoll Testing Framework
> NyoWorks Testing Standards
> Last Updated: 2026-01-29

---

## Testing Philosophy

**Goals:**
1. **Bible Compliance**: Every Bible rule (P-xxx, T-xxx) must have test coverage
2. **Regression Prevention**: All bug fixes must include regression tests
3. **Continuous Integration**: All tests run on every commit
4. **Coverage Target**: >80% code coverage, 100% critical path coverage

---

## Test Pyramid

```
           ╱╲
          ╱  ╲
         ╱ E2E ╲         10% - End-to-End (Playwright)
        ╱────────╲
       ╱          ╲
      ╱ Integration╲     30% - Integration (API + DB)
     ╱──────────────╲
    ╱                ╲
   ╱  Unit Tests      ╲   60% - Unit (Services, Utils)
  ╱────────────────────╲
```

**Distribution:**
- **Unit Tests**: 60% (Fast, isolated, pure logic)
- **Integration Tests**: 30% (API + DB, realistic scenarios)
- **E2E Tests**: 10% (Critical user flows only)

---

## Test Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Unit Tests** | Vitest | Service logic, utilities, helpers |
| **Integration Tests** | Vitest + Testcontainers | API endpoints + real database |
| **E2E Tests** | Playwright | Critical user flows (web + mobile) |
| **Component Tests** | Vitest + Testing Library | React components |
| **API Tests** | Supertest + Vitest | REST API endpoint validation |
| **Load Tests** | k6 | Performance & scalability |
| **Security Tests** | OWASP ZAP | Vulnerability scanning |

---

## Test Categories

### 1. Unit Tests (60%)

**Location**: `packages/*/src/**/*.test.ts` (co-located with source)

**Scope:**
- Service methods (business logic)
- Utility functions
- Helpers
- Validators
- Pure functions

**Standards:**
- AAA pattern (Arrange, Act, Assert)
- One assertion per test (when possible)
- Descriptive test names
- No external dependencies (mocked)

**Example:**
```typescript
// packages/api/src/services/poll.service.test.ts

describe('PollService', () => {
  describe('createPoll', () => {
    it('should create poll with valid input', async () => {
      // Arrange
      const input = { title: 'Test Poll', options: ['A', 'B'] }

      // Act
      const poll = await pollService.createPoll(input)

      // Assert
      expect(poll.id).toBeDefined()
      expect(poll.title).toBe('Test Poll')
    })

    it('should throw error if title < 10 chars', async () => {
      // Arrange
      const input = { title: 'Short', options: ['A', 'B'] }

      // Act & Assert
      await expect(pollService.createPoll(input)).rejects.toThrow('Title too short')
    })
  })
})
```

---

### 2. Integration Tests (30%)

**Location**: `packages/api/src/test/*.integration.test.ts`

**Scope:**
- API endpoints (full request/response cycle)
- Database interactions
- Authentication flows
- Rate limiting
- Multi-service interactions

**Standards:**
- Use Testcontainers for real database
- Clean database state before each test
- Test both success and error cases
- Verify database state changes

**Example:**
```typescript
// packages/api/src/test/polls.integration.test.ts

describe('POST /polls', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  it('should create poll when authenticated', async () => {
    // Arrange
    const token = await getAuthToken()

    // Act
    const response = await request(app)
      .post('/api/polls')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Poll',
        options: [{ text: 'A' }, { text: 'B' }]
      })

    // Assert
    expect(response.status).toBe(201)
    expect(response.body.id).toBeDefined()

    // Verify database
    const poll = await db.query.polls.findFirst({
      where: eq(polls.id, response.body.id)
    })
    expect(poll).toBeDefined()
  })
})
```

---

### 3. E2E Tests (10%)

**Location**: `tests/e2e/*.spec.ts`

**Scope:**
- Critical user flows only
- Authentication flow
- Poll creation → voting → results
- Payment flow
- User registration → verification

**Standards:**
- Use Playwright for browser automation
- Test on multiple browsers (Chrome, Firefox, Safari)
- Mobile viewport testing
- Accessibility checks (aria labels)

**Example:**
```typescript
// tests/e2e/poll-flow.spec.ts

test('user can create poll and vote', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[name=email]', 'user@test.com')
  await page.fill('[name=password]', 'password')
  await page.click('button[type=submit]')

  // Create poll
  await page.goto('/polls/create')
  await page.fill('[name=title]', 'Favorite Color?')
  await page.fill('[name=options.0]', 'Red')
  await page.fill('[name=options.1]', 'Blue')
  await page.click('button[type=submit]')

  // Vote on poll
  await page.click('text=Red')
  await page.click('button:has-text("Vote")')

  // Verify results
  await expect(page.locator('text=1 vote')).toBeVisible()
})
```

---

## Bible Compliance Testing

**Reference**: Active claim TASK-005 (Claude TESTER 1)

### P0 Security Test Suites (8 suites, ~180 tests)

| Suite | Bible Ref | Coverage | Priority |
|-------|-----------|----------|----------|
| 1. Authentication | P-001, P-002 | Login, register, 2FA, session management | P0 |
| 2. Authorization/RBAC | P-004 | Role checks, permission matrix validation | P0 |
| 3. Rate Limiting | P-058 | All rate limits, progressive lockout, backoff | P0 |
| 4. Device Fingerprinting | P-057 | Hash generation, fraud detection, privacy | P0 |
| 5. Error Sanitization | P-059 | Generic errors, no timing leaks, no enumeration | P0 |
| 6. Fraud Detection | P-057 | Separate salt, hash unlinkability | P0 |
| 7. OTP Verification | P-058 | Rate limits, exponential backoff | P0 |
| 8. Session Management | - | Token rotation, logout, expiry | P0 |

### P1 Core Feature Test Suites (12 suites, ~250 tests)

| Suite | Bible Ref | Coverage | Priority |
|-------|-----------|----------|----------|
| 1. Poll Creation | P-001 | Single question, options, validation | P1 |
| 2. Poll Voting | P-058 | 1 vote/poll, rate limits | P1 |
| 3. Poll Results | P-003 | Reliability scoring calculation | P1 |
| 4. Survey Creation | - | Multi-section, question types | P1 |
| 5. Pre-test Flow | P-007, P-030 | 3 attempts/24h, device tracking | P1 |
| 6. Live Poll | P-058 | Join limits, code validation, backoff | P1 |
| 7. Reliability Scoring | T-009 | Formula validation (35% + 30% + 20% + 15%) | P1 |
| 8. User Profile | P-004 | Verification levels, profile updates | P1 |
| 9. Notifications | - | Email, push, preferences | P1 |
| 10. Analytics | - | Poll stats, demographics | P1 |
| 11. Payments | P-058 | Free (3/day), Premium (unlimited) | P1 |
| 12. Admin Dashboard | - | Moderation, user management | P1 |

**Status**: See [tasks-active.md](c:\Users\PC\Documents\naim\projects\voxpoll\docs\bible\10-logs\tasks-active.md#task-005-bible-flow-test-coverage-wave-1-p0--p1)

---

## Test Execution

### Local Development

```bash
# Unit tests (fast)
pnpm test:unit

# Integration tests (requires Docker)
pnpm test:integration

# E2E tests (requires running app)
pnpm test:e2e

# All tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### CI/CD Pipeline

**Triggered on**: Every commit, every PR

**Stages:**
1. **Lint & Type Check** (2 min)
2. **Unit Tests** (3 min)
3. **Integration Tests** (5 min) - Testcontainers
4. **E2E Tests** (10 min) - Playwright on 3 browsers
5. **Coverage Report** (1 min)
6. **Security Scan** (5 min) - OWASP ZAP

**Total**: ~26 minutes

**Failure Policy**: PR cannot merge if any test fails

---

## Coverage Requirements

### Minimum Coverage Targets

| Component | Target | Enforcement |
|-----------|--------|-------------|
| **Services** | 90% | Blocking |
| **Controllers** | 80% | Blocking |
| **Utilities** | 100% | Blocking |
| **API Routes** | 80% | Blocking |
| **React Components** | 70% | Warning |
| **Overall Project** | 80% | Blocking |

**Tool**: `c8` (built into Vitest)

**Report Format**: HTML + LCOV (uploaded to Codecov)

---

## Test Data Management

### Fixtures

**Location**: `packages/api/src/test/fixtures/`

**Purpose**: Reusable test data

**Example:**
```typescript
// fixtures/users.ts
export const testUsers = {
  admin: {
    email: 'admin@test.com',
    role: 'ADMIN',
    password: 'Test1234!'
  },
  user: {
    email: 'user@test.com',
    role: 'USER',
    password: 'Test1234!'
  }
}
```

### Database Seeds

**Location**: `packages/database/seeds/test/`

**Usage**: Pre-populate test database with realistic data

```typescript
// seeds/test/polls.seed.ts
export async function seedPolls(db: Database) {
  await db.insert(polls).values([
    { title: 'Test Poll 1', creatorId: 'user-1' },
    { title: 'Test Poll 2', creatorId: 'user-2' }
  ])
}
```

---

## Mocking Strategy

### External Services

**Mocked:**
- Redis (use ioredis-mock for unit tests, real Redis for integration)
- Email service (Resend)
- Payment gateway (Stripe)
- File storage (S3)
- Push notifications

**Real:**
- Database (Testcontainers with PostgreSQL)
- Authentication (real JWT signing/verification)

### Mock Implementations

**Location**: `packages/api/src/test/mocks/`

```typescript
// mocks/redis.ts
export const redisMock = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  incr: vi.fn()
}
```

---

## Performance Testing

### Load Tests (k6)

**Location**: `tests/load/*.js`

**Scenarios:**
1. **Poll Voting Spike**: 1000 concurrent users voting
2. **Live Poll Join**: 500 users joining simultaneously
3. **API Baseline**: Sustained 100 req/s for 5 minutes

**Thresholds:**
- p95 response time < 200ms
- p99 response time < 500ms
- Error rate < 1%

**Example:**
```javascript
// tests/load/poll-voting.js
export let options = {
  vus: 1000,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01']
  }
}

export default function () {
  const response = http.post('https://api.voxpoll.com/polls/123/vote', {
    optionId: 'abc'
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  })

  check(response, {
    'status is 200': (r) => r.status === 200
  })
}
```

---

## Security Testing

### OWASP ZAP Scan

**Frequency**: Daily on staging, every PR

**Scan Types:**
- Passive scan (all requests)
- Active scan (common vulnerabilities)
- API scan (OpenAPI spec validation)

**Checks:**
- SQL injection
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- Security headers
- Cookie security
- TLS/SSL configuration

---

## Test Maintenance

### When to Update Tests

1. **Bible Rule Changes**: Update tests when P-xxx or T-xxx modified
2. **Bug Fixes**: Add regression test for every bug
3. **New Features**: Write tests BEFORE implementation (TDD encouraged)
4. **Refactoring**: Ensure all tests still pass

### Test Review Checklist

- [ ] Test name describes expected behavior
- [ ] AAA pattern followed (Arrange, Act, Assert)
- [ ] No external dependencies in unit tests
- [ ] Database cleaned before/after integration tests
- [ ] Error cases tested
- [ ] Edge cases covered
- [ ] Bible compliance verified (P-xxx, T-xxx references in comments)

---

## Continuous Monitoring

### Test Metrics Dashboard

**Tool**: GitHub Actions + Custom dashboard

**Metrics Tracked:**
- Test success rate (last 30 days)
- Average test execution time
- Flaky test detection
- Coverage trends
- Test count growth

---

## Appendix: Test Naming Conventions

### Unit Tests
```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {})
    it('should throw [error] when [invalid condition]', () => {})
  })
})
```

### Integration Tests
```typescript
describe('HTTP_METHOD /endpoint', () => {
  it('should return 200 when [condition]', () => {})
  it('should return 400 when [invalid input]', () => {})
  it('should return 401 when unauthorized', () => {})
})
```

### E2E Tests
```typescript
test('user can [complete action]', async ({ page }) => {})
test('[action] fails when [condition]', async ({ page }) => {})
```

---

## Related Documentation

- **Active Test Work**: [tasks-active.md](c:\Users\PC\Documents\naim\projects\voxpoll\docs\bible\10-logs\tasks-active.md) - TASK-005
- **Test Master Plan**: `docs/bible/99-TRACKING/TEST_MASTER_PLAN.md` (created by Claude TESTER 1)
- **API Contract**: [01-api-contract.md](c:\Users\PC\Documents\naim\projects\voxpoll\docs\bible\05-api\01-api-contract.md)
- **RBAC Matrix**: [01-rbac-matrix.md](c:\Users\PC\Documents\naim\projects\voxpoll\docs\bible\09-security\01-rbac-matrix.md)

---

*NyoWorks Testing Standards - Test Plan v1*
