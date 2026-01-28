import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IStepConfig, IFieldConfig } from '../../interfaces/payment-methods.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stepper-form',
  templateUrl: './stepper-form.component.html',
  styleUrls: ['./stepper-form.component.scss']
})
export class StepperFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() steps: IStepConfig[] = [];
  @Input() useVirtualKeyboard: boolean = true;
  @Input() initialData: any = {};
  
  @Output() stepChange = new EventEmitter<{ step: number; data: any }>();
  @Output() formComplete = new EventEmitter<any>();
  @Output() keyboardInput = new EventEmitter<string>();
  @Output() keyboardDelete = new EventEmitter<void>();

  @ViewChild('activeInput') activeInput: ElementRef<HTMLInputElement>;
  @ViewChildren('activeInput') inputElements: QueryList<ElementRef<HTMLInputElement>>;

  public currentStep: number = 0;
  public stepForm: FormGroup;
  public formData: any = {};
  public activeFieldName: string = '';
  public keyboardVisible: boolean = false;
  public showInfoPopover: string | null = null;

  private fieldSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.formData = { ...this.initialData };
    
    // Inicializar campo monto con 0.00 si existe
    if (this.steps.length > 0) {
      const hasMontoField = this.steps[0].fields.some(f => f.name === 'monto');
      if (hasMontoField && !this.formData['monto']) {
        this.formData['monto'] = '0.00';
      }
    }
    
    this.buildForm();
  }

  ngAfterViewInit(): void {
    // Hacer focus en el primer input cuando la vista se inicializa
    this.focusFirstInput();

    // Suscribirse a los cambios de los inputs para hacer focus cuando cambian
    this.fieldSubscription = this.inputElements.changes.subscribe(() => {
      this.focusFirstInput();
    });
  }

  ngOnDestroy(): void {
    if (this.fieldSubscription) {
      this.fieldSubscription.unsubscribe();
    }
  }

  /**
   * Hace focus en el primer input disponible
   */
  private focusFirstInput(): void {
    setTimeout(() => {
      if (this.inputElements && this.inputElements.length > 0) {
        const firstInput = this.inputElements.first;
        if (firstInput && firstInput.nativeElement) {
          console.warn('SI SE ENFOCOOO', firstInput)
          firstInput.nativeElement.focus();
        }
      }
    }, 100);
  }

  /**
   * Construye el formulario reactivo basado en la configuración del step actual
   */
  private buildForm(): void {
    const currentStepConfig = this.steps[this.currentStep];
    const group: any = {};

    currentStepConfig.fields.forEach(field => {
      const validators = [];
      
      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.minLength) {
        validators.push(Validators.minLength(field.minLength));
      }
      if (field.maxLength) {
        validators.push(Validators.maxLength(field.maxLength));
      }
      if (field.pattern) {
        validators.push(Validators.pattern(field.pattern));
      }

      const initialValue = this.formData[field.name] || '';
      group[field.name] = [initialValue, validators];
    });

    this.stepForm = this.fb.group(group);
    
    // Establecer el primer campo como activo
    if (currentStepConfig.fields.length > 0) {
      this.activeFieldName = currentStepConfig.fields[0].name;
    }

    this.cdr.markForCheck();
    
    // Hacer focus en el primer input después de construir el formulario
    this.focusFirstInput();
  }

  /**
   * Avanza al siguiente step
   */
  nextStep(): void {
    if (this.stepForm.valid) {
      // Guardar datos del step actual
      Object.assign(this.formData, this.stepForm.value);

      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        this.buildForm();
        this.stepChange.emit({ step: this.currentStep, data: this.formData });
      } else {
        // Último step completado
        this.formComplete.emit(this.formData);
      }

      // Hide keyboard when navigating forward
      this.keyboardVisible = false;
    } else {
      this.markFormGroupTouched(this.stepForm);
    }
  }


  /**
   * Retrocede al step anterior
   */
  previousStep(): void {
    if (this.currentStep > 0) {
      Object.assign(this.formData, this.stepForm.value);
      this.currentStep--;
      this.buildForm();
      this.stepChange.emit({ step: this.currentStep, data: this.formData });
      // Hide keyboard when navigating back
      this.keyboardVisible = false;
    }
  }

  /**
   * Maneja el input del teclado virtual
   */
  onVirtualKeyboardInput(value: string): void {
    const control = this.stepForm.get(this.activeFieldName);
    if (!control) return;

    const field = this.getCurrentField(this.activeFieldName);
    
    // Si es el campo de monto, aplicar formato especial
    if (field && field.name === 'monto') {
      this.handleMontoInput(value, control);
      return;
    }

    const currentValue = control.value || '';
    
    if (field && field.maxLength && currentValue.length >= field.maxLength) {
      return;
    }

    control.setValue(currentValue + value);
    this.cdr.markForCheck();
  }

  /**
   * Maneja el delete del teclado virtual
   */
  onVirtualKeyboardDelete(): void {
    const control = this.stepForm.get(this.activeFieldName);
    if (!control) return;

    const field = this.getCurrentField(this.activeFieldName);
    
    // Si es el campo de monto, aplicar formato especial
    if (field && field.name === 'monto') {
      this.handleMontoDelete(control);
      return;
    }

    const currentValue = control.value || '';
    control.setValue(currentValue.slice(0, -1));
    this.cdr.markForCheck();
  }

  /**
   * Maneja el input del campo monto (formato con decimales)
   */
  private handleMontoInput(value: string, control: any): void {
    let currentValue = control.value || '0.00';
    
    // Remover el punto decimal y convertir a número
    let numericValue = currentValue.replace(/\./g, '');
    
    // Agregar el nuevo dígito
    numericValue += value;
    
    // Convertir a número y dividir por 100 para obtener decimales
    const amount = parseInt(numericValue) / 100;
    
    // Formatear con 2 decimales
    control.setValue(amount.toFixed(2));
    this.cdr.markForCheck();
  }

  /**
   * Maneja el delete del campo monto (formato con decimales)
   */
  private handleMontoDelete(control: any): void {
    let currentValue = control.value || '0.00';
    
    // Remover el punto decimal
    let numericValue = currentValue.replace(/\./g, '');
    
    // Remover el último dígito
    numericValue = numericValue.slice(0, -1);
    
    // Si está vacío, poner 0
    if (numericValue.length === 0) {
      numericValue = '0';
    }
    
    // Convertir a número y dividir por 100
    const amount = parseInt(numericValue) / 100;
    
    // Formatear con 2 decimales
    control.setValue(amount.toFixed(2));
    this.cdr.markForCheck();
  }

  /**
   * Establece el campo activo
   */
  setActiveField(fieldName: string): void {
    this.activeFieldName = fieldName;
    this.cdr.markForCheck();

    if (this.useVirtualKeyboard) {
      const field = this.getCurrentField(fieldName);
      if (field) {
        // Show keyboard for numeric/tel/monto inputs, hide for others
        if (field.type === 'tel' || field.type === 'number' || field.name === 'monto') {
          this.keyboardVisible = true;
        } else {
          this.keyboardVisible = false;
        }
      }

      // Scroll focused input into view so it appears above the fixed keyboard
      setTimeout(() => this.scrollFieldIntoView(fieldName), 120);
    }
  }

  private scrollFieldIntoView(fieldName: string): void {
    if (!fieldName) return;
    if (!this.inputElements) return;
    const elRef = this.inputElements.toArray().find(e => e.nativeElement && e.nativeElement.id === fieldName);
    if (elRef && elRef.nativeElement) {
      try {
        elRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // small upward adjustment to leave space for keyboard
        setTimeout(() => window.scrollBy({ top: -110, left: 0, behavior: 'smooth' }), 200);
      } catch (err) {
        // fallback: focus element
        elRef.nativeElement.focus();
      }
    }
  }

  /**
   * Previene el teclado nativo cuando el virtual está activo
   */
  preventNativeKeyboard(event: Event): void {
    if (this.useVirtualKeyboard) {
      event.preventDefault();
      const target = event.target as HTMLInputElement;
      target.blur();
      setTimeout(() => target.blur(), 10);
    }
  }

  /**
   * Maneja el cambio de valor en inputs
   */
  onInputChange(event: Event, fieldName: string): void {
    const target = event.target as HTMLInputElement;
    const field = this.getCurrentField(fieldName);
    
    if (!field) return;

    // Validar patrón para campos numéricos
    if (field.type === 'tel' && field.pattern) {
      const value = target.value;
      const regex = new RegExp(field.pattern);
      
      // Permitir valores vacíos o que cumplan el patrón parcialmente
      if (value && !/^[0-9.]*$/.test(value)) {
        const control = this.stepForm.get(fieldName);
        if (control) {
          control.setValue(value.slice(0, -1));
        }
      }
    }
  }

  /**
   * Muestra/oculta el popover de información
   */
  toggleInfo(fieldName: string, event: Event): void {
    event.stopPropagation();
    this.showInfoPopover = this.showInfoPopover === fieldName ? null : fieldName;
  }

  /**
   * Obtiene la configuración del campo actual
   */
  private getCurrentField(fieldName: string): IFieldConfig | undefined {
    return this.steps[this.currentStep].fields.find(f => f.name === fieldName);
  }

  /**
   * Marca todos los controles del formulario como touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
    this.cdr.markForCheck();
  }

  /**
   * Obtiene el step actual
   */
  get currentStepConfig(): IStepConfig {
    return this.steps[this.currentStep];
  }

  /**
   * Verifica si es el primer step
   */
  get isFirstStep(): boolean {
    return this.currentStep === 0;
  }

  /**
   * Verifica si es el último step
   */
  get isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  /**
   * Obtiene el progreso en porcentaje
   */
  get progressPercentage(): number {
    return ((this.currentStep + 1) / this.steps.length) * 100;
  }

  /**
   * Verifica si el step actual tiene campo de nacionalidad
   */
  hasNacionalidadField(): boolean {
    return this.currentStepConfig.fields.some(field => field.name === 'nacionalidad');
  }

  /**
   * Maneja el cambio de nacionalidad desde las tabs
   */
  onNacionalidadChange(type: string): void {
    const nacionalidadControl = this.stepForm.get('nacionalidad');
    if (nacionalidadControl) {
      nacionalidadControl.setValue(type);
      this.cdr.markForCheck();
    }
  }
}
