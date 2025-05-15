import supabase from '../../lib/supabaseClient';

export default async function Instruments() {
    const { data: instruments } = await supabase.from("instruments").select();

    return <pre>{JSON.stringify(instruments, null, 2)}</pre>
}
