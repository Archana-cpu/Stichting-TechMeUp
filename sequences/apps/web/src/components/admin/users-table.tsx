'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Card,
} from '@seq/ui';
import {
  MoreHorizontal,
  Shield,
  ShieldOff,
  Ban,
  Mail,
  Search,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Film,
} from 'lucide-react';

import { DataTable } from '../data-display';

type UserWithCounts = {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  image: string | null;
  isAdmin: boolean;
  emailVerified: Date | null;
  onboardingComplete: boolean;
  createdAt: Date;
  _count: { sequences: number };
};

type UsersTableProps = {
  users: UserWithCounts[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchQuery: string;
};

export function UsersTable({ users, currentPage, totalPages, totalCount, searchQuery: initialSearch }: UsersTableProps) {
  const t = useTranslations('admin');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      accessor: (user: UserWithCounts) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || undefined} alt={user.name || user.username || ''} />
            <AvatarFallback>{(user.name || user.username || 'U').slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name || user.username || 'Unknown'}</p>
            {user.username && <p className="text-xs text-muted-foreground">@{user.username}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      accessor: (user: UserWithCounts) => (
        <span className="text-sm text-muted-foreground">{user.email}</span>
      ),
    },
    {
      key: 'sequences',
      header: 'Sequences',
      accessor: (user: UserWithCounts) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Film className="h-3 w-3" />
          {user._count.sequences}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (user: UserWithCounts) => (
        <div className="flex items-center gap-2 flex-wrap">
          {user.isAdmin ? (
            <Badge variant="default">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          ) : (
            <Badge variant="secondary">User</Badge>
          )}
          {user.emailVerified && (
            <Badge variant="outline" className="text-green-600 border-green-600/30">
              Verified
            </Badge>
          )}
          {user.onboardingComplete && (
            <Badge variant="outline" className="text-blue-600 border-blue-600/30">
              <UserCheck className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      accessor: (user: UserWithCounts) => (
        <span className="text-sm text-muted-foreground">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      accessor: (user: UserWithCounts) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              {user.isAdmin ? (
                <>
                  <ShieldOff className="h-4 w-4 mr-2" />
                  Remove Admin
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Make Admin
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Ban className="h-4 w-4 mr-2" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: 'w-12',
    },
  ];

  return (
    <Card>
      <div className="p-4 border-b">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or username..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {totalCount.toLocaleString()} total users
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(user) => user.id}
        emptyMessage="No users found"
        isLoading={isPending}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isPending}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isPending}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
