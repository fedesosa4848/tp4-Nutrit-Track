// src/app/utils/meals.utils.ts
import { Meal, UserMeals } from '../interfaces/food.interface';

export function createDefaultUserMeals(userId: string): UserMeals {
  const defaultMeals: Meal[] = [
    { name: 'BreakFast', foods: [], totalCalories: 0, totalProteins: 0, totalCarbs: 0, totalFats: 0 },
    { name: 'Lunch', foods: [], totalCalories: 0, totalProteins: 0, totalCarbs: 0, totalFats: 0 },
    { name: 'Snack', foods: [], totalCalories: 0, totalProteins: 0, totalCarbs: 0, totalFats: 0 },
    { name: 'Dinner', foods: [], totalCalories: 0, totalProteins: 0, totalCarbs: 0, totalFats: 0 },
    { name: 'Dessert', foods: [], totalCalories: 0, totalProteins: 0, totalCarbs: 0, totalFats: 0 },
  ];

  return {
    id: userId,
    meals: defaultMeals,
  };
}
