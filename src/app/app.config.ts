import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideVex } from '@vex/vex.provider';
import { provideIcons } from './core/icons/icons.provider';
import { provideLuxon } from './core/luxon/luxon.provider';
import { provideNavigation } from './core/navigation/navigation.provider';
import { provideQuillConfig } from 'ngx-quill';
import { appRoutes } from './app.routes';
import { vexConfigs } from '@vex/config/vex-configs';
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatNativeDateModule } from '@angular/material/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyABesQqVhuBPoPaghHqg86YCLjyLyZqpRg",
  authDomain: "priming-ai-5.firebaseapp.com",
  projectId: "priming-ai-5",
  storageBucket: "priming-ai-5.appspot.com",
  messagingSenderId: "868476043980",
  appId: "1:868476043980:web:72c71d8191f066be96f869",
  measurementId: "G-SYKNH1HQGW"
};

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      MatDialogModule,
      MatBottomSheetModule,
      MatNativeDateModule,
      AngularFireModule.initializeApp(firebaseConfig),
      AngularFireAuthModule,
      provideFirebaseApp(() => initializeApp(firebaseConfig)),
      provideFirestore(() => getFirestore()),
      provideStorage(() => getStorage()),
      provideAuth(() => getAuth())
    ),
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    ),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideVex({
      config: vexConfigs.poseidon,
      availableThemes: [
        { name: 'Default', className: 'vex-theme-default' },
        { name: 'Teal', className: 'vex-theme-teal' },
        { name: 'Green', className: 'vex-theme-green' },
        { name: 'Purple', className: 'vex-theme-purple' },
        { name: 'Red', className: 'vex-theme-red' },
        { name: 'Orange', className: 'vex-theme-orange' }
      ]
    }),
    provideNavigation(),
    provideIcons(),
    provideLuxon(),
    provideQuillConfig({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['clean'],
          ['link', 'image']
        ]
      }
    })
  ]
};