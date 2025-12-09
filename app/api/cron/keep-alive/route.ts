import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // Ensure this route is not cached

export async function GET() {
    try {
        // Perform a lightweight operation to keep the project alive
        // Select from 'email_verification_codes' or 'users' just to trigger a DB read.

        const { data, error } = await supabase
            .from('email_verification_codes')
            .select('id')
            .limit(1);

        if (error) {
            console.error('Supabase Cron: Query Error:', error.message);
            // Even if table lookup failed, we likely hit the DB.
            return NextResponse.json({ status: 'warning', message: 'DB reached but query failed', error: error.message }, { status: 200 });
        }

        console.log('Supabase Cron: Ping Successful', data);
        return NextResponse.json({ status: 'ok', message: 'Supabase is alive', timestamp: new Date().toISOString() });
    } catch (error: unknown) {
        console.error('Supabase Cron: Critical Error:', error);
        const err = error as Error;
        return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
    }
}
