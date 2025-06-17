'use client'

import { useState, useEffect } from 'react';
import supabase from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

const cookingTips = [
  "Read the entire recipe before starting.",
  "Always preheat your oven or pan.",
  "Use fresh herbs for better flavor.",
  "Season as you go—not just at the end.",
  "Taste your food often.",
  "Don't overcrowd the pan.",
  "Let meat rest before slicing.",
  "Salt pasta water generously.",
  "Use a thermometer to check doneness.",
  "Cut ingredients to uniform size for even cooking.",
  "Add a splash of acid (lemon/vinegar) to brighten dishes.",
  "Layer flavors—don't dump everything in at once.",
  "Toast spices to enhance aroma.",
  "Don't be afraid to use salt—judiciously.",
  "Freshly ground pepper makes a difference.",
  "Deglaze pans with wine or broth for depth.",
  "Balance salt, acid, fat, and heat.",
  "Caramelize onions slowly for sweetness.",
  "Add herbs at the end for freshness.",
  "Use miso, anchovies, or soy for umami.",
  "A sharp knife is safer than a dull one.",
  "Learn the claw grip for safer slicing.",
  "Use the right knife for the task.",
  "Clean and dry knives immediately after use.",
  "Cut against the grain for tender meat.",
  "Keep a damp towel under your cutting board.",
  "Practice your knife skills—it saves time.",
  "Dice onions by cutting vertically and horizontally first.",
  "Use a serrated knife for tomatoes and bread.",
  "Always use a stable cutting board.",
  "Mise en place: prep all ingredients before starting.",
  "Use a kitchen scale for accuracy in baking.",
  "Room temperature eggs mix better in batters.",
  "Let cookie dough chill before baking for better texture.",
  "Don't flip pancakes until bubbles form and pop.",
  "Don't press burgers while they cook—retain the juices.",
  "Let steaks sear without moving them.",
  "Use parchment paper to prevent sticking.",
  "Rinse rice to remove excess starch.",
  "Soak potatoes to get crispy fries.",
  "Use unsalted butter to control salt levels.",
  "Add garlic later in cooking to prevent burning.",
  "Use cold water to peel hard-boiled eggs easily.",
  "Keep your pantry stocked with basics: rice, beans, spices.",
  "Freeze extra herbs in olive oil cubes.",
  "Use the oven light instead of opening the door.",
  "Let bread dough rise in a warm place.",
  "Use cornstarch slurry to thicken sauces quickly.",
  "Don't boil milk—simmer to prevent curdling.",
  "Fold gently to keep air in whipped mixtures.",
  "Cut brownies with a plastic knife for cleaner edges.",
  "Clean as you go to stay organized.",
  "Use an ice cream scoop for even cookie portions.",
  "Don't marinate fish too long—30 mins max.",
  "Let soup or stew sit overnight for deeper flavor.",
  "Use an instant-read thermometer for accuracy.",
  "Rest pasta before cutting if making fresh noodles.",
  "Wipe mushrooms instead of rinsing to prevent sogginess.",
  "Crack eggs on a flat surface, not the bowl.",
  "Use a muffin tin for perfectly portioned dishes.",
  "Add a pinch of sugar to tomato sauces to balance acidity.",
  "Slice meat thinly for stir-fries.",
  "Toast nuts before adding to recipes for better flavor.",
  "Use citrus zest to brighten dishes.",
  "Warm tortillas before serving to make them pliable.",
  "Grease pans with butter and flour for cakes.",
  "Use a baking stone or steel for crispier pizza.",
  "Keep a kitchen towel nearby instead of paper towels.",
  "Invest in a good non-stick pan.",
  "Don't store tomatoes in the fridge.",
  "Use an oven thermometer to ensure correct temps.",
  "Store knives blade-up in a drawer or block.",
  "Add pasta to sauce, not the other way around.",
  "Use leftovers creatively—make frittatas, soups, or wraps.",
  "Blanch vegetables to keep their color vibrant.",
  "Don't overcrowd your baking sheet.",
  "Use kosher salt for more consistent seasoning.",
  "Shred cold cheese—it melts better.",
  "Boil citrus before juicing to get more juice.",
  "Use rice vinegar in dressings for a mild kick.",
  "Label and date leftovers before storing.",
  "Keep onions and potatoes separate—they spoil faster together.",
  "Store fresh herbs in water like flowers.",
  "Cut citrus crosswise for more juice.",
  "Don't wash cast iron with soap—just hot water.",
  "Toast bread crumbs in butter for added crunch.",
  "Use a bench scraper for easy dough cleanup.",
  "Don't discard pickle juice—use it in dressings or marinades.",
  "Cover pans with a lid to speed up boiling.",
  "Use mayonnaise instead of butter for grilled cheese.",
  "Always taste before serving.",
  "Reheat pizza in a skillet for a crisp crust.",
  "Let cheese come to room temp before serving.",
  "Warm plates before plating hot food.",
  "Cool baked goods on a wire rack.",
  "Test baking powder/soda freshness in water.",
  "Add coffee to chocolate desserts for richer flavor.",
  "Use broth instead of water for more flavorful grains.",
  "Keep butter wrappers to grease pans.",
  "Use leftover bones and veggie scraps for homemade stock.",
  "Clean produce as soon as you get home.",
  "Use a salad spinner for washed herbs too.",
  "Practice patience—great food takes time.",
  "Cooking is a skill—experiment and have fun!"
];

export default function RightPanel() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [tipIndex, setTipIndex] = useState(0);
  const Router = useRouter();

  // Dummy loadSaved function to prevent ReferenceError
  const loadSaved = async (_user) => {
    // Implement your logic here if needed
    return;
  };

  useEffect(() => {
    let listener;
    const getUserAndLoad = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await loadSaved(user);
        setLoading(false);
      } else {
        Router.push('/login'); // Redirect to login if no user
      }
    };

    getUserAndLoad();

    listener = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session ? session.user : null;
      setUser(currentUser);
      if (currentUser) {
        loadSaved(currentUser).then(() => { setLoading(false); });
      } else {
        Router.push('/login'); // Redirect to login if no user
      }
    });

    const interval = setInterval(() => {
      setTipIndex((prevIndex) => (prevIndex + 1) % cookingTips.length);
    }, 5000);

    return () => {
      if (listener && listener.data && listener.data.subscription) {
        listener.data.subscription.unsubscribe();
      }
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Router]);

  if (!user) return null;

  return (
    <div className="right">
      <p style={{ fontWeight: 'bold', fontSize: '1rem', margin: '1rem', padding: '1rem' }}>
        {cookingTips[tipIndex]}
      </p>
    </div>
  );
}