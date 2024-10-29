import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder, FormGroup} from '@angular/forms';
import * as NutricionUtils from '../../utils/nutrition.utils';
import { UserServiceService } from '../../services/user.service';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm: FormGroup

  // Inyectar el servicio en el constructor
  constructor(private fb: FormBuilder,private router: Router,
    private userService: UserServiceService) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      edad: [null, [Validators.required, Validators.min(10)]],
      peso: [null, [Validators.required, Validators.min(40)]],
      altura: [null, [Validators.required, Validators.min(100)]],
      genero: ['', Validators.required],
      perfil: ['', Validators.required],
      nivelActividad: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const dataUser = this.registerForm.getRawValue();
      
      const newUser: User = {
        dataUser: dataUser,
        dataUserNutricional: {
          tmb: 0,
          tdee: 0,
          caloriasObjetivo: 0,
          macronutrientes: {
            proteinas: 0,
            carbohidratos: 0,
            grasas: 0
          }
        },
      };

      // Calcula los valores nutricionales usando el objeto newUser
      newUser.dataUserNutricional.tmb = NutricionUtils.calcularTMB(newUser);
      newUser.dataUserNutricional.tdee = NutricionUtils.calcularTDEE(newUser);
      newUser.dataUserNutricional.caloriasObjetivo = NutricionUtils.calcularCaloriasObjetivo(newUser);
      newUser.dataUserNutricional.macronutrientes = NutricionUtils.calcularMacronutrientes(newUser);

      // Llama al servicio para registrar el usuario y luego redirige
      this.userService.addUser(newUser).subscribe({
        next: () => {
          
          this.router.navigate(['/userProfile']); // Redirige al perfil de usuario
        },
        error: (error) => {
          console.error('Error registrando usuario:', error);
        },
      });
    }
  }

  togglePassword() {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
    } else {
      passwordInput.type = 'password';
    }
  }
}
