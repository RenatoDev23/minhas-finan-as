import { ChangeDetectionStrategy, Component, inject, signal, computed, input } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialService, Goal } from './financial.service';

@Component({
  selector: 'app-custom-report',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DecimalPipe, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-8">
        <div>
          <span class="text-secondary font-bold tracking-[0.2em] text-[10px] uppercase">Estúdio de Criação</span>
          <h2 class="text-4xl font-extrabold tracking-tight mt-1">Gestão de {{ reportName() }}</h2>
          <p class="text-on-surface-variant mt-2">Acompanhe seus projetos e investimentos em {{ reportName() }} separadamente.</p>
        </div>
        
        <!-- Tab Switcher -->
        <div class="flex p-1.5 bg-surface-container rounded-2xl w-fit border border-outline-variant/5">
          <button 
            (click)="activeAccount.set(reportName())"
            [class.bg-surface-bright]="activeAccount() === reportName()"
            [class.text-on-surface]="activeAccount() === reportName()"
            [class.shadow-lg]="activeAccount() === reportName()"
            class="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 text-on-surface-variant hover:text-on-surface"
          >
            <span class="material-symbols-outlined text-lg">{{ reportIcon() }}</span>
            Conta {{ reportName() }}
          </button>
          <button 
            (click)="activeAccount.set('Principal')"
            [class.bg-surface-bright]="activeAccount() === 'Principal'"
            [class.text-on-surface]="activeAccount() === 'Principal'"
            [class.shadow-lg]="activeAccount() === 'Principal'"
            class="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 text-on-surface-variant hover:text-on-surface"
          >
            <span class="material-symbols-outlined text-lg">account_balance</span>
            Conta Principal
          </button>
        </div>
      </div>

      <!-- Quick Entry for Earnings -->
      @if (activeAccount() === reportName()) {
        <div class="bg-surface-container-low p-8 rounded-[2rem] border border-secondary/20 shadow-xl animate-in slide-in-from-top-4 duration-500">
          <div class="flex flex-col md:flex-row items-center gap-8">
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-2 flex items-center gap-2">
                <span class="material-symbols-outlined text-secondary">add_circle</span>
                Registrar Novo Recebimento
              </h3>
              <p class="text-sm text-on-surface-variant">Insira o valor do serviço ou venda. Você pode transferir o lucro para a conta principal depois.</p>
            </div>
            <div class="flex items-center gap-4">
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">R$</span>
                <input 
                  #earningsInput
                  type="text" 
                  (input)="onCurrencyInput($event, 'earnings')"
                  class="pl-12 pr-6 py-4 bg-surface-container rounded-2xl border border-outline-variant/20 focus:border-secondary outline-none text-2xl font-bold w-48"
                  placeholder="0,00"
                />
              </div>
              <button 
                (click)="registerEarnings(earningsInput)"
                [disabled]="serviceEarnings() <= 0"
                class="px-8 py-4 bg-secondary text-on-secondary font-bold rounded-2xl hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Transfer Option -->
      @if (activeAccount() === reportName()) {
        <div class="bg-surface-container-low p-8 rounded-[2rem] border border-primary/20 shadow-xl animate-in slide-in-from-top-4 duration-500">
          <div class="flex flex-col md:flex-row items-center gap-8">
            <div class="flex-1">
              <h3 class="text-xl font-bold mb-2 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">send_to_mobile</span>
                Transferir Lucro para Principal
              </h3>
              <p class="text-sm text-on-surface-variant">Mova o saldo de {{ reportName() }} para sua gestão financeira principal.</p>
            </div>
            <div class="flex items-center gap-4">
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">R$</span>
                <input 
                  #transferInput
                  type="text" 
                  (input)="onCurrencyInput($event, 'transfer')"
                  class="pl-12 pr-6 py-4 bg-surface-container rounded-2xl border border-outline-variant/20 focus:border-primary outline-none text-2xl font-bold w-48"
                  placeholder="0,00"
                />
              </div>
              <button 
                (click)="transferToPrincipal(transferInput)"
                [disabled]="transferAmount() <= 0 || transferAmount() > summary().balance"
                class="px-8 py-4 bg-primary text-on-primary font-bold rounded-2xl hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                Transferir
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-surface-container-low p-5 rounded-3xl border border-outline-variant/5 shadow-sm">
          <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Saldo Atual</p>
          <p class="text-2xl font-headline font-extrabold text-on-surface">{{ summary().balance | currency:'BRL' }}</p>
        </div>
        <div class="bg-surface-container-low p-5 rounded-3xl border border-outline-variant/5 shadow-sm">
          <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Faturamento</p>
          <p class="text-2xl font-headline font-extrabold text-secondary">{{ summary().income | currency:'BRL' }}</p>
        </div>
        <div class="bg-surface-container-low p-5 rounded-3xl border border-outline-variant/5 shadow-sm">
          <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Custos/Invest.</p>
          <p class="text-2xl font-headline font-extrabold text-error">{{ summary().expenses | currency:'BRL' }}</p>
        </div>
        <div class="bg-surface-container-low p-5 rounded-3xl border border-outline-variant/5 shadow-sm">
          <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Lucro Bruto</p>
          <p class="text-2xl font-headline font-extrabold" [class.text-secondary]="summary().net >= 0" [class.text-error]="summary().net < 0">
            {{ summary().net | currency:'BRL' }}
          </p>
        </div>
        <div class="bg-surface-container-low p-5 rounded-3xl border border-outline-variant/5 shadow-sm ring-2 ring-primary/10">
          <p class="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Transferido</p>
          <p class="text-2xl font-headline font-extrabold text-primary">{{ summary().transferred | currency:'BRL' }}</p>
        </div>
      </div>

      <!-- Goals Section -->
      @if (activeAccount() === reportName()) {
        <div class="space-y-6">
          <div class="flex justify-between items-end">
            <div>
              <h3 class="text-2xl font-bold font-headline">Alvos de Investimento</h3>
              <p class="text-sm text-on-surface-variant">Planeje seus próximos passos e aquisições para {{ reportName() }}.</p>
            </div>
            <button 
              (click)="showAddGoalModal.set(true)"
              class="flex items-center gap-2 px-6 py-3 bg-secondary/10 text-secondary rounded-2xl font-bold text-sm hover:bg-secondary/20 transition-all"
            >
              <span class="material-symbols-outlined text-lg">add_circle</span>
              Novo Alvo
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (goal of reportGoals(); track goal.id) {
              <div class="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 hover:border-secondary/30 transition-all group relative overflow-hidden">
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors"></div>
                
                <div class="flex justify-between items-start mb-6 relative z-10">
                  <div class="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                    <span class="material-symbols-outlined">{{ goal.icon }}</span>
                  </div>
                  <button 
                    (click)="financialService.deleteCustomGoal(goal.id)"
                    class="p-2 text-on-surface-variant/40 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>

                <div class="space-y-4 relative z-10">
                  <div>
                    <h4 class="font-bold text-lg text-on-surface">{{ goal.title }}</h4>
                    <p class="text-xs text-on-surface-variant">Meta: {{ goal.targetAmount | currency:'BRL' }}</p>
                  </div>

                  <div class="space-y-2">
                    <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span class="text-secondary">{{ goal.currentAmount | currency:'BRL' }} salvos</span>
                      <span class="text-on-surface-variant">{{ Math.round((goal.currentAmount / goal.targetAmount) * 100) }}%</span>
                    </div>
                    <div class="h-2 bg-surface-container-highest rounded-full">
                      <div 
                        class="h-full bg-secondary transition-all duration-1000" 
                        [style.width.%]="(goal.currentAmount / goal.targetAmount) * 100"
                      ></div>
                    </div>
                  </div>

                  <div class="pt-2">
                    <button 
                      (click)="openContributeModal(goal)"
                      class="w-full py-3 bg-surface-container-highest text-on-surface font-bold rounded-xl text-xs hover:bg-secondary hover:text-on-secondary transition-all"
                    >
                      Alocar Saldo
                    </button>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="col-span-full py-12 text-center bg-surface-container-low rounded-[2rem] border border-dashed border-outline-variant/30">
                <span class="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2">inventory_2</span>
                <p class="text-on-surface-variant font-medium">Nenhum alvo definido para este relatório.</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- Add Goal Modal -->
      @if (showAddGoalModal()) {
        <div class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div class="w-full max-w-md bg-surface-container-high rounded-[2rem] shadow-2xl border border-outline-variant/10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="p-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 class="text-xl font-bold">Novo Alvo</h3>
              <button (click)="showAddGoalModal.set(false)" class="p-2 hover:bg-surface-container rounded-full">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label for="goalTitle" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Descrição do Alvo</label>
                <input 
                  id="goalTitle"
                  type="text" 
                  [(ngModel)]="newGoal.title"
                  class="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-on-surface outline-none focus:ring-1 focus:ring-secondary/30" 
                  placeholder="Ex: Novo Equipamento, Curso, Reserva..."
                />
              </div>
              <div>
                <label for="goalAmount" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Valor Alvo (R$)</label>
                <input 
                  id="goalAmount"
                  type="text" 
                  [value]="formattedGoalAmount()"
                  (input)="onCurrencyInput($event, 'goal')"
                  class="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-on-surface outline-none focus:ring-1 focus:ring-secondary/30" 
                  placeholder="0,00"
                />
              </div>
              <div>
                <span class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Ícone</span>
                <div class="flex gap-2 overflow-x-auto pb-2">
                  @for (icon of ['shopping_cart', 'inventory_2', 'school', 'rocket_launch', 'savings', 'build']; track icon) {
                    <button 
                      (click)="newGoal.icon = icon"
                      [class.bg-secondary/20]="newGoal.icon === icon"
                      [class.border-secondary]="newGoal.icon === icon"
                      class="w-12 h-12 flex-shrink-0 rounded-xl border border-outline-variant/20 flex items-center justify-center hover:bg-surface-container transition-all"
                    >
                      <span class="material-symbols-outlined text-on-surface">{{ icon }}</span>
                    </button>
                  }
                </div>
              </div>
            </div>
            <div class="p-6 bg-surface-container-highest/30 border-t border-outline-variant/10 flex gap-3">
              <button (click)="showAddGoalModal.set(false)" class="flex-1 py-3 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-highest transition-all">Cancelar</button>
              <button (click)="saveGoal()" class="flex-1 py-3 bg-secondary text-on-secondary font-bold rounded-xl hover:brightness-110 transition-all">Salvar Alvo</button>
            </div>
          </div>
        </div>
      }

      <!-- Contribute Modal -->
      @if (selectedGoal()) {
        <div class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div class="w-full max-w-md bg-surface-container-high rounded-[2rem] shadow-2xl border border-outline-variant/10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="p-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 class="text-xl font-bold font-headline">Alocar para {{ selectedGoal()?.title }}</h3>
              <button (click)="selectedGoal.set(null)" class="p-2 hover:bg-surface-container rounded-full">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div class="bg-secondary/5 p-4 rounded-2xl border border-secondary/10">
                <p class="text-xs text-on-surface-variant mb-1">Saldo Disponível em {{ reportName() }}</p>
                <p class="text-xl font-bold text-secondary">{{ summary().balance | currency:'BRL' }}</p>
              </div>
              <div>
                <label for="contributionAmount" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Valor a Alocar (R$)</label>
                <input 
                  id="contributionAmount"
                  type="text" 
                  [value]="formattedContributionAmount()"
                  (input)="onCurrencyInput($event, 'contribution')"
                  class="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-on-surface outline-none focus:ring-1 focus:ring-secondary/30" 
                  placeholder="0,00"
                />
              </div>
            </div>
            <div class="p-6 bg-surface-container-highest/30 border-t border-outline-variant/10 flex gap-3">
              <button (click)="selectedGoal.set(null)" class="flex-1 py-3 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-highest transition-all">Cancelar</button>
              <button 
                (click)="confirmContribution()" 
                [disabled]="contributionAmount() <= 0 || contributionAmount() > summary().balance"
                class="flex-1 py-3 bg-secondary text-on-secondary font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              >
                Confirmar Alocação
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Transactions List -->
      <div class="bg-surface-container-low rounded-[2rem] overflow-hidden border border-outline-variant/5 shadow-xl">
        <div class="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-highest/30">
          <h3 class="text-xl font-bold font-headline flex items-center gap-3">
            <span class="material-symbols-outlined text-secondary">
              {{ activeAccount() === 'Principal' ? 'account_balance' : reportIcon() }}
            </span>
            Transações: {{ activeAccount() }}
          </h3>
          <span class="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">
            {{ transactions().length }} registros encontrados
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low/50">
                <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Data</th>
                <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Descrição</th>
                <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Categoria</th>
                <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Valor</th>
                <th class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/10">
              @for (t of transactions(); track t.id) {
                <tr class="hover:bg-secondary/5 transition-colors group">
                  <td class="px-8 py-5">
                    <p class="text-sm font-medium text-on-surface">{{ t.date | date:'d MMM, y' }}</p>
                    <p class="text-[10px] text-on-surface-variant">{{ t.date | date:'HH:mm' }}</p>
                  </td>
                  <td class="px-8 py-5">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-secondary">
                        <span class="material-symbols-outlined">{{ t.icon }}</span>
                      </div>
                      <div>
                        <p class="text-sm font-bold text-on-surface">{{ t.entity }}</p>
                        <p class="text-xs text-on-surface-variant">{{ t.description }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-5">
                    <span class="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-[10px] font-bold rounded-full border border-outline-variant/10">
                      {{ t.category }}
                    </span>
                  </td>
                  <td class="px-8 py-5 text-right">
                    <p class="text-sm font-bold" [class.text-secondary]="t.type === 'income'" [class.text-error]="t.type === 'expense'">
                      {{ t.type === 'income' ? '+' : '' }}{{ t.amount | currency:'BRL' }}
                    </p>
                  </td>
                  <td class="px-8 py-5 text-right">
                    <button 
                      (click)="deleteTransaction(t.id)"
                      class="p-2 text-on-surface-variant/40 hover:text-error hover:bg-error/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      title="Excluir Transação"
                    >
                      <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-8 py-20 text-center opacity-40">
                    <span class="material-symbols-outlined text-6xl mb-4">inventory_2</span>
                    <p class="text-lg font-bold">Nenhum registro encontrado.</p>
                    <p class="text-sm">Registre seus recebimentos acima para começar o controle.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomReportComponent {
  financialService = inject(FinancialService);
  
  // Inputs from route
  id = input.required<string>();

  report = computed(() => {
    const rId = this.id();
    if (rId === 'photo') {
      return { id: 'photo', name: 'Fotografia', icon: 'camera_enhance' };
    }
    return this.financialService.customReports().find(r => r.id === rId);
  });

  reportName = computed(() => this.report()?.name || 'Relatório');
  reportIcon = computed(() => this.report()?.icon || 'analytics');

  activeAccount = signal('');

  constructor() {
    // Initialize active account when report changes
    computed(() => {
      const name = this.reportName();
      this.activeAccount.set(name);
    });
  }

  serviceEarnings = signal(0);
  transferAmount = signal(0);
  
  showAddGoalModal = signal(false);
  selectedGoal = signal<Goal | null>(null);
  contributionAmount = signal(0);
  formattedGoalAmount = signal('');
  formattedContributionAmount = signal('');
  
  newGoal = {
    title: '',
    targetAmount: 0,
    icon: 'shopping_cart',
    category: 'Investimento',
    deadline: ''
  };

  Math = Math;

  transactions = computed(() => {
    return this.financialService.transactions().filter(t => t.account === this.activeAccount());
  });

  reportGoals = computed(() => {
    const rId = this.id();
    if (rId === 'photo') {
      return this.financialService.photoGoals();
    }
    return this.financialService.customGoals().filter(g => g.accountId === rId);
  });

  summary = computed(() => {
    const txs = this.transactions();
    const income = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const expensesOnly = Math.abs(txs.filter(t => t.type === 'expense' && t.category !== 'Transferência' && t.category !== 'Investimento' && t.category !== 'Equipamento').reduce((acc, t) => acc + (Number(t.amount) || 0), 0));
    const investment = Math.abs(txs.filter(t => t.category === 'Investimento' || t.category === 'Equipamento').reduce((acc, t) => acc + (Number(t.amount) || 0), 0));
    const transferred = Math.abs(txs.filter(t => t.category === 'Transferência' && t.entity.includes('Principal')).reduce((acc, t) => acc + (Number(t.amount) || 0), 0));
    
    return {
      income,
      expenses: expensesOnly + investment,
      transferred,
      net: income - (expensesOnly + investment),
      balance: txs.reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
    };
  });

  onCurrencyInput(event: Event, type: 'earnings' | 'transfer' | 'goal' | 'contribution') {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    
    if (!value) {
      this.updateAmount(type, 0, '');
      input.value = '';
      return;
    }

    const numeric = parseInt(value, 10) / 100;
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numeric);

    input.value = formatted;
    this.updateAmount(type, numeric, formatted);
  }

  private updateAmount(type: string, numeric: number, formatted: string) {
    switch (type) {
      case 'earnings': this.serviceEarnings.set(numeric); break;
      case 'transfer': this.transferAmount.set(numeric); break;
      case 'goal': 
        this.newGoal.targetAmount = numeric;
        this.formattedGoalAmount.set(formatted);
        break;
      case 'contribution':
        this.contributionAmount.set(numeric);
        this.formattedContributionAmount.set(formatted);
        break;
    }
  }

  registerEarnings(input?: HTMLInputElement) {
    const amount = this.serviceEarnings();
    if (amount <= 0) return;

    this.financialService.addTransaction({
      date: new Date(),
      entity: `Recebimento: ${this.reportName()}`,
      description: 'Serviço/Venda realizado',
      category: 'Renda Extra',
      account: this.reportName(),
      amount: amount,
      status: 'completed',
      type: 'income',
      icon: this.reportIcon()
    });

    this.serviceEarnings.set(0);
    if (input) input.value = '';
  }

  transferToPrincipal(input?: HTMLInputElement) {
    const amount = this.transferAmount();
    if (amount <= 0 || amount > this.summary().balance) return;

    this.financialService.transfer(this.reportName(), 'Principal', amount);
    this.transferAmount.set(0);
    if (input) input.value = '';
  }

  saveGoal() {
    if (!this.newGoal.title || this.newGoal.targetAmount <= 0) return;
    
    const rId = this.id();
    if (rId === 'photo') {
      this.financialService.addPhotoGoal({
        title: this.newGoal.title,
        targetAmount: this.newGoal.targetAmount,
        icon: this.newGoal.icon,
        category: 'Equipamento',
        deadline: new Date().toISOString()
      });
    } else {
      this.financialService.addCustomGoal({
        title: this.newGoal.title,
        targetAmount: this.newGoal.targetAmount,
        icon: this.newGoal.icon,
        category: 'Investimento',
        deadline: new Date().toISOString(),
        accountId: rId
      });
    }

    this.showAddGoalModal.set(false);
    this.newGoal = { title: '', targetAmount: 0, icon: 'shopping_cart', category: 'Investimento', deadline: '' };
    this.formattedGoalAmount.set('');
  }

  openContributeModal(goal: Goal) {
    this.selectedGoal.set(goal);
    this.contributionAmount.set(0);
    this.formattedContributionAmount.set('');
  }

  confirmContribution() {
    const goal = this.selectedGoal();
    const amount = this.contributionAmount();
    if (!goal || amount <= 0 || amount > this.summary().balance) return;

    // 1. Add transaction to account to reduce balance
    this.financialService.addTransaction({
      date: new Date(),
      entity: `Alocação: ${goal.title}`,
      description: 'Reserva para investimento',
      category: 'Investimento',
      account: this.reportName(),
      amount: -amount,
      status: 'completed',
      type: 'expense',
      icon: goal.icon
    });

    // 2. Update the goal's current amount
    if (this.id() === 'photo') {
      this.financialService.contributeToPhotoGoal(goal.id, amount);
    } else {
      this.financialService.contributeToCustomGoal(goal.id, amount);
    }

    this.selectedGoal.set(null);
  }

  deleteTransaction(id: string) {
    this.financialService.deleteTransaction(id);
  }
}
