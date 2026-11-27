import { zodResolver } from '@hookform/resolvers/zod';
import { EnquiryInputSchema, type EnquiryInput, DEFAULT_ENQUIRY_MESSAGE } from '@catalogue/shared';
import { useId, type ComponentProps, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useSubmitEnquiry } from '../api/catalogue';
import { ApiError } from '../api/client';
import { cn } from '../lib/cn';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

interface EnquiryFormProps {
  productId: string;
  onSuccess: () => void;
}

/** Validates with the same schema as the API; the server remains the authority. */
export function EnquiryForm({ productId, onSuccess }: EnquiryFormProps) {
  const submit = useSubmitEnquiry();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(EnquiryInputSchema),
    defaultValues: { productId, name: '', email: '', phone: '', message: '', website: '' },
  });

  const onSubmit = handleSubmit((input) =>
    submit.mutate(input, {
      onSuccess,
      onError: (error) => {
        // Surface server-side field errors next to the relevant inputs.
        if (error instanceof ApiError && error.code === 'VALIDATION_ERROR' && error.details) {
          for (const [field, messages] of Object.entries(
            error.details as Record<string, string[]>,
          )) {
            setError(field as keyof EnquiryInput, { message: messages[0] });
          }
        }
      },
    }),
  );

  const showSubmitError =
    submit.isError &&
    !(submit.error instanceof ApiError && submit.error.code === 'VALIDATION_ERROR');

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <input type="hidden" {...register('productId')} />

      {/* Honeypot: invisible to people and assistive tech, attractive to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </label>
      </div>

      <Field label="Name" error={errors.name?.message}>
        {(props) => <TextInput {...props} autoComplete="name" {...register('name')} />}
      </Field>

      <Field label="Email" error={errors.email?.message}>
        {(props) => (
          <TextInput {...props} type="email" autoComplete="email" {...register('email')} />
        )}
      </Field>

      <Field label="Phone" optional error={errors.phone?.message}>
        {(props) => <TextInput {...props} type="tel" autoComplete="tel" {...register('phone')} />}
      </Field>

      <Field label="Message" optional error={errors.message?.message}>
        {(props) => (
          <textarea
            {...props}
            rows={4}
            placeholder={DEFAULT_ENQUIRY_MESSAGE}
            className={inputClasses(Boolean(errors.message))}
            {...register('message')}
          />
        )}
      </Field>

      {showSubmitError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md bg-selected p-3 text-base text-danger"
        >
          <Icon name="alert-circle" className="mt-0.5 shrink-0" />
          {submit.error.message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={submit.isPending} className="w-full">
        {submit.isPending ? 'Sending…' : 'Send enquiry'}
      </Button>
      <p className="text-xs text-subtle">We only use your details to respond to this enquiry.</p>
    </form>
  );
}

function inputClasses(invalid: boolean) {
  return cn(
    'w-full rounded-md border bg-surface px-3 py-2 text-base text-strong placeholder:text-subtle',
    invalid ? 'border-danger' : 'border-border hover:border-subtle',
  );
}

interface FieldControlProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
}

function Field({
  label,
  optional,
  error,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  children: (props: FieldControlProps) => ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base font-medium text-strong">
        {label}
        {optional && <span className="font-regular text-subtle"> (optional)</span>}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function TextInput(props: ComponentProps<'input'>) {
  return <input {...props} className={inputClasses(Boolean(props['aria-invalid']))} />;
}
