import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Meal, Food, UserMeals } from '../interfaces/food.interface';
import { catchError } from 'rxjs/operators';
import { FoodService } from './food.service';

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

  foodService = inject(FoodService);

  private roundToZero(value: number): number {
    const epsilon = 1e-10; // Umbral para considerar el valor como cero
    return Math.abs(value) < epsilon ? 0 : value;
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
  // Método para agregar un alimento a una comida
  addFoodToMeal(food: Food, mealName: string) {
    if (!this.userId) {
      console.error('No hay un usuario autenticado');
      return;
    }

    const currentMeals = this.mealsSubject.getValue();
    const meal = currentMeals.find(m => m.name === mealName);

    if (meal) {
      // Agregar alimento a la comida existente
      meal.foods.push(food); // No es necesario añadir amountInGrams

      // Calcular nutrientes del alimento y actualizar totales
      const nutrients = this.calculateNutrients(food);
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
        foods: [food], // No es necesario añadir amountInGrams
        totalCalories: 0,
        totalProteins: 0,
        totalCarbs: 0,
        totalFats: 0,
      };

      // Calcular nutrientes del nuevo alimento y agregar
      const nutrients = this.calculateNutrients(food);
      newMeal.totalCalories = nutrients.calories;
      newMeal.totalProteins = nutrients.proteins;
      newMeal.totalCarbs = nutrients.carbs;
      newMeal.totalFats = nutrients.fats;

      // Guardar la nueva comida en JSON Server
      currentMeals.push(newMeal);
      this.updateUserMeals(currentMeals);
    }
  }

  private calculateNutrients(food: Food) {
    const calories = food.foodNutrients.find(n => n.nutrientName === 'Energy')?.value || 0;
    const proteins = food.foodNutrients.find(n => n.nutrientName === 'Protein')?.value || 0;
    const carbs = food.foodNutrients.find(n => n.nutrientName === 'Carbohydrate, by difference')?.value || 0;
    const fats = food.foodNutrients.find(n => n.nutrientName === 'Total lipid (fat)')?.value || 0;

    return { calories, proteins, carbs, fats };
  }


  getTotalCalories(): number {
    const currentMeals = this.mealsSubject.getValue();
    return currentMeals.reduce((total, meal) => total + meal.totalCalories, 0);
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
            const nutrientsToRemove = this.calculateNutrients(meal.foods[foodIndex]); 

            // Eliminar el alimento de la lista
            meal.foods.splice(foodIndex, 1);
            
            // Restar nutrientes asegurándote de que no sean undefined
            console.log(amountInGrams)
            meal.totalCalories = this.roundToZero(meal.totalCalories - nutrientsToRemove.calories);
            meal.totalProteins = this.roundToZero((meal.totalProteins ?? 0) - nutrientsToRemove.proteins);
            meal.totalCarbs = this.roundToZero((meal.totalCarbs ?? 0) - nutrientsToRemove.carbs);
            meal.totalFats = this.roundToZero((meal.totalFats ?? 0) - nutrientsToRemove.fats);
            // Actualizar la comida en JSON Server
            this.updateUserMeals(currentMeals); // Asegúrate de llamar aquí
        }
    }
}

// Método para actualizar la cantidad de un alimento en una comida
// Método para actualizar la cantidad de un alimento en una comida
updateFoodAmountInMeal(mealName: string, foodDescription: string, newAmountInGrams: number): void {
  if (!this.userId) {
      console.error('No hay un usuario autenticado');
      return;
  }

  const currentMeals = this.mealsSubject.getValue();
  const mealIndex = currentMeals.findIndex(m => m.name === mealName);

  if (mealIndex !== -1) {
      const meal = currentMeals[mealIndex];
      const foodIndex = meal.foods.findIndex(food => food.description === foodDescription);

      if (foodIndex !== -1) {
          const food = meal.foods[foodIndex];
          if (newAmountInGrams < 0) {
              console.error('La cantidad no puede ser negativa');
              return;
          }

          // Obtener los nutrientes originales del alimento paso a paso
          let energyOriginal = 0;
          let proteinOriginal = 0;
          let carbsOriginal = 0;
          let fatsOriginal = 0;

          if (food.foodNutrients) {
              food.foodNutrients.forEach(nutrient => {
                  switch (nutrient.nutrientName) {
                      case 'Energy':
                          energyOriginal = nutrient.value;
                          break;
                      case 'Protein':
                          proteinOriginal = nutrient.value;
                          break;
                      case 'Carbohydrate, by difference':
                          carbsOriginal = nutrient.value;
                          break;
                      case 'Total lipid (fat)':
                          fatsOriginal = nutrient.value;
                          break;
                  }
              });
          }

          // Obtener el alimento con nutrientes ajustados para la nueva cantidad
          this.foodService.getNutrientsForFood(foodDescription, newAmountInGrams).subscribe(nutrientsNuevos => {
              if (!nutrientsNuevos) return;

              // Actualizar la cantidad en gramos del alimento
              meal.foods[foodIndex] = { ...nutrientsNuevos, amountInGrams: newAmountInGrams };

              console.log('Nutrientes originales:', { energyOriginal, proteinOriginal, carbsOriginal, fatsOriginal });
              console.log('Nutrientes nuevos:', nutrientsNuevos);

              // Comparar y actualizar los totales de nutrientes
              meal.totalCalories = this.roundToZero(meal.totalCalories - energyOriginal + nutrientsNuevos.foodNutrients[0].value);
              meal.totalProteins = this.roundToZero((meal.totalProteins ?? 0) - proteinOriginal + nutrientsNuevos.foodNutrients[1].value);
              meal.totalCarbs = this.roundToZero((meal.totalCarbs ?? 0) - carbsOriginal + nutrientsNuevos.foodNutrients[2].value);
              meal.totalFats = this.roundToZero((meal.totalFats ?? 0) - fatsOriginal + nutrientsNuevos.foodNutrients[3].value);

              console.log(meal);

              // Guardar los cambios
              this.updateUserMeals(currentMeals);
          });
      }
  }
}



  


}
