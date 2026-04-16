import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <!-- Ambient background glows -->
      <div class="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
      <div class="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-[100px] pointer-events-none"></div>
      
      <main class="relative w-full max-w-md z-10">
        <!-- Logo Branding -->
        <div class="flex flex-col items-center mb-10">
          <div class="w-16 h-16 rounded-3xl primary-gradient flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,140,0,0.2)]">
            <span class="material-symbols-outlined text-on-primary text-4xl" style="font-variation-settings: 'FILL' 1;">account_balance</span>
          </div>
          <h1 class="font-headline font-extrabold text-3xl text-on-background tracking-tight">Minhas Finanças</h1>
          <p class="font-body text-on-surface-variant text-sm mt-2 opacity-80 uppercase tracking-[0.2em]">Criação de Cofre Pessoal</p>
        </div>

        <!-- Register Card -->
        <div class="glass-panel p-8 rounded-3xl shadow-2xl border border-white/5">
          <div class="mb-8">
            <h2 class="font-headline font-bold text-xl text-on-background">Estabelecer Registro</h2>
            <p class="font-body text-on-surface-variant text-sm mt-1">Crie sua chave de acesso para o sistema pessoal.</p>
          </div>

          @if (errorMessage()) {
            <div class="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-bold flex items-center gap-3">
              <span class="material-symbols-outlined text-lg">error</span>
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Name Field -->
            <div class="space-y-2">
              <label for="name" class="font-label text-xs font-semibold text-primary/80 uppercase tracking-wider px-1">Nome Completo</label>
              <div class="relative group">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">person</span>
                <input 
                   id="name"
                   formControlName="name"
                   class="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-background placeholder-on-surface-variant/40 rounded-xl py-4 pl-12 pr-4 transition-all duration-300" 
                   placeholder="Seu nome" 
                   type="text"
                />
              </div>
            </div>

            <!-- Email Field -->
            <div class="space-y-2">
              <label for="email" class="font-label text-xs font-semibold text-primary/80 uppercase tracking-wider px-1">E-mail de Identidade</label>
              <div class="relative group">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">alternate_email</span>
                <input 
                   id="email"
                   formControlName="email"
                   class="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-background placeholder-on-surface-variant/40 rounded-xl py-4 pl-12 pr-4 transition-all duration-300" 
                   placeholder="Endereço de e-mail" 
                   type="email"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label for="password" class="font-label text-xs font-semibold text-primary/80 uppercase tracking-wider px-1">Chave de Acesso</label>
              <div class="relative group">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">lock</span>
                <input 
                   id="password"
                   formControlName="password"
                   class="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-background placeholder-on-surface-variant/40 rounded-xl py-4 pl-12 pr-4 transition-all duration-300" 
                   placeholder="Crie uma senha forte" 
                   type="password"
                />
              </div>
            </div>

            <!-- Register Button -->
            <button 
              type="submit"
              [disabled]="registerForm.invalid"
              class="w-full primary-gradient text-on-primary font-headline font-bold py-4 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
            >
              <span>Criar Acesso</span>
              <span class="material-symbols-outlined text-xl">how_to_reg</span>
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-white/5 text-center">
            <p class="font-body text-sm text-on-surface-variant">
              Já possui um cofre? 
              <a class="text-primary font-semibold hover:underline underline-offset-4 ml-1" routerLink="/login">Entrar no Sistema</a>
            </p>
          </div>
        </div>
      </main>

      <!-- Decorative Image Content -->
      <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none mix-blend-overlay">
        <img 
          alt="" 
          class="w-full h-full object-cover" 
          referrerpolicy="no-referrer"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAl4qFR3UHOrgj6HX5QOS8CEll-6VUMwTv_zj-Ixa9m_IP8q-4tj61hMAxaEY0Zyz_AAlhOSyfn3Qi4ub2DXXoeuD8-yOorsIgjjCqZgyCcrP79KPbpiTy56T1hmOSmmWKmKj43uDvZYokn9dBR2ly4SCup1m6aD_FMajCBD3-om7JM7pjxI5IbS9aLEHv4ln7yLKNs-IEH6zM1hbtEZLyMyAYBqzae8_7ZkIkBdT9R3ZzhSI63DB-urbHLDzQhjYJ4kV_JzDb1xmg"
        />
      </div>
    </div>
  `,
  styles: [
    `
    :host {
      display: block;
    }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  errorMessage = signal('');

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;
      const success = this.authService.register({ 
        name: name!, 
        email: email!, 
        password: password! 
      });

      if (success) {
        this.router.navigate(['/login']);
      } else {
        this.errorMessage.set('Este e-mail já está registrado em nosso sistema.');
      }
    }
  }
}
