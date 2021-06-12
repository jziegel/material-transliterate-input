import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnDestroy, Optional, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { Language } from '../language';
import { TransliterationService } from '../transliteration.service';

@Component({
  selector: 'mat-transliterate-input',
  templateUrl: './mat-transliterate.input.html',
  styleUrls: ['./mat-transliterate.input.scss'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: MatTransliterateInput
    },
  ]
})
export class MatTransliterateInput implements ControlValueAccessor, MatFormFieldControl<string>, AfterViewInit, OnDestroy {

  public static nextId = 0;

  public stateChanges: Subject<void> = new Subject<void>();
  public focused: boolean = false;
  public controlType = 'mat-transliterate-input';
  public autofilled?: boolean;
  public transliterationControl: any;

  private _required = false;
  private _language: Language = Language.EN;
  private _disabled = false;
  private _placeholder = '';

  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @HostBinding() id = `mat-transliterate-input-${MatTransliterateInput.nextId++}`;
  
  @HostBinding('attr.aria-describedby') describedBy = '';

  @Input()
  get required() {
    return this._required;
  }
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  @Input()
  get errorState(): boolean {
    return this.ngControl.errors !== null && !!this.ngControl.touched;
  }

  get empty() {
    return !this.val;
  }

  set value(val: string | null) {
    this.val = val;
    this.onChange(val);
    this.onTouched();
    this.stateChanges.next();
  }
  get value(): string | null {
    return this.val;
  }

  @Input()
  get language(): Language {
    return this._language;
  }
  set language(language: Language) {
    this._language = language;
    if (this.input) {
      this.transliterationControl = this.transliterationService.initTransliterate(this.input, this.language);
    }
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
    this._disabled ? this.ngControl.control?.disable() : this.ngControl.control?.enable();
    this.stateChanges.next();
  }

  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(placeholder: string) {
    this._placeholder = placeholder;
  }

  @Input('value') val: string | null = null;

  @Input() type = 'text';

  @Input() autocomplete: string = '';

  @ViewChild('input', { static: false }) input: ElementRef | undefined;

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private focusMonitor: FocusMonitor,
    private transliterationService: TransliterationService,
    private elementRef: ElementRef<HTMLElement>
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
    focusMonitor.monitor(elementRef.nativeElement, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });

    setTimeout(() => {
      if (this.ngControl.value === undefined && !this.value) {
        this.ngControl.reset();
      }

      if (this.value !== null && this.value !== undefined && (this.ngControl.value === null || this.ngControl.value === undefined)) {
        this.ngControl.control?.setValue(this.value);
      }
    });
  }

  writeValue(value: any): void {
    if (value === null && this.value !== null && this.value !== undefined) {
      this.value = null;
    } else if (value !== undefined && value !== null && this.value !== null) {
      this.value = value;
    }

    setTimeout(() => {
      this.ngControl?.control?.markAsPristine();
    }, 0);
  }

  ngAfterViewInit(): void {
    if (this.input) {
      this.transliterationControl = this.transliterationService.initTransliterate(this.input, this.language);
    }
  }

  ngOnDestroy(): void {
    if (this.input) {
      this.transliterationService.destroyTransliterate(this.input);
    }
    this.stateChanges.next();
    this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onChange: any = () => { };
  onTouched: any = () => { };

  setDescribedByIds(ids: string[]): void {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent): void {
    if (this.type === 'textarea' && (event.target as Element).tagName.toLowerCase() === 'textarea') {
      this.elementRef.nativeElement.querySelector('textarea')?.focus();
    }
    if (this.type === 'input' && (event.target as Element).tagName.toLowerCase() === 'input') {
      this.elementRef.nativeElement.querySelector('input')?.focus();
    }
  }

  onBlur() {
    if (!this.disabled) {
      this.onTouched();
    }
  }
}
