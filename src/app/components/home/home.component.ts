import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../../services/user.service'; // Asegúrate de importar correctamente el servicio
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user.interface';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userName: string | null = null; // Variable para almacenar el nombre del usuario

  constructor(private userService: UserServiceService) {}

  ngOnInit(): void {
    this.loadUserName();
  }

  loadUserName(): void {
    const userId = localStorage.getItem('userToken');
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (userData: User) => {
          this.userName = userData.dataUser.nombre; // Guarda el nombre del usuario
        },
        error: (error) => {
          console.error('Error al obtener los datos del usuario:', error);
        }
      });
    }
  }
}
