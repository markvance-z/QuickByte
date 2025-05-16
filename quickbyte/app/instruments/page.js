import supabase from '../../lib/supabaseClient';
import styles from "../page.module.css";

export default async function Instruments() {
    const { data: instruments } = await supabase.from("instruments").select();

    return (
        <div className={styles.page}>
            <h1>Instruments</h1>

            <ul className={styles.li}>
                {instruments.map((instrument) => (
                    <li key={instrument.name}>{instrument.id} {instrument.name}</li>
                ))}
            </ul>
        </div>
    )
}
