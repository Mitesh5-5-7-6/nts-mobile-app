import { Button } from '@/components/ui/Button';
import { NumberInput, Textarea, TextInput } from '@/components/ui/Input';
import { BottomSheet } from '@/components/ui/Modal';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/api/useCustomers';
import type { ApiErrorResponse } from '@/lib/api-error';
import { useAppTheme } from '@/theme';
import type { CreateCustomerPayload, Customer } from '@/types/api.types';
import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;

const customerSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be 2–100 characters').max(100, 'Name must be 2–100 characters'),
  phone: z.string().trim().regex(phoneRegex, 'Enter a valid 10-digit mobile number'),
  address: z.string().trim().max(200, 'Address must be 200 characters or fewer'),
  notes: z.string().trim().max(500, 'Notes must be 500 characters or fewer'),
  morning: z.boolean(),
  morning_qty: z.number().min(1, 'Quantity must be 1–10').max(10, 'Quantity must be 1–10'),
  morning_price: z.number().min(1, 'Price must be 1–10000').max(10000, 'Price must be 1–10000'),
  evening: z.boolean(),
  evening_qty: z.number().min(1, 'Quantity must be 1–10').max(10, 'Quantity must be 1–10'),
  evening_price: z.number().min(1, 'Price must be 1–10000').max(10000, 'Price must be 1–10000'),
});

type FormState = z.input<typeof customerSchema>;

const initialForm = (customer?: Customer): FormState => ({
  full_name: customer?.full_name ?? '',
  phone: customer?.phone ?? '',
  address: customer?.address ?? '',
  notes: customer?.notes ?? '',
  morning: customer?.tiffin_defaults?.morning ?? true,
  morning_qty: customer?.tiffin_defaults?.morning_qty ?? 1,
  morning_price: customer?.tiffin_defaults?.morning_price ?? 60,
  evening: customer?.tiffin_defaults?.evening ?? true,
  evening_qty: customer?.tiffin_defaults?.evening_qty ?? 1,
  evening_price: customer?.tiffin_defaults?.evening_price ?? 60,
});

interface CustomerFormSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Pass a customer to edit; omit to create. */
  customer?: Customer;
}

export const CustomerFormSheet = React.memo(({ visible, onClose, customer }: CustomerFormSheetProps) => {
  const { colors, spacing, typography } = useAppTheme();
  const isEdit = !!customer;

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const submitting = createMutation.isPending || updateMutation.isPending;

  // State is seeded once on mount. The parent remounts this sheet (via `key`)
  // each time it opens, so the form always starts fresh for the right customer.
  const [form, setForm] = useState<FormState>(() => initialForm(customer));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const applyServerError = (e: unknown) => {
    const err = e as ApiErrorResponse;
    const next: Record<string, string> = {};
    if (err?.details) {
      for (const [key, messages] of Object.entries(err.details)) {
        const field = key.replace('tiffin_defaults.', '');
        if (messages?.length) next[field] = messages[0];
      }
    }
    if (err?.code === 'CONFLICT') next.phone = err.message || 'Phone number already registered';
    setErrors(next);
    setServerError(err?.message ?? 'Something went wrong. Please try again.');
  };

  const handleSubmit = async () => {
    const result = customerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? '');
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    const v = result.data;
    const payload: CreateCustomerPayload = {
      full_name: v.full_name,
      phone: v.phone,
      address: v.address || undefined,
      notes: v.notes || undefined,
      tiffin_defaults: {
        morning: v.morning,
        morning_qty: v.morning_qty,
        morning_price: v.morning_price,
        evening: v.evening,
        evening_qty: v.evening_qty,
        evening_price: v.evening_price,
      },
    };

    setErrors({});
    setServerError(null);

    try {
      if (customer) {
        await updateMutation.mutateAsync({ id: customer._id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (e) {
      applyServerError(e);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={isEdit ? 'Edit Customer' : 'Add Customer'} maxHeight="90%">
      <TextInput
        label="Full name"
        placeholder="e.g. Rohan Verma"
        value={form.full_name}
        onChangeText={(t) => set('full_name', t)}
        error={errors.full_name}
        autoCapitalize="words"
      />
      <TextInput
        label="Phone"
        placeholder="10-digit mobile number"
        value={form.phone}
        onChangeText={(t) => set('phone', t.replace(/[^0-9]/g, ''))}
        error={errors.phone}
        keyboardType="phone-pad"
        maxLength={10}
        iconLeft="user"
      />
      <TextInput
        label="Address (optional)"
        placeholder="Flat / building / area"
        value={form.address}
        onChangeText={(t) => set('address', t)}
        error={errors.address}
      />

      <Text style={[styles.sectionLabel, { color: colors.text, fontSize: typography.size.sm, marginTop: spacing.sm, marginBottom: spacing.sm }]}>
        Default Tiffin Plan
      </Text>

      <PlanRow
        title="Morning"
        enabled={form.morning}
        onToggle={(v) => set('morning', v)}
        qty={form.morning_qty}
        price={form.morning_price}
        onQty={(n) => set('morning_qty', n)}
        onPrice={(n) => set('morning_price', n)}
        qtyError={errors.morning_qty}
        priceError={errors.morning_price}
      />
      <PlanRow
        title="Evening"
        enabled={form.evening}
        onToggle={(v) => set('evening', v)}
        qty={form.evening_qty}
        price={form.evening_price}
        onQty={(n) => set('evening_qty', n)}
        onPrice={(n) => set('evening_price', n)}
        qtyError={errors.evening_qty}
        priceError={errors.evening_price}
      />

      <Textarea
        label="Notes (optional)"
        placeholder="Any preferences or remarks"
        value={form.notes}
        onChangeText={(t) => set('notes', t)}
        error={errors.notes}
      />

      {serverError ? (
        <Text style={{ color: colors.error, fontSize: typography.size.sm, marginBottom: spacing.md }}>{serverError}</Text>
      ) : null}

      <Button
        title={isEdit ? 'Save Changes' : 'Add Customer'}
        onPress={handleSubmit}
        loading={submitting}
        size="lg"
        style={{ marginTop: spacing.xs }}
      />
    </BottomSheet>
  );
});

function PlanRow({
  title,
  enabled,
  onToggle,
  qty,
  price,
  onQty,
  onPrice,
  qtyError,
  priceError,
}: {
  title: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  qty: number;
  price: number;
  onQty: (n: number) => void;
  onPrice: (n: number) => void;
  qtyError?: string;
  priceError?: string;
}) {
  const { colors, spacing, radius, typography } = useAppTheme();
  return (
    <View style={[styles.planRow, { borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md }]}>
      <View style={styles.planHeader}>
        <Text style={{ color: colors.text, fontSize: typography.size.base, fontWeight: '700', fontFamily: typography.family.rounded }}>
          {title}
        </Text>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor="#FFFFFF"
        />
      </View>
      <View style={[styles.planInputs, { gap: spacing.md }]}>
        <View style={{ flex: 1 }}>
          <NumberInput
            label="Qty"
            value={String(qty)}
            onChangeNumber={onQty}
            min={1}
            max={10}
            error={qtyError}
          />
        </View>
        <View style={{ flex: 1 }}>
          <NumberInput
            label="Price (₹)"
            value={String(price)}
            onChangeNumber={onPrice}
            min={1}
            max={10000}
            error={priceError}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontWeight: '700',
  },
  planRow: {
    borderWidth: 1,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planInputs: {
    flexDirection: 'row',
  },
});

CustomerFormSheet.displayName = 'CustomerFormSheet';
export default CustomerFormSheet;
