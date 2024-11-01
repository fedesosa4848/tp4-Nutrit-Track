import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Meal, Food, UserMeals } from '../interfaces/food.interface';
import { catchError } from 'rxjs/operators';
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
    if (!this.userId) {
      console.error('No hay un usuario autenticado');
      return;
    }
  
    this.http.get<UserMeals>(`${this.apiUrl}/${this.userId}`)
      .pipe(
        map((userMeals) => {
          const meals = userMeals?.meals || [];
          const requiredMeals = ['BreakFast', 'Lunch', 'Snack', 'Dinner', 'Dessert'];
  
          // Añadir comidas requeridas si faltan
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
        }),
        catchError((error) => {
          if (error.status === 404) {
            // Si no existe el recurso, creamos una entrada nueva para este usuario
            const newUserMeals: UserMeals = {
              id: this.userId as string,
              meals: [
                { name: 'BreakFast', foods: [], totalCalories: 0, totalProteins: 0, totalCarbs: 0, totalFats: 0 },
                { name: 'Lunch', foods: [], totalCalories: 0, totalProteins: 0, totalCarbs: 0, totalFats: 0 },
                { name: 'Snack', foods: [], totalCalories: 0, totalProteins: 0, totalCarbs: 0, totalFats: 0 },
                { name: 'Dinner', foods: [], totalCalories: 0, totalProteins: 0, totalCarbs: 0, totalFats: 0 },
                { name: 'Dessert', foods: [], totalCalories: 0, totalProteins: 0, totalCarbs: 0, totalFats: 0 },
              ],
            };
            // Crear el nuevo recurso en JSON Server
            return this.http.post<UserMeals>(this.apiUrl, newUserMeals).pipe(map(() => newUserMeals.meals));
          }
          throw error;
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
        meal.foods.push({
            ...food,
            amountInGrams // Aquí añadimos la cantidad en gramos al alimento
        });

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
            foods: [{
                ...food,
                amountInGrams // Aquí añadimos la cantidad en gramos al alimento
            }],
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
      id: this.userId as string,
      meals: meals,
    };

    // Actualizar las comidas del usuario en JSON Server
    this.http.put(`${this.apiUrl}/${this.userId}`, userMeals).subscribe();
  }


  removeFoodFromMeal(mealName: string, foodDescription: string): void {
    if (!this.userId) {
        console.error('No hay un usuario autenticado');
        return;
    }

    const currentMeals = this.mealsSubject.getValue();
    const meal = currentMeals.find(m => m.name === mealName);

    if (meal) {
        // Eliminar el alimento de la comida
        const foodIndex = meal.foods.findIndex(food => food.description === foodDescription);
        if (foodIndex !== -1) {
            // Obtener la cantidad en gramos del alimento a eliminar
            const amountInGrams = meal.foods[foodIndex].amountInGrams ?? 0;

            // Calcular los nutrientes a eliminar
            const nutrientsToRemove = this.calculateNutrients(meal.foods[foodIndex], amountInGrams); 

            // Eliminar el alimento de la lista
            meal.foods.splice(foodIndex, 1);
            
            // Restar nutrientes asegurándote de que no sean undefined
            console.log(amountInGrams)
            meal.totalCalories = Math.max(0, meal.totalCalories - nutrientsToRemove.calories); // Evitar negativos
            meal.totalProteins = Math.max(0, (meal.totalProteins ?? 0) - nutrientsToRemove.proteins);
            meal.totalCarbs = Math.max(0, (meal.totalCarbs ?? 0) - nutrientsToRemove.carbs);
            meal.totalFats = Math.max(0, (meal.totalFats ?? 0) - nutrientsToRemove.fats);

            // Actualizar la comida en JSON Server
            this.updateUserMeals(currentMeals); // Asegúrate de llamar aquí
        }
    }
}

  


}
