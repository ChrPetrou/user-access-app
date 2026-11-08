import { Badge, Card, PageHeader } from '@/components/generic';
import Pagination from '@/components/pagination';
import GridTable from '@/components/Table/GridTable';
import { canAccessUserManagement, canChangeRole, canChangeStatus, canCreateUser, canEditProfile } from '@/lib/policy';
import { requireCurrentUser } from '@/lib/session';
import { listManagerOptions, listUsers } from '@/lib/users';
import React from 'react';
import CreateUser from './createUser/CreateUser';
import EditUser from './editUser/EditUser';

const ManageUsersPage = async ({ searchParams }: PageProps<'/manage-users'>) => {
  const user = await requireCurrentUser(canAccessUserManagement);
  const { page, limit } = await searchParams;
  const result = listUsers(user, Number(page), Number(limit));
  const managers = listManagerOptions();

  return (
    <>
      <PageHeader
        title="Manage users"
        subtitle="Search and manage user accounts"
        action={canCreateUser(user) && <CreateUser managers={managers} />}
      />

      <Card className="flex min-h-0 flex-1 flex-col gap-4">
        {result.totalItems === 0 ? (
          <p className="text-sm text-muted">No users to show.</p>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-auto">
              <GridTable headers={['Full name', 'Email', 'Role', 'Status', 'Edit']}>
                {({ Row, Field }) =>
                  result.items.map(u => (
                    <Row key={u.id}>
                      <Field>{u.fullName}</Field>
                      <Field>{u.email}</Field>
                      <Field>{u.role}</Field>
                      <Field>
                        <Badge tone={u.status === 'active' ? 'success' : 'danger'}>{u.status}</Badge>
                      </Field>
                      <Field>
                        <EditUser
                          user={u}
                          can={{
                            profile: canEditProfile(user, u),
                            role: canChangeRole(user, u),
                            status: canChangeStatus(user, u)
                          }}
                        />
                      </Field>
                    </Row>
                  ))
                }
              </GridTable>
            </div>
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              totalItems={result.totalItems}
              limit={result.limit}
            />
          </>
        )}
      </Card>
    </>
  );
};

export default ManageUsersPage;
