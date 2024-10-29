import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const userToken = localStorage.getItem('userToken');

  if (userToken) {
    // Si el token existe, se permite el acceso
    return true;
  } else {
    // Si el token no existe, se bloquea el acceso y puedes redirigir a la página de login
    window.location.href = '/login';
    return false;
  }
};
