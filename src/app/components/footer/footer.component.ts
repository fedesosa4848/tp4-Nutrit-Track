import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer>
      <div class="footer-content">
        <p>&copy; 2024 Nutrit-Track. Todos los derechos reservados.</p>
        <ul class="socials">
          <li><a href="#"><i class="fa-brands fa-facebook icons" aria-label="Facebook"></i></a></li>
          <li><a href="#"><i class="fa-brands fa-x-twitter icons" aria-label="X-Twitter"></i></a></li>
          <li><a href="#"><i class="fa-brands fa-instagram icons" aria-label="Instagram"></i></a></li>
        </ul>
        <div class="footer-bottom">
          <p>Diseñado por <a href="#" style="color: aliceblue; opacity: 0.5; text-decoration: none">Federico Sosa</a></p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    footer {
      background-color: #333;
      color: white;
      padding: 20px 0;
      text-align: center;
    }
    .footer-content {
      max-width: 1200px;
      margin: auto;
    }
    .socials {
      list-style: none;
      padding: 0;
      display: flex;
      justify-content: center;
    }
    .socials li {
      margin: 0 10px;
    }
    .icons {
      font-size: 1.5em;
      color: white;
      transition: color 0.3s;
    }
    .icons:hover {
      color: #aaa;
    }
    .footer-bottom {
      margin-top: 15px;
      font-size: 0.9em;
    }
  `]
})
export class FooterComponent {}
