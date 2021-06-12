import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Language } from './language';
import { TransliterationService } from './transliteration.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public formGroup: FormGroup;
  public processing = false;
  public language: Language;

  constructor(
    private transliterationService: TransliterationService,
    private formBuilder: FormBuilder,
  ) {
    this.language = Language.SI;
    this.transliterationService.init();
    this.formGroup = this.formBuilder.group({
      content: [null, Validators.required],
    });
  }

  onSubmit() {
    console.log(this.formGroup.value);
  }
}
