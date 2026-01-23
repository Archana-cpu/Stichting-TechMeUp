import { setRequestLocale } from 'next-intl/server';
import { db } from '@seq/database';
import { UsersTable } from '@/components/admin/users-table';
import type { Locale } from '@seq/i18n';

type PageProps = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ page?: string; search?: string }>;
};

export default async function AdminUsersPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { page = '1', search = '' } = await searchParams;
  setRequestLocale(locale);

  const pageSize = 20;
  const currentPage = parseInt(page, 10) || 1;
  const skip = (currentPage - 1) * pageSize;

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
          { username: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [users, totalCount] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        image: true,
        isAdmin: true,
        emailVerified: true,
        onboardingComplete: true,
        createdAt: true,
        _count: {
          select: { sequences: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    db.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          View and manage all registered users
        </p>
      </div>
      
      <UsersTable
        users={users}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        searchQuery={search}
      />
    </div>
  );
}
