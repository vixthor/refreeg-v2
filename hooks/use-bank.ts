import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import type { BankDetailsFormData, ICreateSubaccount } from "@/types";
import { updateBankDetails } from "@/actions";
import { useQueryClient } from "@tanstack/react-query";

interface UseBankProps {
  initialData?: {
    account_number: string | null;
    bank_name: string | null;
    account_name: string | null;
    sub_account_code: string | null;
  };
  userId: string;
}

export function useBank({ initialData, userId }: UseBankProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [formData, setFormData] = useState<BankDetailsFormData>({
    accountNumber: initialData?.account_number || "",
    bankName: initialData?.bank_name || "",
    accountName: initialData?.account_name || "",
    sub_account_code: initialData?.sub_account_code || "",
  });
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const lastInitialDataRef = useRef<string>("");

  useEffect(() => {
    const currentKey = JSON.stringify({
      account_number: initialData?.account_number,
      bank_name: initialData?.bank_name,
      account_name: initialData?.account_name,
      sub_account_code: initialData?.sub_account_code,
    });

    if (
      initialData &&
      !hasUserInteracted &&
      currentKey !== lastInitialDataRef.current
    ) {
      setFormData({
        accountNumber: initialData.account_number || "",
        bankName: initialData.bank_name || "",
        accountName: initialData.account_name || "",
        sub_account_code: initialData.sub_account_code || "",
      });
      lastInitialDataRef.current = currentKey;
    }
  }, [initialData, hasUserInteracted]);

  useEffect(() => {
    const fetchBanks = async () => {
      setIsLoadingBanks(true);
      try {
        const response = await fetch("/api/banks");
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch banks");
        }

        const banksList = result.data;

        const uniqueBanks = banksList.reduce(
          (
            acc: { name: string; code: string }[],
            bank: { name: string; code: string }
          ) => {
            const key = `${bank.code}-${bank.name}`;
            if (!acc.some((b) => `${b.code}-${b.name}` === key)) {
              acc.push(bank);
            }
            return acc;
          },
          []
        );
        setBanks(uniqueBanks);
      } catch (error) {
        console.error("Error fetching banks:", error);
        toast({
          title: "Error",
          description: "Failed to fetch banks list",
          variant: "destructive",
        });
      } finally {
        setIsLoadingBanks(false);
      }
    };

    fetchBanks();
  }, []);

  const verifyAccount = useCallback(
    async (accountNumber: string, bankCode: string) => {
      try {
        const response = await fetch("/api/banks/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accountNumber, bankCode }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to verify account");
        }

        const verification = result.data;
        setFormData((prev) => ({
          ...prev,
          accountName: verification.account_name,
        }));
        toast({
          title: "Account verified",
          description:
            "Your bank account details were successfully verified. Please review and save to continue.",
        });
      } catch (error: any) {
        console.error("Error verifying account:", error);
        toast({
          title: "Verification failed",
          description:
            error.message ||
            "We couldn’t verify these bank details. Please double-check the account number and bank, then try again.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!hasUserInteracted) return;

    if (formData.accountNumber && formData.bankName && banks.length > 0) {
      const bank = banks.find((b) => b.name === formData.bankName);
      if (bank && formData.accountNumber.length >= 10) {
        setIsVerifying(true);
        verifyAccount(formData.accountNumber, bank.code);
      }
    }
  }, [
    formData.accountNumber,
    formData.bankName,
    banks,
    verifyAccount,
    hasUserInteracted,
  ]);

  const handleBankChange = (value: string, field: string) => {
    setHasUserInteracted(true);
    const updatedFormData = {
      ...formData,
      [field]: value,
    };
    setFormData(updatedFormData);
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const bank = banks.find((b) => b.name === formData.bankName);
      if (!bank) {
        throw new Error("Bank not found");
      }

      const data: ICreateSubaccount = {
        bank_code: bank.code,
        account_number: formData.accountNumber,
        business_name: formData.accountName,
        percentage_charge: 0,
      };

      const response = await fetch("/api/banks/subaccount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to create subaccount");
      }

      const sub_account_code = result.data;
      const updatedProfile = await updateBankDetails(userId, {
        ...formData,
        sub_account_code: sub_account_code.subaccount_code,
      });

      queryClient.setQueryData(["profile", userId], updatedProfile);

      setHasUserInteracted(false);
      lastInitialDataRef.current = JSON.stringify({
        account_number: updatedProfile.account_number,
        bank_name: updatedProfile.bank_name,
        account_name: updatedProfile.account_name,
        sub_account_code: updatedProfile.sub_account_code,
      });

      toast({
        title: "Success",
        description: "Bank details updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating bank details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update bank details",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    isVerifying,
    banks,
    isLoadingBanks,
    isVerified: !!formData.accountName,
    formData,
    handleBankChange,
    handleBankSubmit,
  };
}
