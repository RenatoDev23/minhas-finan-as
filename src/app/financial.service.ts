import { Injectable, signal, computed, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

export interface Transaction {
  id: string;
  date: Date;
  entity: string;
  description: string;
  category: string;
  account: string;
  amount: number;
  status: 'completed' | 'pending';
  type: 'income' | 'expense';
  icon: string;
}

export interface Debt {
  id: string;
  name: string;
  apr: number;
  balance: number;
  paidPercentage: number;
  monthlyPayment: number;
  projectedZeroMonths: number;
  icon: string;
  status: 'active' | 'paused' | 'on-track';
  type: 'debt' | 'fixed-term'; // Added type to distinguish
  totalInstallments?: number;
  paidInstallments?: number;
  lastPaidMonth?: number; // Month index (0-11)
}

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  dueDate: number; // Day of month
  category: string;
  icon: string;
  status: 'paid' | 'pending';
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  icon: string;
  completed: boolean;
  accountId?: string;
}

export interface CustomReport {
  id: string;
  name: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinancialService {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  
  transactions = signal<Transaction[]>([]);
  searchQuery = signal('');
  categories = signal<string[]>(['Moradia', 'Utilidades', 'Saúde', 'Educação', 'Alimentação', 'Transporte', 'Entretenimento', 'Viagem', 'Tecnologia', 'Renda Extra', 'Outros']);
  accounts = signal<string[]>(['Pessoal', 'Fotografia', 'Principal']);
  debts = signal<Debt[]>([]);
  recurringBills = signal<RecurringBill[]>([]);
  goals = signal<Goal[]>([]);
  photoGoals = signal<Goal[]>([]);
  customGoals = signal<Goal[]>([]);
  customReports = signal<CustomReport[]>([]);
  photoReportHidden = signal(false);
  emergencyFund = signal(0);
  emergencyFundTarget = signal(0);
  userName = signal('Usuário');
  userBirthDate = signal('');
  birthdayCelebratedToday = signal(false);

  // Transações principais (exclui Fotografia e relatórios customizados para manter isolamento)
  mainTransactions = computed(() => {
    const customAccountNames = this.customReports().map(r => r.name);
    return this.transactions().filter(t => t.account !== 'Fotografia' && !customAccountNames.includes(t.account));
  });

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadUserData(user.householdId);
      } else {
        this.resetData();
      }
    });

    // Persist last status for theme consistency on login screen
    effect(() => {
      const status = this.liquidityStatus();
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('atlas_last_status', status);
      }
    });
  }

  private getUserStorageKey(householdId: string) {
    return `atlas_data_h_${householdId}`;
  }

  private loadUserData(householdId: string) {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem(this.getUserStorageKey(householdId));
      const authUser = this.authService.currentUser();
      
      if (data) {
        const parsed = JSON.parse(data);
        const transactions = (parsed.transactions || []).map((t: Transaction) => ({
          ...t,
          date: new Date(t.date as unknown as string)
        }));
        this.transactions.set(transactions);
        this.debts.set(parsed.debts || []);
        this.recurringBills.set(parsed.recurringBills || []);
        this.goals.set(parsed.goals || []);
        this.photoGoals.set(parsed.photoGoals || []);
        this.customGoals.set(parsed.customGoals || []);
        this.customReports.set(parsed.customReports || []);
        this.photoReportHidden.set(parsed.photoReportHidden || false);
        this.emergencyFund.set(parsed.emergencyFund || 0);
        this.emergencyFundTarget.set(parsed.emergencyFundTarget || 0);
        this.categories.set(parsed.categories || ['Moradia', 'Utilidades', 'Saúde', 'Educação', 'Alimentação', 'Transporte', 'Entretenimento', 'Viagem', 'Tecnologia', 'Renda Extra', 'Outros']);
        this.accounts.set(parsed.accounts || ['Pessoal', 'Fotografia', 'Principal']);
        // Ensure new accounts are added if they don't exist in saved data
        this.accounts.update(accs => {
          const required = ['Pessoal', 'Fotografia', 'Principal'];
          const missing = required.filter(r => !accs.includes(r));
          return missing.length > 0 ? [...accs, ...missing] : accs;
        });
        this.userName.set(parsed.userName || authUser?.name || 'Usuário');
        this.userBirthDate.set(parsed.userBirthDate || '');
      } else {
        this.resetData();
        if (authUser) {
          this.userName.set(authUser.name);
        }
      }
    }
  }

  private saveUserData() {
    const user = this.authService.currentUser();
    if (user && isPlatformBrowser(this.platformId)) {
      const data = {
        transactions: this.transactions(),
        debts: this.debts(),
        recurringBills: this.recurringBills(),
        goals: this.goals(),
        photoGoals: this.photoGoals(),
        customGoals: this.customGoals(),
        customReports: this.customReports(),
        photoReportHidden: this.photoReportHidden(),
        emergencyFund: this.emergencyFund(),
        emergencyFundTarget: this.emergencyFundTarget(),
        categories: this.categories(),
        accounts: this.accounts(),
        userName: this.userName(),
        userBirthDate: this.userBirthDate()
      };
      localStorage.setItem(this.getUserStorageKey(user.householdId), JSON.stringify(data));
    }
  }

  clearAllData() {
    this.resetData();
    this.saveUserData();
  }

  private resetData() {
    this.transactions.set([]);
    this.debts.set([]);
    this.recurringBills.set([]);
    this.goals.set([]);
    this.photoGoals.set([]);
    this.customGoals.set([]);
    this.customReports.set([]);
    this.photoReportHidden.set(false);
    this.emergencyFund.set(0);
    this.emergencyFundTarget.set(0);
    this.categories.set(['Moradia', 'Utilidades', 'Saúde', 'Educação', 'Alimentação', 'Transporte', 'Entretenimento', 'Viagem', 'Tecnologia', 'Renda Extra', 'Outros']);
    this.userName.set('Usuário');
    this.userBirthDate.set('');
  }

  addPhotoGoal(goal: Omit<Goal, 'id' | 'completed' | 'currentAmount'>) {
    const newGoal: Goal = {
      ...goal,
      id: Math.random().toString(36).substring(2, 9),
      currentAmount: 0,
      completed: false,
      accountId: 'photo'
    };
    this.photoGoals.update(goals => [newGoal, ...goals]);
    this.saveUserData();
  }

  addCustomGoal(goal: Omit<Goal, 'id' | 'completed' | 'currentAmount'>) {
    const newGoal: Goal = {
      ...goal,
      id: Math.random().toString(36).substring(2, 9),
      currentAmount: 0,
      completed: false
    };
    this.customGoals.update(goals => [newGoal, ...goals]);
    this.saveUserData();
  }

  deleteCustomGoal(id: string) {
    this.customGoals.update(goals => goals.filter(g => g.id !== id));
    this.saveUserData();
  }

  contributeToCustomGoal(goalId: string, amount: number) {
    this.customGoals.update(goals => 
      goals.map(g => {
        if (g.id === goalId) {
          const newAmount = g.currentAmount + amount;
          return { 
            ...g, 
            currentAmount: newAmount,
            completed: newAmount >= g.targetAmount
          };
        }
        return g;
      })
    );
    this.saveUserData();
  }

  addCustomReport(name: string, icon: string) {
    const id = Math.random().toString(36).substring(2, 9);
    const newReport: CustomReport = { id, name, icon };
    this.customReports.update(reports => [...reports, newReport]);
    this.accounts.update(accs => [...accs, name]);
    this.saveUserData();
    return id;
  }

  deleteCustomReport(id: string) {
    const report = this.customReports().find(r => r.id === id);
    if (report) {
      this.customReports.update(reports => reports.filter(r => r.id !== id));
      this.accounts.update(accs => accs.filter(a => a !== report.name));
      this.transactions.update(txs => txs.filter(t => t.account !== report.name));
      this.customGoals.update(goals => goals.filter(g => g.accountId !== id));
      this.saveUserData();
    }
  }

  hidePhotoReport() {
    this.photoReportHidden.set(true);
    this.saveUserData();
  }

  deletePhotoGoal(id: string) {
    this.photoGoals.update(goals => goals.filter(g => g.id !== id));
    this.saveUserData();
  }

  contributeToPhotoGoal(goalId: string, amount: number) {
    this.photoGoals.update(goals => 
      goals.map(g => {
        if (g.id === goalId) {
          const newAmount = g.currentAmount + amount;
          return { 
            ...g, 
            currentAmount: newAmount,
            completed: newAmount >= g.targetAmount
          };
        }
        return g;
      })
    );
    this.saveUserData();
  }

  addCategory(name: string) {
    if (name && !this.categories().includes(name)) {
      this.categories.update(c => [...c, name]);
      this.saveUserData();
    }
  }

  getTransactionsByAccount(account: string) {
    return computed(() => this.transactions().filter(t => t.account === account));
  }

  transfer(fromAccount: string, toAccount: string, amount: number) {
    if (amount <= 0) return;
    
    const date = new Date();
    const id1 = Math.random().toString(36).substring(2, 9);
    const id2 = Math.random().toString(36).substring(2, 9);

    const withdrawal: Transaction = {
      id: id1,
      date,
      entity: `Transferência para ${toAccount}`,
      description: `Transferência de fundos`,
      category: 'Transferência',
      account: fromAccount,
      amount: -amount,
      status: 'completed',
      type: 'expense',
      icon: 'sync_alt'
    };

    const deposit: Transaction = {
      id: id2,
      date,
      entity: `Transferência de ${fromAccount}`,
      description: `Recebimento de fundos`,
      category: 'Transferência',
      account: toAccount,
      amount: amount,
      status: 'completed',
      type: 'income',
      icon: 'sync_alt'
    };

    this.transactions.update(txs => [withdrawal, deposit, ...txs]);
    this.saveUserData();
  }

  getAccountSummary(account: string) {
    return computed(() => {
      const transactions = this.transactions().filter(t => t.account === account);
      const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      const expenses = Math.abs(transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + (Number(t.amount) || 0), 0));
      return {
        income,
        expenses,
        net: income - expenses,
        balance: transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
      };
    });
  }

  filteredTransactions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const base = this.mainTransactions();
    if (!query) return base;
    
    return base.filter(t => 
      t.entity.toLowerCase().includes(query) || 
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );
  });

  filteredIncome = computed(() => {
    return this.filteredTransactions()
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + Number(t.amount), 0);
  });

  filteredExpenses = computed(() => {
    return Math.abs(this.filteredTransactions()
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + Number(t.amount), 0));
  });

  filteredNet = computed(() => {
    return this.filteredIncome() - this.filteredExpenses();
  });

  sortedBills = computed(() => {
    return [...this.recurringBills()].sort((a, b) => a.dueDate - b.dueDate);
  });

  updateProfile(name: string, birthDate: string) {
    this.userName.set(name);
    this.userBirthDate.set(birthDate);
    
    const user = this.authService.currentUser();
    if (user) {
      this.authService.updateUser({ ...user, name });
    }
    
    this.saveUserData();
  }

  isBirthday = computed(() => {
    const today = new Date();
    const birthDateStr = this.userBirthDate();
    if (!birthDateStr) return false;
    
    // Parse YYYY-MM-DD manually to avoid time zone shifts
    const parts = birthDateStr.split('-');
    if (parts.length !== 3) return false;
    
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const day = parseInt(parts[2], 10);
    
    return today.getDate() === day && today.getMonth() === month;
  });

  checkBirthdayCelebration() {
    if (!this.isBirthday()) return false;
    
    if (isPlatformBrowser(this.platformId)) {
      const lastCelebration = localStorage.getItem('atlas_last_birthday_celebration');
      const todayStr = new Date().toISOString().split('T')[0];
      
      const celebrated = lastCelebration === todayStr;
      this.birthdayCelebratedToday.set(celebrated);
      return celebrated;
    }
    return false;
  }

  markBirthdayAsCelebrated() {
    if (isPlatformBrowser(this.platformId)) {
      const todayStr = new Date().toISOString().split('T')[0];
      localStorage.setItem('atlas_last_birthday_celebration', todayStr);
      this.birthdayCelebratedToday.set(true);
    }
  }

  totalBalance = computed(() => {
    const transactions = this.mainTransactions();
    const transactionTotal = transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    return Math.round(transactionTotal * 100) / 100;
  });

  consolidatedBalance = computed(() => {
    const transactionTotal = this.transactions().reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const fund = Number(this.emergencyFund()) || 0;
    const total = transactionTotal + fund;
    return Math.round(total * 100) / 100;
  });

  transactionBalance = computed(() => {
    return this.transactions().reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  });

  monthlyIncome = computed(() => {
    const now = new Date();
    return this.mainTransactions()
      .filter(t => t.type === 'income' && 
        t.date.getMonth() === now.getMonth() && 
        t.date.getFullYear() === now.getFullYear())
      .reduce((acc, t) => acc + Number(t.amount), 0);
  });

  monthlyExtraIncome = computed(() => {
    const now = new Date();
    return this.mainTransactions()
      .filter(t => t.type === 'income' && 
        t.category === 'Renda Extra' &&
        t.date.getMonth() === now.getMonth() && 
        t.date.getFullYear() === now.getFullYear())
      .reduce((acc, t) => acc + Number(t.amount), 0);
  });

  monthlyExpenses = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const transactionExpenses = Math.abs(this.mainTransactions()
      .filter(t => t.type === 'expense' &&
        t.date.getMonth() === currentMonth && 
        t.date.getFullYear() === currentYear)
      .reduce((acc, t) => acc + Number(t.amount), 0));
    
    // Add pending bills (not yet paid)
    const pendingBills = this.recurringBills()
      .filter(b => b.status === 'pending')
      .reduce((acc, b) => acc + b.amount, 0);
      
    // Add pending debt payments (not yet paid this month)
    const pendingDebts = this.debts()
      .filter(d => d.status !== 'paused' && d.lastPaidMonth !== currentMonth)
      .reduce((acc, d) => acc + d.monthlyPayment, 0);
      
    return transactionExpenses + pendingBills + pendingDebts;
  });

  amountToPayThisMonth = computed(() => {
    const currentMonth = new Date().getMonth();
    const pendingTransactions = Math.abs(this.mainTransactions()
      .filter(t => t.type === 'expense' && t.status === 'pending')
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0));

    const pendingBills = this.recurringBills()
      .filter(b => b.status === 'pending')
      .reduce((acc, b) => acc + b.amount, 0);
      
    const pendingDebts = this.debts()
      .filter(d => d.status !== 'paused' && d.lastPaidMonth !== currentMonth)
      .reduce((acc, d) => acc + d.monthlyPayment, 0);
      
    return pendingTransactions + pendingBills + pendingDebts;
  });

  totalFixedCosts = computed(() => {
    const bills = this.recurringBills().reduce((acc, b) => acc + b.amount, 0);
    const debts = this.debts()
      .filter(d => d.status !== 'paused')
      .reduce((acc, d) => acc + d.monthlyPayment, 0);
    return bills + debts;
  });

  netDifference = computed(() => {
    return this.monthlyIncome() - this.monthlyExpenses();
  });

  monthlyPerformance = computed(() => {
    const income = this.monthlyIncome();
    const net = this.netDifference();
    
    if (income <= 0) {
      return net < 0 ? -100 : 0;
    }
    
    // Savings rate: how much of your income is left (positive) or how much you are overspending (negative)
    return Math.round((net / income) * 100);
  });

  incomeCommitmentPercentage = computed(() => {
    const income = this.monthlyIncome();
    
    // transactionExpenses are already paid variable costs
    // We should only count expenses that are NOT linked to bills or debts to avoid double counting
    // However, since we don't have a robust link in the transaction object, 
    // we use a different approach: Commitment = (Paid Transactions) + (Pending Bills) + (Pending Debt Payments)
    
    const now = new Date();
    const paidExpenses = Math.abs(this.mainTransactions()
      .filter(t => t.type === 'expense' &&
        t.date.getMonth() === now.getMonth() && 
        t.date.getFullYear() === now.getFullYear())
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0));
      
    const pendingBills = this.recurringBills()
      .filter(b => b.status === 'pending')
      .reduce((acc, b) => acc + b.amount, 0);
      
    const pendingDebts = this.debts()
      .filter(d => d.status !== 'paused')
      // This is a simplification: we assume the monthly payment is pending if not paid this month
      // In a real app, we'd track payment status per month for debts too
      .reduce((acc, d) => acc + d.monthlyPayment, 0);
      
    const totalCommitment = paidExpenses + pendingBills + pendingDebts;
    
    if (income <= 0) {
      return totalCommitment > 0 ? 100 : 0;
    }
    
    return Math.round((totalCommitment / income) * 100);
  });

  incomeToLiquidityRatio = computed(() => {
    const income = this.monthlyIncome();
    const liquidity = this.totalBalance();
    if (liquidity <= 0) return 0;
    return Math.round((income / liquidity) * 100);
  });

  debtToIncomeRatio = computed(() => {
    const income = this.monthlyIncome();
    if (income === 0) return 0;
    const totalMonthlyDebt = this.debts()
      .filter(d => d.status !== 'paused')
      .reduce((acc, d) => acc + d.monthlyPayment, 0);
    return (totalMonthlyDebt / income) * 100;
  });

  debtFreeDate = computed(() => {
    const activeDebts = this.debts().filter(d => d.status !== 'paused');
    if (activeDebts.length === 0) return 'Nenhuma dívida ativa';
    
    const maxMonths = Math.max(...activeDebts.map(d => d.projectedZeroMonths));
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + maxMonths);
    
    return targetDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  });

  updateEmergencyTarget(amount: number) {
    this.emergencyFundTarget.set(amount);
    this.saveUserData();
  }

  addToEmergencyFund(amount: number) {
    this.emergencyFund.update(current => current + amount);
    this.saveUserData();
  }

  removeFromEmergencyFund(amount: number) {
    this.emergencyFund.update(current => Math.max(0, current - amount));
    this.saveUserData();
  }

  liquidityStatus = computed(() => {
    const user = this.authService.currentUser();
    if (!user) {
      if (isPlatformBrowser(this.platformId)) {
        return localStorage.getItem('atlas_last_status') || 'positive';
      }
      return 'positive';
    }

    const balance = Number(this.totalBalance());
    const commitment = Number(this.incomeCommitmentPercentage()) || 0;
    
    // Status Crítico (Vermelho)
    // 1. Saldo zerado ou negativo
    // 2. Comprometimento de renda acima de 90%
    if (isNaN(balance) || balance <= 0.001 || commitment >= 90) {
      return 'negative';
    } 
    
    // Status de Alerta (Laranja)
    // 1. Comprometimento de renda acima de 70%
    else if (commitment > 70) {
      return 'warning';
    }
    
    return 'positive';
  });

  addDebt(debt: Omit<Debt, 'id'>) {
    const newDebt: Debt = {
      ...debt,
      id: Math.random().toString(36).substring(2, 9)
    };
    this.debts.update(d => [newDebt, ...d]);
    this.saveUserData();
  }

  addRecurringBill(bill: Omit<RecurringBill, 'id' | 'status'>) {
    const newBill: RecurringBill = {
      ...bill,
      id: Math.random().toString(36).substring(2, 9),
      status: 'pending'
    };
    this.recurringBills.update(b => [newBill, ...b]);
    this.saveUserData();
  }

  toggleBillStatus(id: string) {
    this.recurringBills.update(bills => 
      bills.map(b => b.id === id ? { ...b, status: b.status === 'paid' ? 'pending' : 'paid' } : b)
    );
    this.saveUserData();
  }

  deleteTransaction(id: string) {
    this.transactions.update(t => t.filter(item => item.id !== id));
    this.saveUserData();
  }

  deleteRecurringBill(id: string) {
    this.recurringBills.update(bills => bills.filter(b => b.id !== id));
    this.saveUserData();
  }

  updateRecurringBill(id: string, updates: Partial<RecurringBill>) {
    this.recurringBills.update(bills => 
      bills.map(b => b.id === id ? { ...b, ...updates } : b)
    );
    this.saveUserData();
  }

  deleteDebt(id: string) {
    this.debts.update(debts => debts.filter(d => d.id !== id));
    this.saveUserData();
  }

  updateDebt(id: string, updates: Partial<Debt>) {
    this.debts.update(debts => 
      debts.map(d => d.id === id ? { ...d, ...updates } : d)
    );
    this.saveUserData();
  }

  addTransaction(transaction: Omit<Transaction, 'id'>, link?: { type: 'bill' | 'debt' | 'transaction', id: string }) {
    if (link && link.type === 'transaction') {
      this.transactions.update(ts => ts.map(t => 
        t.id === link.id ? { ...t, status: 'completed' as const } : t
      ));
      this.saveUserData();
      return;
    }

    const rawAmount = Math.abs(Number(transaction.amount));
    const finalAmount = transaction.type === 'expense' ? -rawAmount : rawAmount;
    
    const newTransaction: Transaction = {
      ...transaction,
      amount: finalAmount,
      id: Math.random().toString(36).substring(2, 9)
    };
    this.transactions.update(t => [newTransaction, ...t]);
    this.saveUserData();

    if (link) {
      if (link.type === 'bill') {
        this.toggleBillStatus(link.id);
      } else if (link.type === 'debt') {
        this.debts.update(debts => debts.map(d => {
          if (d.id === link.id) {
            const newPaid = (d.paidInstallments || 0) + 1;
            const total = d.totalInstallments || 1;
            return {
              ...d,
              paidInstallments: newPaid,
              paidPercentage: Math.round((newPaid / total) * 100),
              balance: Math.max(0, d.balance - d.monthlyPayment),
              projectedZeroMonths: Math.max(0, total - newPaid),
              lastPaidMonth: new Date().getMonth()
            };
          }
          return d;
        }));
      }
    }
    this.saveUserData();
  }

  addGoal(goal: Omit<Goal, 'id' | 'completed'>) {
    const newGoal: Goal = {
      ...goal,
      id: Math.random().toString(36).substring(2, 9),
      completed: false
    };
    this.goals.update(g => [newGoal, ...g]);
    this.saveUserData();
  }

  updateGoal(id: string, updates: Partial<Goal>) {
    this.goals.update(goals => 
      goals.map(g => g.id === id ? { ...g, ...updates } : g)
    );
    this.saveUserData();
  }

  deleteGoal(id: string) {
    this.goals.update(goals => goals.filter(g => g.id !== id));
    this.saveUserData();
  }

  toggleGoalCompletion(id: string) {
    this.goals.update(goals => 
      goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g)
    );
    this.saveUserData();
  }

  upcomingAlerts = computed(() => {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    const expenses = this.transactions()
      .filter(t => t.type === 'expense' && t.status === 'pending' && new Date(t.date) <= threeDaysFromNow)
      .map(t => ({
        type: 'expense' as const,
        title: `Vencimento Próximo: ${t.entity}`,
        message: `Sua despesa de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(t.amount))} vence em breve (${new Date(t.date).toLocaleDateString('pt-BR')}).`,
        icon: 'warning'
      }));

    const goals = this.goals()
      .filter(g => !g.completed && (g.currentAmount / g.targetAmount) >= 0.8)
      .map(g => {
        const remaining = g.targetAmount - g.currentAmount;
        return {
          type: 'goal' as const,
          title: `Alvo Quase Lá: ${g.title}`,
          message: `Faltam apenas ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remaining)} para você conquistar este objetivo! "A persistência é o caminho do êxito."`,
          icon: 'stars'
        };
      });

    const debtAlert = this.debtToIncomeRatio() >= 80 ? [{
      type: 'warning' as const,
      title: 'Limite de Endividamento Atingido',
      message: 'Suas parcelas mensais atingiram 80% da sua renda. Por segurança financeira, você não deve assumir novas contas a prazo no momento.',
      icon: 'error'
    }] : [];

    return [...expenses, ...goals, ...debtAlert];
  });

  financialSummary = computed(() => {
    return {
      balance: this.totalBalance(),
      income: this.monthlyIncome(),
      expenses: this.monthlyExpenses(),
      net: this.netDifference(),
      totalDebt: this.debts().reduce((acc, d) => acc + d.balance, 0)
    };
  });

  topSpendingCategories = computed(() => {
    const expenses = this.mainTransactions().filter(t => t.type === 'expense');
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
    });

    return Object.entries(categoryTotals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  });

  monthlyHistory = computed(() => {
    const transactions = this.mainTransactions();
    const history: { month: string, income: number, expenses: number }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short' });
      
      const monthTxs = transactions.filter(t => 
        t.date.getMonth() === d.getMonth() && 
        t.date.getFullYear() === d.getFullYear()
      );
      
      const income = monthTxs
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Number(t.amount), 0);
        
      const expenses = Math.abs(monthTxs
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount), 0));
        
      history.push({ month: monthLabel, income, expenses });
    }
    
    return history;
  });

  savingsTips = computed(() => {
    const tips = [];
    const topCategory = this.topSpendingCategories()[0];
    const dti = this.debtToIncomeRatio();
    const net = this.netDifference();

    if (topCategory) {
      tips.push({
        title: `Reduza em ${topCategory.name}`,
        message: `Você gastou ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(topCategory.total)} em ${topCategory.name} este mês. Tente reduzir 10% aqui para economizar.`,
        icon: 'trending_down'
      });
    }

    if (dti > 50) {
      tips.push({
        title: 'Atenção às Dívidas',
        message: 'Suas dívidas estão consumindo mais de 50% da sua renda. Priorize quitar o cartão de crédito primeiro.',
        icon: 'priority_high'
      });
    }

    if (net < 500) {
      tips.push({
        title: 'Margem de Segurança',
        message: 'Seu excedente mensal está baixo. Considere revisar assinaturas e gastos recorrentes não essenciais.',
        icon: 'shield'
      });
    }

    if (tips.length === 0) {
      tips.push({
        title: 'Continue Assim!',
        message: 'Suas finanças parecem saudáveis. Considere aumentar seu aporte em investimentos de longo prazo.',
        icon: 'auto_awesome'
      });
    }

    return tips;
  });

  pieChartData = computed(() => {
    const income = this.monthlyIncome();
    const expenses = this.monthlyExpenses();
    const toPay = this.amountToPayThisMonth();
    const total = income + expenses + toPay;
    
    if (total === 0) return [];
    
    const incomePercent = (income / total) * 100;
    const expensesPercent = (expenses / total) * 100;
    const toPayPercent = (toPay / total) * 100;
    
    return [
      { name: 'Renda', value: income, color: 'var(--color-primary)', percent: incomePercent, offset: 0 },
      { name: 'Despesas', value: expenses, color: 'var(--color-error)', percent: expensesPercent, offset: -incomePercent },
      { name: 'A Pagar', value: toPay, color: 'var(--color-secondary)', percent: toPayPercent, offset: -(incomePercent + expensesPercent) }
    ];
  });

  pendingBillsAndDebts = computed(() => {
    const currentMonth = new Date().getMonth();
    
    const bills = this.recurringBills().filter(b => b.status === 'pending');
    const debts = this.debts().filter(d => 
      d.status !== 'paused' && 
      d.balance > 0 &&
      d.lastPaidMonth !== currentMonth
    );
    
    const transactions = this.mainTransactions().filter(t => t.type === 'expense' && t.status === 'pending');
    
    return { bills, debts, transactions };
  });

  contributeToGoal(goalId: string, amount: number) {
    this.goals.update(goals => 
      goals.map(g => {
        if (g.id === goalId) {
          const newAmount = g.currentAmount + amount;
          return { 
            ...g, 
            currentAmount: newAmount,
            completed: newAmount >= g.targetAmount
          };
        }
        return g;
      })
    );
    this.saveUserData();
  }
}
