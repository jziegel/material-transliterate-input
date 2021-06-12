import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { Language } from './language';
import { TransliterationService } from './transliteration.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  public formGroup: FormGroup;
  public processing = false;
  public language: Language;

  @ViewChild(MatButtonToggleGroup) languageToggle: MatButtonToggleGroup | undefined;

  constructor(private transliterationService: TransliterationService, private formBuilder: FormBuilder) {
    this.language = Language.SI;
    this.transliterationService.init();
    this.formGroup = this.formBuilder.group({
      content: [null, Validators.required],
    });
  }

  ngAfterViewInit() {
    if (this.languageToggle) {
      this.languageToggle.change.pipe(
        tap( event => {
          this.language = event.value;
        })
      ).subscribe();
    }
  }

  onSubmit() {
    console.log(this.formGroup.value);
  }
}
