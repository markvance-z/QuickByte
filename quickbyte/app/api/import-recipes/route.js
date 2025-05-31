/* import dataset from kaggle into supabase. Please do not undo the comments. Thank you. 
import { createClient } from "@supabase/supabase-js";   
import { NextResponse } from "next/server";
import Papa from "papaparse";

let alreadyImported = false;

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
    if (alreadyImported) {
        return NextResponse.json({ message: "Recipes already imported" }, { status: 200 });
    }

    alreadyImported = true;

    const filestoImport = [
        'RAW_recipes3370_1.csv',
        'RAW_recipes3370_2.csv',        
        'RAW_recipes3370_3.csv',
        'RAW_recipes3370_4.csv',
        'RAW_recipes3370_5.csv',
        'RAW_recipes3370_6.csv'
    ];

    const BATCH_SIZE = 1000;

    for (const filename of filestoImport) {
        console.log(`Downloading: ${filename}`);
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('csv-uploads')
            .download(filename);

        if (downloadError) {
            console.error(`Failed to download ${filename}:`, downloadError);
            return NextResponse.json({ error: `Failed to download ${filename}`, details: downloadError.message }, { status: 500 });
        }

        const text = await fileData.text();
        console.log(`Parsing: ${filename}`);

        const { data: parsed, errors } = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
        });

        if (errors.length > 0) {
            console.warn(`CSV parse errors in ${filename}:`, errors);
        }

        console.log(`Total rows parsed from ${filename}: ${parsed.length}`);

        // Deduplicate parsed data by title
        const uniqueMap = new Map();
        for (const recipe of parsed) {
            if (!uniqueMap.has(recipe.title)) {
                uniqueMap.set(recipe.title, recipe);
            }
        }
        const uniqueRecipes = Array.from(uniqueMap.values());

        // Batch insert unique rows
        for (let i = 0; i < uniqueRecipes.length; i += BATCH_SIZE) {
            const batch = uniqueRecipes.slice(i, i + BATCH_SIZE);
            console.log(`Inserting rows ${i} to ${i + batch.length} from ${filename}`);
            const { error: insertError } = await supabase
                .from('recipes')
                .upsert(batch, { onConflict: 'title' });

            if (insertError) {
                console.error(`Failed to insert batch starting at row ${i}:`, insertError);
                return NextResponse.json({ error: `Failed to insert data batch from ${filename}`, details: insertError.message }, { status: 500 });
            }
        }

        console.log(`Successfully inserted all data from ${filename}`);
    }

    return NextResponse.json({ message: "All recipes imported successfully" }, { status: 200 });
}
*/