import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          *,
          ingredients (*)
        )
      `)
      .order('name', { ascending: true });

    if (error) throw error;

    // Calculer le coût de chaque recette
    const recipesWithCost = data?.map(recipe => {
      const totalCost = recipe.recipe_ingredients?.reduce((sum: number, ri: any) => {
        const ingredientCost = ri.ingredients?.unit_cost || 0;
        return sum + (ri.quantity * ingredientCost);
      }, 0) || 0;

      return {
        ...recipe,
        total_cost: totalCost.toFixed(2),
        cost_per_serving: recipe.servings > 0 ? (totalCost / recipe.servings).toFixed(2) : '0.00',
      };
    }) || [];

    return NextResponse.json(recipesWithCost);
  } catch (error) {
    console.error('Recipes GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Créer la recette
    const { data: recipe, error: recipeError } = await supabaseAdmin
      .from('recipes')
      .insert({
        name: body.name,
        description: body.description,
        servings: body.servings,
        prep_time: body.prep_time,
        cook_time: body.cook_time,
        instructions: body.instructions,
        category: body.category,
      })
      .select()
      .single();

    if (recipeError) throw recipeError;

    // Ajouter les ingrédients de la recette
    if (body.ingredients && body.ingredients.length > 0) {
      const recipeIngredients = body.ingredients.map((ing: any) => ({
        recipe_id: recipe.id,
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity,
        unit: ing.unit,
      }));

      const { error: ingredientsError } = await supabaseAdmin
        .from('recipe_ingredients')
        .insert(recipeIngredients);

      if (ingredientsError) throw ingredientsError;
    }

    return NextResponse.json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    console.error('Recipes POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}

