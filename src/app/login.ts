import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background transition-colors duration-1000">
      <!-- Ambient background glows -->
      <div class="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px] pointer-events-none transition-colors duration-1000"></div>
      <div class="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[100px] pointer-events-none transition-colors duration-1000"></div>
      
      <main class="relative w-full max-w-md z-10">
        <!-- Logo Branding -->
        <div class="flex flex-col items-center mb-10">
          <div class="w-16 h-16 rounded-3xl primary-gradient flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] transition-shadow duration-1000">
            <span class="material-symbols-outlined text-on-primary text-4xl" style="font-variation-settings: 'FILL' 1;">account_balance</span>
          </div>
          <h1 class="font-headline font-extrabold text-3xl text-on-background tracking-tight">Minhas Finanças</h1>
          <p class="font-body text-on-surface-variant text-sm mt-2 opacity-80 uppercase tracking-[0.2em]">Portal de Acesso Seguro</p>
          
          <!-- User Count Badge -->
          <div class="mt-4 flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full border border-outline-variant/10 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              {{ authService.userCount() }} {{ authService.userCount() === 1 ? 'Usuário Ativo' : 'Usuários Ativos' }} no Sistema
            </span>
          </div>
        </div>

        <!-- Login Card -->
        <div class="glass-panel p-8 rounded-3xl shadow-2xl border border-white/5">
          <div class="mb-8">
            <h2 class="font-headline font-bold text-xl text-on-background">Bem-vindo de Volta</h2>
            <p class="font-body text-on-surface-variant text-sm mt-1">Autentique-se para acessar seu cofre privado.</p>
          </div>

          @if (errorMessage()) {
            <div class="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-bold flex items-center gap-3">
              <span class="material-symbols-outlined text-lg">error</span>
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Email Field -->
            <div class="space-y-2">
              <label for="email" class="font-label text-xs font-semibold text-primary/80 uppercase tracking-wider px-1">Identidade do Cofre</label>
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
              <div class="flex justify-between items-center px-1">
                <label for="password" class="font-label text-xs font-semibold text-primary/80 uppercase tracking-wider">Chave de Acesso</label>
                <a class="font-label text-[10px] text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest" href="javascript:void(0)">Recuperação</a>
              </div>
              <div class="relative group">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">lock</span>
                <input 
                   id="password"
                   formControlName="password"
                   [type]="showPassword() ? 'text' : 'password'"
                   class="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-background placeholder-on-surface-variant/40 rounded-xl py-4 pl-12 pr-12 transition-all duration-300" 
                   placeholder="Digite a senha" 
                />
                <button (click)="showPassword.set(!showPassword())" class="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-background transition-colors" type="button">
                  <span class="material-symbols-outlined text-lg">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <!-- Sign In Button -->
            <button 
              type="submit"
              [disabled]="loginForm.invalid"
              class="w-full primary-gradient text-on-primary font-headline font-bold py-4 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
            >
              <span>Entrar em Minhas Finanças</span>
              <span class="material-symbols-outlined text-xl">key</span>
            </button>
          </form>

          <div class="mt-8 pt-6 border-t border-white/5 text-center">
            <p class="font-body text-sm text-on-surface-variant">
              Não tem uma conta? 
              <a class="text-primary font-semibold hover:underline underline-offset-4 ml-1" routerLink="/register">Estabelecer Registro</a>
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
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public authService = inject(AuthService);

  errorMessage = signal('');
  showPassword = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const success = this.authService.login(email!, password!);
      
      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage.set('Credenciais inválidas. Verifique seu e-mail e chave de acesso.');
      }
    }
  }
}
