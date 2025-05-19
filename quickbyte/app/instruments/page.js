import supabase from '../../lib/supabaseClient';
//import styles from "../page.module.css";

export default async function Instruments() {
    const { data: instruments } = await supabase.from("instruments").select();

    return (
        <div>
            <h1>Instruments</h1>
            <ul>
                {instruments.map((instrument) => (
                    <li key={instrument.name}>{instrument.id} {instrument.name}</li>
                ))}
            </ul>
        </div>
    )
}
