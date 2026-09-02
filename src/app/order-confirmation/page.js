import { redirect } from 'next/navigation';

export default function OrderConfirmationFallback() {
    redirect('/my-orders');
}
