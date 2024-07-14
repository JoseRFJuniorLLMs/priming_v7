import { Component, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GrammarService } from '../book3/grammar.service';

@Component({
  selector: 'app-grammar-analyzer',
  templateUrl: './grammar-analyzer.component.html',
  styleUrls: ['./grammar-analyzer.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatTooltipModule
  ]
})
export class GrammarAnalyzerComponent {
  @ViewChild('textContainer') textContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  text: string = '';
  fileName: string = '';
  isAnalyzed: boolean = false;

  constructor(
    private grammarService: GrammarService,
    private cdr: ChangeDetectorRef
  ) {}

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.text = e.target?.result as string;
        console.log('File content:', this.text); // Log file content
        this.textContainer.nativeElement.innerText = this.text;
        this.isAnalyzed = false;
        this.cdr.detectChanges();
      };
      reader.readAsText(file);
    }
  }

  analyzeText(): void {
    if (this.text) {
      console.log('Analyzing text...');
      this.grammarService.applyPartsOfSpeech(this.textContainer.nativeElement);
      this.isAnalyzed = true;
      this.cdr.detectChanges();
    } else {
      alert('Por favor, selecione um arquivo de texto primeiro.');
    }
  }

  
  resetAnalysis(): void {
    this.text = '';
    this.fileName = '';
    this.isAnalyzed = false;
    this.textContainer.nativeElement.innerHTML = '';
    this.fileInput.nativeElement.value = '';
  }
}
