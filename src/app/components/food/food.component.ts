import { Component, OnInit } from '@angular/core';
import { Food } from '../../interfaces/food.interface';
import { FoodService } from '../../services/food.service';
import { MealService } from '../../services/meals.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-food',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './food.component.html',
  styleUrls: ['./food.component.css']
})
export class FoodComponent implements OnInit {
  foodData: Food[] = [];
  foodItem: string = '';
  foodNutritionalInfo: { [key: string]: { calories: number, protein: number, carbs: number, fat: number } } = {};
  selectedMeal: string = '';
  isLoggedIn: boolean = false;
  amountInGrams: number = 100; // Cantidad predeterminada para cálculo

   


  constructor(private foodService: FoodService, private mealService: MealService, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
    });
    this.searchFood();
  }

  searchFood(): void {
    if (!this.foodItem.trim()) {
      this.foodData = [];
      return;
    }
  
    this.foodService.getFood(this.foodItem).subscribe((foods: Food[]) => {
      // Filtramos para obtener descripciones únicas
      const uniqueDescriptions = new Set<string>();
      const uniqueFoods: Food[] = [];
  
      foods.forEach(food => {
        if (
          food.description.toLowerCase().includes(this.foodItem.toLowerCase()) &&
          !uniqueDescriptions.has(food.description.toLowerCase())
        ) {
          uniqueDescriptions.add(food.description.toLowerCase());
          uniqueFoods.push(food);
        }
      });
  
      this.foodData = uniqueFoods.slice(0, 13); // Mostramos los primeros 13 resultados
  
      // Calculamos los valores nutricionales
      this.foodData.forEach(food => {
        const calories = food.foodNutrients.find(n => n.nutrientName === 'Energy')?.value || 0;
        const protein = food.foodNutrients.find(n => n.nutrientName === 'Protein')?.value || 0;
        const carbs = food.foodNutrients.find(n => n.nutrientName === 'Carbohydrate, by difference')?.value || 0;
        const fat = food.foodNutrients.find(n => n.nutrientName === 'Total lipid (fat)')?.value || 0;
  
        this.foodNutritionalInfo[food.description] = { calories, protein, carbs, fat };
        
      });

      
    });
  }
  

  onSearchChange(): void {
    this.searchFood();
  }

  // Calcula la información nutricional en base a la cantidad ingresada
  calculateNutrientsForAmount(food: Food): { calories: number, protein: number, carbs: number, fat: number } {
    const nutrients = this.foodNutritionalInfo[food.description];
    return {
      calories: (nutrients.calories * this.amountInGrams) / 100,
      protein: (nutrients.protein * this.amountInGrams) / 100,
      carbs: (nutrients.carbs * this.amountInGrams) / 100,
      fat: (nutrients.fat * this.amountInGrams) / 100,
    };
  }

  selectFood(food: Food,amountInGrams:number) {
    // Calcular los nutrientes para la cantidad especificada
    const nutrientsForAmount = this.calculateNutrientsForAmount(food);
    
    // let newFood:Food = {
    //   description: '',
    //   ingredients: '',
    //   amountInGrams : 0,
    //   foodNutrients: [
    //     { nutrientName: 'Energy', value: 0, unitName: 'kcal' },
    //     { nutrientName: 'Protein', value: 0, unitName: 'g' },
    //     { nutrientName: 'Carbohydrate, by difference', value: 0, unitName: 'g' },
    //     { nutrientName: 'Total lipid (fat)', value: 0, unitName: 'g' }
    //   ],
    // };

    // Asignar el alimento y sus nutrientes a newFood
    let newFood:Food = { 
      ...food, // Propiedades de food
      amountInGrams:amountInGrams,
      foodNutrients: [
        { nutrientName: 'Energy', value: nutrientsForAmount.calories, unitName: 'kcal' },
        { nutrientName: 'Protein', value: nutrientsForAmount.protein, unitName: 'g' },
        { nutrientName: 'Carbohydrate, by difference', value: nutrientsForAmount.carbs, unitName: 'g' },
        { nutrientName: 'Total lipid (fat)', value: nutrientsForAmount.fat, unitName: 'g' }
      ]
    };
    return newFood; // Asegúrate de que esto se retorne

  }
  

  addFoodToMeal(food: Food) {
    if (this.selectedMeal && this.isLoggedIn) {
      // Calcular los nutrientes para la cantidad especificada
      // const nutrientsForAmount = this.calculateNutrientsForAmount(food);

      this.mealService.addFoodToMeal(this.selectFood(food,this.amountInGrams), this.selectedMeal);
      this.selectedMeal = ''; // Reinicia la selección después de añadir
    } else if (!this.isLoggedIn) {
      console.error('Usuario no autenticado');
    }
  }
}
