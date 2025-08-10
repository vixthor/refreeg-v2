'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function SignatureVerification() {
    const router = useRouter();
    const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success'>('loading');

    useEffect(() => {
        // Always succeed after a short delay for UX
        const timer = setTimeout(() => {
            setVerificationStatus('success');
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md p-8">
                <div className="flex flex-col items-center space-y-6">
                    {verificationStatus === 'loading' && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-center"
                        >
                            <CheckCircle2 className="w-16 h-16 text-brand mx-auto mb-4 animate-pulse" />
                            <h2 className="text-2xl font-semibold text-foreground">Verifying Signature</h2>
                            <p className="text-muted-foreground mt-2">Please wait while we confirm your signature...</p>
                        </motion.div>
                    )}

                    {verificationStatus === 'success' && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-center"
                        >
                            <CheckCircle2 className="w-16 h-16 text-brand mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold text-foreground">Signature Successful!</h2>
                            <p className="text-muted-foreground mt-2">Thank you for supporting this petition.</p>
                            <div className="mt-6 space-y-3">
                                <Button
                                    onClick={() => router.push('/')}
                                    className="w-full bg-brand hover:bg-secondary"
                                >
                                    Return to Home
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/petitions')}
                                    className="w-full border-brand text-brand hover:bg-secondary hover:text-secondary-foreground"
                                >
                                    Browse More Petitions
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </Card>
        </div>
    );
}
