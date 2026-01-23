import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ============================================================================
// MOCKS - Use vi.hoisted to ensure variables are available during mock hoisting
// ============================================================================

const { mockAuthFn, mockPersonDb } = vi.hoisted(() => ({
  mockAuthFn: vi.fn(),
  mockPersonDb: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock modules
vi.mock('@seq/auth', () => ({
  auth: () => mockAuthFn(),
}));

vi.mock('@seq/database', () => ({
  db: {
    person: mockPersonDb,
  },
}));

// Import route handlers after mocks are set up
import { GET, PUT, PATCH, DELETE } from '@/app/api/people/[id]/route';

// ============================================================================
// TEST DATA
// ============================================================================

const mockUser = { id: 'user1' };
const mockPerson = {
  id: 'person123',
  userId: 'user1',
  name: 'John Doe',
  relationship: 'friend',
  positionX: 100,
  positionY: 200,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createRequest(method: string, body?: any): NextRequest {
  const url = 'http://localhost:3000/api/people/person123';
  return new NextRequest(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function createRouteParams(id: string) {
  return {
    params: Promise.resolve({ id }),
  };
}

// ============================================================================
// TESTS
// ============================================================================

describe('People API Route - /api/people/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PATCH - Position Update', () => {
    it('yetkisiz kullanıcı için 401 dönmeli', async () => {
      mockAuthFn.mockResolvedValue(null);

      const request = createRequest('PATCH', { positionX: 100, positionY: 200 });
      const response = await PATCH(request, createRouteParams('person123'));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('geçersiz position data için 400 dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: mockUser });
      mockPersonDb.findUnique.mockResolvedValue({ userId: 'user1' }); // Person var

      const request = createRequest('PATCH', { positionX: 'invalid' }); // Geçersiz tip
      const response = await PATCH(request, createRouteParams('person123'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('positionX eksik olduğunda 400 dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: mockUser });
      mockPersonDb.findUnique.mockResolvedValue({ userId: 'user1' }); // Person var

      const request = createRequest('PATCH', { positionY: 200 }); // positionX eksik
      const response = await PATCH(request, createRouteParams('person123'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('positionY eksik olduğunda 400 dönmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: mockUser });
      mockPersonDb.findUnique.mockResolvedValue({ userId: 'user1' }); // Person var

      const request = createRequest('PATCH', { positionX: 100 }); // positionY eksik
      const response = await PATCH(request, createRouteParams('person123'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("başka kullanıcının person'ı için 404 dönmeli", async () => {
      mockAuthFn.mockResolvedValue({ user: mockUser });
      mockPersonDb.findUnique.mockResolvedValue({ userId: 'user2' }); // Farklı user

      const request = createRequest('PATCH', { positionX: 100, positionY: 200 });
      const response = await PATCH(request, createRouteParams('person123'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Not found');
    });

    it("olmayan person için 404 dönmeli", async () => {
      mockAuthFn.mockResolvedValue({ user: mockUser });
      mockPersonDb.findUnique.mockResolvedValue(null);

      const request = createRequest('PATCH', { positionX: 100, positionY: 200 });
      const response = await PATCH(request, createRouteParams('nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Not found');
    });

    it('pozisyon başarıyla güncellenmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: mockUser });
      mockPersonDb.findUnique.mockResolvedValue({ userId: 'user1' });
      mockPersonDb.update.mockResolvedValue({
        ...mockPerson,
        positionX: 150,
        positionY: 250,
      });

      const request = createRequest('PATCH', { positionX: 150, positionY: 250 });
      const response = await PATCH(request, createRouteParams('person123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.positionX).toBe(150);
      expect(data.positionY).toBe(250);
      expect(mockPersonDb.update).toHaveBeenCalledWith({
        where: { id: 'person123' },
        data: {
          positionX: 150,
          positionY: 250,
        },
      });
    });

    it('negatif pozisyon değerleri kabul etmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: mockUser });
      mockPersonDb.findUnique.mockResolvedValue({ userId: 'user1' });
      mockPersonDb.update.mockResolvedValue({
        ...mockPerson,
        positionX: -100,
        positionY: -200,
      });

      const request = createRequest('PATCH', { positionX: -100, positionY: -200 });
      const response = await PATCH(request, createRouteParams('person123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.positionX).toBe(-100);
      expect(data.positionY).toBe(-200);
    });

    it('ondalıklı pozisyon değerleri kabul etmeli', async () => {
      mockAuthFn.mockResolvedValue({ user: mockUser });
      mockPersonDb.findUnique.mockResolvedValue({ userId: 'user1' });
      mockPersonDb.update.mockResolvedValue({
        ...mockPerson,
        positionX: 100.5,
        positionY: 200.75,
      });

      const request = createRequest('PATCH', { positionX: 100.5, positionY: 200.75 });
      const response = await PATCH(request, createRouteParams('person123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.positionX).toBe(100.5);
      expect(data.positionY).toBe(200.75);
    });
  });

  describe('GET', () => {
    it('yetkisiz kullanıcı için 401 dönmeli', async () => {
      mockAuthFn.mockResolvedValue(null);

      const request = createRequest('GET');
      const response = await GET(request, createRouteParams('person123'));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('başarılı person getirme', async () => {
      mockAuthFn.mockResolvedValue({ user: mockUser });
      mockPersonDb.findUnique.mockResolvedValue(mockPerson);

      const request = createRequest('GET');
      const response = await GET(request, createRouteParams('person123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('person123');
      expect(data.name).toBe('John Doe');
    });
  });

  describe('PUT', () => {
    it('yetkisiz kullanıcı için 401 dönmeli', async () => {
      mockAuthFn.mockResolvedValue(null);

      const request = createRequest('PUT', { name: 'New Name' });
      const response = await PUT(request, createRouteParams('person123'));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('başarılı person güncelleme', async () => {
      mockAuthFn.mockResolvedValue({ user: mockUser });
      mockPersonDb.findUnique.mockResolvedValue({ userId: 'user1' });
      mockPersonDb.update.mockResolvedValue({ ...mockPerson, name: 'New Name' });

      const request = createRequest('PUT', { name: 'New Name' });
      const response = await PUT(request, createRouteParams('person123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('New Name');
    });
  });

  describe('DELETE', () => {
    it('yetkisiz kullanıcı için 401 dönmeli', async () => {
      mockAuthFn.mockResolvedValue(null);

      const request = createRequest('DELETE');
      const response = await DELETE(request, createRouteParams('person123'));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('başarılı person silme', async () => {
      mockAuthFn.mockResolvedValue({ user: mockUser });
      mockPersonDb.findUnique.mockResolvedValue({ userId: 'user1' });
      mockPersonDb.delete.mockResolvedValue({ id: 'person123' });

      const request = createRequest('DELETE');
      const response = await DELETE(request, createRouteParams('person123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPersonDb.delete).toHaveBeenCalledWith({
        where: { id: 'person123' },
      });
    });
  });
});
