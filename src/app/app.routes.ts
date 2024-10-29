import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './auth.guard';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { FoodComponent } from './components/food/food.component';
import { MealsComponent } from './components/meals/meals.component';


export const routes: Routes = [
  {
    path: 'userProfile', // La ruta protegida
    component: UserProfileComponent,
    canActivate: [authGuard], // Se aplica el authGuard aquí
  },
  {
    path: 'userMeals',
    component:MealsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: LoginComponent, // Ruta pública para el login
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path:'about-us',
    component: AboutUsComponent,
  },
  {
    path:'foods',
    component:FoodComponent
  },
  {
    path:'',
    component:HomeComponent
  },
  {
    path: '**',
    redirectTo: 'login', // Redirección por defecto para rutas no encontradas
  }
];
