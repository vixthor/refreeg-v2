import { useState, useEffect, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"
import Paystack from "@/services/paystack"
import type { BankDetailsFormData, ICreateSubaccount } from "@/types"
import { updateBankDetails } from "@/actions"
import { useQuery, useMutation } from "@tanstack/react-query"

interface UseBankProps {
    initialData?: {
        account_number: string | null
        bank_name: string | null
        account_name: string | null
        sub_account_code: string | null
    }
    userId: string
}

export function useBank({ initialData, userId }: UseBankProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [formData, setFormData] = useState<BankDetailsFormData>({
        accountNumber: initialData?.account_number || "",
        bankName: initialData?.bank_name || "",
        accountName: initialData?.account_name || "",
        sub_account_code: initialData?.sub_account_code || ""
    })

    // Fetch banks using React Query
    const { data: banks = [], isLoading: isLoadingBanks } = useQuery({
        queryKey: ['banks'],
        queryFn: async () => {
            const banksList = await Paystack.listBanks()
            // Deduplicate banks list
            return banksList.reduce((acc, bank) => {
                const key = `${bank.code}-${bank.name}`
                if (!acc.some(b => `${b.code}-${b.name}` === key)) {
                    acc.push(bank)
                }
                return acc
            }, [] as { name: string; code: string }[])
        },
    })

    // Account verification mutation
    const verifyAccountMutation = useMutation({
        mutationFn: async ({ accountNumber, bankCode }: { accountNumber: string; bankCode: string }) => {
            return Paystack.verifyAccountNumber(accountNumber, bankCode)
        },
        onSuccess: (verification) => {
            setFormData(prev => ({
                ...prev,
                accountName: verification.account_name
            }))
            toast({
                title: "Account verified",
                description: "Your bank account details have been verified successfully",
            })
        },
        onError: (error) => {
            console.error('Error verifying account:', error)
            toast({
                title: "Verification failed",
                description: "Could not verify the account details. Please check and try again.",
                variant: "destructive"
            })
        },
        onSettled: () => {
            setIsVerifying(false)
        }
    })

    // Debounced verification function
    const debouncedVerify = useCallback(
        (accountNumber: string, bankName: string) => {
            const bank = banks.find(b => b.name === bankName)
            if (bank) {
                setIsVerifying(true)
                verifyAccountMutation.mutate({
                    accountNumber,
                    bankCode: bank.code
                })
            }
        },
        [banks, verifyAccountMutation]
    )

    // Improved useEffect for account verification
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.accountNumber && formData.bankName && !verifyAccountMutation.isSuccess) {
                debouncedVerify(formData.accountNumber, formData.bankName)
            }
        }, 1000) // 1 second debounce

        return () => clearTimeout(timer)
    }, [formData.accountNumber, formData.bankName, debouncedVerify, verifyAccountMutation.isSuccess])

    // Handle bank details update mutation
    const updateBankDetailsMutation = useMutation({
        mutationFn: async (data: ICreateSubaccount) => {
            const sub_account_code = await Paystack.createSubaccount(data)
            await updateBankDetails(userId, { ...formData, sub_account_code: sub_account_code.subaccount_code })
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Bank details updated successfully",
            })
        },
        onError: (error) => {
            console.error('Error updating bank details:', error)
            toast({
                title: "Error",
                description: "Failed to update bank details",
                variant: "destructive"
            })
        }
    })

    const handleBankChange = (value: string, field: string) => {
        const updatedFormData = {
            ...formData,
            [field]: value
        }
        setFormData(updatedFormData)
    }

    const handleBankSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const bank = banks.find(b => b.name === formData.bankName)
            if (!bank) {
                throw new Error("Bank not found")
            }

            const data: ICreateSubaccount = {
                bank_code: bank.code,
                account_number: formData.accountNumber,
                business_name: formData.accountName,
                percentage_charge:0
            }

            await updateBankDetailsMutation.mutateAsync(data)
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        isSubmitting,
        isVerifying,
        banks,
        isLoadingBanks,
        isVerified: verifyAccountMutation.isSuccess,
        formData,
        handleBankChange,
        handleBankSubmit
    }
} 