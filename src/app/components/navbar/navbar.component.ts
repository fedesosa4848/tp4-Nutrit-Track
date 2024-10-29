import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Subscribirse al estado de autenticación para actualizar `isLoggedIn`
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
    });
  }

  navigateToHome() {
    this.router.navigate(['']);
  }

  navigateToAboutUs(){
    this.router.navigate(['about-us'])
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToUserProfile() {
    this.router.navigate(['/userProfile']);
  }

  navigateToSearchFoods() {
    this.router.navigate(['/foods']);
  }

  navigateToUserMeals() {
    this.router.navigate(['/userMeals']);
  }

  login() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.authService.logout(); // Llama al método de logout del servicio de autenticación
    this.router.navigate(['']);
  }
}
