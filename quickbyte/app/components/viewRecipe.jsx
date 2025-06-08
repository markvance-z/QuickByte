'use client';

import React, {useState, useEffect} from 'react';
import supabase from '../../lib/supabaseClient';

export default function ViewRecipe() {
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    return (
        <div>
            Please select a recipe.
        </div>

    );

}
