import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexSecondaryToolbarComponent } from '@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component';
import gpt4 from '../../../../../../gpt4.json';

import { MatTabsModule } from '@angular/material/tabs';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';

import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Book3Component } from 'src/app/pages/apps/book3/book3.component';

import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';

import { MatTooltipModule } from '@angular/material/tooltip';
import screenfull from 'screenfull';

import { MatToolbarModule } from '@angular/material/toolbar';

// Interface para descrever a estrutura da resposta da API
interface ResponseData {
  choices?: { message: { content: string } }[];
}
@Component({
  selector: 'vex-share-bottom-books3',
  templateUrl: './share-bottom-books3.component.html',
  styleUrls: ['./share-bottom-books3.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatBottomSheetModule,
    MatListModule,
    VexSecondaryToolbarComponent,
    VexBreadcrumbsComponent,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    VexPageLayoutContentDirective,
    VexPageLayoutHeaderDirective,
    VexPageLayoutComponent,
    MatCardModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    Book3Component
  ]
})
export class ShareBottomBooks3Component implements OnInit {
  durationInSeconds = 130;
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  questionAnswerList: any[] = [];
  questionText: any = '';
  chatMessage: any;
  isLoading = false;
  errorText = '';
  data: any;
  collapsed: any;
  layoutService: any;

  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar
  ) {}

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Save Notes', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000
    });
  }

  ngOnInit(): void {
    if (screenfull.isEnabled) {
      screenfull.request();
      this.toggleCollapse();
    }
  }
  toggleCollapse() {
    this.collapsed
      ? this.layoutService.expandSidenav()
      : this.layoutService.collapseSidenav();
  } //fim

  async questionToOpenAI(question: string) {
    this.isLoading = true;
    try {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${gpt4.apiKey}`,
        'Content-Type': 'application/json'
      });

      const response: ResponseData | undefined = await this.http
        .post<ResponseData>(
          gpt4.baseUrl,
          {
            messages: [{ role: 'user', content: question }],
            temperature: 0.5,
            max_tokens: 100,
            model: 'gpt-4'
          },
          { headers }
        )
        .toPromise();

      // Verificando se a resposta é indefinida
      if (response === undefined) {
        throw new Error('Resposta indefinida.');
      }

      // Verificando se a propriedade 'choices' está presente na resposta
      if (response.choices && response.choices.length > 0) {
        this.chatMessage = response.choices[0].message.content;
        // Chamando a função para exibir o Snackbar com a mensagem processada
        this.openSnackBar(this.chatMessage);
      } else {
        throw new Error('Resposta inválida.');
      }
    } catch (error) {
      this.errorText = (error as any).error.message;
    } finally {
      this.isLoading = false;
    }
  }
}
