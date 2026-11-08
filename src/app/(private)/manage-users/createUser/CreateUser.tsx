'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { LuPlus } from 'react-icons/lu';
import { FormField, inputClass } from '@/components/form';
import { Button } from '@/components/generic';
import Modal from '@/components/Modal';
import { ROLES } from '@/lib/roles';
import { userCreateSchema, type UserCreate } from '@/lib/schemas';
import { Agent } from '@/utils/apiAgent';

// people who can be picked as manager — computed on the server with canHaveReports
export type ManagerOption = { id: number; fullName: string };

const CreateUserForm = ({ managers, onDone }: { managers: ManagerOption[]; onDone: () => void }) => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<UserCreate>({
    resolver: yupResolver(userCreateSchema),
    defaultValues: { fullName: '', email: '', password: '', role: 'user', managerId: null }
  });

  const onSubmit = async (values: UserCreate) => {
    const result = await Agent.createUser(values);
    if (!result.ok) return setServerError(result.error);

    onDone();
    router.refresh();
  };

  return (
    <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Controller
        name="fullName"
        control={control}
        render={({ field }) => (
          <FormField label="Full name" error={errors.fullName?.message}>
            <input
              className={inputClass}
              value={field.value}
              onChange={field.onChange}
              onBlur={() => field.onChange(field.value.trim())}
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
              autoComplete="off"
              className={inputClass}
              value={field.value}
              onChange={field.onChange}
              onBlur={() => field.onChange(field.value.trim())}
            />
          </FormField>
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <FormField label="Password" error={errors.password?.message}>
            <input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              value={field.value}
              onChange={field.onChange}
            />
          </FormField>
        )}
      />
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
      <Controller
        name="managerId"
        control={control}
        render={({ field }) => (
          <FormField label="Manager" error={errors.managerId?.message}>
            {/* <select> values are strings: '' means no manager, anything else is an id */}
            <select
              className={inputClass}
              value={field.value ?? ''}
              onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}>
              <option value="">No manager</option>
              {managers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </FormField>
        )}
      />

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" className="w-auto" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" className="w-auto" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

const CreateUser = ({ managers }: { managers: ManagerOption[] }) => (
  <Modal title="Add user" ModalView={({ CloseModal }) => <CreateUserForm managers={managers} onDone={CloseModal} />}>
    {({ OpenModal }) => (
      <Button className="flex  items-center gap-2 max-w-40 justify-center" onClick={OpenModal}>
        <LuPlus size={16} />
        Add user
      </Button>
    )}
  </Modal>
);

export default CreateUser;
