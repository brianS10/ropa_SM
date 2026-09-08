import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplashScreenComponent } from './compartido/componentes/splash-screen/splash-screen.component';
import { TemaService } from './core/servicios/tema.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SplashScreenComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Inicializamos el servicio de temas (oscuro / claro) para toda la app
  private temaService = inject(TemaService);
}
