import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { FinancialService, RecurringBill, Debt, Transaction } from './financial.service';

@Component({
  selector: 'app-new-transaction',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Editorial Header -->
      <div class="mb-12">
        <div class="flex items-end justify-between border-b border-outline-variant/10 pb-6">
          <div>
            <span class="text-primary font-bold tracking-[0.2em] text-[10px] uppercase">Livro de Transações</span>
            <h2 class="text-4xl font-extrabold tracking-tight mt-1">Novo Registro</h2>
          </div>
          <div class="text-right">
            <p class="text-on-surface-variant text-sm">Saldo do Cofre</p>
            <p class="text-2xl font-bold font-headline">{{ financialService.totalBalance() | currency:'BRL' }}</p>
          </div>
        </div>
      </div>

      <!-- Central Transaction Card -->
      <div class="bg-surface-container-low rounded-[2rem] overflow-hidden shadow-2xl relative">
        <!-- Decorative Accent -->
        <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
        
        <div class="grid grid-cols-1">
          <!-- Main Form Section -->
          <div class="p-10">
            <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()" class="space-y-8">
              <!-- Type Toggle -->
              <div class="flex p-1.5 bg-surface-container rounded-2xl w-fit">
                <button 
                  type="button"
                  (click)="setType('expense')"
                  [class.bg-error]="type() === 'expense'"
                  [class.text-on-error]="type() === 'expense'"
                  [class.shadow-lg]="type() === 'expense'"
                  [class.shadow-error/20]="type() === 'expense'"
                  class="px-8 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 text-on-surface-variant hover:text-on-surface"
                >
                  Despesa
                </button>
                <button 
                  type="button"
                  (click)="setType('income')"
                  [class.bg-primary]="type() === 'income'"
                  [class.text-on-primary]="type() === 'income'"
                  [class.shadow-lg]="type() === 'income'"
                  [class.shadow-primary/20]="type() === 'income'"
                  class="px-8 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 text-on-surface-variant hover:text-on-surface"
                >
                  Renda
                </button>
                <button 
                  type="button"
                  (click)="setType('bill_payment')"
                  [class.bg-secondary]="type() === 'bill_payment'"
                  [class.text-on-secondary]="type() === 'bill_payment'"
                  [class.shadow-lg]="type() === 'bill_payment'"
                  [class.shadow-secondary/20]="type() === 'bill_payment'"
                  class="px-8 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 text-on-surface-variant hover:text-on-surface"
                >
                  Pagar Conta
                </button>
              </div>

              <!-- Amount Input -->
              <div class="relative">
                <label for="amount" class="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2 ml-1">Valor da Transação</label>
                <div class="flex items-center gap-4 group">
                  <span class="text-4xl font-headline font-bold text-on-surface-variant group-focus-within:text-primary transition-colors">R$</span>
                  <input 
                    id="amount"
                    #amountInput
                    formControlName="amount"
                    class="w-full bg-transparent border-none p-0 text-6xl font-headline font-extrabold focus:ring-0 placeholder:text-surface-variant text-on-surface" 
                    placeholder="0,00" 
                    type="text"
                    (input)="onAmountInput($event)"
                  />
                </div>
                <div class="h-[2px] w-full bg-surface-container-highest mt-4 relative overflow-hidden">
                  <div class="absolute inset-0 bg-primary w-1/3"></div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-8">
                <!-- Date Picker -->
                <div class="space-y-2">
                  <label for="date" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Data de Execução</label>
                  <div class="flex items-center gap-3 bg-surface-container p-4 rounded-2xl border border-outline-variant/10 focus-within:border-primary/50 transition-colors">
                    <span class="material-symbols-outlined text-primary">calendar_today</span>
                    <input 
                      id="date"
                      formControlName="date"
                      class="bg-transparent border-none focus:ring-0 text-sm font-medium w-full text-on-surface [color-scheme:dark]" 
                      type="date"
                    />
                  </div>
                </div>

                <!-- Category -->
                <div class="space-y-2">
                  <label for="category" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Classificação</label>
                  <div class="space-y-3">
                    <div class="flex items-center gap-3 bg-surface-container p-4 rounded-2xl border border-outline-variant/10 focus-within:border-primary/50 transition-colors">
                      <span class="material-symbols-outlined text-primary">category</span>
                      <select 
                        id="category"
                        formControlName="category"
                        (change)="onCategoryChange($event)"
                        class="bg-transparent border-none focus:ring-0 text-sm font-medium w-full text-on-surface appearance-none"
                      >
                        @for (cat of financialService.categories(); track cat) {
                          <option [value]="cat" class="bg-surface-container-high text-on-surface">{{ cat }}</option>
                        }
                        <option value="NEW_CATEGORY" class="bg-surface-container-high text-primary font-bold">+ Nova Categoria...</option>
                      </select>
                    </div>

                    @if (showNewCategoryInput()) {
                      <div class="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                        <input 
                          #newCatInput
                          type="text" 
                          class="flex-1 bg-surface-container p-4 rounded-2xl border border-primary/30 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary/50" 
                          placeholder="Nome da nova categoria"
                          (keyup.enter)="addNewCategory(newCatInput.value)"
                        />
                        <button 
                          type="button"
                          (click)="addNewCategory(newCatInput.value)"
                          class="bg-primary text-on-primary px-6 rounded-2xl font-bold hover:brightness-110 transition-all"
                        >
                          OK
                        </button>
                      </div>
                    }
                  </div>
                </div>
              </div>

                <!-- Entity Input -->
                <div class="space-y-2">
                  <label for="entity" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Entidade / Beneficiário</label>
                  <input 
                    id="entity"
                    formControlName="entity"
                    class="w-full bg-surface-container p-4 rounded-2xl border border-outline-variant/10 focus-within:border-primary/50 transition-colors focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant/40" 
                    placeholder="Com quem é esta transação?"
                  />
                </div>

                <!-- Account Selection -->
                <div class="space-y-2">
                  <label for="account" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Conta de Origem/Destino</label>
                  <div class="flex items-center gap-3 bg-surface-container p-4 rounded-2xl border border-outline-variant/10 focus-within:border-primary/50 transition-colors">
                    <span class="material-symbols-outlined text-primary">account_balance</span>
                    <select 
                      id="account"
                      formControlName="account"
                      class="bg-transparent border-none focus:ring-0 text-sm font-medium w-full text-on-surface appearance-none"
                    >
                      @for (acc of financialService.accounts(); track acc) {
                        <option [value]="acc" class="bg-surface-container-high text-on-surface">{{ acc }}</option>
                      }
                    </select>
                  </div>
                </div>

              @if (type() === 'expense') {
                <!-- Expense Linking -->
                <div class="space-y-4 p-6 bg-surface-container/50 rounded-2xl border border-outline-variant/5">
                  <p class="block text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Vínculo de Pagamento (Opcional)</p>
                  <div class="flex items-center gap-3 bg-surface-container p-4 rounded-2xl border border-outline-variant/10 focus-within:border-primary/50 transition-colors">
                    <span class="material-symbols-outlined text-primary">link</span>
                    <select 
                      id="paymentLink"
                      formControlName="paymentLink"
                      class="bg-transparent border-none focus:ring-0 text-sm font-medium w-full text-on-surface appearance-none"
                      (change)="onLinkChange($event)"
                    >
                      <option value="" class="bg-surface-container-high text-on-surface">Nenhum vínculo</option>
                      <optgroup label="Contas Mensais" class="bg-surface-container-high text-primary font-bold">
                        @for (bill of financialService.recurringBills(); track bill.id) {
                          <option [value]="'bill:' + bill.id" class="bg-surface-container-high text-on-surface" [disabled]="bill.status === 'paid'">
                            {{ bill.name }} ({{ bill.amount | currency:'BRL' }}) {{ bill.status === 'paid' ? '• PAGO' : '' }}
                          </option>
                        }
                      </optgroup>
                      <optgroup label="Contas a Prazo" class="bg-surface-container-high text-primary font-bold">
                        @for (debt of financialService.debts(); track debt.id) {
                          <option [value]="'debt:' + debt.id" class="bg-surface-container-high text-on-surface">
                            {{ debt.name }} ({{ debt.monthlyPayment | currency:'BRL' }}/mês)
                          </option>
                        }
                      </optgroup>
                    </select>
                  </div>
                  <p class="text-[10px] text-on-surface-variant/60 italic ml-1">Ao vincular, a conta será marcada como paga automaticamente.</p>
                </div>
              }

              @if (type() === 'income') {
                <!-- Income Allocation -->
                <div class="space-y-4 p-6 bg-surface-container/50 rounded-2xl border border-outline-variant/5">
                  <p class="block text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Destino da Renda</p>
                  <div class="grid grid-cols-3 gap-4">
                    <button 
                      type="button"
                      (click)="transactionForm.patchValue({allocation: 'monthly'})"
                      [class.border-primary]="transactionForm.get('allocation')?.value === 'monthly'"
                      [class.bg-primary/5]="transactionForm.get('allocation')?.value === 'monthly'"
                      class="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant/10 hover:bg-surface-container transition-all"
                    >
                      <span class="material-symbols-outlined text-primary">account_balance</span>
                      <span class="text-[10px] font-bold">Renda Mensal</span>
                    </button>
                    <button 
                      type="button"
                      (click)="transactionForm.patchValue({allocation: 'goal'})"
                      [class.border-primary]="transactionForm.get('allocation')?.value === 'goal'"
                      [class.bg-primary/5]="transactionForm.get('allocation')?.value === 'goal'"
                      class="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant/10 hover:bg-surface-container transition-all"
                    >
                      <span class="material-symbols-outlined text-primary">target</span>
                      <span class="text-[10px] font-bold">Meus Alvos</span>
                    </button>
                    <button 
                      type="button"
                      (click)="transactionForm.patchValue({allocation: 'emergency'})"
                      [class.border-primary]="transactionForm.get('allocation')?.value === 'emergency'"
                      [class.bg-primary/5]="transactionForm.get('allocation')?.value === 'emergency'"
                      class="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant/10 hover:bg-surface-container transition-all"
                    >
                      <span class="material-symbols-outlined text-primary">health_and_safety</span>
                      <span class="text-[10px] font-bold">Reserva</span>
                    </button>
                  </div>

                  @if (transactionForm.get('allocation')?.value === 'goal') {
                    <div class="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label for="targetGoalId" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Selecione o Alvo</label>
                      <div class="flex items-center gap-3 bg-surface-container p-4 rounded-2xl border border-outline-variant/10 focus-within:border-primary/50 transition-colors">
                        <span class="material-symbols-outlined text-primary">flag</span>
                        <select 
                          id="targetGoalId"
                          formControlName="targetGoalId"
                          class="bg-transparent border-none focus:ring-0 text-sm font-medium w-full text-on-surface appearance-none"
                        >
                          <option value="" disabled selected>Escolha um alvo...</option>
                          @for (goal of financialService.goals(); track goal.id) {
                            <option [value]="goal.id">{{ goal.title }}</option>
                          }
                        </select>
                      </div>
                    </div>
                  }
                </div>
              }

              @if (type() === 'bill_payment') {
                <!-- Bill Selection -->
                <div class="space-y-4 p-6 bg-surface-container/50 rounded-2xl border border-outline-variant/5">
                  <p class="block text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Contas Pendentes</p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <!-- Recurring Bills -->
                    @for (bill of financialService.pendingBillsAndDebts().bills; track bill.id) {
                      <button 
                        type="button"
                        (click)="selectBillToPay(bill, 'bill')"
                        [class.border-primary]="transactionForm.get('paymentLink')?.value === 'bill:' + bill.id"
                        [class.bg-primary/5]="transactionForm.get('paymentLink')?.value === 'bill:' + bill.id"
                        class="flex items-center gap-3 p-4 rounded-xl border border-outline-variant/10 hover:bg-surface-container transition-all text-left group"
                      >
                        <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <span class="material-symbols-outlined">{{ bill.icon }}</span>
                        </div>
                        <div class="flex-1 overflow-hidden">
                          <p class="text-xs font-bold truncate">{{ bill.name }}</p>
                          <p class="text-[10px] text-on-surface-variant">Conta Mensal • {{ bill.amount | currency:'BRL' }}</p>
                        </div>
                      </button>
                    }

                    <!-- Debts and Installments -->
                    @for (debt of financialService.pendingBillsAndDebts().debts; track debt.id) {
                      <button 
                        type="button"
                        (click)="selectBillToPay(debt, 'debt')"
                        [class.border-primary]="transactionForm.get('paymentLink')?.value === 'debt:' + debt.id"
                        [class.bg-primary/5]="transactionForm.get('paymentLink')?.value === 'debt:' + debt.id"
                        class="flex items-center gap-3 p-4 rounded-xl border border-outline-variant/10 hover:bg-surface-container transition-all text-left group"
                      >
                        <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                          <span class="material-symbols-outlined">{{ debt.icon }}</span>
                        </div>
                        <div class="flex-1 overflow-hidden">
                          <p class="text-xs font-bold truncate">{{ debt.name }}</p>
                          <p class="text-[10px] text-on-surface-variant">
                            {{ debt.type === 'fixed-term' ? 'Conta a Prazo' : 'Passivo' }} • {{ debt.monthlyPayment | currency:'BRL' }}
                          </p>
                        </div>
                      </button>
                    }

                    <!-- Pending Transactions -->
                    @for (t of financialService.pendingBillsAndDebts().transactions; track t.id) {
                      <button 
                        type="button"
                        (click)="selectBillToPay(t, 'transaction')"
                        [class.border-primary]="transactionForm.get('paymentLink')?.value === 'transaction:' + t.id"
                        [class.bg-primary/5]="transactionForm.get('paymentLink')?.value === 'transaction:' + t.id"
                        class="flex items-center gap-3 p-4 rounded-xl border border-outline-variant/10 hover:bg-surface-container transition-all text-left group"
                      >
                        <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-warning group-hover:scale-110 transition-transform">
                          <span class="material-symbols-outlined">{{ t.icon }}</span>
                        </div>
                        <div class="flex-1 overflow-hidden">
                          <p class="text-xs font-bold truncate">{{ t.entity }}</p>
                          <p class="text-[10px] text-on-surface-variant">Pendente • {{ t.amount | currency:'BRL' }}</p>
                        </div>
                      </button>
                    }

                    @if (!hasPendingBills()) {
                      <div class="col-span-full py-8 text-center opacity-50">
                        <span class="material-symbols-outlined text-4xl mb-2">task_alt</span>
                        <p class="text-xs font-bold">Todas as contas estão pagas!</p>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Note Field -->
              <div class="space-y-2">
                <label for="description" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Nota Narrativa</label>
                <textarea 
                  id="description"
                  formControlName="description"
                  class="w-full bg-surface-container p-4 rounded-2xl border border-outline-variant/10 focus-within:border-primary/50 transition-colors focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant/40 resize-none" 
                  placeholder="Contexto para este movimento financeiro..." 
                  rows="3"
                ></textarea>
              </div>

              <div class="flex items-center gap-4 pt-4">
                <button 
                  type="submit"
                  [disabled]="transactionForm.invalid"
                  [class.opacity-50]="transactionForm.invalid"
                  [class.cursor-not-allowed]="transactionForm.invalid"
                  class="flex-1 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-2xl shadow-xl shadow-primary/10 active:scale-[0.98] transition-all disabled:grayscale"
                >
                  Confirmar Transação
                </button>
                <button 
                  type="button"
                  (click)="cancel()"
                  class="px-8 py-4 rounded-2xl font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      <!-- Footer Meta -->
      <div class="flex justify-between items-center mt-8 px-6">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span class="text-[10px] font-bold text-on-surface-variant/60 uppercase">Sincronização em tempo real</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-xs text-on-surface-variant">lock</span>
            <span class="text-[10px] font-bold text-on-surface-variant/60 uppercase">Criptografia AES-256 Bits</span>
          </div>
        </div>
        <div class="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
          ID: TRX-9928-VX
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewTransaction implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  financialService = inject(FinancialService);
  showNewCategoryInput = signal(false);

  type = signal<'expense' | 'income' | 'bill_payment'>('expense');

  hasPendingBills = computed(() => {
    const { bills, debts, transactions } = this.financialService.pendingBillsAndDebts();
    return bills.length > 0 || debts.length > 0 || transactions.length > 0;
  });

  transactionForm = this.fb.group({
    amount: ['', [Validators.required]],
    date: [new Date().toISOString().split('T')[0], [Validators.required]],
    category: ['Mercado', [Validators.required]],
    entity: ['', [Validators.required]],
    description: [''],
    account: ['Principal', [Validators.required]],
    allocation: ['monthly'],
    targetGoalId: [''],
    paymentLink: ['']
  });

  ngOnInit() {
    const typeParam = this.route.snapshot.queryParamMap.get('type');
    if (typeParam === 'income') {
      this.setType('income');
    } else if (typeParam === 'expense') {
      this.setType('expense');
    }
  }

  onAmountInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    
    if (value === '') {
      this.transactionForm.get('amount')?.setValue('', { emitEvent: false });
      return;
    }

    const numberValue = parseInt(value, 10) / 100;
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numberValue);

    input.value = formatted;
    this.transactionForm.get('amount')?.setValue(formatted, { emitEvent: false });
  }

  setType(type: 'expense' | 'income' | 'bill_payment') {
    this.type.set(type);
    if (type === 'income') {
      this.transactionForm.patchValue({ category: 'Renda', paymentLink: '' });
    } else if (type === 'bill_payment') {
      this.transactionForm.patchValue({ category: 'Moradia', paymentLink: '' });
    } else {
      this.transactionForm.patchValue({ category: 'Mercado', paymentLink: '' });
    }
  }

  selectBillToPay(item: RecurringBill | Debt | Transaction, type: 'bill' | 'debt' | 'transaction') {
    let amount = 0;
    let category = 'Outros';
    let entity = '';

    if (type === 'bill') {
      const bill = item as RecurringBill;
      amount = bill.amount;
      category = bill.category;
      entity = bill.name;
    } else if (type === 'debt') {
      const debt = item as Debt;
      amount = debt.monthlyPayment;
      category = 'Dívidas';
      entity = debt.name;
    } else if (type === 'transaction') {
      const trans = item as Transaction;
      amount = Math.abs(trans.amount);
      category = trans.category;
      entity = trans.entity;
    }

    this.transactionForm.patchValue({
      paymentLink: type + ':' + item.id,
      amount: new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(amount),
      entity: entity,
      category: category
    });
  }

  onCategoryChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    if (select.value === 'NEW_CATEGORY') {
      this.showNewCategoryInput.set(true);
    } else {
      this.showNewCategoryInput.set(false);
    }
  }

  addNewCategory(name: string) {
    if (!name.trim()) return;
    this.financialService.addCategory(name.trim());
    this.transactionForm.patchValue({ category: name.trim() });
    this.showNewCategoryInput.set(false);
  }

  onLinkChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    if (!value) return;

    const [type, id] = value.split(':');
    if (type === 'bill') {
      const bill = this.financialService.recurringBills().find(b => b.id === id);
      if (bill) {
        this.transactionForm.patchValue({
          entity: bill.name,
          category: bill.category,
          amount: new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(bill.amount)
        });
      }
    } else if (type === 'debt') {
      const debt = this.financialService.debts().find(d => d.id === id);
      if (debt) {
        this.transactionForm.patchValue({
          entity: debt.name,
          category: 'Dívidas',
          amount: new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(debt.monthlyPayment)
        });
      }
    }
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      // Robust parsing: remove everything except digits and comma, then replace comma with dot
      const rawAmount = formValue.amount!.replace(/[^\d,]/g, '').replace(',', '.');
      const numericAmount = parseFloat(rawAmount);

      if (isNaN(numericAmount) || numericAmount <= 0) return;

      let link: { type: 'bill' | 'debt' | 'transaction', id: string } | undefined;
      if (formValue.paymentLink) {
        const [lType, lId] = formValue.paymentLink.split(':');
        link = { type: lType as 'bill' | 'debt' | 'transaction', id: lId };
      }

      const [year, month, day] = formValue.date!.split('-').map(Number);
      const date = new Date(year, month - 1, day);

      // Add the transaction
      this.financialService.addTransaction({
        date: date,
        entity: formValue.entity!,
        description: formValue.description || '',
        category: formValue.category!,
        account: formValue.account!,
        amount: this.type() === 'income' ? numericAmount : -numericAmount,
        status: 'completed',
        type: this.type() === 'income' ? 'income' : 'expense',
        icon: this.getIconForCategory(formValue.category!)
      }, link);

      // If it's income and allocated to a goal, update the goal
      if (this.type() === 'income' && formValue.allocation === 'goal' && formValue.targetGoalId) {
        this.financialService.contributeToGoal(formValue.targetGoalId, numericAmount);
      }

      // If it's income and allocated to emergency fund
      if (this.type() === 'income' && formValue.allocation === 'emergency') {
        this.financialService.addToEmergencyFund(numericAmount);
      }

      this.router.navigate(['/transactions']);
    }
  }

  cancel() {
    this.router.navigate(['/transactions']);
  }

  private getIconForCategory(category: string): string {
    switch (category) {
      case 'Mercado': return 'shopping_cart';
      case 'Lazer': return 'movie';
      case 'Transporte': return 'car_rental';
      case 'Renda': return 'work';
      case 'Renda Extra': return 'add_card';
      default: return 'payments';
    }
  }
}
