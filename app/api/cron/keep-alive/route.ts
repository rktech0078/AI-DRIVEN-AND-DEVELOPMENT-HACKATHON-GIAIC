import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // Ensure this route is not cached

export async function GET() {
    try {
        // Perform a lightweight operation to keep the project alive
        // We'll just fetch the current time from the database or check a simple table
        // Since we might not have a specific table guaranteed, we can try a simple auth check or just a select on a known table if it exists.
        // A simple RPC call or just checking connection is usually enough.
        // Let's try to select from 'email_verification_codes' since we saw it in supabase.ts, limiting to 1 row.

        const { error } = await supabase
            .from('email_verification_codes')
            .select('id')
            .limit(1);

        if (error) {
            console.error('Supabase Keep-Alive Error:', error);
            // Even if there's an error (e.g. table empty), the request hit the DB, so it counts as activity.
            return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
        }

        console.log('Supabase Keep-Alive Ping Successful');
        return NextResponse.json({ status: 'ok', message: 'Supabase is alive' });
    } catch (error: unknown) {
        console.error('Supabase Keep-Alive Unexpected Error:', error);
        const err = error as Error;
        return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
    }
}
