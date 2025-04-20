'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { usePayment } from '@/hooks/use-payment';
import { useQueryState } from 'nuqs';

export default function PaymentVerification() {
    const router = useRouter();
    const [reference] = useQueryState('reference');
    const { verifyPayment, error } = usePayment();
    const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const verifyPaymentStatus = async () => {
            try {
                if (!reference) {
                    setVerificationStatus('failed');
                    setErrorMessage('Invalid payment verification parameters');
                    return;
                }

                const isSuccessful = await verifyPayment(reference);

                if (isSuccessful) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setVerificationStatus('success');
                } else {
                    setVerificationStatus('failed');
                    setErrorMessage('Payment verification failed');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setVerificationStatus('failed');
                setErrorMessage('Failed to verify payment. Please contact support.');
            }
        };

        verifyPaymentStatus();
    }, [reference, verifyPayment]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-palette-baseWhite p-4">
            <Card className="w-full max-w-md p-8">
                <div className="flex flex-col items-center space-y-6">
                    {(verificationStatus === 'loading') && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-center"
                        >
                            <Loader2 className="w-16 h-16 animate-spin text-palette-primary mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold text-palette-gray01">Verifying Payment</h2>
                            <p className="text-palette-secondary mt-2">Please wait while we verify your payment...</p>
                        </motion.div>
                    )}

                    {verificationStatus === 'success' && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-center"
                        >
                            <CheckCircle2 className="w-16 h-16 text-palette-success mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold text-palette-gray01">Payment Successful!</h2>
                            <p className="text-palette-secondary mt-2">Thank you for your contribution.</p>
                            <div className="mt-6 space-y-3">
                                <Button
                                    onClick={() => router.push('/')}
                                    className="w-full bg-palette-primary hover:bg-primaryShades-700"
                                >
                                    Return to Home
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/cause')}
                                    className="w-full border-palette-primary text-palette-primary hover:bg-primaryShades-100"
                                >
                                    Browse More Causes
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {verificationStatus === 'failed' && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-center"
                        >
                            <XCircle className="w-16 h-16 text-palette-error mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold text-palette-gray01">Verification Failed</h2>
                            <p className="text-palette-secondary mt-2">{errorMessage}</p>
                            <div className="mt-6 space-y-3">
                                <Button
                                    onClick={() => router.push('/')}
                                    className="w-full bg-palette-primary hover:bg-primaryShades-700"
                                >
                                    Return to Home
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/causes')}
                                    className="w-full border-palette-primary text-palette-primary hover:bg-primaryShades-100"
                                >
                                    Try Another Cause
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </Card>
        </div>
    );
}
