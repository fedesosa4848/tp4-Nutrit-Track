import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Food, Nutrient } from '../interfaces/food.interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private apiKey = 'WXR98JlYSznuZKeTrZ475zL2bGhiZHlSaL390rxV';
  private url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${this.apiKey}`;

  constructor(private http: HttpClient) {}

  getFood(foodItem: string): Observable<Food[]> {
    const url = `${this.url}&query=${foodItem}`;
    return this.http.get<{ foods: any[] }>(url).pipe(
      map(response => response.foods.map(apiFood => this.transformApiResponseToFood(apiFood)))
    );
  }

  // Función para transformar la respuesta de la API en un objeto Food
  private transformApiResponseToFood(apiResponse: any): Food {
    const desiredNutrients = ["Energy", "Protein", "Carbohydrate, by difference", "Total lipid (fat)"];

    // Filtramos solo los nutrientes necesarios
    const filteredNutrients: Nutrient[] = apiResponse.foodNutrients
      .filter((nutrient: any) => desiredNutrients.includes(nutrient.nutrientName))
      .map((nutrient: any) => ({
        nutrientName: nutrient.nutrientName,
        unitName: nutrient.unitName,
        value: nutrient.value
      }));

    // Retornamos el objeto con los datos requeridos
    return {
      description: apiResponse.description,
      ingredients: apiResponse.ingredients,
      foodNutrients: filteredNutrients
    };
  }
}
