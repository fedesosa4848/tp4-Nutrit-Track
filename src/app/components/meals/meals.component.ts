import { Component, OnInit } from '@angular/core';
import { MealService } from '../../services/meals.service';
import { Food, Meal } from '../../interfaces/food.interface';
import { CommonModule } from '@angular/common';
import { MacronutrientChartComponent } from '../../macronutrient-chart/macronutrient-chart.component';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts'; 

@Component({
  selector: 'app-meals',
  standalone: true,
  imports: [CommonModule,MacronutrientChartComponent,CanvasJSAngularChartsModule],
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.css'] 
})
export class MealsComponent implements OnInit {

  showCharts: boolean[] = []; // Arreglo para manejar el estado de los gráficos

  meals: Meal[] = [];
  totalCalories: number = 0; //  variable para almacenar las calorías totales

  constructor(private mealService: MealService) {}

  ngOnInit(): void {
    this.mealService.meals$.subscribe((meals) => {
      this.meals = meals;
      this.totalCalories = this.mealService.getTotalCalories(); // Actualiza el total de calorías
      this.showCharts = new Array(this.meals.length).fill(false); // Inicializa el arreglo en falso

    });
  }

  getCalories(food: Food): string {
    const calories = food.foodNutrients?.find(n => n.nutrientName === 'Energy');
    return calories ? calories.value.toString() : 'Nutrient data not available';
  }

  removeFood(meal: Meal, food: Food): void {
    this.mealService.removeFoodFromMeal(meal.name, food.description); // Llama al método del servicio
    this.totalCalories = this.mealService.getTotalCalories(); // Actualiza las calorías totales
}

toggleChart(index: number) {
  this.showCharts[index] = !this.showCharts[index]; // Cambia el estado del gráfico correspondiente
}

}
