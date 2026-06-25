import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { Skeleton } from '@/components/ui/Feedback';
import { NumberInput, TextInput, Textarea } from '@/components/ui/Input';
import { BottomSheet } from '@/components/ui/Modal';
import { PAYMENT_METHODS } from '@/constants/finance';
import { useGenerateBill, useRecordPayment } from '@/hooks/api/usePayments';
import type { ApiErrorResponse } from '@/lib/api-error';
import { useAppTheme } from '@/theme';
import type { CreatePaymentPayload, GeneratedBill, PaymentMethod } from '@/types/api.types';
import { formatCurrency, toApiDate } from '@/utils/format';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RecordPaymentSheetProps {
  visible: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  range: { startDate: string; endDate: string };
}

export const RecordPaymentSheet = React.memo(
  ({ visible, onClose, customerId, customerName, range }: RecordPaymentSheetProps) => {
    const { colors, spacing, radius, typography } = useAppTheme();

    const generateBill = useGenerateBill();
    const recordPayment = useRecordPayment();

    const [bill, setBill] = useState<GeneratedBill | null>(null);
    const [billError, setBillError] = useState<string | null>(null);
    const [amount, setAmount] = useState(0);
    const [method, setMethod] = useState<PaymentMethod>('cash');
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState('');
    const [serverError, setServerError] = useState<string | null>(null);

    // Generate the bill once when the sheet mounts (parent remounts via `key`).
    // billError starts null on each mount, so no synchronous reset is needed.
    useEffect(() => {
      let active = true;
      generateBill
        .mutateAsync({
          customer_id: customerId,
          billing_start_date: range.startDate,
          billing_end_date: range.endDate,
        })
        .then((res) => {
          if (!active) return;
          setBill(res.data);
          setAmount(res.data.final_payable);
        })
        .catch((e: unknown) => {
          if (!active) return;
          setBillError((e as ApiErrorResponse)?.message ?? 'Could not calculate the bill.');
        });
      return () => {
        active = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async () => {
      if (!bill) return;
      if (amount <= 0) {
        setServerError('Enter an amount greater than zero.');
        return;
      }
      setServerError(null);

      const payload: CreatePaymentPayload = {
        customer_id: customerId,
        payment_date: toApiDate(new Date()),
        billing_start_date: range.startDate,
        billing_end_date: range.endDate,
        total_bill_amount: bill.final_payable,
        paid_amount: amount,
        payment_method: method,
        reference_number: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      try {
        await recordPayment.mutateAsync(payload);
        onClose();
      } catch (e) {
        setServerError((e as ApiErrorResponse)?.message ?? 'Could not record the payment.');
      }
    };

    const remaining = bill ? Math.max(0, bill.final_payable - amount) : 0;

    return (
      <BottomSheet visible={visible} onClose={onClose} title={`Collect · ${customerName}`} maxHeight="90%">
        {generateBill.isPending && !bill ? (
          <Skeleton height={120} borderRadius={radius.lg} style={{ marginBottom: spacing.md }} />
        ) : billError ? (
          <Text style={{ color: colors.error, fontSize: typography.size.sm, marginBottom: spacing.md }}>
            {billError}
          </Text>
        ) : bill ? (
          <View
            style={[
              styles.billBox,
              { backgroundColor: colors.backgroundSecondary, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
            ]}
          >
            <BillLine label="Entries" value={String(bill.total_entries)} />
            <BillLine label="Period bill" value={formatCurrency(bill.total_amount)} />
            {bill.previous_pending > 0 && (
              <BillLine label="Previous pending" value={formatCurrency(bill.previous_pending)} />
            )}
            {bill.advance_deduction > 0 && (
              <BillLine label="Advance applied" value={`- ${formatCurrency(bill.advance_deduction)}`} />
            )}
            <View style={[styles.hr, { backgroundColor: colors.border }]} />
            <BillLine label="Payable" value={formatCurrency(bill.final_payable)} strong />
          </View>
        ) : null}

        <NumberInput
          label="Amount received (₹)"
          value={String(amount)}
          onChangeNumber={setAmount}
          min={0}
        />

        {bill && remaining > 0 ? (
          <Text style={{ color: colors.warning, fontSize: typography.size.xs, marginTop: -spacing.sm, marginBottom: spacing.md }}>
            Partial payment · {formatCurrency(remaining)} will remain pending.
          </Text>
        ) : null}

        <ChipGroup<PaymentMethod>
          label="Payment method"
          options={PAYMENT_METHODS}
          selected={method}
          onChange={setMethod}
        />

        <TextInput
          label="Reference number (optional)"
          placeholder="UPI / cheque / txn id"
          value={reference}
          onChangeText={setReference}
        />

        <Textarea
          label="Notes (optional)"
          placeholder="Any remarks"
          value={notes}
          onChangeText={setNotes}
        />

        {serverError ? (
          <Text style={{ color: colors.error, fontSize: typography.size.sm, marginBottom: spacing.md }}>
            {serverError}
          </Text>
        ) : null}

        <Button
          title="Record Payment"
          onPress={handleSubmit}
          loading={recordPayment.isPending}
          disabled={!bill}
          size="lg"
        />
      </BottomSheet>
    );
  },
);

function BillLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const { colors, spacing, typography } = useAppTheme();
  return (
    <View style={[styles.billLine, { paddingVertical: spacing.xxs }]}>
      <Text style={{ color: strong ? colors.text : colors.textSecondary, fontSize: typography.size.sm, fontWeight: strong ? '700' : '400' }}>
        {label}
      </Text>
      <Text style={{ color: strong ? colors.primary : colors.text, fontSize: typography.size.sm, fontWeight: strong ? '800' : '600' }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  billBox: {
    borderWidth: 0,
  },
  billLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hr: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
  },
});

RecordPaymentSheet.displayName = 'RecordPaymentSheet';
export default RecordPaymentSheet;
