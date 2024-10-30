import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { tap } from 'rxjs';
import { UserMeals } from '../interfaces/food.interface';
import { createDefaultUserMeals } from '../utils/meals.utils';
@Injectable({
  providedIn: 'root',
})
export class UserServiceService {
  private apiUrl = 'http://localhost:3000/users'; // URL del json-server
  private userMealsUrl = 'http://localhost:3000/userMeals'; // URL para userMeals

  constructor(private http: HttpClient) {}

  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap((user) => {
        // Guarda el ID del usuario registrado en localStorage
        localStorage.setItem('userToken', user.id || ''); // Aquí guardas el ID generado
        
         // Crea un `userMeals` en segundo plano sin afectar el retorno de `addUser`
        const userMeals: UserMeals = createDefaultUserMeals(user.id || '');
        this.http.post<UserMeals>(this.userMealsUrl, userMeals).subscribe();
      })
    );
  }
  

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }
  
}
