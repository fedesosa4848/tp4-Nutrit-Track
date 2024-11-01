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

  // En FoodService
// getNutrientsForFood(foodDescription: string, amountInGrams: number): Observable<Food | null> {
//   console.log(foodDescription)
//   return this.getFood(foodDescription).pipe(
//       map(foods => {
//           const food = foods.find(f => f.description === foodDescription);
//           if (!food) {
//               console.error('Alimento no encontrado');
//               return null;
//           }
          
//           console.log(foodDescription)

//           // Escalar nutrientes según la cantidad en gramos especificada
//           const scaleFactor = amountInGrams / 100;
//           const adjustedNutrients = food.foodNutrients.map(nutrient => ({
//               ...nutrient,
//               value: nutrient.value * scaleFactor // Escala el valor del nutriente
//           }));

//           console.log(adjustedNutrients)
          
//           return {
//               ...food,
//               amountInGrams,
//               foodNutrients: adjustedNutrients
//           };
//       })
//   );
// }

getNutrientsForFood(foodDescription: string, amountInGrams: number): Observable<Food | null> {
  return this.getFood(foodDescription).pipe(
      map(foods => {
          const food = foods.find(f => f.description === foodDescription);
          if (!food) {
              console.error('Alimento no encontrado');
              return null;
          }

          // Calcular el factor de escala
          const scaleFactor = amountInGrams / 100;

          // Filtrar solo los nutrientes deseados
          const desiredNutrients = ["Energy", "Protein", "Carbohydrate, by difference", "Total lipid (fat)"];
          const adjustedNutrients = food.foodNutrients
              .filter(nutrient => desiredNutrients.includes(nutrient.nutrientName))
              .map(nutrient => ({
                  nutrientName: nutrient.nutrientName,
                  unitName: nutrient.unitName,
                  value: nutrient.value * scaleFactor // Escalar el valor del nutriente
              }));

          return {
              ...food,
              amountInGrams,
              foodNutrients: adjustedNutrients
          };
      })
  );
}




  
}
