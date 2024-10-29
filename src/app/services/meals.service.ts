import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Meal, Food, UserMeals } from '../interfaces/food.interface';

@Injectable({
  providedIn: 'root',
})
export class MealService {
  private apiUrl = 'http://localhost:3000/userMeals'; // Cambia la URL para apuntar al endpoint de UserMeals
  private mealsSubject = new BehaviorSubject<Meal[]>([]);
  meals$ = this.mealsSubject.asObservable();
  private userId: string | null = null;

  constructor(private http: HttpClient) {
    this.userId = localStorage.getItem('userToken');
    this.loadMeals(); // Cargar comidas al iniciar el servicio
  }

  // Método para cargar las comidas desde JSON Server
  private loadMeals(): void {
    this.http.get<UserMeals[]>(`${this.apiUrl}?userId=${this.userId}`)
      .pipe(
        map((userMeals) => {
          // Filtrar por el usuario y asegurarse de que el usuario tenga las 5 comidas
          const userMealsData = userMeals.find(um => um.userId === this.userId);
          const meals = userMealsData ? userMealsData.meals : [];

          const requiredMeals = ['BreakFast', 'Lunch', 'Snack', 'Dinner', 'Dessert'];
          requiredMeals.forEach((mealName) => {
            if (!meals.some(meal => meal.name === mealName)) {
              meals.push({
                name: mealName,
                foods: [],
                totalCalories: 0,
                totalProteins: 0,
                totalCarbs: 0,
                totalFats: 0,
              });
            }
          });
          return meals;
        })
      )
      .subscribe((meals) => this.mealsSubject.next(meals));
  }

  // Método para agregar un alimento a una comida
  addFoodToMeal(food: Food, mealName: string, amountInGrams: number) {
    if (!this.userId) {
      console.error('No hay un usuario autenticado');
      return;
    }

    const currentMeals = this.mealsSubject.getValue();
    const meal = currentMeals.find(m => m.name === mealName);

    if (meal) {
      // Agregar alimento a la comida existente
      meal.foods.push(food);
      const nutrients = this.calculateNutrients(food, amountInGrams);
      meal.totalCalories += nutrients.calories;
      meal.totalProteins = (meal.totalProteins || 0) + nutrients.proteins;
      meal.totalCarbs = (meal.totalCarbs || 0) + nutrients.carbs;
      meal.totalFats = (meal.totalFats || 0) + nutrients.fats;

      // Actualizar la comida en JSON Server
      this.updateUserMeals(currentMeals);
    } else {
      // Crear nueva comida si no existe
      const newMeal: Meal = {
        name: mealName,
        foods: [food],
        totalCalories: 0,
        totalProteins: 0,
        totalCarbs: 0,
        totalFats: 0,
      };

      // Calcular nutrientes del nuevo alimento y agregar
      const nutrients = this.calculateNutrients(food, amountInGrams);
      newMeal.totalCalories = (newMeal.totalCalories ?? 0) + nutrients.calories;
      newMeal.totalProteins = (newMeal.totalProteins ?? 0) + nutrients.proteins;
      newMeal.totalCarbs = (newMeal.totalCarbs ?? 0) + nutrients.carbs;
      newMeal.totalFats = (newMeal.totalFats ?? 0) + nutrients.fats;

      // Guardar la nueva comida en JSON Server
      currentMeals.push(newMeal);
      this.updateUserMeals(currentMeals);
    }
  }

  getTotalCalories(): number {
    const currentMeals = this.mealsSubject.getValue();
    return currentMeals.reduce((total, meal) => total + meal.totalCalories, 0);
  }

  private calculateNutrients(food: Food, amountInGrams: number) {
    const calories = (food.foodNutrients.find(n => n.nutrientName === 'Energy')?.value || 0) * (amountInGrams / 100);
    const proteins = (food.foodNutrients.find(n => n.nutrientName === 'Protein')?.value || 0) * (amountInGrams / 100);
    const carbs = (food.foodNutrients.find(n => n.nutrientName === 'Carbohydrate, by difference')?.value || 0) * (amountInGrams / 100);
    const fats = (food.foodNutrients.find(n => n.nutrientName === 'Total lipid (fat)')?.value || 0) * (amountInGrams / 100);

    return { calories, proteins, carbs, fats };
  }

  private updateUserMeals(meals: Meal[]) {
    const userMeals: UserMeals = {
      userId: this.userId as string,
      meals: meals,
    };

    // Actualizar las comidas del usuario en JSON Server
    this.http.put(`${this.apiUrl}/${this.userId}`, userMeals).subscribe();
  }
}
