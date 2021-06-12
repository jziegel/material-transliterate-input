import { ElementRef, EventEmitter, Injectable, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Language } from './language';

declare var google: any;

interface TranslatableElement {
  elementRef: ElementRef;
  language: Language;
}

@Injectable({
  providedIn: 'root',
})
export class TransliterationService implements OnInit {
  public isTransliterationLoaded = false;
  private elements: ElementRef[] = [];
  private elementQueue: TranslatableElement[] = [];

  @Output() status = new EventEmitter<any>();

  @Output() processing = new EventEmitter<boolean>();

  constructor(private matSnackBar: MatSnackBar) {}

  ngOnInit(): void {
    google.load('elements', '1', {
      packages: 'transliteration',
    });
  }

  init() {
    google.setOnLoadCallback(() => this.onTransliterationLoaded());
  }

  onTransliterationLoaded() {
    this.isTransliterationLoaded = true;

    this.elementQueue.forEach((element) => {
      this.initTransliterate(element.elementRef, element.language);
    });

    this.elementQueue = [];
  }

  initTransliterate(elementRef: ElementRef, language: Language): any {
    if (!this.isTransliterationLoaded && elementRef && language) {
      this.elementQueue.push({
        elementRef,
        language,
      });
      return;
    }

    if (!this.isTransliterationLoaded || !elementRef || !language || this.elements.includes(elementRef)) {
      return;
    }

    this.elements.push(elementRef);

    const element = elementRef.nativeElement;
    let transliterationControl;

    if (google.elements.transliteration.isBrowserCompatible()) {
      let options = {
        sourceLanguage: google.elements.transliteration.LanguageCode.ENGLISH,
        destinationLanguage: [
          google.elements.transliteration.LanguageCode.SINHALESE,
          google.elements.transliteration.LanguageCode.TAMIL,
        ],
        shortcutKey: 'ctrl+g',
        transliterationEnabled: false,
      };

      transliterationControl = new google.elements.transliteration.TransliterationControl(options);
      transliterationControl.makeTransliteratable([element]);

      if (language) {
        this.onLanguageChange(transliterationControl, language);
      }
    } else {
      this.matSnackBar.open('Transliteration unavailable on this browser', 'Close', {
        duration: 2000,
      });
    }

    return transliterationControl;
  }

  destroyTransliterate(input: ElementRef): void {
    if (this.elements.includes(input)) {
      let index = this.elements.indexOf(input);

      if (index > -1) {
        this.elements.splice(index, 1);
      }
    }
  }

  onLanguageChange(transliterationControl: any, language: Language): void {
    if (!transliterationControl) {
      return;
    }

    if (language === Language.SI) {
      if (!transliterationControl.isTransliterationEnabled()) {
        transliterationControl.enableTransliteration();
      }
      transliterationControl.setLanguagePair(
        google.elements.transliteration.LanguageCode.ENGLISH,
        google.elements.transliteration.LanguageCode.SINHALESE
      );
    } else if (language === Language.TA) {
      if (!transliterationControl.isTransliterationEnabled()) {
        transliterationControl.enableTransliteration();
      }
      transliterationControl.setLanguagePair(
        google.elements.transliteration.LanguageCode.ENGLISH,
        google.elements.transliteration.LanguageCode.TAMIL
      );
    } else {
      transliterationControl.disableTransliteration();
    }
  }
}
