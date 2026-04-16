import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FinancialService, Goal } from './financial.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { GoogleGenAI } from "@google/genai";

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule],
  template: `
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <span class="text-primary font-bold tracking-[0.2em] text-[10px] uppercase">Planejamento Estratégico</span>
          <h2 class="text-3xl lg:text-4xl font-extrabold tracking-tight mt-1">Meus Alvos</h2>
        </div>
        <button 
          (click)="showAddForm.set(!showAddForm())"
          class="w-full sm:w-auto bg-primary text-on-primary px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20"
        >
          <span class="material-symbols-outlined">{{ showAddForm() ? 'close' : 'add' }}</span>
          {{ showAddForm() ? 'Fechar' : 'Novo Alvo' }}
        </button>
      </div>

      <!-- Add Goal Form -->
      @if (showAddForm()) {
        <div class="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <form [formGroup]="goalForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label for="goalTitle" class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Título do Alvo</label>
              <input id="goalTitle" formControlName="title" class="w-full bg-surface-container p-4 rounded-2xl border border-outline-variant/10 focus:ring-1 focus:ring-primary/50 text-sm" placeholder="Ex: Viagem para Paris">
            </div>
            <div class="space-y-2">
              <label for="targetAmount" class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Valor Alvo (R$)</label>
              <input 
                id="targetAmount" 
                type="text" 
                class="w-full bg-surface-container p-4 rounded-2xl border border-outline-variant/10 focus:ring-1 focus:ring-primary/50 text-sm" 
                placeholder="0,00"
                (input)="onCurrencyInput($event, 'targetAmount')"
              >
            </div>
            <div class="space-y-2">
              <label for="currentAmount" class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Valor Atual (R$)</label>
              <input 
                id="currentAmount" 
                type="text" 
                class="w-full bg-surface-container p-4 rounded-2xl border border-outline-variant/10 focus:ring-1 focus:ring-primary/50 text-sm" 
                placeholder="0,00"
                (input)="onCurrencyInput($event, 'currentAmount')"
              >
            </div>
            <div class="space-y-2">
              <label for="deadline" class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Data Limite</label>
              <input id="deadline" type="date" formControlName="deadline" class="w-full bg-surface-container p-4 rounded-2xl border border-outline-variant/10 focus:ring-1 focus:ring-primary/50 text-sm [color-scheme:dark]">
            </div>
            <div class="space-y-2">
              <label for="category" class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Categoria</label>
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
                      <option [value]="cat">{{ cat }}</option>
                    }
                    <option value="NEW_CATEGORY" class="text-primary font-bold">+ Nova Categoria...</option>
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
            <div class="flex items-end">
              <button 
                type="submit" 
                [disabled]="goalForm.invalid"
                class="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold disabled:opacity-50 transition-all"
              >
                Salvar Alvo
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Goals Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        @for (goal of financialService.goals(); track goal.id) {
          <div 
            class="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10 relative overflow-hidden group hover:border-primary/30 transition-all duration-500"
            [class.opacity-60]="goal.completed"
          >
            <!-- Progress Background -->
            <div 
              class="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-1000"
              [style.width.%]="(goal.currentAmount / goal.targetAmount) * 100"
            ></div>

            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined">{{ goal.icon }}</span>
              </div>
              <div class="flex gap-2">
                <button 
                  (click)="financialService.toggleGoalCompletion(goal.id)"
                  class="p-2 rounded-xl hover:bg-surface-container transition-colors"
                  [class.text-primary]="goal.completed"
                >
                  <span class="material-symbols-outlined">{{ goal.completed ? 'check_circle' : 'radio_button_unchecked' }}</span>
                </button>
                <button 
                  (click)="financialService.deleteGoal(goal.id)"
                  class="p-2 rounded-xl hover:bg-error/10 text-on-surface-variant/40 hover:text-error transition-colors"
                >
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>

            <h3 class="text-xl font-bold mb-1">{{ goal.title }}</h3>
            <p class="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-6">{{ goal.category }}</p>

            <div class="space-y-4">
              <div class="flex justify-between items-end">
                <div>
                  <p class="text-[10px] font-bold text-on-surface-variant/60 uppercase">Progresso</p>
                  <p class="text-lg font-headline font-bold">{{ goal.currentAmount | currency:'BRL' }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] font-bold text-on-surface-variant/60 uppercase">Alvo</p>
                  <p class="text-sm font-bold text-on-surface-variant">{{ goal.targetAmount | currency:'BRL' }}</p>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="h-2 bg-surface-container rounded-full overflow-hidden">
                <div 
                  class="h-full bg-primary rounded-full transition-all duration-1000"
                  [style.width.%]="((goal.currentAmount / goal.targetAmount) * 100) > 100 ? 100 : ((goal.currentAmount / goal.targetAmount) * 100)"
                ></div>
              </div>

              <div class="flex justify-between items-center pt-2">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant/60 uppercase">
                    <span class="material-symbols-outlined text-xs">calendar_today</span>
                    {{ goal.deadline | date:'dd MMM yyyy' }}
                  </div>
                  @if (!goal.completed) {
                    <div class="text-[10px] font-bold text-secondary uppercase flex items-center gap-1">
                      <span class="material-symbols-outlined text-xs">timer</span>
                      @let days = getDaysRemaining(goal.deadline);
                      @if (days > 0) {
                        Falta{{ days > 1 ? 'm' : '' }} {{ days }} dia{{ days > 1 ? 's' : '' }}
                      } @else if (days === 0) {
                        É hoje!
                      } @else {
                        Atrasado {{ days * -1 }} dia{{ (days * -1) > 1 ? 's' : '' }}
                      }
                    </div>
                  }
                </div>
                <div class="text-[10px] font-bold text-primary uppercase">
                  {{ ((goal.currentAmount / goal.targetAmount) * 100) | number:'1.0-0' }}%
                </div>
              </div>

              <!-- AI Strategy Button -->
              @if (!goal.completed) {
                <div class="pt-4 border-t border-outline-variant/10 mt-4">
                  <button 
                    (click)="generateStrategy(goal)"
                    [disabled]="loadingStrategy() === goal.id"
                    class="w-full py-3 rounded-xl bg-surface-container-highest text-on-surface text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-on-primary transition-all group/btn"
                  >
                    @if (loadingStrategy() === goal.id) {
                      <span class="material-symbols-outlined animate-spin text-sm">sync</span>
                      Gerando Estratégia...
                    } @else {
                      <span class="material-symbols-outlined text-sm group-hover/btn:scale-110 transition-transform">lightbulb</span>
                      Ver Estratégia IA
                    }
                  </button>
                </div>
              }
            </div>

            <!-- Strategy Overlay/Modal -->
            @if (activeStrategy()?.goalId === goal.id) {
              <div class="absolute inset-0 bg-surface-container-high/95 backdrop-blur-md z-20 p-6 flex flex-col animate-in fade-in zoom-in-95 duration-300">
                <div class="flex justify-between items-center mb-4">
                  <h4 class="font-bold text-primary flex items-center gap-2">
                    <span class="material-symbols-outlined">psychology</span>
                    Estratégia Atlas
                  </h4>
                  <button (click)="activeStrategy.set(null)" class="p-1 hover:bg-surface-container rounded-lg">
                    <span class="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                <div class="flex-1 overflow-y-auto text-xs text-on-surface-variant leading-relaxed space-y-3 custom-scrollbar pr-2">
                  <div class="prose prose-sm prose-invert max-w-none" [innerHTML]="formatMarkdown(activeStrategy()?.text || '')"></div>
                </div>
                <div class="mt-4 pt-4 border-t border-outline-variant/10">
                  <p class="text-[8px] text-on-surface-variant/40 uppercase font-bold text-center">Gerado por Inteligência Artificial</p>
                </div>
              </div>
            }

            @if (goal.completed) {
              <div class="absolute inset-0 bg-surface/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                <div class="bg-primary text-on-primary px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest rotate-[-12deg] shadow-xl">
                  Concluído
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Goals {
  financialService = inject(FinancialService);
  private fb = inject(FormBuilder);
  private ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  showAddForm = signal(false);
  showNewCategoryInput = signal(false);
  loadingStrategy = signal<string | null>(null);
  activeStrategy = signal<{ goalId: string, text: string } | null>(null);

  goalForm = this.fb.group({
    title: ['', [Validators.required]],
    targetAmount: [0, [Validators.required, Validators.min(0.01)]],
    currentAmount: [0, [Validators.required, Validators.min(0)]],
    deadline: ['', [Validators.required]],
    category: ['Viagem', [Validators.required]]
  });

  onCurrencyInput(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    
    if (value === '') {
      this.goalForm.get(controlName)?.setValue(0, { emitEvent: false });
      input.value = '';
      return;
    }

    const numberValue = parseInt(value, 10) / 100;
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numberValue);

    input.value = formatted;
    this.goalForm.get(controlName)?.setValue(numberValue, { emitEvent: false });
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
    this.goalForm.patchValue({ category: name.trim() });
    this.showNewCategoryInput.set(false);
  }

  onSubmit() {
    if (this.goalForm.valid) {
      const formValue = this.goalForm.value;
      this.financialService.addGoal({
        title: formValue.title!,
        targetAmount: formValue.targetAmount!,
        currentAmount: formValue.currentAmount!,
        deadline: formValue.deadline!,
        category: formValue.category!,
        icon: this.getIconForCategory(formValue.category!)
      });
      this.goalForm.reset({
        category: 'Viagem',
        currentAmount: 0,
        targetAmount: 0
      });
      this.showAddForm.set(false);
    }
  }

  private getIconForCategory(category: string): string {
    switch (category) {
      case 'Viagem': return 'flight';
      case 'Tecnologia': return 'laptop_mac';
      case 'Casa': return 'home';
      case 'Carro': return 'directions_car';
      default: return 'target';
    }
  }

  getDaysRemaining(deadline: string): number {
    const targetDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async generateStrategy(goal: Goal) {
    if (this.loadingStrategy()) return;
    
    this.loadingStrategy.set(goal.id);
    const summary = this.financialService.financialSummary();
    
    try {
      const prompt = `Você é um consultor financeiro especialista. Crie uma estratégia prática e motivadora para alcançar o seguinte alvo financeiro:
