import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { FinancialService } from './financial.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8">
      <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-extrabold font-headline text-on-surface">Meu Perfil</h2>
          <p class="text-on-surface-variant/60 text-sm sm:text-base">Gerencie suas informações e preferências do Minhas Finanças.</p>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- User Info Card -->
        <div class="md:col-span-2 bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
          <div class="flex justify-between items-start mb-6">
            <h3 class="text-lg font-bold">Informações Pessoais</h3>
            @if (!isEditing()) {
              <button 
                (click)="startEditing()"
                class="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all"
              >
                <span class="material-symbols-outlined text-sm">edit</span>
                Editar
              </button>
            }
          </div>
          
          @if (!isEditing()) {
            <div class="space-y-6 animate-in fade-in duration-300">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Nome Completo</p>
                  <p class="text-on-surface font-medium">{{ financialService.userName() }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Data de Nascimento</p>
                  <p class="text-on-surface font-medium">{{ financialService.userBirthDate() | date:'dd/MM/yyyy' }}</p>
                </div>
              </div>
            </div>
          } @else {
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-6 animate-in slide-in-from-top-2 duration-300">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label for="profile-name" class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Nome Completo</label>
                  <input 
                    id="profile-name"
                    type="text" 
                    formControlName="name"
                    class="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                  >
                </div>
                <div class="space-y-2">
                  <label for="profile-birthdate" class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Data de Nascimento</label>
                  <input 
                    id="profile-birthdate"
                    type="date" 
                    formControlName="birthDate"
                    class="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                  >
                </div>
              </div>
              
              <div class="flex gap-3 pt-4">
                <button 
                  type="submit"
                  [disabled]="profileForm.invalid"
                  class="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/10 hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  Salvar Alterações
                </button>
                <button 
                  type="button"
                  (click)="isEditing.set(false)"
                  class="px-6 py-2.5 bg-surface-container-highest text-on-surface font-bold rounded-xl hover:bg-surface-container transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          }
        </div>

        <!-- Quick Stats Card -->
        <div class="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 flex flex-col justify-between">
          <div>
            <h3 class="text-lg font-bold mb-6">Resumo Rápido</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-xs text-on-surface-variant">Patrimônio Líquido</span>
                <span class="text-sm font-bold text-primary">{{ financialService.totalBalance() | currency:'BRL' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-on-surface-variant">Metas Ativas</span>
                <span class="text-sm font-bold">{{ financialService.goals().length }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-on-surface-variant">Dívidas em Aberto</span>
                <span class="text-sm font-bold text-error">{{ financialService.debts().length }}</span>
              </div>
            </div>
          </div>
          <div class="mt-6 p-4 bg-primary/5 rounded-2xl">
            <p class="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Status de Liquidez</p>
            <p class="text-xs text-on-surface-variant">Seu ecossistema está operando em nível positivo.</p>
          </div>
        </div>
      </div>

      <!-- Couple Account Section -->
      <div class="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-secondary text-2xl">favorite</span>
          </div>
          <div>
            <h3 class="text-lg font-bold">Conta de Casal</h3>
            <p class="text-xs text-on-surface-variant">Compartilhe suas finanças com seu parceiro(a) em tempo real.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <!-- My Code -->
          <div class="space-y-4">
            <h4 class="text-sm font-bold text-on-surface/80">Seu Código de Compartilhamento</h4>
            <p class="text-xs text-on-surface-variant leading-relaxed">Envie este código para seu parceiro(a) para que ele(a) possa acessar os mesmos dados financeiros que você.</p>
            
            <div class="flex items-center gap-2 p-4 bg-surface-container-highest rounded-2xl border border-outline-variant/10">
              <code class="flex-1 font-mono text-lg font-bold tracking-wider text-primary">{{ authService.currentUser()?.householdId }}</code>
              <button 
                (click)="copyCode()"
                class="p-2 hover:bg-primary/10 rounded-xl transition-colors text-primary"
                title="Copiar Código"
              >
                <span class="material-symbols-outlined text-xl">content_copy</span>
              </button>
            </div>
            @if (showCopySuccess()) {
              <p class="text-[10px] text-primary font-bold animate-in fade-in slide-in-from-left-2">Código copiado com sucesso!</p>
            }
          </div>

          <!-- Join Code -->
          <div class="space-y-4">
            <h4 class="text-sm font-bold text-on-surface/80">Vincular a outra Conta</h4>
            <p class="text-xs text-on-surface-variant leading-relaxed">Insira o código recebido do seu parceiro(a) para mesclar suas contas e visualizar os dados dele(a).</p>
            
            <form [formGroup]="joinForm" (ngSubmit)="joinHousehold()" class="flex flex-col gap-3">
              <input 
                type="text" 
                formControlName="code"
                placeholder="Insira o código aqui"
                class="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary/50 transition-colors font-mono"
              >
              <button 
                type="submit"
                [disabled]="joinForm.invalid"
                class="w-full py-3 bg-secondary text-on-secondary font-bold rounded-xl shadow-lg shadow-secondary/10 hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined text-sm">link</span>
                Vincular Contas
              </button>
            </form>
            @if (joinError()) {
              <p class="text-[10px] text-error font-bold">{{ joinError() }}</p>
            }
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="bg-error/5 rounded-3xl p-8 border border-error/20">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-error text-2xl">warning</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-error">Zona de Perigo</h3>
            <p class="text-xs text-on-surface-variant">Ações irreversíveis para sua conta.</p>
          </div>
        </div>

        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 bg-surface-container-low rounded-2xl border border-error/10">
          <div>
            <h4 class="text-sm font-bold text-on-surface">Resetar Todos os Dados</h4>
            <p class="text-xs text-on-surface-variant mt-1">Isso apagará permanentemente todas as suas transações, metas, dívidas e configurações.</p>
          </div>
          <button 
            (click)="confirmReset()"
            class="w-full lg:w-auto px-6 py-3 bg-error text-on-error font-bold rounded-xl hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-sm">delete_forever</span>
            Resetar Conta
          </button>
        </div>
      </div>

      @if (showResetConfirmation()) {
        <div class="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div class="w-full max-w-md bg-surface-container-high rounded-[2.5rem] shadow-2xl border border-error/20 p-10 text-center animate-in zoom-in-95 duration-300">
            <div class="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6 text-error">
              <span class="material-symbols-outlined text-5xl">report</span>
            </div>
            <h3 class="text-2xl font-extrabold font-headline text-on-surface mb-4">Tem certeza absoluta?</h3>
            <p class="text-on-surface-variant mb-8 leading-relaxed">
              Esta ação não pode ser desfeita. Todos os seus registros financeiros serão apagados para sempre.
            </p>
            <div class="flex flex-col gap-3">
              <button 
                (click)="resetAllData()"
                class="w-full py-4 bg-error text-on-error font-bold rounded-2xl shadow-xl shadow-error/20 hover:brightness-110 transition-all active:scale-95"
              >
                Sim, Apagar Tudo
              </button>
              <button 
                (click)="showResetConfirmation.set(false)"
                class="w-full py-4 bg-surface-container-highest text-on-surface font-bold rounded-2xl hover:bg-surface-container transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  financialService = inject(FinancialService);
  authService = inject(AuthService);
  
  isEditing = signal(false);
  showCopySuccess = signal(false);
  showResetConfirmation = signal(false);
  joinError = signal('');

  profileForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    birthDate: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  joinForm = new FormGroup({
    code: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(5)] })
  });

  startEditing() {
    this.profileForm.patchValue({
      name: this.financialService.userName(),
      birthDate: this.financialService.userBirthDate()
    });
    this.isEditing.set(true);
  }

  saveProfile() {
    if (this.profileForm.valid) {
      const { name, birthDate } = this.profileForm.getRawValue();
      this.financialService.updateProfile(name, birthDate);
      this.isEditing.set(false);
    }
  }

  copyCode() {
    const code = this.authService.currentUser()?.householdId;
    if (code) {
      navigator.clipboard.writeText(code);
      this.showCopySuccess.set(true);
      setTimeout(() => this.showCopySuccess.set(false), 3000);
    }
  }

  joinHousehold() {
    if (this.joinForm.valid) {
      const code = this.joinForm.getRawValue().code;
      const success = this.authService.joinHousehold(code);
      if (success) {
        window.location.reload(); // Refresh to reload data with new household ID
      } else {
        this.joinError.set('Não foi possível vincular as contas. Tente novamente.');
      }
    }
  }

  confirmReset() {
    this.showResetConfirmation.set(true);
  }

  resetAllData() {
    this.financialService.clearAllData();
    this.showResetConfirmation.set(false);
    window.location.reload(); // Refresh to clear all UI states
  }
}
