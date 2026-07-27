import { redirect } from 'next/navigation';

export default function VerifyOtpRedirect() {
  redirect('/auth/verify-otp');
}
