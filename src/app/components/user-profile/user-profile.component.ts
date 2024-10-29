import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;

  constructor(private userService: UserServiceService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const id = localStorage.getItem('userToken');
  
    if (id) {
      this.userService.getUserById(id).subscribe({
        next: (userData) => {
          this.user = userData;
        },
        error: (error) => {
          console.error('Error al obtener los datos del usuario:', error);
        }
      });
    } else {
      console.error('No se encontró el token del usuario en localStorage');
    }
  }
  
}
