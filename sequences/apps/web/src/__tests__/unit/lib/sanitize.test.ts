import { describe, it, expect } from 'vitest';
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeFilename,
  normalizeEmail,
  sanitizeSearchQuery,
  sanitizeUrl,
  sanitizeUsername,
} from '@/lib/sanitize';

describe('sanitizeHtml', () => {
  it('boş string döndürmeli boş input için', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('script tagları kaldırmalı', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('script');
    expect(result).toContain('<p>Hello</p>');
  });

  it('style tagları kaldırmalı', () => {
    const input = '<p>Hello</p><style>.evil { color: red; }</style>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('style');
    expect(result).not.toContain('.evil');
  });

  it('izin verilen tagları korumalı', () => {
    const input = '<p><strong>Bold</strong> and <em>italic</em></p>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<strong>');
    expect(result).toContain('<em>');
    expect(result).toContain('<p>');
  });

  it('onerror attribute kaldırmalı', () => {
    const input = '<img src="x" onerror="alert(1)">';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onerror');
  });

  it('href attribute korumalı', () => {
    const input = '<a href="https://example.com">Link</a>';
    const result = sanitizeHtml(input);
    expect(result).toContain('href="https://example.com"');
  });
});

describe('sanitizeText', () => {
  it('boş string döndürmeli boş input için', () => {
    expect(sanitizeText('')).toBe('');
  });

  it('tüm HTML taglarını kaldırmalı', () => {
    const input = '<p>Hello <strong>World</strong></p>';
    const result = sanitizeText(input);
    expect(result).toBe('Hello World');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  it('whitespace trim etmeli', () => {
    const input = '  Hello World  ';
    const result = sanitizeText(input);
    expect(result).toBe('Hello World');
  });
});

describe('sanitizeFilename', () => {
  it('unnamed döndürmeli boş input için', () => {
    expect(sanitizeFilename('')).toBe('unnamed');
  });

  it('path traversal önlemeli', () => {
    expect(sanitizeFilename('../../../etc/passwd')).not.toContain('..');
    expect(sanitizeFilename('test/../file.jpg')).not.toContain('..');
  });

  it('slash karakterleri kaldırmalı', () => {
    expect(sanitizeFilename('folder/file.jpg')).not.toContain('/');
    expect(sanitizeFilename('folder\\file.jpg')).not.toContain('\\');
  });

  it('özel karakterleri underscore ile değiştirmeli', () => {
    const result = sanitizeFilename('file name!@#$.jpg');
    expect(result).not.toContain('!');
    expect(result).not.toContain('@');
    expect(result).not.toContain('#');
    expect(result).not.toContain('$');
  });

  it('multiple dots temizlemeli', () => {
    const result = sanitizeFilename('file...name.jpg');
    expect(result).not.toContain('...');
  });

  it('200 karakterden uzun isimleri kısaltmalı', () => {
    const longName = 'a'.repeat(250) + '.jpg';
    const result = sanitizeFilename(longName);
    expect(result.length).toBeLessThanOrEqual(200);
  });
});

describe('normalizeEmail', () => {
  it('boş string döndürmeli boş input için', () => {
    expect(normalizeEmail('')).toBe('');
  });

  it('lowercase yapmalı', () => {
    expect(normalizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
  });

  it('whitespace trim etmeli', () => {
    expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com');
  });

  it('Gmail dot trick kaldırmalı (opsiyonel)', () => {
    const result = normalizeEmail('test.user@gmail.com', { removeGmailDots: true });
    expect(result).toBe('testuser@gmail.com');
  });

  it('Gmail olmayan emailler için dot korumalı', () => {
    const result = normalizeEmail('test.user@example.com', { removeGmailDots: true });
    expect(result).toBe('test.user@example.com');
  });
});

describe('sanitizeSearchQuery', () => {
  it('boş string döndürmeli boş input için', () => {
    expect(sanitizeSearchQuery('')).toBe('');
  });

  it('SQL wildcards escape etmeli', () => {
    const result = sanitizeSearchQuery('test%query');
    expect(result).toContain('\\%');
  });

  it('underscore escape etmeli', () => {
    const result = sanitizeSearchQuery('test_query');
    expect(result).toContain('\\_');
  });

  it('newlines kaldırmalı', () => {
    const result = sanitizeSearchQuery('test\nquery');
    expect(result).not.toContain('\n');
  });

  it('multiple spaces tek space yapmalı', () => {
    const result = sanitizeSearchQuery('test    query');
    expect(result).toBe('test query');
  });

  it('100 karakterden uzun queryler kısaltmalı', () => {
    const longQuery = 'a'.repeat(150);
    const result = sanitizeSearchQuery(longQuery);
    expect(result.length).toBeLessThanOrEqual(100);
  });
});

describe('sanitizeUrl', () => {
  it('null döndürmeli boş input için', () => {
    expect(sanitizeUrl('')).toBeNull();
  });

  it('geçerli https URL döndürmeli', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
  });

  it('geçerli http URL döndürmeli', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
  });

  it('javascript: URL reddetmeli', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
  });

  it('data: URL reddetmeli', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
  });

  it('geçersiz URL için null döndürmeli', () => {
    expect(sanitizeUrl('not-a-valid-url')).toBeNull();
  });
});

describe('sanitizeUsername', () => {
  it('null döndürmeli boş input için', () => {
    expect(sanitizeUsername('')).toBeNull();
  });

  it('lowercase yapmalı', () => {
    expect(sanitizeUsername('TestUser')).toBe('testuser');
  });

  it('özel karakterleri kaldırmalı', () => {
    expect(sanitizeUsername('test@user!')).toBe('testuser');
  });

  it('underscore korumalı', () => {
    expect(sanitizeUsername('test_user')).toBe('test_user');
  });

  it('3 karakterden kısa için null döndürmeli', () => {
    expect(sanitizeUsername('ab')).toBeNull();
  });

  it('30 karakterden uzun username kısaltmalı', () => {
    const longUsername = 'a'.repeat(40);
    const result = sanitizeUsername(longUsername);
    expect(result!.length).toBe(30);
  });
});
