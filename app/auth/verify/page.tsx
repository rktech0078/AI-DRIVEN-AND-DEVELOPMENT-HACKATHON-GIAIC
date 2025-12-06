import { Suspense } from 'react';
import VerifyEmailForm from '@/components/auth/VerifyEmailForm'

function VerifyEmailPageContent() {
    return <VerifyEmailForm />;
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailPageContent />
        </Suspense>
    );
}
