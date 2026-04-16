import { ChangeDetectionStrategy, Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FinancialService } from './financial.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterLink],
  template: `
    <div class="max-w-[1440px] mx-auto space-y-8">
      <!-- Birthday Celebration Banner -->
      @if (financialService.isBirthday()) {
        <div class="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 rounded-[2rem] border border-primary/20 flex items-center justify-between relative overflow-hidden animate-in slide-in-from-top-4 duration-700">
          <div class="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16"></div>
          <div class="flex items-center gap-6 relative z-10">
            <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
              <span class="material-symbols-outlined text-3xl">cake</span>
            </div>
            <div>
              <h2 class="text-2xl font-extrabold font-headline text-on-surface">Feliz Aniversário, {{ financialService.userName() }}! 🎂</h2>
              <p class="text-on-surface-variant">O Atlas Finance celebra sua vida e sua jornada rumo à prosperidade. Que seu dia seja incrível!</p>
            </div>
          </div>
          <div class="hidden md:block relative z-10">
            <span class="text-primary font-bold text-sm uppercase tracking-widest">Atlas Celebration • 2026</span>
          </div>
        </div>
      }

      <!-- Birthday Popup -->
      @if (showBirthdayPopup()) {
        <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
          <div class="w-full max-w-md bg-surface-container-high rounded-[2.5rem] shadow-2xl border border-primary/20 overflow-hidden animate-in zoom-in-95 duration-500 text-center p-10 relative">
            <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style="background-image: radial-gradient(circle at 50% 50%, var(--primary-hex) 0%, transparent 70%);"></div>
            
            <div class="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <span class="material-symbols-outlined text-5xl">cake</span>
            </div>
            
            <h3 class="text-3xl font-extrabold font-headline text-on-surface mb-2">Parabéns, {{ financialService.userName() }}!</h3>
            <p class="text-on-surface-variant mb-8">O Atlas Finance deseja a você um dia repleto de prosperidade, alegria e novas conquistas ao lado de sua família!</p>
            
            <button 
              (click)="closeBirthdayPopup()"
              class="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-95"
            >
              Obrigado!
            </button>
          </div>
        </div>
      }

      <!-- Hero Bento Section -->
      <div class="grid grid-cols-12 gap-6">
        <!-- Main Balance Card -->
        <div class="col-span-12 lg:col-span-8 bg-surface-container-low rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-between group min-h-[420px]">
          <div class="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32"></div>
          <div class="relative z-10">
            <div class="flex justify-between items-start">
              <div>
                <span class="text-on-surface-variant/60 font-label tracking-widest uppercase text-xs">Liquidez Principal</span>
                <h2 class="text-6xl font-extrabold font-headline text-on-surface mt-2 tracking-tight">
                  {{ financialService.totalBalance() | currency:'BRL':'symbol':'1.0-2' }}
                </h2>
                <div class="mt-4 flex items-center gap-2 text-on-surface-variant/40">
                  <span class="material-symbols-outlined text-sm">account_balance_wallet</span>
                  <span class="text-[10px] font-bold uppercase tracking-widest">Patrimônio Total: {{ financialService.consolidatedBalance() | currency:'BRL' }}</span>
                </div>
              </div>
              <div 
                [class]="financialService.monthlyPerformance() >= 0 ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'"
                class="px-4 py-2 rounded-full flex items-center gap-2 transition-colors duration-500"
              >
                <span class="material-symbols-outlined text-sm">
                  {{ financialService.monthlyPerformance() >= 0 ? 'trending_up' : 'trending_down' }}
                </span>
                <span class="font-bold text-sm">
                  {{ financialService.monthlyPerformance() > 0 ? '+' : '' }}{{ financialService.monthlyPerformance() }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Comparative Flow Chart (Pie Chart) -->
          <div class="relative z-10 my-8 flex flex-col items-center">
            <div class="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 px-1 mb-6">
              <span>Distribuição de Fluxo</span>
              <span class="text-primary">Visão Consolidada</span>
            </div>
            
            <div class="flex flex-col sm:flex-row items-center gap-8 lg:gap-16">
              <div class="relative w-40 h-40 lg:w-48 lg:h-48">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.05)" stroke-width="4"></circle>
                  @for (segment of financialService.pieChartData(); track segment.name) {
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15.915" 
                      fill="transparent" 
                      [attr.stroke]="segment.color" 
                      stroke-width="4"
                      [attr.stroke-dasharray]="segment.percent + ' ' + (100 - segment.percent)"
                      [attr.stroke-dashoffset]="segment.offset"
                      class="transition-all duration-1000 ease-out"
                    ></circle>
                  }
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-[10px] text-on-surface-variant/60 font-bold uppercase">Total</span>
                  <span class="text-sm lg:text-base font-bold">{{ (financialService.monthlyIncome() + financialService.monthlyExpenses() + financialService.amountToPayThisMonth()) | currency:'BRL':'symbol':'1.0-0' }}</span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-1 gap-4 w-full sm:w-auto">
                @for (segment of financialService.pieChartData(); track segment.name) {
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full shrink-0" [style.background-color]="segment.color"></div>
                    <div>
                      <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{{ segment.name }}</p>
                      <p class="text-sm font-bold text-on-surface">{{ segment.value | currency:'BRL' }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            <div class="p-5 rounded-2xl backdrop-blur-md border transition-all group/card bg-surface-container-high/40 border-outline-variant/5">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover/card:scale-110 transition-transform">
                  <span class="material-symbols-outlined text-primary text-[18px]">payments</span>
                </div>
                <span class="text-on-surface-variant/70 text-[10px] font-bold uppercase tracking-widest">Renda Mensal</span>
              </div>
              <p class="text-lg font-bold font-headline tracking-tight">{{ (financialService.monthlyIncome() - financialService.monthlyExtraIncome()) | currency:'BRL' }}</p>
            </div>

            <div class="p-5 rounded-2xl backdrop-blur-md border transition-all group/card bg-primary/10 border-primary/20">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center group-hover/card:scale-110 transition-transform">
                  <span class="material-symbols-outlined text-primary text-[18px]">add_card</span>
                </div>
                <span class="text-on-surface-variant/70 text-[10px] font-bold uppercase tracking-widest">Renda Extra</span>
              </div>
              <p class="text-lg font-bold font-headline tracking-tight text-primary">{{ financialService.monthlyExtraIncome() | currency:'BRL' }}</p>
            </div>

            <div class="p-5 rounded-2xl backdrop-blur-md border transition-all group/card bg-surface-container-high/40 border-outline-variant/5">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-7 h-7 rounded-lg bg-error/10 flex items-center justify-center group-hover/card:scale-110 transition-transform">
                  <span class="material-symbols-outlined text-error text-[18px]">arrow_upward</span>
                </div>
                <span class="text-on-surface-variant/70 text-[10px] font-bold uppercase tracking-widest">Despesas</span>
              </div>
              <p class="text-lg font-bold font-headline tracking-tight">{{ financialService.monthlyExpenses() | currency:'BRL' }}</p>
            </div>

            <div class="p-5 rounded-2xl bg-surface-container-high/40 backdrop-blur-md border border-error/10 hover:bg-surface-container-high/60 transition-all group/card">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-7 h-7 rounded-lg bg-error/5 flex items-center justify-center group-hover/card:scale-110 transition-transform">
                  <span class="material-symbols-outlined text-error text-[18px]">pending_actions</span>
                </div>
                <span class="text-on-surface-variant/70 text-[10px] font-bold uppercase tracking-widest">A Pagar</span>
              </div>
              <p class="text-lg font-bold font-headline tracking-tight text-error">{{ financialService.amountToPayThisMonth() | currency:'BRL' }}</p>
            </div>
          </div>

          <!-- Month-to-Month Comparison -->
          <div class="relative z-10 mt-6 grid grid-cols-1 gap-6">
            <div class="p-6 bg-surface-container-high/20 rounded-3xl border border-outline-variant/5">
              <h4 class="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mb-4">Performance vs Mês Anterior</h4>
              <div class="space-y-4">
                @let current = financialService.monthlyHistory()[5];
                @let previous = financialService.monthlyHistory()[4];
                
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-on-surface">Renda</span>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold" [class.text-primary]="(current?.income || 0) >= (previous?.income || 0)" [class.text-error]="(current?.income || 0) < (previous?.income || 0)">
                      {{ (current?.income || 0) >= (previous?.income || 0) ? '+' : '' }}{{ (((current?.income || 0) - (previous?.income || 0)) / ((previous?.income || 1) || 1) * 100) | number:'1.0-1' }}%
                    </span>
                    <span class="material-symbols-outlined text-sm" [class.text-primary]="(current?.income || 0) >= (previous?.income || 0)" [class.text-error]="(current?.income || 0) < (previous?.income || 0)">
                      {{ (current?.income || 0) >= (previous?.income || 0) ? 'trending_up' : 'trending_down' }}
                    </span>
                  </div>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-on-surface">Gastos</span>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold" [class.text-primary]="(current?.expenses || 0) <= (previous?.expenses || 0)" [class.text-error]="(current?.expenses || 0) > (previous?.expenses || 0)">
                      {{ (current?.expenses || 0) > (previous?.expenses || 0) ? '+' : '' }}{{ (((current?.expenses || 0) - (previous?.expenses || 0)) / ((previous?.expenses || 1) || 1) * 100) | number:'1.0-1' }}%
                    </span>
                    <span class="material-symbols-outlined text-sm" [class.text-primary]="(current?.expenses || 0) <= (previous?.expenses || 0)" [class.text-error]="(current?.expenses || 0) > (previous?.expenses || 0)">
                      {{ (current?.expenses || 0) <= (previous?.expenses || 0) ? 'trending_down' : 'trending_up' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Strategy Goal Widget -->
        <div class="col-span-12 lg:col-span-4 rounded-[2rem] p-6 lg:p-8 flex flex-col border transition-all duration-500 shadow-sm bg-surface-container-high border-outline-variant/10 min-h-[420px]">
          <div class="flex-1">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-bold font-headline">Ação Recomendada</h3>
              <span class="material-symbols-outlined text-primary">rocket_launch</span>
            </div>
            
            <!-- Income Commitment Indicator -->
            <div class="mb-6 p-4 bg-surface-container rounded-2xl border border-outline-variant/5">
              <div class="flex justify-between items-center mb-2">
                <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Comprometimento de Renda</span>
                <span class="text-sm font-bold" 
                  [class.text-primary]="financialService.incomeCommitmentPercentage() <= 50"
                  [class.text-error]="financialService.incomeCommitmentPercentage() >= 90"
                  [class.text-warning]="financialService.incomeCommitmentPercentage() > 50 && financialService.incomeCommitmentPercentage() < 90">
                  {{ financialService.incomeCommitmentPercentage() }}%
                </span>
              </div>
              <div class="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                <div 
                  class="h-full transition-all duration-1000" 
                  [class.bg-primary]="financialService.incomeCommitmentPercentage() <= 50"
                  [class.bg-error]="financialService.incomeCommitmentPercentage() >= 90"
                  [class.bg-warning]="financialService.incomeCommitmentPercentage() > 50 && financialService.incomeCommitmentPercentage() < 90"
                  [style.width.%]="financialService.incomeCommitmentPercentage() > 100 ? 100 : financialService.incomeCommitmentPercentage()"
                ></div>
              </div>
              <p class="text-[9px] text-on-surface-variant/60 mt-2 leading-tight">
                @if (financialService.incomeCommitmentPercentage() <= 50) {
                  Excelente! Mais de 50% da sua renda está livre para o futuro.
                } @else if (financialService.incomeCommitmentPercentage() >= 90) {
                  Atenção Crítica! Quase toda a sua renda está comprometida.
                } @else {
                  Fluxo estável. Continue monitorando seus gastos variáveis.
                }
              </p>
            </div>

            @if (financialService.incomeCommitmentPercentage() <= 50) {
              <div class="p-4 bg-primary/10 border border-primary/20 rounded-2xl mb-6 animate-in fade-in duration-500">
                <p class="text-sm font-bold text-primary mb-1">Saúde Financeira Alta</p>
                <p class="text-xs text-on-surface-variant">Sua renda disponível é superior a 50%. Momento ideal para acelerar suas metas.</p>
              </div>
              <button 
                routerLink="/goals"
                class="w-full py-4 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined">add_task</span>
                Criar Novo Alvo
              </button>
            } @else if (financialService.incomeCommitmentPercentage() >= 90) {
              <div class="p-4 bg-error/10 border border-error/20 rounded-2xl mb-6 animate-in shake duration-500">
                <p class="text-sm font-bold text-error mb-1">Risco de Insolvência</p>
                <p class="text-xs text-on-surface-variant leading-relaxed">Seu comprometimento atingiu {{ financialService.incomeCommitmentPercentage() }}%. Reduza gastos não essenciais imediatamente.</p>
              </div>
              <button 
                routerLink="/strategy"
                class="w-full py-4 bg-error text-on-error font-bold rounded-xl shadow-lg shadow-error/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined">query_stats</span>
                Ajustar Estratégia
              </button>
            } @else {
              <div class="p-4 bg-surface-container-highest/40 rounded-2xl mb-6">
                <p class="text-sm font-bold text-on-surface-variant mb-1">Equilíbrio Mantido</p>
                <p class="text-xs text-on-surface-variant/70">Você está operando em uma zona de segurança. Mantenha o foco no seu planejamento.</p>
              </div>
            }
          </div>
          
          @if (financialService.incomeCommitmentPercentage() >= 90) {
            <div class="mt-8 pt-8 border-t border-outline-variant/10 animate-in fade-in duration-700">
              <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Dicas Atlas para Economizar</p>
              <div class="space-y-4">
                @for (tip of financialService.savingsTips().slice(0, 2); track tip.title) {
                  <div class="flex gap-3">
                    <div class="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined text-primary text-sm">{{ tip.icon }}</span>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-on-surface">{{ tip.title }}</p>
                      <p class="text-[10px] text-on-surface-variant leading-relaxed">{{ tip.message }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Analytics and Transactions Grid -->
      <div class="grid grid-cols-12 gap-6">
        <!-- Recent Transactions Table -->
        <div class="col-span-12 lg:col-span-8 bg-surface-container-low rounded-[2rem] p-8 flex flex-col">
          <div class="flex justify-between items-center mb-8">
            <h3 class="text-lg font-bold font-headline">Transações Recentes</h3>
            <button 
              routerLink="/transactions"
              class="text-primary text-sm font-semibold hover:underline"
            >
              Ver Todo o Fluxo de Riqueza
            </button>
          </div>
          <div class="space-y-1">
            @for (transaction of financialService.filteredTransactions().slice(0, 4); track transaction.id) {
              <div class="group flex items-center justify-between p-4 rounded-2xl hover:bg-surface-container-high transition-colors">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined">{{ transaction.icon }}</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-on-surface">{{ transaction.entity }}</h4>
                    <p class="text-xs text-on-surface-variant/60 font-label uppercase tracking-wider mt-0.5">
                      {{ transaction.category }} • {{ transaction.date | date:'shortTime' }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold" [class.text-error]="transaction.type === 'expense'" [class.text-primary]="transaction.type === 'income'">
                    {{ transaction.type === 'income' ? '+' : '' }}{{ transaction.amount | currency:'BRL' }}
                  </p>
                  <p class="text-[10px] text-on-surface-variant/40 font-label">Autenticação: #{{ transaction.id }}</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Allocation & Top Spending -->
        <div class="col-span-12 lg:col-span-4 space-y-6">
          <div class="bg-surface-container-low rounded-[2rem] p-8 flex flex-col shadow-sm border border-outline-variant/5">
            <h3 class="text-lg font-bold font-headline mb-6">Onde você mais gasta</h3>
            
            <div class="space-y-6">
              @for (cat of financialService.topSpendingCategories(); track cat.name) {
                <div class="space-y-2">
                  <div class="flex justify-between items-end">
                    <span class="text-sm font-bold text-on-surface">{{ cat.name }}</span>
                    <span class="text-sm font-bold text-primary">{{ cat.total | currency:'BRL' }}</span>
                  </div>
                  <div class="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-primary rounded-full" 
                      [style.width.%]="(cat.total / (financialService.monthlyExpenses() || 1)) * 100"
                    ></div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Pending Items List -->
          <div class="bg-surface-container-low rounded-[2rem] p-8 flex flex-col shadow-sm border border-outline-variant/5">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-bold font-headline">Contas Pendentes</h3>
              <span class="px-2 py-0.5 bg-error/10 text-error text-[10px] font-bold rounded-full uppercase tracking-widest">
                {{ financialService.amountToPayThisMonth() | currency:'BRL' }}
              </span>
            </div>
            
            <div class="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              @for (bill of financialService.pendingBillsAndDebts().bills; track bill.id) {
                <div class="flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span class="material-symbols-outlined text-sm">{{ bill.icon }}</span>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-on-surface">{{ bill.name }}</p>
                      <p class="text-[10px] text-on-surface-variant">Vence dia {{ bill.dueDate }}</p>
                    </div>
                  </div>
                  <p class="text-xs font-bold text-on-surface">{{ bill.amount | currency:'BRL' }}</p>
                </div>
              }

              @for (t of financialService.pendingBillsAndDebts().transactions; track t.id) {
                <div class="flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-warning group-hover:scale-110 transition-transform">
                      <span class="material-symbols-outlined text-sm">{{ t.icon }}</span>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-on-surface">{{ t.entity }}</p>
                      <p class="text-[10px] text-on-surface-variant">Pendente • {{ t.date | date:'dd/MM' }}</p>
                    </div>
                  </div>
                  <p class="text-xs font-bold text-on-surface">{{ t.amount | currency:'BRL' }}</p>
                </div>
              }

              @for (debt of financialService.pendingBillsAndDebts().debts; track debt.id) {
                <div class="flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                      <span class="material-symbols-outlined text-sm">{{ debt.icon }}</span>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-on-surface">{{ debt.name }}</p>
                      <p class="text-[10px] text-on-surface-variant">Parcela Mensal</p>
                    </div>
                  </div>
                  <p class="text-xs font-bold text-on-surface">{{ debt.monthlyPayment | currency:'BRL' }}</p>
                </div>
              }

              @if (financialService.amountToPayThisMonth() === 0) {
                <div class="py-8 text-center opacity-40">
                  <span class="material-symbols-outlined text-3xl mb-2">task_alt</span>
                  <p class="text-xs font-bold">Tudo em dia!</p>
                </div>
              }
            </div>

            <button 
              routerLink="/strategy"
              class="w-full mt-6 py-3 bg-surface-container-highest text-on-surface font-bold text-xs rounded-xl hover:bg-surface-container transition-all"
            >
              Gerenciar Compromissos
            </button>
          </div>
        </div>
      </div>

      <!-- Editorial Quote / Insight -->
      <div class="bg-gradient-to-r from-surface-container to-surface-container-low p-12 rounded-[2.5rem] border border-outline-variant/5 text-center relative overflow-hidden min-h-[240px] flex flex-col justify-center">
        <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style="background-image: radial-gradient(circle at 50% 50%, var(--primary-hex) 0%, transparent 70%);"></div>
        <h4 class="text-2xl font-headline font-bold text-on-background max-w-2xl mx-auto leading-relaxed relative z-10 animate-in fade-in duration-1000">
          "{{ quotes[currentQuoteIndex()] }}"
        </h4>
        <p class="text-primary font-label uppercase tracking-widest mt-6 text-sm relative z-10">Atlas Finance • Sabedoria Familiar</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit, OnDestroy {
  financialService = inject(FinancialService);
  showBirthdayPopup = signal(false);

  quotes = [
    "Investir no futuro da sua família é o maior dividendo que você pode receber.",
    "O legado financeiro que você deixa para seus filhos começa com as escolhas de hoje.",
    "Riqueza de verdade é ter tempo para ver seus filhos crescerem sem preocupações financeiras.",
    "Educação financeira é o melhor presente que você pode dar aos seus filhos.",
    "Sua família é o seu maior ativo. Proteja o futuro deles com sabedoria.",
    "Pequenas economias hoje garantem grandes sorrisos amanhã com quem você ama."
  ];

  currentQuoteIndex = signal(0);
  private quoteInterval: ReturnType<typeof setInterval> | undefined;

  ngOnInit() {
    this.quoteInterval = setInterval(() => {
      this.currentQuoteIndex.update(i => (i + 1) % this.quotes.length);
    }, 10000);

    // Birthday Logic
    if (this.financialService.isBirthday() && !this.financialService.checkBirthdayCelebration()) {
      setTimeout(() => {
        this.showBirthdayPopup.set(true);
      }, 1500);
    }
  }

  closeBirthdayPopup() {
    this.showBirthdayPopup.set(false);
    this.financialService.markBirthdayAsCelebrated();
  }

  ngOnDestroy() {
    if (this.quoteInterval) {
      clearInterval(this.quoteInterval);
    }
  }
}