Título: ${goal.title}
Valor Alvo: R$ ${goal.targetAmount}
Valor Atual: R$ ${goal.currentAmount}
Data Limite: ${goal.deadline}
Saldo Atual em Contas: R$ ${summary.balance}
Renda Mensal: R$ ${summary.income}
Gasto Mensal: R$ ${summary.expenses}

Dê dicas de economia específicas para este alvo, sugestões de renda extra e um cronograma simplificado de quanto poupar por mês/semana. 
Responda em Português do Brasil, de forma concisa e amigável, usando Markdown para formatação (negrito, listas).`;

      const response = await this.ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
      });

      if (!response.text) {
        throw new Error('Resposta vazia da IA');
      }

      this.activeStrategy.set({
        goalId: goal.id,
        text: response.text
      });
    } catch (error) {
      console.error('Erro ao gerar estratégia:', error);
      let errorMessage = 'Ocorreu um erro ao conectar com a IA.';
      
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
          errorMessage = 'Chave de API inválida. Por favor, verifique as configurações.';
        } else if (error.message.includes('quota')) {
          errorMessage = 'Limite de uso da IA atingido. Tente novamente em instantes.';
        }
      }

      this.activeStrategy.set({
        goalId: goal.id,
        text: errorMessage
      });
    } finally {
      this.loadingStrategy.set(null);
    }
  }

  formatMarkdown(text: string): string {
    // Basic markdown formatting for the UI
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/- (.*?)(<br>|$)/g, '<div class="flex gap-2 mb-1"><span class="text-primary">•</span><span>$1</span></div>');
  }
}
