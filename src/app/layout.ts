import { ChangeDetectionStrategy, Component, inject, Renderer2, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DOCUMENT, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialService } from './financial.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CurrencyPipe, FormsModule],
  template: `
    <div class="antialiased min-h-screen bg-background">
      <!-- Mobile Menu Backdrop -->
      @if (isMobileMenuOpen()) {
        <div 
          (click)="isMobileMenuOpen.set(false)"
          (keydown.escape)="isMobileMenuOpen.set(false)"
          role="button"
          tabindex="0"
          aria-label="Fechar menu"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
        ></div>
      }

      <!-- SideNavBar -->
      <aside 
        [class.translate-x-0]="isMobileMenuOpen()"
        [class.-translate-x-full]="!isMobileMenuOpen()"
        class="h-screen w-64 fixed left-0 top-0 bg-surface border-r border-outline-variant/10 shadow-2xl shadow-black/50 flex flex-col py-8 px-4 z-[70] lg:translate-x-0 transition-transform duration-300 ease-in-out"
      >
        <div class="mb-12 px-2">
          <h1 class="text-xl font-bold tracking-tight text-primary font-headline">Minhas Finanças</h1>
          <p class="text-xs text-on-surface-variant/60 font-label tracking-widest uppercase mt-1">Gestão Patrimonial</p>
        </div>
        
        <nav class="flex-1 space-y-2">
          <a 
            routerLink="/dashboard" 
            routerLinkActive="text-primary font-semibold border-r-2 border-primary bg-gradient-to-r from-primary/10 to-transparent"
            [routerLinkActiveOptions]="{exact: true}"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-low transition-all duration-300"
          >
            <span class="material-symbols-outlined">home</span>
            <span class="font-body">Início</span>
          </a>
          <a 
            routerLink="/transactions" 
            routerLinkActive="text-primary font-semibold border-r-2 border-primary bg-gradient-to-r from-primary/10 to-transparent"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-low transition-all duration-300"
          >
            <span class="material-symbols-outlined">account_balance_wallet</span>
            <span class="font-body">Transações</span>
          </a>
          <a 
            routerLink="/strategy" 
            routerLinkActive="text-primary font-semibold border-r-2 border-primary bg-gradient-to-r from-primary/10 to-transparent"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-low transition-all duration-300"
          >
            <span class="material-symbols-outlined">insights</span>
            <span class="font-body">Estratégia</span>
          </a>
          <a 
            routerLink="/goals" 
            routerLinkActive="text-primary font-semibold border-r-2 border-primary bg-gradient-to-r from-primary/10 to-transparent"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-low transition-all duration-300"
          >
            <span class="material-symbols-outlined">target</span>
            <span class="font-body">Meus Alvos</span>
          </a>
          <!-- Photography Report (Deletable) -->
          @if (!financialService.photoReportHidden()) {
            <div class="group relative">
              <a 
                routerLink="/photo" 
                routerLinkActive="text-primary font-semibold border-r-2 border-primary bg-gradient-to-r from-primary/10 to-transparent"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-low transition-all duration-300"
              >
                <span class="material-symbols-outlined">camera_enhance</span>
                <span class="font-body">Relatório Fotografia</span>
              </a>
              <button 
                (click)="financialService.hidePhotoReport()"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-error/40 hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Remover Relatório"
              >
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          }

          <!-- Custom Reports -->
          @for (report of financialService.customReports(); track report.id) {
            <div class="group relative">
              <a 
                [routerLink]="['/report', report.id]" 
                routerLinkActive="text-primary font-semibold border-r-2 border-primary bg-gradient-to-r from-primary/10 to-transparent"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-low transition-all duration-300"
              >
                <span class="material-symbols-outlined">{{ report.icon }}</span>
                <span class="font-body">{{ report.name }}</span>
              </a>
              <button 
                (click)="financialService.deleteCustomReport(report.id)"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-error/40 hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Excluir Relatório"
              >
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          }

          <a 
            routerLink="/profile" 
            routerLinkActive="text-primary font-semibold border-r-2 border-primary bg-gradient-to-r from-primary/10 to-transparent"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-low transition-all duration-300"
          >
            <span class="material-symbols-outlined">person</span>
            <span class="font-body">Perfil</span>
          </a>
        </nav>

        <div class="mt-auto space-y-4 px-2">
          <button 
            (click)="showCreateReportModal.set(true)"
            class="w-full py-3 bg-secondary/10 text-secondary font-bold rounded-xl border border-dashed border-secondary/30 flex items-center justify-center gap-2 hover:bg-secondary/20 transition-all"
          >
            <span class="material-symbols-outlined">add_circle</span>
            Novo Relatório
          </button>
          <button 
            routerLink="/transactions/new"
            class="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-lg shadow-primary/10 flex items-center justify-center gap-2 transform transition-transform active:scale-95 hover:brightness-110"
          >
            <span class="material-symbols-outlined">add</span>
            Nova Transação
          </button>
        </div>
      </aside>

      <!-- Create Report Modal -->
      @if (showCreateReportModal()) {
        <div class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div class="w-full max-w-md bg-surface-container-high rounded-[2rem] shadow-2xl border border-outline-variant/10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-gradient-to-r from-secondary/5 to-transparent">
              <h3 class="text-xl font-bold">Criar Novo Relatório</h3>
              <button (click)="showCreateReportModal.set(false)" class="p-2 hover:bg-surface-container rounded-full">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="p-6 space-y-4">
              <p class="text-sm text-on-surface-variant">Crie um relatório personalizado com sua própria conta e alvos de investimento.</p>
              <div>
                <label for="reportName" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Nome do Relatório</label>
                <input 
                  id="reportName"
                  type="text" 
                  [(ngModel)]="newReportName"
                  class="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-on-surface outline-none focus:ring-1 focus:ring-secondary/30" 
                  placeholder="Ex: Artesanato, Consultoria, Freelance..."
                />
              </div>
              <div>
                <span class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Ícone</span>
                <div class="flex gap-2 overflow-x-auto pb-2">
                  @for (icon of ['palette', 'work', 'code', 'storefront', 'fitness_center', 'music_note', 'local_shipping', 'restaurant']; track icon) {
                    <button 
                      (click)="newReportIcon.set(icon)"
                      [class.bg-secondary/20]="newReportIcon() === icon"
                      [class.border-secondary]="newReportIcon() === icon"
                      class="w-12 h-12 flex-shrink-0 rounded-xl border border-outline-variant/20 flex items-center justify-center hover:bg-surface-container transition-all"
                    >
                      <span class="material-symbols-outlined text-on-surface">{{ icon }}</span>
                    </button>
                  }
                </div>
              </div>
            </div>
            <div class="p-6 bg-surface-container-highest/30 border-t border-outline-variant/10 flex gap-3">
              <button (click)="showCreateReportModal.set(false)" class="flex-1 py-3 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-highest transition-all">Cancelar</button>
              <button 
                (click)="createReport()" 
                [disabled]="!newReportName()"
                class="flex-1 py-3 bg-secondary text-on-secondary font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              >
                Criar Relatório
              </button>
            </div>
          </div>
        </div>
      }

      <!-- TopNavBar -->
      <header class="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] bg-surface/80 backdrop-blur-xl flex justify-between lg:justify-end items-center px-4 lg:px-8 py-4 z-40">
        <button 
          (click)="isMobileMenuOpen.set(true)"
          class="lg:hidden p-2 text-on-surface-variant/70 hover:bg-primary/10 rounded-full transition-colors"
        >
          <span class="material-symbols-outlined">menu</span>
        </button>

        <div class="flex items-center gap-3 lg:gap-6">
          <div class="flex items-center gap-2">
            <button 
              (click)="showNotifications.set(!showNotifications())"
              class="p-2 text-on-surface-variant/70 hover:bg-primary/10 rounded-full transition-colors relative"
            >
              <span class="material-symbols-outlined">notifications</span>
              @if (financialService.upcomingAlerts().length > 0) {
                <span class="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-surface animate-bounce"></span>
              }
            </button>
            <button 
              (click)="showSummary.set(true)"
              class="p-2 text-on-surface-variant/70 hover:bg-primary/10 rounded-full transition-colors"
            >
              <span class="material-symbols-outlined">analytics</span>
            </button>
          </div>
          <button 
            routerLink="/transactions/new"
            [queryParams]="{type: 'income'}"
            class="px-5 py-2 rounded-full border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
          >
            Adicionar Fundos
          </button>
          <div class="flex items-center gap-3 ml-2">
            <span class="text-sm font-bold text-on-surface">Olá, {{ financialService.userName() }}</span>
            <button 
              (click)="authService.logout()"
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-error hover:bg-error/10 transition-colors text-xs font-semibold"
              title="Sair do Sistema"
            >
              <span class="material-symbols-outlined text-lg">logout</span>
              Sair
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="lg:ml-64 pt-24 pb-12 px-4 lg:px-8 min-h-screen">
        <router-outlet></router-outlet>
      </main>

      <!-- Notification Overlay -->
      @if (showNotifications()) {
        <div 
          role="button"
          tabindex="0"
          (click)="showNotifications.set(false)"
          (keydown.escape)="showNotifications.set(false)"
          class="fixed inset-0 z-[100] flex items-start justify-end p-8 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300"
        >
          <div 
            role="none"
            (click)="$event.stopPropagation()"
            (keydown)="$event.stopPropagation()"
            class="w-96 bg-surface-container-high rounded-3xl shadow-2xl border border-outline-variant/10 animate-in slide-in-from-right-10 duration-300 overflow-hidden"
          >
            <div class="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-highest/50">
              <h3 class="font-bold text-lg flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">notifications_active</span>
                Alertas de Sistema
              </h3>
              <button (click)="showNotifications.set(false)" class="p-1 hover:bg-surface-container rounded-full">
                <span class="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div class="max-h-[70vh] overflow-y-auto p-4 space-y-4">
              @if (financialService.upcomingAlerts().length === 0) {
                <div class="text-center py-10 opacity-40">
                  <span class="material-symbols-outlined text-4xl mb-2">check_circle</span>
                  <p class="text-sm font-medium">Tudo em ordem no seu ecossistema.</p>
                </div>
              }
              @for (alert of financialService.upcomingAlerts(); track alert.title) {
                <div class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/5 hover:bg-surface-container transition-colors group">
                  <div class="flex gap-4">
                    <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined text-primary">{{ alert.icon }}</span>
                    </div>
                    <div>
                      <h4 class="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{{ alert.title }}</h4>
                      <p class="text-xs text-on-surface-variant mt-1 leading-relaxed">{{ alert.message }}</p>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Summary Modal -->
      @if (showSummary()) {
        <div 
          role="button"
          tabindex="0"
          (click)="showSummary.set(false)"
          (keydown.escape)="showSummary.set(false)"
          class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        >
          <div 
            role="none"
            (click)="$event.stopPropagation()"
            (keydown)="$event.stopPropagation()"
            class="w-full max-w-2xl bg-surface-container-high rounded-[2.5rem] shadow-2xl border border-outline-variant/10 overflow-hidden animate-in zoom-in-95 duration-300"
          >
            <div class="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-gradient-to-r from-primary/5 to-transparent">
              <div>
                <span class="text-primary font-bold tracking-[0.2em] text-[10px] uppercase">Relatório Executivo</span>
                <h3 class="text-3xl font-extrabold tracking-tight mt-1">Resumo Patrimonial</h3>
              </div>
              <button (click)="showSummary.set(false)" class="w-12 h-12 flex items-center justify-center hover:bg-surface-container rounded-full transition-colors">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div class="p-8 grid grid-cols-2 gap-6">
              <div class="col-span-2 bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5">
                <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Liquidez Total</p>
                <p class="text-4xl font-headline font-extrabold text-primary">{{ financialService.financialSummary().balance | currency:'BRL' }}</p>
              </div>
              
              <div class="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5">
                <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Renda Mensal</p>
                <p class="text-2xl font-headline font-extrabold text-on-surface">{{ financialService.financialSummary().income | currency:'BRL' }}</p>
              </div>
              
              <div class="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5">
                <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Despesas Mensais</p>
                <p class="text-2xl font-headline font-extrabold text-on-surface">{{ financialService.financialSummary().expenses | currency:'BRL' }}</p>
              </div>

              <div class="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5">
                <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Saldo Líquido</p>
                <p class="text-2xl font-headline font-extrabold" [class.text-primary]="financialService.financialSummary().net >= 0" [class.text-error]="financialService.financialSummary().net < 0">
                  {{ financialService.financialSummary().net | currency:'BRL' }}
                </p>
              </div>

              <div class="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5">
                <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total a Pagar (Mês)</p>
                <p class="text-2xl font-headline font-extrabold text-error">{{ financialService.amountToPayThisMonth() | currency:'BRL' }}</p>
              </div>

              <div class="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5">
                <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Dívida Consolidada</p>
                <p class="text-2xl font-headline font-extrabold text-secondary">{{ financialService.financialSummary().totalDebt | currency:'BRL' }}</p>
              </div>
            </div>

            <div class="p-8 bg-surface-container-highest/30 border-t border-outline-variant/10 flex justify-end">
              <button (click)="showSummary.set(false)" class="px-8 py-3 bg-primary text-on-primary font-bold rounded-xl hover:brightness-110 transition-all">
                Entendido
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout {
  financialService = inject(FinancialService);
  authService = inject(AuthService);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  showNotifications = signal(false);
  showSummary = signal(false);
  showCreateReportModal = signal(false);
  isMobileMenuOpen = signal(false);
  newReportName = signal('');
  newReportIcon = signal('palette');

  createReport() {
    const name = this.newReportName();
    const icon = this.newReportIcon();
    if (name) {
      this.financialService.addCustomReport(name, icon);
      this.showCreateReportModal.set(false);
      this.newReportName.set('');
      this.newReportIcon.set('palette');
    }
  }
}
