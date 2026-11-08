'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { LuPencil } from 'react-icons/lu';
import { Button } from '@/components/generic';
import { FormField, inputClass } from '@/components/form';
import Modal from '@/components/Modal';
import { ROLES } from '@/lib/roles';
import { userUpdateSchema, type UserUpdate } from '@/lib/schemas';
import { userStatuses, type User } from '@/lib/types';
import { Agent } from '@/utils/apiAgent';

// what the current user may change on this row — computed on the server, only used to show/hide fields
export type EditPermissions = { profile: boolean; role: boolean; status: boolean };

type Props = { user: User; can: EditPermissions };

const EditUserForm = ({ user, can, onDone }: Props & { onDone: () => void }) => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<UserUpdate>({
    resolver: yupResolver(userUpdateSchema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status
    }
  });

  const onSubmit = async (values: UserUpdate) => {
    const changes: UserUpdate = {
      ...(values.fullName !== user.fullName && { fullName: values.fullName }),
      ...(values.email !== user.email && { email: values.email }),
      ...(values.role !== user.role && { role: values.role }),
      ...(values.status !== user.status && { status: values.status })
    };
    if (Object.keys(changes).length === 0) return onDone();

    const result = await Agent.updateUser(user.id, changes);
    if (!result.ok) return setServerError(result.error);

    onDone();
    router.refresh();
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {can.profile && (
        <>
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <FormField label="Full name" error={errors.fullName?.message}>
                <input
                  className={inputClass}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={() => field.onChange(field.value?.trim())}
                />
              </FormField>
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <FormField label="Email" error={errors.email?.message}>
                <input
                  type="email"
                  className={inputClass}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={() => field.onChange(field.value?.trim())}
                />
              </FormField>
            )}
          />
        </>
      )}

      {can.role && (
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <FormField label="Role" error={errors.role?.message}>
              <select className={inputClass} value={field.value} onChange={field.onChange}>
                {ROLES.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </FormField>
          )}
        />
      )}

      {can.status && (
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <FormField label="Status" error={errors.status?.message}>
              <select className={inputClass} value={field.value} onChange={field.onChange}>
                {userStatuses.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </FormField>
          )}
        />
      )}

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" className="w-auto" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" className="w-auto" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

const EditUser = ({ user, can }: Props) => (
  <Modal
    title={`Edit ${user.fullName}`}
    ModalView={({ CloseModal }) => <EditUserForm user={user} can={can} onDone={CloseModal} />}>
    {({ OpenModal }) => (
      <button
        type="button"
        onClick={OpenModal}
        aria-label={`Edit ${user.fullName}`}
        title="Edit"
        className="cursor-pointer rounded p-1 text-muted hover:bg-page hover:text-primary">
        <LuPencil size={16} />
      </button>
    )}
  </Modal>
);

export default EditUser;
