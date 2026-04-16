import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialService, RecurringBill, Debt } from './financial.service';
import { AuthService } from './auth.service';
import { GoogleGenAI } from "@google/genai";

@Component({
  selector: 'app-strategy',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, FormsModule, DatePipe],
  template: `
    <div class="max-w-7xl mx-auto space-y-10">
      <!-- Hero Strategy Header -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="col-span-1 lg:col-span-8 space-y-4">
          <h2 class="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">Seu Plano de <span class="text-primary">Gestão Patrimonial</span></h2>
          <p class="text-on-surface-variant text-base lg:text-lg max-w-2xl leading-relaxed">Redução sistemática de passivos e preservação de capital em um ambiente de alta precisão. Você está atualmente com um desempenho 8% melhor do que o cronograma projetado.</p>
          
          <div class="pt-4 flex flex-wrap gap-3">
            <button 
              (click)="showPurchaseSim.set(!showPurchaseSim()); showBillOptimizer.set(false)"
              class="flex-1 lg:flex-none flex items-center gap-2 px-6 py-3 bg-secondary/10 text-secondary rounded-2xl font-bold text-sm hover:bg-secondary/20 transition-all shadow-lg shadow-secondary/5"
            >
              <span class="material-symbols-outlined">{{ showPurchaseSim() ? 'close' : 'analytics' }}</span>
              Simulador de Compra IA
            </button>
            <button 
              (click)="showBillOptimizer.set(!showBillOptimizer()); showPurchaseSim.set(false)"
              class="flex-1 lg:flex-none flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-2xl font-bold text-sm hover:bg-primary/20 transition-all shadow-lg shadow-primary/5"
            >
              <span class="material-symbols-outlined">{{ showBillOptimizer() ? 'close' : 'auto_fix_high' }}</span>
              Otimizador de Contas IA
            </button>
          </div>
        </div>
        
        <!-- Emergency Fund Card - High Visibility -->
        <div 
          [style.background-color]="emergencyColor()"
          class="col-span-1 lg:col-span-4 rounded-3xl p-6 relative overflow-hidden group transition-colors duration-700 shadow-2xl shadow-black/20"
        >
          <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
          
          <div class="flex justify-between items-start mb-4 relative z-10">
            <span class="text-white/70 font-bold tracking-widest text-xs uppercase">Reserva de Emergência</span>
            <button (click)="toggleEditing()" class="p-1 hover:bg-white/10 rounded-full transition-colors">
              <span class="material-symbols-outlined text-white text-sm">{{ isEditing() ? 'close' : 'edit' }}</span>
            </button>
          </div>

          @if (!isEditing()) {
            <div class="relative z-10">
              <div class="mb-4">
                <span class="text-4xl font-headline font-extrabold text-white block">{{ financialService.emergencyFund() | currency:'BRL':'symbol':'1.0-0' }}</span>
                <div class="flex flex-col mt-1">
                  <span class="text-white/80 text-sm font-semibold">{{ emergencyPercentage() | number:'1.0-0' }}% da Meta</span>
                  <span class="text-white/50 text-[10px] font-bold uppercase tracking-tighter">
                    @if (financialService.emergencyFundTarget() > 0) {
                      Meta Definida: {{ financialService.emergencyFundTarget() | currency:'BRL':'symbol':'1.0-0' }}
                    } @else {
                      Meta Ideal (6x): {{ (financialService.monthlyExpenses() * 6) | currency:'BRL':'symbol':'1.0-0' }}
                    }
                  </span>
                </div>
              </div>
              <div class="w-full h-2 bg-black/20 rounded-full mb-4">
                <div 
                  class="h-full bg-white transition-all duration-1000 ease-out" 
                  [style.width.%]="emergencyBarWidth()"
                ></div>
              </div>
              
              <div class="flex flex-col gap-2 mt-4">
                <div class="flex gap-2">
                  <button 
                    (click)="addQuickAmount(100)"
                    class="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-[10px] font-bold transition-colors border border-white/10 flex items-center justify-center gap-1"
                  >
                    <span class="material-symbols-outlined text-xs">add</span>
                    R$ 100
                  </button>
                  <button 
                    (click)="addQuickAmount(500)"
                    class="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-[10px] font-bold transition-colors border border-white/10 flex items-center justify-center gap-1"
                  >
                    <span class="material-symbols-outlined text-xs">add</span>
                    R$ 500
                  </button>
                </div>
                <div class="flex gap-2">
                  <button 
                    (click)="withdrawQuickAmount(100)"
                    class="flex-1 py-2 bg-black/20 hover:bg-black/30 rounded-xl text-white/80 text-[10px] font-bold transition-colors border border-white/5 flex items-center justify-center gap-1"
                  >
                    <span class="material-symbols-outlined text-xs">remove</span>
                    R$ 100
                  </button>
                  <button 
                    (click)="withdrawQuickAmount(500)"
                    class="flex-1 py-2 bg-black/20 hover:bg-black/30 rounded-xl text-white/80 text-[10px] font-bold transition-colors border border-white/5 flex items-center justify-center gap-1"
                  >
                    <span class="material-symbols-outlined text-xs">remove</span>
                    R$ 500
                  </button>
                </div>
              </div>
            </div>
          } @else {
            <div class="relative z-10 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <label for="emergencyTarget" class="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1 ml-1">Meta de Emergência</label>
                <input 
                  id="emergencyTarget"
                  type="text" 
                  [value]="formattedEmergencyTarget()"
                  (input)="onCurrencyInput($event, 'emergencyTarget')"
                  class="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white font-bold focus:ring-1 focus:ring-white/30 outline-none"
                />
              </div>
              <button 
                (click)="saveTarget()"
                class="w-full py-3 bg-white text-black font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
              >
                Salvar Nova Meta
              </button>
            </div>
          }
          
          <p class="text-white/60 text-[10px] font-label italic mt-4 relative z-10">"A paz de espírito é o maior ativo."</p>
        </div>
      </section>

      <!-- Purchase Simulator Section -->
      @if (showPurchaseSim()) {
        <div class="bg-surface-container-low p-6 lg:p-8 rounded-[2rem] border border-secondary/20 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div class="space-y-6">
              <div>
                <h3 class="text-2xl font-bold flex items-center gap-3">
                  <span class="material-symbols-outlined text-secondary">shopping_cart_checkout</span>
                  O que você deseja comprar?
                </h3>
                <p class="text-on-surface-variant text-sm mt-1">Nossa IA analisará sua saúde financeira completa para te dar o melhor conselho.</p>
              </div>

              <div class="space-y-4">
                <div>
                  <label for="purchaseItem" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Item / Sonho</label>
                  <input 
                    id="purchaseItem"
                    type="text" 
                    [ngModel]="purchaseItem()"
                    (ngModelChange)="purchaseItem.set($event)"
                    class="w-full bg-surface-container border border-outline-variant/20 rounded-xl p-4 text-on-surface outline-none focus:ring-1 focus:ring-secondary/50" 
                    placeholder="Ex: Novo MacBook, Viagem, Carro..."
                  />
                </div>
                <div>
                  <label for="purchasePrice" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Valor Estimado (R$)</label>
                  <input 
                    id="purchasePrice"
                    type="text" 
                    [value]="formattedPurchasePrice()"
                    (input)="onCurrencyInput($event, 'purchasePrice')"
                    class="w-full bg-surface-container border border-outline-variant/20 rounded-xl p-4 text-on-surface text-2xl font-bold outline-none focus:ring-1 focus:ring-secondary/50" 
                    placeholder="0,00"
                  />
                </div>
                <button 
                  (click)="analyzePurchase()"
                  [disabled]="loadingAnalysis() || !purchaseItem() || purchasePrice() <= 0"
                  class="w-full py-4 bg-secondary text-on-secondary font-bold rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  @if (loadingAnalysis()) {
                    <span class="material-symbols-outlined animate-spin">sync</span>
                    Analisando seu Patrimônio...
                  } @else {
                    <span class="material-symbols-outlined">psychology</span>
                    Solicitar Análise Estratégica
                  }
                </button>
              </div>
            </div>

            <div class="bg-surface-container rounded-[1.5rem] p-6 border border-outline-variant/10 min-h-[300px] flex flex-col">
              @if (analysisResult()) {
                <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div class="flex items-center gap-2 mb-4 text-secondary font-bold text-sm uppercase tracking-widest">
                    <span class="material-symbols-outlined">verified</span>
                    Parecer do Consultor Atlas
                  </div>
                  <div class="prose prose-sm prose-invert max-w-none text-on-surface-variant leading-relaxed" [innerHTML]="formatMarkdown(analysisResult() || '')"></div>
                </div>
              } @else if (loadingAnalysis()) {
                <div class="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <div class="w-16 h-16 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin"></div>
                  <p class="text-sm font-medium">Cruzando dados de saldo, dívidas e reserva...</p>
                </div>
              } @else {
                <div class="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                  <span class="material-symbols-outlined text-6xl">query_stats</span>
                  <p class="text-sm max-w-[200px]">Preencha os dados ao lado para receber sua estratégia de compra.</p>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Bill Optimizer Section -->
      @if (showBillOptimizer()) {
        <div class="bg-surface-container-low p-6 lg:p-8 rounded-[2rem] border border-primary/20 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div class="space-y-6">
              <div>
                <h3 class="text-2xl font-bold flex items-center gap-3">
                  <span class="material-symbols-outlined text-primary">auto_fix_high</span>
                  Otimizador de Gastos
                </h3>
                <p class="text-on-surface-variant text-sm mt-1">Selecione as contas que deseja reduzir ou eliminar para ver o impacto no seu futuro.</p>
              </div>

              <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                @for (bill of financialService.recurringBills(); track bill.id) {
                  <div class="flex items-center gap-4 p-4 bg-surface-container rounded-2xl border border-outline-variant/10 group hover:border-primary/30 transition-all">
                    <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <span class="material-symbols-outlined">{{ bill.icon }}</span>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-bold">{{ bill.name }}</p>
                      <p class="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Atual: {{ bill.amount | currency:'BRL' }}</p>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant">R$</span>
                        <input 
                          type="text" 
                          [value]="getOptimizedValue(bill.id)"
                          (input)="onOptimizedInput($event, bill.id)"
                          class="w-24 bg-surface-container-low border border-outline-variant/20 rounded-lg p-2 pl-8 text-xs font-bold outline-none focus:ring-1 focus:ring-primary/50"
                          placeholder="0,00"
                        />
                      </div>
                      <button 
                        (click)="resetOptimizedValue(bill.id)"
                        class="p-2 text-on-surface-variant/40 hover:text-primary transition-colors"
                        title="Resetar para valor original"
                      >
                        <span class="material-symbols-outlined text-sm">restart_alt</span>
                      </button>
                    </div>
                  </div>
                } @empty {
                  <div class="text-center py-8 opacity-50">
                    <p class="text-sm italic">Nenhuma conta recorrente cadastrada.</p>
                  </div>
                }
              </div>

              <button 
                (click)="analyzeOptimization()"
                [disabled]="loadingOptimization() || financialService.recurringBills().length === 0"
                class="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                @if (loadingOptimization()) {
                  <span class="material-symbols-outlined animate-spin">sync</span>
                  Calculando Impacto...
                } @else {
                  <span class="material-symbols-outlined">insights</span>
                  Simular Economia IA
                }
              </button>
            </div>

            <div class="bg-surface-container rounded-[1.5rem] p-6 border border-outline-variant/10 min-h-[300px] flex flex-col">
              @if (optimizationResult()) {
                <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div class="flex items-center gap-2 mb-4 text-primary font-bold text-sm uppercase tracking-widest">
                    <span class="material-symbols-outlined">auto_awesome</span>
                    Relatório de Eficiência Atlas
                  </div>
                  <div class="prose prose-sm prose-invert max-w-none text-on-surface-variant leading-relaxed" [innerHTML]="formatMarkdown(optimizationResult() || '')"></div>
                </div>
              } @else if (loadingOptimization()) {
                <div class="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <div class="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                  <p class="text-sm font-medium">Simulando novos cenários de investimento...</p>
                </div>
              } @else {
                <div class="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                  <span class="material-symbols-outlined text-6xl">account_balance_wallet</span>
                  <p class="text-sm max-w-[200px]">Ajuste os valores das suas contas ao lado para ver quanto tempo você ganha na sua liberdade financeira.</p>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Main Strategy Grid -->
      <section class="grid grid-cols-12 gap-10">
        <!-- Recurring Bills Section -->
        <div class="col-span-12 space-y-6">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h3 class="text-2xl font-bold">Contas Mensais e Recorrentes</h3>
              <p class="text-on-surface-variant text-sm mt-1">Organizadas cronologicamente pelo dia de vencimento.</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex bg-surface-container-highest rounded-xl p-1">
                <button 
                  (click)="billFilter.set('all')"
                  class="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                  [class.bg-primary]="billFilter() === 'all'"
                  [class.text-on-primary]="billFilter() === 'all'"
                  [class.text-on-surface-variant]="billFilter() !== 'all'"
                >
                  Todas
                </button>
                <button 
                  (click)="billFilter.set('pending')"
                  class="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                  [class.bg-primary]="billFilter() === 'pending'"
                  [class.text-on-primary]="billFilter() === 'pending'"
                  [class.text-on-surface-variant]="billFilter() !== 'pending'"
                >
                  Pendentes
                </button>
              </div>
              <button 
                (click)="showAddBillModal.set(true)"
                class="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs hover:brightness-110 transition-all shadow-lg shadow-primary/20"
              >
                <span class="material-symbols-outlined text-sm">add</span>
                Nova Conta
              </button>
            </div>
          </div>

          <div class="bg-surface-container-low rounded-[2rem] border border-primary/5 hover:border-primary/10 transition-all shadow-[0_0_40px_rgba(var(--primary-rgb),0.01)] overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr class="border-b border-outline-variant/10">
                    <th class="px-4 lg:px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Vencimento</th>
                    <th class="px-4 lg:px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Conta</th>
                    <th class="px-4 lg:px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest hidden md:table-cell">Categoria</th>
                    <th class="px-4 lg:px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Valor</th>
                    <th class="px-4 lg:px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Status</th>
                    <th class="px-4 lg:px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/5">
                  @for (bill of filteredBills(); track bill.id) {
                    <tr 
                      class="group cursor-pointer hover:bg-surface-container-high/50 transition-colors"
                      [class.opacity-50]="bill.status === 'paid'"
                    >
                      <td (click)="financialService.toggleBillStatus(bill.id)" class="px-4 lg:px-6 py-4">
                        <div class="flex items-center gap-2">
                          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {{ bill.dueDate }}
                          </div>
                          <span class="text-xs font-medium text-on-surface-variant hidden sm:inline">Todo mês</span>
                        </div>
                      </td>
                      <td (click)="financialService.toggleBillStatus(bill.id)" class="px-4 lg:px-6 py-4">
                        <div class="flex items-center gap-3">
                          <span class="material-symbols-outlined text-primary text-xl">{{ bill.icon }}</span>
                          <span class="font-bold text-on-surface">{{ bill.name }}</span>
                        </div>
                      </td>
                      <td (click)="financialService.toggleBillStatus(bill.id)" class="px-4 lg:px-6 py-4 hidden md:table-cell">
                        <span class="px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                          {{ bill.category }}
                        </span>
                      </td>
                      <td (click)="financialService.toggleBillStatus(bill.id)" class="px-4 lg:px-6 py-4">
                        <span class="font-headline font-bold text-on-surface">{{ bill.amount | currency:'BRL' }}</span>
                      </td>
                      <td (click)="financialService.toggleBillStatus(bill.id)" class="px-4 lg:px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <span class="text-[10px] font-bold uppercase tracking-widest hidden sm:inline" [class.text-primary]="bill.status === 'paid'" [class.text-error]="bill.status === 'pending'">
                            {{ bill.status === 'paid' ? 'Pago' : 'Pendente' }}
                          </span>
                          <span class="material-symbols-outlined text-xl" [class.text-primary]="bill.status === 'paid'" [class.text-outline-variant]="bill.status === 'pending'">
                            {{ bill.status === 'paid' ? 'check_circle' : 'radio_button_unchecked' }}
                          </span>
                        </div>
                      </td>
                      <td class="px-4 lg:px-6 py-4 text-right">
                        <div class="flex justify-end gap-2">
                          <button 
                            (click)="editBill(bill)"
                            class="p-2 text-on-surface-variant/60 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                          >
                            <span class="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button 
                            (click)="financialService.deleteRecurringBill(bill.id)"
                            class="p-2 text-on-surface-variant/60 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                          >
                            <span class="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="px-6 py-12 text-center">
                        <p class="text-on-surface-variant italic">Nenhuma conta encontrada para este filtro.</p>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Debt & Fixed-Term Section -->
        <div class="col-span-12 space-y-6">
          <div class="flex justify-between items-end">
            <h3 class="text-2xl font-bold">Passivos e Contas a Prazo</h3>
            <div class="flex gap-2">
              @if (financialService.debtToIncomeRatio() >= 80) {
                <div class="flex items-center gap-2 px-4 py-2 bg-error/10 text-error rounded-xl font-bold text-[10px] uppercase tracking-tighter animate-pulse">
                  <span class="material-symbols-outlined text-sm">report</span>
                  Bloqueio de Crédito: Limite 80% Atingido
                </div>
              }
              <button 
                (click)="showAddDebtModal.set(true)"
                [disabled]="financialService.debtToIncomeRatio() >= 80"
                [class.opacity-50]="financialService.debtToIncomeRatio() >= 80"
                [class.cursor-not-allowed]="financialService.debtToIncomeRatio() >= 80"
                class="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-xl font-bold text-xs hover:bg-secondary/20 transition-all"
              >
                <span class="material-symbols-outlined text-sm">add_card</span>
                Nova Conta a Prazo
              </button>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (debt of financialService.debts(); track debt.id) {
              <div class="bg-surface-container-low p-6 rounded-2xl hover:bg-surface-container transition-all border border-primary/5 hover:border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.02)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.05)]" [class.opacity-70]="debt.status === 'paused'">
                <div class="flex justify-between items-center mb-4">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center">
                      <span class="material-symbols-outlined text-primary">{{ debt.icon }}</span>
                    </div>
                    <div>
                      <p class="font-bold text-on-surface">{{ debt.name }}</p>
                      <p class="text-xs text-on-surface-variant">
                        @if (debt.type === 'fixed-term') {
                          Parcela {{ debt.paidInstallments }} de {{ debt.totalInstallments }} 
                          <span class="text-primary font-bold ml-1">• Faltam {{ (debt.totalInstallments || 0) - (debt.paidInstallments || 0) }}</span>
                        } @else {
                          {{ debt.apr }}% Taxa Anual
                        }
                        • 
                        @if (debt.status === 'paused') {
                          Pausado
                        } @else {
                          Projeção de zero em {{ debt.projectedZeroMonths }} meses
                        }
                      </p>
                    </div>
                  </div>
                    <div class="text-right flex items-center gap-2">
                      <div>
                        <p class="font-headline font-bold text-lg text-on-surface">{{ debt.balance | currency:'BRL' }}</p>
                        @if (debt.monthlyPayment > 0) {
                          <p class="text-xs text-primary font-bold">-{{ debt.monthlyPayment | currency:'BRL' }} este mês</p>
                        }
                      </div>
                      <div class="flex flex-col gap-1">
                        <button 
                          (click)="editDebt(debt)"
                          class="p-2 text-on-surface-variant/60 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                        >
                          <span class="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button 
                          (click)="financialService.deleteDebt(debt.id)"
                          class="p-2 text-on-surface-variant/60 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                        >
                          <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="flex-1 h-3 bg-surface-container-highest rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-primary to-primary-container rounded-full" [style.width.%]="debt.paidPercentage"></div>
                  </div>
                  <span class="text-xs font-bold text-on-surface-variant">{{ debt.paidPercentage }}% Pago</span>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Bottom Bento Stats -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-surface-container-low p-6 rounded-3xl">
          <p class="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Excedente Mensal</p>
          <p class="text-2xl font-headline font-extrabold text-primary">
            {{ (financialService.netDifference() >= 0 ? '+' : '') }}{{ financialService.netDifference() | currency:'BRL' }}
          </p>
          <p class="text-[10px] text-on-primary-container mt-2 flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px]">trending_up</span>
            Cálculo em tempo real
          </p>
        </div>
        <div 
          role="button"
          tabindex="0"
          (click)="showPendingBillsModal.set(true)"
          (keydown.enter)="showPendingBillsModal.set(true)"
          (keydown.space)="showPendingBillsModal.set(true)"
          class="bg-surface-container-low p-6 rounded-3xl cursor-pointer hover:bg-surface-container transition-colors group focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <p class="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Total a Pagar (Mês)</p>
          <p class="text-2xl font-headline font-extrabold text-error">
            {{ financialService.amountToPayThisMonth() | currency:'BRL' }}
          </p>
          <p class="text-[10px] text-on-error-container mt-2 flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px]">visibility</span>
            Clique para ver detalhes
          </p>
        </div>
        <div class="bg-surface-container-low p-6 rounded-3xl" [class.border-error/30]="financialService.debtToIncomeRatio() >= 80" [class.border]="financialService.debtToIncomeRatio() >= 80">
          <p class="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Dívida sobre Renda</p>
          <p class="text-2xl font-headline font-extrabold" [class.text-secondary]="financialService.debtToIncomeRatio() < 80" [class.text-error]="financialService.debtToIncomeRatio() >= 80">
            {{ financialService.debtToIncomeRatio() | number:'1.0-0' }}%
          </p>
          <p class="text-[10px] mt-2 flex items-center gap-1" [class.text-on-secondary-container]="financialService.debtToIncomeRatio() < 80" [class.text-error]="financialService.debtToIncomeRatio() >= 80">
            <span class="material-symbols-outlined text-[12px]">{{ financialService.debtToIncomeRatio() < 80 ? 'check_circle' : 'report' }}</span>
            {{ financialService.debtToIncomeRatio() < 80 ? 'Dentro dos limites saudáveis' : 'LIMITE ATINGIDO: Não faça novas contas' }}
          </p>
        </div>
        <div class="bg-gradient-to-br from-primary-container/20 to-surface-container-low p-6 rounded-3xl border border-primary/10">
          <p class="text-xs font-bold text-primary uppercase tracking-widest mb-1">Próximo Marco</p>
          <p class="text-2xl font-headline font-extrabold text-on-surface">Livre de Dívidas</p>
          <p class="text-[10px] text-on-surface-variant mt-2 flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px]">calendar_today</span>
            Estimado: {{ financialService.debtFreeDate() }}
          </p>
        </div>
      </section>

      <!-- Pending Bills Modal -->
      @if (showPendingBillsModal()) {
        <div class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div class="w-full max-w-lg bg-surface-container-high rounded-[2rem] shadow-2xl border border-outline-variant/10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-error/5">
              <div>
                <span class="text-error font-bold tracking-[0.2em] text-[10px] uppercase">Controle de Fluxo</span>
                <h3 class="text-xl font-bold">Compromissos Pendentes</h3>
              </div>
              <button (click)="showPendingBillsModal.set(false)" class="p-2 hover:bg-surface-container rounded-full">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              <!-- Recurring Bills -->
              <div class="space-y-3">
                <p class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Contas Fixas</p>
                @for (bill of financialService.recurringBills(); track bill.id) {
                  @if (bill.status === 'pending') {
                    <div class="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant/5">
                      <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-primary">{{ bill.icon }}</span>
                        <div>
                          <p class="text-sm font-bold">{{ bill.name }}</p>
                          <p class="text-[10px] text-on-surface-variant">Vence dia {{ bill.dueDate }}</p>
                        </div>
                      </div>
                      <p class="font-bold text-on-surface">{{ bill.amount | currency:'BRL' }}</p>
                    </div>
                  }
                }
              </div>

              <!-- Pending Transactions -->
              <div class="space-y-3 pt-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Transações Pendentes</p>
                @for (t of financialService.mainTransactions(); track t.id) {
                  @if (t.type === 'expense' && t.status === 'pending') {
                    <div class="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant/5">
                      <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-error">{{ t.icon }}</span>
                        <div>
                          <p class="text-sm font-bold">{{ t.entity }}</p>
                          <p class="text-[10px] text-on-surface-variant">{{ t.category }} • {{ t.date | date:'dd/MM' }}</p>
                        </div>
                      </div>
                      <p class="font-bold text-on-surface">{{ t.amount | currency:'BRL' }}</p>
                    </div>
                  }
                }
              </div>

              <!-- Debt Installments -->
              <div class="space-y-3 pt-4">
                <p class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Parcelas de Dívidas</p>
                @for (debt of financialService.debts(); track debt.id) {
                  @if (debt.status !== 'paused') {
                    <div class="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant/5">
                      <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-secondary">{{ debt.icon }}</span>
                        <div>
                          <p class="text-sm font-bold">{{ debt.name }}</p>
                          <p class="text-[10px] text-on-surface-variant">Parcela Mensal</p>
                        </div>
                      </div>
                      <p class="font-bold text-on-surface">{{ debt.monthlyPayment | currency:'BRL' }}</p>
                    </div>
                  }
                }
              </div>
            </div>
            <div class="p-6 bg-surface-container-highest/30 border-t border-outline-variant/10 flex justify-between items-center">
              <div>
                <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total Pendente</p>
                <p class="text-xl font-bold text-error">{{ financialService.amountToPayThisMonth() | currency:'BRL' }}</p>
              </div>
              <button (click)="showPendingBillsModal.set(false)" class="px-6 py-2 bg-surface-container-highest text-on-surface font-bold rounded-xl hover:bg-surface-container transition-all">
                Fechar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Add/Edit Bill Modal -->
      @if (showAddBillModal()) {
        <div class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div class="w-full max-w-md bg-surface-container-high rounded-[2rem] shadow-2xl border border-outline-variant/10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="p-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 class="text-xl font-bold">{{ editingBillId() ? 'Editar Conta Mensal' : 'Nova Conta Mensal' }}</h3>
              <button (click)="closeBillModal()" class="p-2 hover:bg-surface-container rounded-full">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label for="billName" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Nome da Conta</label>
                <input id="billName" type="text" [(ngModel)]="newBill.name" class="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-on-surface outline-none focus:ring-1 focus:ring-primary/30" placeholder="Ex: Internet, Aluguel..."/>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="billAmount" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Valor (R$)</label>
                  <input 
                    id="billAmount" 
                    type="text" 
                    [value]="formattedBillAmount()"
                    (input)="onCurrencyInput($event, 'billAmount')"
                    class="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-on-surface outline-none focus:ring-1 focus:ring-primary/30"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label for="billDueDate" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Dia do Vencimento</label>
                  <input 
                    id="billDueDate" 
                    type="date" 
                    (change)="onDateChange($event)"
                    class="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-on-surface outline-none focus:ring-1 focus:ring-primary/30 [color-scheme:dark]"
                  />
                </div>
              </div>
              <div>
                <label for="billCategory" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Categoria</label>
                <div class="space-y-3">
                  <select 
                    id="billCategory" 
                    [(ngModel)]="newBill.category" 
                    (change)="onCategoryChange($event)"
                    class="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-on-surface outline-none focus:ring-1 focus:ring-primary/30"
                  >
                    @for (cat of financialService.categories(); track cat) {
                      <option [value]="cat">{{ cat }}</option>
                    }
                    <option value="NEW_CATEGORY">+ Adicionar Nova Categoria...</option>
                  </select>

                  @if (showNewCategoryInput()) {
                    <div class="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                      <input 
                        #newCatInput
                        type="text" 
                        class="flex-1 bg-surface-container-low border border-primary/30 rounded-xl p-3 text-on-surface outline-none focus:ring-1 focus:ring-primary/50" 
                        placeholder="Nome da nova categoria"
                        (keyup.enter)="addNewCategory(newCatInput.value)"
                      />
                      <button 
                        (click)="addNewCategory(newCatInput.value)"
                        class="bg-primary text-on-primary px-4 rounded-xl font-bold hover:brightness-110 transition-all"
                      >
                        OK
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
            <div class="p-6 bg-surface-container-highest/30 border-t border-outline-variant/10 flex gap-3">
              <button (click)="closeBillModal()" class="flex-1 py-3 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-highest transition-all">Cancelar</button>
              <button (click)="saveBill()" class="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl hover:brightness-110 transition-all">
                {{ editingBillId() ? 'Salvar Alterações' : 'Adicionar' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Add/Edit Debt Modal -->
      @if (showAddDebtModal()) {
        <div class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div class="w-full max-w-md bg-surface-container-high rounded-[2rem] shadow-2xl border border-outline-variant/10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="p-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 class="text-xl font-bold">{{ editingDebtId() ? 'Editar Conta a Prazo' : 'Nova Conta a Prazo' }}</h3>
              <button (click)="closeDebtModal()" class="p-2 hover:bg-surface-container rounded-full">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label for="debtName" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Descrição</label>
                <input id="debtName" type="text" [(ngModel)]="newDebt.name" class="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-on-surface outline-none focus:ring-1 focus:ring-primary/30" placeholder="Ex: iPhone, Empréstimo..."/>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="debtBalance" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Saldo Devedor (R$)</label>
                  <input 
                    id="debtBalance" 
                    type="text" 
                    [value]="formattedDebtBalance()"
                    (input)="onCurrencyInput($event, 'debtBalance')"
                    class="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-on-surface outline-none focus:ring-1 focus:ring-primary/30"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label for="debtMonthly" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Parcela Mensal (R$)</label>
                  <input 
                    id="debtMonthly" 
                    type="text" 
                    [value]="formattedDebtMonthly()"
                    (input)="onCurrencyInput($event, 'debtMonthly')"
                    class="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-on-surface outline-none focus:ring-1 focus:ring-primary/30"
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="debtTotalInst" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Total de Parcelas</label>
                  <input id="debtTotalInst" type="number" [(ngModel)]="newDebt.totalInstallments" class="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-on-surface outline-none focus:ring-1 focus:ring-primary/30"/>
                </div>
                <div>
                  <label for="debtPaidInst" class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Parcelas Pagas</label>
                  <input id="debtPaidInst" type="number" [(ngModel)]="newDebt.paidInstallments" class="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-on-surface outline-none focus:ring-1 focus:ring-primary/30"/>
                </div>
              </div>
            </div>
            <div class="p-6 bg-surface-container-highest/30 border-t border-outline-variant/10 flex gap-3">
              <button (click)="closeDebtModal()" class="flex-1 py-3 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-highest transition-all">Cancelar</button>
              <button (click)="saveDebt()" class="flex-1 py-3 bg-secondary text-on-secondary font-bold rounded-xl hover:brightness-110 transition-all">
                {{ editingDebtId() ? 'Salvar Alterações' : 'Adicionar' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Strategy {
  financialService = inject(FinancialService);
  authService = inject(AuthService);
  private ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  isEditing = signal(false);
  tempTarget = 25000;

  showAddBillModal = signal(false);
  showAddDebtModal = signal(false);
  showPendingBillsModal = signal(false);
  showNewCategoryInput = signal(false);
  billFilter = signal<'all' | 'pending'>('all');

  purchaseItem = signal('');
  purchasePrice = signal(0);
  formattedPurchasePrice = signal('');
  analysisResult = signal<string | null>(null);
  loadingAnalysis = signal(false);
  showPurchaseSim = signal(false);

  showBillOptimizer = signal(false);
  optimizedBills = signal<Record<string, number>>({});
  optimizationResult = signal<string | null>(null);
  loadingOptimization = signal(false);

  editingBillId = signal<string | null>(null);
  editingDebtId = signal<string | null>(null);

  formattedBillAmount = signal('');
  formattedDebtBalance = signal('');
  formattedDebtMonthly = signal('');
  formattedEmergencyTarget = signal('');

  filteredBills = computed(() => {
    const bills = this.financialService.sortedBills();
    if (this.billFilter() === 'all') return bills;
    return bills.filter(b => b.status === 'pending');
  });

  newBill = {
    name: '',
    amount: 0,
    dueDate: 1,
    category: 'Outros',
    icon: 'receipt_long'
  };

  newDebt = {
    name: '',
    balance: 0,
    monthlyPayment: 0,
    totalInstallments: 12,
    paidInstallments: 0,
    icon: 'payments'
  };

  emergencyPercentage = computed(() => {
    const current = this.financialService.emergencyFund();
    const monthlyExpenses = this.financialService.monthlyExpenses();
    const userTarget = this.financialService.emergencyFundTarget();
    
    // Use a meta definida pelo usuário, ou o ideal (6x despesas) se não houver meta
    const target = userTarget > 0 ? userTarget : (monthlyExpenses * 6);
    
    if (target <= 0) return 0;
    return (current / target) * 100;
  });

  emergencyBarWidth = computed(() => Math.min(100, this.emergencyPercentage()));

  onCurrencyInput(event: Event, field: string) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    
    if (value === '') {
      this.updateField(field, 0, '');
      return;
    }

    const numberValue = parseInt(value, 10) / 100;
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numberValue);

    input.value = formatted;
    this.updateField(field, numberValue, formatted);
  }

  private updateField(field: string, value: number, formatted: string) {
    switch (field) {
      case 'billAmount':
        this.newBill.amount = value;
        this.formattedBillAmount.set(formatted);
        break;
      case 'debtBalance':
        this.newDebt.balance = value;
        this.formattedDebtBalance.set(formatted);
        break;
      case 'debtMonthly':
        this.newDebt.monthlyPayment = value;
        this.formattedDebtMonthly.set(formatted);
        break;
      case 'emergencyTarget':
        this.tempTarget = value;
        this.formattedEmergencyTarget.set(formatted);
        break;
      case 'purchasePrice':
        this.purchasePrice.set(value);
        this.formattedPurchasePrice.set(formatted);
        break;
    }
  }

  async analyzePurchase() {
    if (!this.purchaseItem() || this.purchasePrice() <= 0) return;
    
    this.loadingAnalysis.set(true);
    const summary = this.financialService.financialSummary();
    
    const prompt = `Você é um consultor financeiro pessoal de elite. Analise se o usuário pode comprar o seguinte item:
Item: ${this.purchaseItem()}
Valor: R$ ${this.purchasePrice()}

Dados Financeiros Atuais:
- Saldo Total: R$ ${summary.balance}
- Renda Mensal: R$ ${summary.income}
- Gastos Mensais: R$ ${summary.expenses}
- Sobra Mensal (Net): R$ ${summary.net}
- Dívida Total: R$ ${summary.totalDebt}
- Reserva de Emergência Atual: R$ ${this.financialService.emergencyFund()}

Considere:
1. Compra à vista: É seguro tirar esse valor do saldo agora sem comprometer a reserva de emergência ou as contas do mês?
2. Compra parcelada: Se parcelar em 10x (exemplo), como isso afeta a sobra mensal?
3. Recomendação: "Compre agora", "Espere X meses" ou "Não compre".

Responda em Português do Brasil, de forma direta, honesta e com tom profissional. Use Markdown para negrito e listas.`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
      });
      
      if (!response.text) {
        throw new Error('Resposta vazia da IA');
      }

      this.analysisResult.set(response.text);
    } catch (error) {
      console.error('Erro na análise IA:', error);
      let errorMessage = 'Erro ao conectar com o consultor IA. Tente novamente.';
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) errorMessage = 'Chave de API inválida.';
        else if (error.message.includes('quota')) errorMessage = 'Limite de uso atingido.';
      }
      this.analysisResult.set(errorMessage);
    } finally {
      this.loadingAnalysis.set(false);
    }
  }

  formatMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/- (.*?)(<br>|$)/g, '<div class="flex gap-2 mb-1"><span class="text-primary">•</span><span>$1</span></div>');
  }

  getOptimizedValue(billId: string): string {
    const val = this.optimizedBills()[billId];
    if (val === undefined) {
      const bill = this.financialService.recurringBills().find(b => b.id === billId);
      return bill ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(bill.amount) : '0,00';
    }
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  }

  onOptimizedInput(event: Event, billId: string) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    
    if (value === '') {
      this.optimizedBills.update(prev => ({ ...prev, [billId]: 0 }));
      input.value = '0,00';
      return;
    }

    const numberValue = parseInt(value, 10) / 100;
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numberValue);

    input.value = formatted;
    this.optimizedBills.update(prev => ({ ...prev, [billId]: numberValue }));
  }

  resetOptimizedValue(billId: string) {
    this.optimizedBills.update(prev => {
      const next = { ...prev };
      delete next[billId];
      return next;
    });
  }

  async analyzeOptimization() {
    this.loadingOptimization.set(true);
    const summary = this.financialService.financialSummary();
    const bills = this.financialService.recurringBills();
    
    const optimizationData = bills.map(b => {
      const simValue = this.optimizedBills()[b.id] ?? b.amount;
      return {
        name: b.name,
        original: b.amount,
        simulated: simValue,
        diff: b.amount - simValue
      };
    }).filter(d => d.diff !== 0);

    if (optimizationData.length === 0) {
      this.optimizationResult.set("Você não alterou nenhum valor para simulação. Tente reduzir o valor de alguma conta ou zerar (remover) para ver o impacto.");
      this.loadingOptimization.set(false);
      return;
    }

    const totalSaving = optimizationData.reduce((acc, d) => acc + d.diff, 0);
    
    const prompt = `Você é um estrategista financeiro focado em eficiência e liberdade financeira. Analise o impacto da seguinte simulação de redução de gastos mensais:

Contas Alteradas:
${optimizationData.map(d => `- ${d.name}: De R$ ${d.original} para R$ ${d.simulated} (Economia de R$ ${d.diff})`).join('\n')}

Total de Economia Mensal Simulada: R$ ${totalSaving}

Dados Financeiros Atuais:
- Saldo Total: R$ ${summary.balance}
- Renda Mensal: R$ ${summary.income}
- Gastos Mensais Atuais: R$ ${summary.expenses}
- Sobra Mensal Atual: R$ ${summary.net}
- Dívida Total: R$ ${summary.totalDebt}
- Data Estimada para Fim das Dívidas: ${this.financialService.debtFreeDate()}

Por favor, forneça:
1. Impacto no Futuro: Quanto tempo a menos o usuário levaria para quitar suas dívidas se usasse essa economia para amortizar parcelas?
2. Poder de Investimento: Se investisse essa economia mensal a 10% ao ano, quanto teria em 1, 5 e 10 anos?
3. Dicas Práticas: Como ele pode realmente conseguir essas reduções (ex: renegociação, cancelamento de serviços redundantes, substituição por opções mais baratas).

Responda em Português do Brasil, de forma motivadora e técnica. Use Markdown para negrito e listas.`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
      });
      
      if (!response.text) throw new Error('Resposta vazia');
      this.optimizationResult.set(response.text);
    } catch (error) {
      console.error('Erro na otimização IA:', error);
      this.optimizationResult.set('Erro ao processar simulação. Tente novamente.');
    } finally {
      this.loadingOptimization.set(false);
    }
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      // Use local date parts to avoid timezone shifts
      const day = parseInt(input.value.split('-')[2], 10);
      this.newBill.dueDate = day;
    }
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
    this.newBill.category = name.trim();
    this.showNewCategoryInput.set(false);
  }

  toggleEditing() {
    if (!this.isEditing()) {
      const currentTarget = this.financialService.emergencyFundTarget();
      // Sugere o ideal (6x despesas) se não houver meta definida
      this.tempTarget = currentTarget > 0 ? currentTarget : (this.financialService.monthlyExpenses() * 6);
      
      this.formattedEmergencyTarget.set(new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(this.tempTarget));
    }
    this.isEditing.set(!this.isEditing());
  }

  emergencyColor = computed(() => {
    const percentage = this.emergencyPercentage();
    const commitment = this.financialService.incomeCommitmentPercentage();
    
    // Prioridade para alerta de comprometimento crítico
    if (commitment >= 90) {
      return 'var(--status-error)';
    }

    // Cores baseadas na meta da reserva (Independentes do tema global)
    if (percentage < 30) {
      return 'var(--status-error)';
    } else if (percentage < 80) {
      return 'var(--status-warning)';
    }
    return 'var(--status-success)';
  });

  saveTarget() {
    this.financialService.updateEmergencyTarget(this.tempTarget);
    this.isEditing.set(false);
  }

  addQuickAmount(amount: number) {
    this.financialService.addToEmergencyFund(amount);
  }

  withdrawQuickAmount(amount: number) {
    this.financialService.removeFromEmergencyFund(amount);
  }

  saveBill() {
    if (!this.newBill.name || this.newBill.amount <= 0) return;
    
    if (this.editingBillId()) {
      this.financialService.updateRecurringBill(this.editingBillId()!, {
        name: this.newBill.name,
        amount: this.newBill.amount,
        dueDate: this.newBill.dueDate,
        category: this.newBill.category,
        icon: this.newBill.icon
      });
    } else {
      this.financialService.addRecurringBill({
        name: this.newBill.name,
        amount: this.newBill.amount,
        dueDate: this.newBill.dueDate,
        category: this.newBill.category,
        icon: this.newBill.icon
      });
    }

    this.closeBillModal();
  }

  editBill(bill: RecurringBill) {
    this.editingBillId.set(bill.id);
    this.newBill = {
      name: bill.name,
      amount: bill.amount,
      dueDate: bill.dueDate,
      category: bill.category,
      icon: bill.icon
    };
    this.formattedBillAmount.set(new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(bill.amount));
    this.showAddBillModal.set(true);
  }

  closeBillModal() {
    this.showAddBillModal.set(false);
    this.editingBillId.set(null);
    this.newBill = { name: '', amount: 0, dueDate: 1, category: 'Outros', icon: 'receipt_long' };
    this.formattedBillAmount.set('');
  }

  saveDebt() {
    if (!this.newDebt.name || this.newDebt.balance <= 0) return;

    const paidPercentage = Math.round((this.newDebt.paidInstallments / this.newDebt.totalInstallments) * 100);
    const projectedZeroMonths = this.newDebt.totalInstallments - this.newDebt.paidInstallments;

    if (this.editingDebtId()) {
      this.financialService.updateDebt(this.editingDebtId()!, {
        name: this.newDebt.name,
        balance: this.newDebt.balance,
        monthlyPayment: this.newDebt.monthlyPayment,
        totalInstallments: this.newDebt.totalInstallments,
        paidInstallments: this.newDebt.paidInstallments,
        paidPercentage,
        projectedZeroMonths,
        icon: this.newDebt.icon
      });
    } else {
      this.financialService.addDebt({
        name: this.newDebt.name,
        balance: this.newDebt.balance,
        monthlyPayment: this.newDebt.monthlyPayment,
        totalInstallments: this.newDebt.totalInstallments,
        paidInstallments: this.newDebt.paidInstallments,
        paidPercentage,
        projectedZeroMonths,
        apr: 0,
        icon: this.newDebt.icon,
        status: 'on-track',
        type: 'fixed-term'
      });
    }

    this.closeDebtModal();
  }

  editDebt(debt: Debt) {
    this.editingDebtId.set(debt.id);
    this.newDebt = {
      name: debt.name,
      balance: debt.balance,
      monthlyPayment: debt.monthlyPayment,
      totalInstallments: debt.totalInstallments ?? 12,
      paidInstallments: debt.paidInstallments ?? 0,
      icon: debt.icon
    };
    this.formattedDebtBalance.set(new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(debt.balance));
    this.formattedDebtMonthly.set(new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(debt.monthlyPayment));
    this.showAddDebtModal.set(true);
  }

  closeDebtModal() {
    this.showAddDebtModal.set(false);
    this.editingDebtId.set(null);
    this.newDebt = { name: '', balance: 0, monthlyPayment: 0, totalInstallments: 12, paidInstallments: 0, icon: 'payments' };
    this.formattedDebtBalance.set('');
    this.formattedDebtMonthly.set('');
  }
}
