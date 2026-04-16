import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FinancialService } from './financial.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="mb-8">
        <h2 class="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">Livro de Transações</h2>
        <div class="flex items-center gap-2 text-primary font-medium text-sm">
          <span class="material-symbols-outlined text-sm">auto_awesome</span>
          <span>Seu ecossistema financeiro foi atualizado há 2 minutos.</span>
        </div>
      </div>

      <!-- Bento Summary Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="surface-container-low p-6 rounded-xl relative overflow-hidden">
          <div class="absolute top-0 right-0 p-4 opacity-10">
            <span class="material-symbols-outlined text-6xl">account_balance</span>
          </div>
          <p class="text-label-sm text-on-surface-variant font-medium uppercase tracking-widest mb-1">Saldo Total</p>
          <h3 class="text-3xl font-headline font-bold text-on-surface">{{ financialService.totalBalance() | currency:'BRL' }}</h3>
          <div class="mt-4 flex items-center gap-2 text-xs">
            <span 
              [class]="financialService.monthlyPerformance() >= 0 ? 'bg-primary/20 text-primary' : 'bg-error/20 text-error'"
              class="px-2 py-0.5 rounded-full font-bold transition-colors duration-500"
            >
              {{ financialService.monthlyPerformance() > 0 ? '+' : '' }}{{ financialService.monthlyPerformance() }}% este mês
            </span>
          </div>
        </div>
        <div class="surface-container-low p-6 rounded-xl border-l-4 border-primary/50">
          <p class="text-label-sm text-on-surface-variant font-medium uppercase tracking-widest mb-1">Renda Mensal</p>
          <h3 class="text-3xl font-headline font-bold text-primary">{{ financialService.monthlyIncome() | currency:'BRL' }}</h3>
          <div class="mt-4 w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
            <div class="bg-primary h-full transition-all duration-1000" [style.width.%]="100"></div>
          </div>
        </div>
        <div class="surface-container-low p-6 rounded-xl border-l-4 border-error/50">
          <p class="text-label-sm text-on-surface-variant font-medium uppercase tracking-widest mb-1">Despesas Mensais</p>
          <h3 class="text-3xl font-headline font-bold text-error">{{ financialService.monthlyExpenses() | currency:'BRL' }}</h3>
          <div class="mt-4 w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
            <div 
              class="bg-error h-full transition-all duration-1000" 
              [style.width.%]="financialService.incomeCommitmentPercentage() > 100 ? 100 : financialService.incomeCommitmentPercentage()"
            ></div>
          </div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bg-surface-container-low p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-4 flex-1 min-w-[300px]">
          <div class="relative flex-1 max-w-md">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
            <input 
              type="text"
              [value]="financialService.searchQuery()"
              (input)="onSearch($event)"
              placeholder="Buscar por entidade, categoria ou nota..."
              class="w-full bg-surface-container pl-10 pr-4 py-2 rounded-lg border border-outline-variant/10 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          
          <div class="flex bg-surface-container rounded-lg p-1 border border-outline-variant/10">
            <button 
              (click)="statusFilter.set('all')"
              class="px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all"
              [class.bg-primary]="statusFilter() === 'all'"
              [class.text-on-primary]="statusFilter() === 'all'"
              [class.text-on-surface-variant]="statusFilter() !== 'all'"
            >
              Todos
            </button>
            <button 
              (click)="statusFilter.set('pending')"
              class="px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all"
              [class.bg-error]="statusFilter() === 'pending'"
              [class.text-white]="statusFilter() === 'pending'"
              [class.text-on-surface-variant]="statusFilter() !== 'pending'"
            >
              Pendentes
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="flex items-center gap-2 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors">
            <span class="material-symbols-outlined text-lg">download</span>
            <span class="text-sm font-bold">Exportar</span>
          </button>
        </div>
      </div>

      <!-- Transaction Ledger Table (Desktop) / Cards (Mobile) -->
      <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-xl">
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="bg-surface-container-low/50">
                <th class="px-6 py-4 text-label-sm font-bold uppercase tracking-widest text-on-surface-variant">Data</th>
                <th class="px-6 py-4 text-label-sm font-bold uppercase tracking-widest text-on-surface-variant">Entidade</th>
                <th class="px-6 py-4 text-label-sm font-bold uppercase tracking-widest text-on-surface-variant">Categoria</th>
                <th class="px-6 py-4 text-label-sm font-bold uppercase tracking-widest text-on-surface-variant">Conta</th>
                <th class="px-6 py-4 text-label-sm font-bold uppercase tracking-widest text-on-surface-variant text-right">Valor</th>
                <th class="px-6 py-4 text-label-sm font-bold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                <th class="px-6 py-4 text-label-sm font-bold uppercase tracking-widest text-on-surface-variant text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/10">
              @for (transaction of filteredTransactions(); track transaction.id) {
                <tr class="hover:bg-primary/5 transition-colors group cursor-pointer">
                  <td class="px-6 py-5">
                    <p class="text-sm font-medium text-on-surface">{{ transaction.date | date:'d MMM, y' }}</p>
                    <p class="text-[10px] text-on-surface-variant">{{ transaction.date | date:'HH:mm' }}</p>
                  </td>
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary border border-outline-variant/10">
                        <span class="material-symbols-outlined">{{ transaction.icon }}</span>
                      </div>
                      <div>
                        <p class="text-sm font-bold text-on-surface">{{ transaction.entity }}</p>
                        <p class="text-xs text-on-surface-variant">{{ transaction.description }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-5">
                    <span class="px-3 py-1 bg-secondary-container/30 text-secondary text-[11px] font-bold rounded-full border border-secondary/20">
                      {{ transaction.category }}
                    </span>
                  </td>
                  <td class="px-6 py-5">
                    <p class="text-sm text-on-surface-variant">{{ transaction.account }}</p>
                  </td>
                  <td class="px-6 py-5 text-right">
                    <p class="text-sm font-bold" [class.text-primary]="transaction.type === 'income'" [class.text-on-surface]="transaction.type === 'expense'">
                      {{ transaction.type === 'income' ? '+' : '' }}{{ transaction.amount | currency:'BRL' }}
                    </p>
                  </td>
                  <td class="px-6 py-5">
                    <div class="flex justify-center">
                      @if (transaction.status === 'completed') {
                        <span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                      } @else {
                        <span class="material-symbols-outlined text-on-surface-variant text-lg">pending</span>
                      }
                    </div>
                  </td>
                  <td class="px-6 py-5 text-right">
                    <button 
                      (click)="deleteTransaction(transaction.id, $event)"
                      class="p-2 text-on-surface-variant/40 hover:text-error hover:bg-error/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      title="Excluir Transação"
                    >
                      <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden divide-y divide-outline-variant/10">
          @for (transaction of filteredTransactions(); track transaction.id) {
            <div class="p-4 flex flex-col gap-3 hover:bg-primary/5 transition-colors">
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary border border-outline-variant/10">
                    <span class="material-symbols-outlined">{{ transaction.icon }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-on-surface">{{ transaction.entity }}</p>
                    <p class="text-[10px] text-on-surface-variant">{{ transaction.date | date:'d MMM, y • HH:mm' }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold" [class.text-primary]="transaction.type === 'income'" [class.text-on-surface]="transaction.type === 'expense'">
                    {{ transaction.type === 'income' ? '+' : '' }}{{ transaction.amount | currency:'BRL' }}
                  </p>
                  <span class="px-2 py-0.5 bg-secondary-container/30 text-secondary text-[9px] font-bold rounded-full border border-secondary/20 uppercase">
                    {{ transaction.category }}
                  </span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <p class="text-xs text-on-surface-variant">{{ transaction.account }}</p>
                <div class="flex items-center gap-4">
                  @if (transaction.status === 'completed') {
                    <span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                  } @else {
                    <span class="material-symbols-outlined text-on-surface-variant text-lg">pending</span>
                  }
                  <button 
                    (click)="deleteTransaction(transaction.id, $event)"
                    class="p-2 text-error/60 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        @if (filteredTransactions().length === 0) {
          <div class="px-6 py-20 text-center">
            <div class="flex flex-col items-center gap-3 opacity-40">
              <span class="material-symbols-outlined text-5xl">search_off</span>
              <p class="text-lg font-bold">Nenhum registro encontrado</p>
              <p class="text-sm">Tente ajustar seus termos de busca.</p>
            </div>
          </div>
        }
        
        <!-- Table Footer/Summary -->
        <div class="bg-surface-container-low p-4 lg:p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <button class="p-2 bg-surface-container rounded-lg border border-outline-variant/10 hover:bg-primary/10 transition-colors">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-primary font-bold">1</span>
              <span class="text-on-surface-variant">de 1 Página</span>
            </div>
            <button class="p-2 bg-surface-container rounded-lg border border-outline-variant/10 hover:bg-primary/10 transition-colors">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <div class="flex flex-wrap items-center justify-center lg:justify-end gap-4 lg:gap-8 w-full lg:w-auto">
            <div class="text-center lg:text-right">
              <p class="text-[9px] lg:text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Renda (Filtro)</p>
              <p class="text-base lg:text-lg font-bold text-primary">+{{ financialService.filteredIncome() | currency:'BRL' }}</p>
            </div>
            <div class="text-center lg:text-right">
              <p class="text-[9px] lg:text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Despesa (Filtro)</p>
              <p class="text-base lg:text-lg font-bold text-error">-{{ financialService.filteredExpenses() | currency:'BRL' }}</p>
            </div>
            <div class="hidden lg:block h-10 w-[1px] bg-outline-variant/30"></div>
            <div class="text-center lg:text-right w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-outline-variant/10">
              <p class="text-[9px] lg:text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Saldo Filtrado</p>
              <p class="text-lg lg:text-xl font-headline font-extrabold text-on-surface">
                {{ financialService.filteredNet() >= 0 ? '+' : '' }}{{ financialService.filteredNet() | currency:'BRL' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Transactions {
  financialService = inject(FinancialService);
  statusFilter = signal<'all' | 'pending'>('all');

  filteredTransactions = computed(() => {
    const transactions = this.financialService.filteredTransactions();
    if (this.statusFilter() === 'all') return transactions;
    return transactions.filter(t => t.status === 'pending');
  });

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.financialService.searchQuery.set(input.value);
  }

  deleteTransaction(id: string, event: Event) {
    event.stopPropagation();
    this.financialService.deleteTransaction(id);
  }
}
