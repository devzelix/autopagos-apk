import { Component, Input, Output, EventEmitter, forwardRef, HostListener, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ]
})
export class CustomSelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Seleccione...';
  @Input() disabled: boolean = false;
  @Output() selectionChange = new EventEmitter<string>();
  @Output() focus = new EventEmitter<void>();

  public isOpen: boolean = false;
  public selectedValue: string = '';
  public selectedLabel: string = '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.selectedValue = value || '';
    this.updateSelectedLabel();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Toggle dropdown
  toggleDropdown(): void {
    if (this.disabled) return;
    
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      this.onTouched();
      this.focus.emit();
    }
  }

  // Select an option
  selectOption(option: SelectOption): void {
    this.selectedValue = option.value;
    this.selectedLabel = option.label;
    this.isOpen = false;
    
    this.onChange(this.selectedValue);
    this.selectionChange.emit(this.selectedValue);
  }

  // Update selected label based on value
  private updateSelectedLabel(): void {
    const option = this.options.find(opt => opt.value === this.selectedValue);
    this.selectedLabel = option ? option.label : '';
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  // Get display text
  get displayText(): string {
    return this.selectedLabel || this.placeholder;
  }

  // Check if placeholder is showing
  get isPlaceholder(): boolean {
    return !this.selectedLabel;
  }
}
